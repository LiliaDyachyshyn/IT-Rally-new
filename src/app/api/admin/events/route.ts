import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { speakers: true, scheduleItems: true } },
    },
  });
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { scheduleItems, speakers, sponsors, ...eventData } = body;

    const slug = slugify(eventData.title);

    const event = await prisma.event.create({
      data: {
        ...eventData,
        slug,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        scheduleItems: scheduleItems
          ? { create: scheduleItems }
          : undefined,
        speakers: speakers ? { create: speakers } : undefined,
        sponsors: sponsors ? { create: sponsors } : undefined,
      },
      include: { scheduleItems: true, speakers: true, sponsors: true },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
