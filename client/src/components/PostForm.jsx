import { useState } from "react";
import { uploadImage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = {
  title: "",
  location: "",
  author: "",
  content: "",
  coverImageUrl: "",
  tags: "",
};

export default function PostForm({ initialValues, onSubmit, submitLabel = "Publish" }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    ...emptyForm,
    author: user?.name || "",
    ...initialValues,
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSubmitError("");
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, coverImageUrl: url }));
    } catch (err) {
      setSubmitError(err.response?.data?.error || "Image upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required";
    else if (form.title.length > 200) next.title = "Title must be under 200 characters";
    if (!form.location.trim()) next.location = "Location is required";
    if (!form.author.trim()) next.author = "Author is required";
    if (!form.content.trim() || form.content.trim().length < 10)
      next.content = "Content must be at least 10 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await onSubmit({
        title: form.title.trim(),
        location: form.location.trim(),
        author: form.author.trim(),
        content: form.content,
        coverImageUrl: form.coverImageUrl || null,
        tags,
      });
    } catch (err) {
      setSubmitError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {submitError}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1.5">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Three days lost in the Atlas Mountains"
          className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 bg-white dark:bg-ink-800 dark:border-ink-800 dark:text-sand-100"
        />
        {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Marrakech, Morocco"
            className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 bg-white dark:bg-ink-800 dark:border-ink-800 dark:text-sand-100"
          />
          {errors.location && <p className="text-red-600 text-xs mt-1">{errors.location}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Author</label>
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 bg-white dark:bg-ink-800 dark:border-ink-800 dark:text-sand-100"
          />
          {errors.author && <p className="text-red-600 text-xs mt-1">{errors.author}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Cover image</label>
        <label className="flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed border-sand-300 dark:border-ink-800 rounded-xl py-6 cursor-pointer hover:border-clay-500 hover:bg-sand-50 dark:hover:bg-ink-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-clay-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span className="text-sm text-ink-800/60 dark:text-sand-300">
            {uploading ? "Uploading…" : "Click to upload image"}
          </span>
          <span className="text-xs text-ink-800/40 dark:text-sand-300/60">PNG, JPG, WEBP up to 5MB</span>
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
        {form.coverImageUrl && (
          <img src={form.coverImageUrl} alt="Cover preview"
            className="mt-3 rounded-xl w-full max-h-64 object-cover" />
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Tags (comma separated)</label>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="hiking, desert, solo-travel"
          className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 bg-white dark:bg-ink-800 dark:border-ink-800 dark:text-sand-100"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Content</label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={10}
          placeholder="Tell the story of your journey…"
          className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 bg-white dark:bg-ink-800 dark:border-ink-800 dark:text-sand-100 font-serif"
        />
        {errors.content && <p className="text-red-600 text-xs mt-1">{errors.content}</p>}
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="bg-clay-500 text-white px-6 py-3 rounded-full font-medium hover:bg-clay-600 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
