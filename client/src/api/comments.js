import { API_URL, authHeaders } from "./config";

export async function createComment(postId, text, attachment = null, attachmentName = null) {
  const body = { text };
  if (attachment) body.attachment = attachment;
  if (attachmentName) body.attachmentName = attachmentName;

  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  return res.json();
}
