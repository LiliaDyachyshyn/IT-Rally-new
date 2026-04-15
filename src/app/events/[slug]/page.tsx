import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export const revalidate = 60;

export async function generateStaticParams() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return events.map((e) => ({ slug: e.slug }));
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      scheduleItems: { orderBy: { order: "asc" } },
      speakers: { orderBy: { order: "asc" } },
      sponsors: true,
    },
  });

  if (!event || event.status !== "PUBLISHED") notFound();

  const sponsorTierLabel: Record<string, string> = {
    PLATINUM: "Платиновий",
    GOLD: "Золотий",
    SILVER: "Срібний",
    GENERAL: "Генеральний",
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-950">
        {/* Hero */}
        <section className="relative bg-gray-900 border-b border-gray-800">
          {event.coverImage && (
            <div className="absolute inset-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.coverImage} alt="" className="w-full h-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900" />
            </div>
          )}
          <div className="relative max-w-5xl mx-auto px-4 py-16">
            <Link href="/events" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
              ← Всі події
            </Link>
            <p className="text-blue-400 text-sm mb-3">
              {formatDateRange(event.startDate, event.endDate)} • {event.location}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{event.title}</h1>
            {event.shortDesc && (
              <p className="text-xl text-gray-300 max-w-2xl">{event.shortDesc}</p>
            )}
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
          {/* Description */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Про подію</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            {event.address && (
              <p className="text-gray-400 mt-4 text-sm">📍 {event.address}</p>
            )}
          </section>

          {/* Schedule */}
          {event.scheduleItems.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Розклад</h2>
              <div className="space-y-3">
                {event.scheduleItems.map((item) => (
                  <div key={item.id} className="flex gap-5 bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <div className="text-blue-400 font-mono text-sm font-bold w-16 shrink-0 pt-0.5">{item.time}</div>
                    <div>
                      <p className="text-white font-semibold">{item.title}</p>
                      {item.speaker && <p className="text-gray-400 text-sm mt-0.5">{item.speaker}</p>}
                      {item.description && <p className="text-gray-500 text-sm mt-1">{item.description}</p>}
                      {item.room && <p className="text-gray-600 text-xs mt-1">Зал: {item.room}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Speakers */}
          {event.speakers.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Спікери</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {event.speakers.map((speaker) => (
                  <div key={speaker.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    {speaker.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={speaker.photo} alt={speaker.name} className="w-16 h-16 rounded-full object-cover mb-4" />
                    )}
                    <p className="text-white font-semibold">{speaker.name}</p>
                    {speaker.title && <p className="text-gray-400 text-sm">{speaker.title}</p>}
                    {speaker.company && <p className="text-blue-400 text-sm">{speaker.company}</p>}
                    {speaker.talkTitle && (
                      <p className="text-gray-500 text-sm mt-2 italic">"{speaker.talkTitle}"</p>
                    )}
                    {speaker.linkedinUrl && (
                      <a href={speaker.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs mt-2 inline-block">
                        LinkedIn →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sponsors */}
          {event.sponsors.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Спонсори</h2>
              <div className="flex flex-wrap gap-4">
                {event.sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
                    {sponsor.logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sponsor.logoUrl} alt={sponsor.name} className="h-8 object-contain" />
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">{sponsor.name}</p>
                      <p className="text-gray-500 text-xs">{sponsorTierLabel[sponsor.tier]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
