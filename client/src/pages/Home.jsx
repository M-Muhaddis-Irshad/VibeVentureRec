import { useEffect, useState, useCallback } from "react";
import { fetchPosts } from "../services/api.js";
import PostList from "../components/PostList.jsx";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const load = useCallback(async (page = 1, searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchPosts({ page, pageSize: 9, search: searchTerm });
      setPosts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Couldn't load journal entries. Is the API running?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    load(1, search);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold mb-2">Journal</h1>
        <p className="text-ink-800/70">Stories from the road, one entry at a time.</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-8 flex gap-2 max-w-md">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or location…"
          className="flex-1 px-4 py-2.5 rounded-full border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 bg-white text-sm"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-full bg-ink-900 text-white text-sm font-medium hover:bg-ink-800 transition-colors"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-center py-16 text-ink-800/60">Loading entries…</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {!loading && !error && <PostList posts={posts} />}

      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-10">
          <button
            disabled={pagination.page <= 1}
            onClick={() => load(pagination.page - 1, search)}
            className="px-4 py-2 rounded-full border border-sand-300 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-ink-800/60 self-center">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => load(pagination.page + 1, search)}
            className="px-4 py-2 rounded-full border border-sand-300 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
