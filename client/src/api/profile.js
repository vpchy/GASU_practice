import { API_URL, authHeaders } from "./config";

export async function getMe() {
  const res = await fetch(`${API_URL}/me`, {
    headers: authHeaders(),
  });

  return res.json();
}

export async function updateMe(data) {
  const res = await fetch(`${API_URL}/me`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}
