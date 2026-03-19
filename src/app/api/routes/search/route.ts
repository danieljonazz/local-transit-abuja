import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startLat = searchParams.get("start_lat");
    const startLng = searchParams.get("start_lng");
    const endLat = searchParams.get("end_lat");
    const endLng = searchParams.get("end_lng");

    if (!startLat || !startLng || !endLat || !endLng) {
        return NextResponse.json({ error: "Missing coordinates for search" }, { status: 400 });
    }

    try {
        let routes = [];

        try {
            // Native PostGIS Radius Search Query
            const rawRoutes: any[] = await prisma.$queryRaw`
                SELECT r.id, r.start_name, r.end_name, r.total_cost, r.total_time_mins, r.upvotes, r.downvotes
                FROM "routes" r
                WHERE ST_DWithin(start_coordinates, ST_MakePoint(${parseFloat(startLng)}, ${parseFloat(startLat)})::geography, 2000)
                AND ST_DWithin(end_coordinates, ST_MakePoint(${parseFloat(endLng)}, ${parseFloat(endLat)})::geography, 2000)
                ORDER BY upvotes DESC
                LIMIT 10;
            `;

            if (rawRoutes.length === 0) {
                return NextResponse.json({ routes: [] }, { status: 200 });
            }

            // Fetch segments for these routes (Raw query doesn't relationally join easily without custom mapping)
            const routeIds = rawRoutes.map(r => r.id);
            const segments = await prisma.routeSegment.findMany({
                where: { route_id: { in: routeIds } },
                orderBy: { step_order: 'asc' }
            });

            routes = rawRoutes.map(route => ({
                ...route,
                segments: segments.filter((seg: any) => seg.route_id === route.id)
            }));
            
        } catch (postGisError: any) {
            console.warn("PostGIS search failed. Make sure your database has PostGIS enabled and migrated.", postGisError.message);
            // Fallback to basic ILIKE matching if PostGIS isn't fully configured
            return NextResponse.json({ error: "Database not configured for spatial queries yet", details: postGisError.message }, { status: 500 });
        }

        return NextResponse.json({ routes }, { status: 200 });

    } catch (error: any) {
        console.error("Error searching routes:", error);
        return NextResponse.json({ error: "Failed to search routes", details: error.message }, { status: 500 });
    }
}
