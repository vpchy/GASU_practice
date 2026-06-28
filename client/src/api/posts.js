const API_URL = "http://localhost:3000";

export async function getPosts(token) {
  const response = await fetch(`${API_URL}/posts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `BEARER ${token}`
    },
  });

  return await response.json();
}