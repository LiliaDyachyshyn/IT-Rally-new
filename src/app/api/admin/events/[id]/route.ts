import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      scheduleItems: { orderBy: { order: "asc" } },
      speakers: { orderBy: { order: "asc" } },
      sponsors: true,
    },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { scheduleItems, speakers, sponsors, ...eventData } = body;

  try {
    // Rebuild relations: delete and recreate for simplicity
    await prisma.scheduleItem.deleteMany({ where: { eventId: id } });
    await prisma.speaker.deleteMany({ where: { eventId: id } });
    await prisma.sponsor.deleteMany({ where: { eventId: id } });

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...eventData,
        slug: slugify(eventData.title),
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        scheduleItems: scheduleItems ? { create: scheduleItems } : undefined,
        speakers: speakers ? { create: speakers } : undefined,
        sponsors: sponsors ? { create: sponsors } : undefined,
      },
      include: { scheduleItems: true, speakers: true, sponsors: true },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
