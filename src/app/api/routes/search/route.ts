import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startName = searchParams.get("start_name");
    const endName = searchParams.get("end_name");

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
            orderBy: {
                upvotes: 'desc'
            }
        });

        return NextResponse.json({ routes }, { status: 200 });

    } catch (error: any) {
        console.error("Error searching routes:", error);
        return NextResponse.json({ error: "Failed to search routes", details: error.message }, { status: 500 });
    }
}
