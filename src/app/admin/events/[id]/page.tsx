import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EventForm from "@/components/admin/EventForm";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      scheduleItems: { orderBy: { order: "asc" } },
      speakers: { orderBy: { order: "asc" } },
      sponsors: true,
    },
  });

  if (!event) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        Редагування: {event.title}
      </h1>
      <EventForm event={event} />
    </div>
  );
}
