import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setProfileOpen(false);
    navigate("/");
  }

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="border-b border-sand-200 dark:border-ink-800 bg-sand-50/90 dark:bg-ink-900 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl font-bold text-clay-600 tracking-tight">
          Vibeventure
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-ink-800 dark:text-sand-100">

          {/* Home icon */}
          <Link to="/" aria-label="Home" className="hover:text-clay-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/>
            </svg>
          </Link>

          {/* Dark mode toggle */}
          <button onClick={() => setDark(d => !d)} className="hover:text-clay-600 transition-colors" aria-label="Toggle dark mode">
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>

          {user ? (
            <>
              <Link to="/create" className="bg-clay-500 text-white px-4 py-2 rounded-full hover:bg-clay-600 transition-colors">
                + New Entry
              </Link>

              {/* Profile avatar + dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="w-9 h-9 rounded-full bg-clay-500 text-white flex items-center justify-center text-sm font-semibold hover:bg-clay-600 transition-colors"
                  aria-label="Profile menu"
                >
                  {initials}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-ink-800 border border-sand-200 dark:border-ink-800 rounded-2xl shadow-lg py-2 z-20">
                    <div className="px-4 py-3 border-b border-sand-200 dark:border-ink-800">
                      <p className="text-sm font-semibold text-ink-900 dark:text-sand-100 truncate">{user.name}</p>
                      <p className="text-xs text-ink-800/50 dark:text-sand-300 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/create"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-800 dark:text-sand-100 hover:bg-sand-50 dark:hover:bg-ink-900 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                      New Entry
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
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
