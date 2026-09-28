import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startName = searchParams.get("start_name");
    const endName = searchParams.get("end_name");
    const sort = searchParams.get("sort");

    if (!startName || !endName) {
        return NextResponse.json({ error: "Missing start_name or end_name for search" }, { status: 400 });
    }

    try {
        const routes = await prisma.route.findMany({
            where: {
                start_name: {
                    contains: startName,
                    mode: 'insensitive'
                },
                end_name: {
                    contains: endName,
                    mode: 'insensitive'
                }
            },
            include: {
                segments: {
                    orderBy: {
                        step_order: 'asc'
                    }
                }
            },
            orderBy: sort === 'cheapest' ? { total_cost: 'asc' } : { upvotes: 'desc' }
        });

        if (routes.length === 0) {
            return NextResponse.json({ routes: [] }, { status: 200 });
        }

        const routeIds = routes.map(r => r.id);
        
        // Fetch coordinates for the matched routes using ST_X and ST_Y
        const coords = await prisma.$queryRaw<any[]>`
            SELECT id, 
                   ST_X(start_coordinates::geometry) as start_lng, ST_Y(start_coordinates::geometry) as start_lat,
                   ST_X(end_coordinates::geometry) as end_lng, ST_Y(end_coordinates::geometry) as end_lat
            FROM routes
            WHERE id IN (${Prisma.join(routeIds)})
        `;

        const coordsMap = new Map();
        coords.forEach(c => coordsMap.set(c.id, c));

        const enrichedRoutes = routes.map(route => {
            const c = coordsMap.get(route.id);
            return {
                ...route,
                start_coordinates: c && c.start_lat != null && c.start_lng != null ? [c.start_lat, c.start_lng] : null,
                end_coordinates: c && c.end_lat != null && c.end_lng != null ? [c.end_lat, c.end_lng] : null,
            };
        });

        return NextResponse.json({ routes: enrichedRoutes }, { status: 200 });

    } catch (error: any) {
        console.error("Error searching routes:", error);
        return NextResponse.json({ error: "Failed to search routes", details: error.message }, { status: 500 });
    }
}
