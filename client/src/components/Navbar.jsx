import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="border-b border-sand-200 dark:border-ink-800 bg-sand-50/90 dark:bg-ink-900 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl font-bold text-clay-600 tracking-tight">
          Vibeventure
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-ink-800 dark:text-sand-100">
          <Link to="/" className="hover:text-clay-600 transition-colors">Journal</Link>
          <button onClick={() => setDark(d => !d)} className="text-xl" aria-label="Toggle dark mode">
            {dark ? '☀️' : '🌙'}
          </button>
          {user ? (
            <>
              <Link to="/create" className="bg-clay-500 text-white px-4 py-2 rounded-full hover:bg-clay-600 transition-colors">
                + New Entry
              </Link>
              <span className="text-ink-800/60 dark:text-sand-300 hidden sm:inline">Hi, {user.name}</span>
              <button onClick={handleLogout} className="text-clay-600 hover:underline">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-clay-600 transition-colors">Sign in</Link>
              <Link to="/register" className="bg-clay-500 text-white px-4 py-2 rounded-full hover:bg-clay-600 transition-colors">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
