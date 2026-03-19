import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { 
      start_name, 
      start_lat, 
      start_lng, 
      end_name, 
      end_lat, 
      end_lng, 
      segments 
    } = body;

    if (!start_name || !end_name || !segments || segments.length === 0) {
      return NextResponse.json({ error: "Missing required route data" }, { status: 400 });
    }

    // Since we don't have authentication set up for MVP yet, we create a mock user or use an existing one
    let mockUser = await prisma.user.findFirst();
    if (!mockUser) {
      mockUser = await prisma.user.create({
        data: {
          email: "test.user@example.com"
        }
      });
    }

    // Calculate total cost
    interface Segment { cost: string | number; [key: string]: any }
    const total_cost = segments.reduce((acc: number, seg: Segment) => acc + Number(seg.cost), 0);

    // Create the route within a transaction or create sequence
    const newRoute = await prisma.route.create({
      data: {
        creator_id: mockUser.id,
        start_name,
        end_name,
        total_cost: total_cost,
        total_time_mins: segments.length * 15, // Mock time or calculate it
        segments: {
          create: segments.map((seg: any, index: number) => ({
            step_order: index + 1,
            start_location_name: seg.start_location,
            end_location_name: seg.end_location,
            transport_mode: seg.transport_mode,
            cost: Number(seg.cost),
            instructions: `Take a ${seg.transport_mode} from ${seg.start_location} to ${seg.end_location}`
          }))
        }
      }
    });

    try {
      // Update the geometry using PostGIS functions. We require raw queries for this part 
      // because Prisma does not natively support inserting PostGIS 'geometry' objects directly via the ORM yet.
      await prisma.$executeRaw`
        UPDATE "routes" 
        SET 
          start_coordinates = ST_SetSRID(ST_MakePoint(${parseFloat(start_lng)}, ${parseFloat(start_lat)}), 4326),
          end_coordinates = ST_SetSRID(ST_MakePoint(${parseFloat(end_lng)}, ${parseFloat(end_lat)}), 4326)
        WHERE id = ${newRoute.id};
      `;
    } catch (geomError: any) {
      console.error("PostGIS error occurred but route was saved. Did you run CREATE EXTENSION postgis?", geomError.message);
      // We don't fail the entire request if just the GIS update fails, but typically you'd want to handle this.
    }

    return NextResponse.json({ success: true, message: "Route submitted successfully", routeId: newRoute.id }, { status: 201 });

  } catch (error: any) {
    console.error("Error submitting route:", error);
    return NextResponse.json({ error: "Failed to submit route", details: error.message }, { status: 500 });
  }
}
