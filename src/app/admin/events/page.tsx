import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import DeleteEventButton from "@/components/admin/DeleteEventButton";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { speakers: true } } },
  });

  const statusLabel: Record<string, string> = {
    PUBLISHED: "Опубліковано",
    DRAFT: "Чернетка",
    ARCHIVED: "Архів",
  };
  const statusColor: Record<string, string> = {
    PUBLISHED: "bg-green-900/40 text-green-300 border-green-800",
    DRAFT: "bg-yellow-900/40 text-yellow-300 border-yellow-800",
    ARCHIVED: "bg-gray-800 text-gray-400 border-gray-700",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Події</h1>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Нова подія
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-xl">
          <p className="text-gray-400 mb-4">Подій ще немає</p>
          <Link
            href="/admin/events/new"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Створити першу подію
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium px-5 py-3">
                  Назва
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">
                  Дата
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">
                  Місце
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">
                  Статус
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">
                  Спікери
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-gray-800/60 last:border-0 hover:bg-gray-800/30"
                >
                  <td className="px-5 py-4 text-white font-medium">
                    {event.title}
                  </td>
                  <td className="px-5 py-4 text-gray-400">
                    {formatDate(event.startDate)}
                  </td>
                  <td className="px-5 py-4 text-gray-400">{event.location}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-medium ${statusColor[event.status]}`}
                    >
                      {statusLabel[event.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400">
                    {event._count.speakers}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Редагувати
                      </Link>
                      <DeleteEventButton id={event.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
