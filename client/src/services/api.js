import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function fetchPosts({ page = 1, pageSize = 10, search = "" } = {}) {
  const { data } = await client.get("/api/posts", {
    params: { page, pageSize, search },
  });
  return data; // { data: [...], pagination: {...} }
}

export async function fetchPost(id) {
  const { data } = await client.get(`/api/posts/${id}`);
  return data.data;
}

export async function createPost(payload) {
  const { data } = await client.post("/api/posts", payload);
  return data.data;
}

export async function updatePost(id, payload) {
  const { data } = await client.put(`/api/posts/${id}`, payload);
  return data.data;
}

export async function deletePost(id) {
  await client.delete(`/api/posts/${id}`);
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await client.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.url;
}

export default client;
