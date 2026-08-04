import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Route ID is required" }, { status: 400 });
    }

    const updatedRoute = await prisma.route.update({
      where: { id },
      data: {
        upvotes: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, route: updatedRoute }, { status: 200 });
  } catch (error: any) {
    console.error("Error upvoting route:", error);
    return NextResponse.json({ error: "Failed to upvote route", details: error.message }, { status: 500 });
  }
}
