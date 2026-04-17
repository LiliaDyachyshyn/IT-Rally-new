import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/utils";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredEvents, upcomingEvents] = await Promise.all([
    prisma.event.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: { startDate: "asc" },
      take: 1,
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { startDate: "desc" },
      take: 6,
      include: { _count: { select: { speakers: true } } },
    }),
  ]);

  const featured = featuredEvents[0];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gray-950 text-white py-24 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-blue-600/20 border border-blue-600/40 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-6">
              IT-конференція
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
              IT Rally
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Щорічна конференція для розробників, менеджерів та підприємців.
              Доповіді, нетворкінг та натхнення.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/events" className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
                Усі події
              </Link>
              <Link href="/about" className="px-7 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors">
                Про нас
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Event */}
        {featured && (
          <section className="bg-gray-900 py-16 px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-6">
                Найближча подія
              </h2>
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 flex flex-col sm:flex-row gap-8 items-start">
                {featured.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.coverImage} alt={featured.title} className="w-full sm:w-64 h-40 object-cover rounded-xl" />
                )}
                <div className="flex-1">
                  <p className="text-blue-400 text-sm mb-2">
                    {formatDateRange(featured.startDate, featured.endDate)} • {featured.location}
                  </p>
                  <h3 className="text-2xl font-bold text-white mb-3">{featured.title}</h3>
                  <p className="text-gray-400 mb-6 line-clamp-3">{featured.shortDesc ?? featured.description}</p>
                  <Link href={`/events/${featured.slug}`} className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                    Дізнатися більше
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Events Grid */}
        <section className="bg-gray-950 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Усі події</h2>
              <Link href="/events" className="text-blue-400 hover:text-blue-300 text-sm">
                Переглянути всі →
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500">Поки що немає опублікованих подій.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.slug}`} className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
                    {event.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.coverImage} alt={event.title} className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    )}
                    <div className="p-5">
                      <p className="text-blue-400 text-xs mb-2">{formatDateRange(event.startDate, event.endDate)}</p>
                      <h3 className="text-white font-semibold mb-1 line-clamp-2">{event.title}</h3>
                      <p className="text-gray-500 text-sm">{event.location}</p>
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
