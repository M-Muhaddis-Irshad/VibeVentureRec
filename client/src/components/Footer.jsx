import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-sand-200 dark:border-ink-800 bg-sand-50 dark:bg-ink-900 mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-800/60 dark:text-sand-300">
        <span className="font-serif text-clay-600 font-semibold text-base">Vibeventure</span>
        <nav className="flex gap-6">
          <Link to="/" className="hover:text-clay-600 transition-colors">Journal</Link>
          <Link to="/create" className="hover:text-clay-600 transition-colors">New Entry</Link>
        </nav>
        <span>© {new Date().getFullYear()} Vibeventure. All rights reserved.</span>
      </div>
    </footer>
  );
}
