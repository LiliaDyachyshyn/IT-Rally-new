import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} IT Rally. Всі права захищено.
        </p>
        <div className="flex gap-6">
          <Link href="/events" className="text-gray-500 hover:text-gray-300 text-sm">
            Події
          </Link>
          <Link href="/about" className="text-gray-500 hover:text-gray-300 text-sm">
            Про нас
          </Link>
        </div>
      </div>
    </footer>
  );
}
