import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json({ locations: [] }, { status: 200 });
    }

    const routes = await prisma.route.findMany({
      where: {
        OR: [
          { start_name: { contains: q, mode: 'insensitive' } },
          { end_name: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        start_name: true,
        end_name: true
      },
      take: 20
    });

    const locations = new Set<string>();
    routes.forEach(route => {
      if (route.start_name.toLowerCase().includes(q.toLowerCase())) {
        locations.add(route.start_name);
      }
      if (route.end_name.toLowerCase().includes(q.toLowerCase())) {
        locations.add(route.end_name);
      }
    });

    return NextResponse.json({ locations: Array.from(locations).slice(0, 5) }, { status: 200 });
  } catch (error: any) {
    console.error("Error searching locations:", error);
    return NextResponse.json({ error: "Failed to search locations", details: error.message }, { status: 500 });
  }
}
