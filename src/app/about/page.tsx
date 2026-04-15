import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-950">
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-white mb-4">Про IT Rally</h1>
          <p className="text-gray-400 text-lg mb-8">
            IT Rally — це щорічна конференція для IT-спільноти України та світу.
          </p>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              Наша місія — об&apos;єднати розробників, менеджерів, підприємців та
              всіх, хто пов&apos;язаний з технологіями, на одному майданчику для
              обміну знаннями, досвідом та натхненням.
            </p>
            <p>
              IT Rally щорічно збирає сотні учасників з усієї країни. Тут
              відбуваються доповіді від провідних спеціалістів галузі,
              практичні майстер-класи та нетворкінг-сесії.
            </p>
            <p>
              Ми віримо, що технології — це не просто інструмент, а рушійна
              сила змін. І саме тому IT Rally — це місце, де народжуються нові
              ідеї, партнерства та проекти.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {[
              { value: "500+", label: "Учасників щороку" },
              { value: "30+", label: "Спікерів" },
              { value: "10+", label: "Років досвіду" },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                <p className="text-3xl font-bold text-blue-400 mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
