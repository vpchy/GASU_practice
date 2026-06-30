import { API_URL } from "./config";

export async function uploadFile(file) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    return {
      success: false,
      message: data.message || `Ошибка загрузки файла: ${res.status}`,
    };
  }

  return data;
}
