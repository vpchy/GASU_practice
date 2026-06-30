import { API_URL, authHeaders } from "./config";

export async function getPosts() {
  const res = await fetch(`${API_URL}/posts`, {
    headers: authHeaders(),
  });

  return res.json();
}

export async function getMyPosts() {
  const res = await fetch(`${API_URL}/my-posts`, {
    headers: authHeaders(),
  });

  return res.json();
}

export async function createPost({ title, text }) {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, text }),
  });

  return res.json();
}

export async function likePost(postId) {
  const res = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: "POST",
    headers: authHeaders(),
  });

  return res.json();
}

export async function deletePost(postId) {
  const res = await fetch(`${API_URL}/posts/${postId}/del`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function updatePost(postId, { title, text }) {
  const res = await fetch(`${API_URL}/posts/${postId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ title, text }),
  });

  return res.json();
}
