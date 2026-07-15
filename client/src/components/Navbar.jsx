import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b border-sand-200 bg-sand-50/90 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl font-bold text-clay-600 tracking-tight">
          Vibeventure
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-ink-800">
          <Link to="/" className="hover:text-clay-600 transition-colors">
            Journal
          </Link>
          <Link
            to="/create"
            className="bg-clay-500 text-white px-4 py-2 rounded-full hover:bg-clay-600 transition-colors"
          >
            + New Entry
          </Link>
        </nav>
      </div>
    </header>
  );
}
