import { API_URL, authHeaders } from "./config";

export async function createComment(postId, text) {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ text }),
  });

  return res.json();
}
