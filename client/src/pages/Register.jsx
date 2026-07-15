import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import client from "../services/api.js";

const rules = [
  { label: "At least 8 characters", test: p => p.length >= 8 },
  { label: "One uppercase letter",  test: p => /[A-Z]/.test(p) },
  { label: "One lowercase letter",  test: p => /[a-z]/.test(p) },
  { label: "One number",            test: p => /[0-9]/.test(p) },
];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [loading, setLoading] = useState(false);

  const allValid = rules.every(r => r.test(form.password));

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!allValid) {
      const failed = rules.filter(r => !r.test(form.password)).map(r => r.label);
      setPwdError("Password must have: " + failed.join(", ").toLowerCase() + ".");
      return;
    }
    setPwdError("");
    setLoading(true); setError("");
    try {
      const { data } = await client.post("/api/auth/register", form);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl font-bold mb-6 dark:text-sand-100">Create account</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Name" required value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 bg-white dark:bg-ink-800 dark:border-ink-800 dark:text-sand-100" />
          <input type="email" placeholder="Email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 bg-white dark:bg-ink-800 dark:border-ink-800 dark:text-sand-100" />
          <div>
            <input type="password" placeholder="Password" required value={form.password}
              onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setPwdError(""); }}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 bg-white dark:bg-ink-800 dark:border-ink-800 dark:text-sand-100" />
            {pwdError && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
                {pwdError}
              </div>
            )}
          </div>
          <button type="submit" disabled={loading}
            className="bg-clay-500 text-white py-2.5 rounded-full font-medium hover:bg-clay-600 transition-colors disabled:opacity-50">
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>
        <p className="text-sm text-center mt-4 dark:text-sand-300">
          Already have an account? <Link to="/login" className="text-clay-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
