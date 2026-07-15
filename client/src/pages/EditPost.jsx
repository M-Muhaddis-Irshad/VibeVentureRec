import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPost, updatePost } from "../services/api.js";
import PostForm from "../components/PostForm.jsx";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPost(id)
      .then(setPost)
      .catch((err) => setError(err.response?.data?.error || "Couldn't load this entry."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(payload) {
    const updated = await updatePost(id, payload);
    navigate(`/posts/${updated.id}`);
  }

  if (loading) return <p className="text-center py-24 text-ink-800/60">Loading…</p>;

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
      <h1 className="font-serif text-3xl font-bold mb-8">Edit entry</h1>
      <PostForm
        initialValues={{
          title: post.title,
          location: post.location,
          author: post.author,
          content: post.content,
          coverImageUrl: post.coverImageUrl || "",
          tags: (post.tags || []).join(", "),
        }}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
