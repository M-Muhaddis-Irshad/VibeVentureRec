import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPost, deletePost } from "../services/api.js";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPost(id)
      .then(setPost)
      .catch((err) =>
        setError(err.response?.data?.error || "Couldn't load this entry.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePost(id);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete entry.");
      setDeleting(false);
      setModalOpen(false);
    }
  }

  if (loading) {
    return <p className="text-center py-24 text-ink-800/60">Loading…</p>;
  }

  if (error && !post) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/" className="text-clay-600 underline">
          Back to journal
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/" className="text-sm text-clay-600 hover:underline mb-6 inline-block">
        ← Back to journal
      </Link>

      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-full rounded-2xl mb-8 max-h-[420px] object-cover"
        />
      )}

      <span className="inline-block text-xs font-semibold tracking-wide uppercase text-clay-600 bg-clay-500/10 px-2.5 py-1 rounded-full mb-3">
        {post.location}
      </span>

      <h1 className="font-serif text-4xl font-bold mb-3">{post.title}</h1>

      <div className="flex items-center justify-between text-sm text-ink-800/60 mb-8 border-b border-sand-200 pb-6">
        <span>
          By {post.author} · {formatDate(post.createdAt)}
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/edit/${post.id}`)}
            className="px-3 py-1.5 rounded-full border border-sand-300 hover:bg-sand-100 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="prose-content">{post.content}</div>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-sand-100 text-ink-800/70 px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <DeleteConfirmModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
