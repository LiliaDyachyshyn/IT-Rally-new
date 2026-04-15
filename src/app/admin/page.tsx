import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboard() {
  const [totalEvents, publishedEvents, draftEvents, upcomingEvents] =
    await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: "PUBLISHED" } }),
      prisma.event.count({ where: { status: "DRAFT" } }),
      prisma.event.findMany({
        where: { status: "PUBLISHED", startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 3,
      }),
    ]);

  const stats = [
    { label: "Всього подій", value: totalEvents, color: "blue" },
    { label: "Опубліковано", value: publishedEvents, color: "green" },
    { label: "Чернетки", value: draftEvents, color: "yellow" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Дашборд</h1>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Нова подія
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5"
          >
            <p className="text-gray-400 text-sm mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Найближчі події
        </h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-500 text-sm">Немає запланованих подій</p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
              >
                <div>
                  <p className="text-white font-medium">{event.title}</p>
                  <p className="text-gray-400 text-sm">
                    {formatDate(event.startDate)} • {event.location}
                  </p>
                </div>
                <Link
                  href={`/admin/events/${event.id}`}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Редагувати
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
