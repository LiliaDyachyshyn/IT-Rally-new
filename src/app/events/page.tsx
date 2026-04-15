import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/utils";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export const revalidate = 60;

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startDate: "desc" },
    include: { _count: { select: { speakers: true } } },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-950">
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">Події</h1>
            <p className="text-gray-400 mb-10">Усі конференції та заходи IT Rally</p>

            {events.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">Поки що немає опублікованих подій.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Link key={event.id} href={`/events/${event.slug}`} className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
                    {event.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.coverImage} alt={event.title} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-6">
                      <p className="text-blue-400 text-xs font-medium mb-2">{formatDateRange(event.startDate, event.endDate)}</p>
                      <h2 className="text-white font-bold text-lg mb-2 line-clamp-2">{event.title}</h2>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.shortDesc ?? event.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{event.location}</span>
                        <span className="text-gray-500">{event._count.speakers} спікерів</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
