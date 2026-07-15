import { useNavigate } from "react-router-dom";
import { createPost } from "../services/api.js";
import PostForm from "../components/PostForm.jsx";

export default function CreatePost() {
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    const post = await createPost(payload);
    navigate(`/posts/${post.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-serif text-3xl font-bold mb-8">New journal entry</h1>
      <PostForm onSubmit={handleSubmit} submitLabel="Publish entry" />
    </div>
  );
}
