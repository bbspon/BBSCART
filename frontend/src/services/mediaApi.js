// src/services/mediaApi.js
const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function uploadMedia(files, onProgress) {
  const form = new FormData();
  for (const f of files) form.append("files", f);

  const xhr = new XMLHttpRequest();
  const url = `${API}/api/media/upload`;

  const promise = new Promise((resolve, reject) => {
    xhr.open("POST", url);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(xhr.responseText || `HTTP ${xhr.status}`));
        }
      }
    };
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        const pct = Math.round((e.loaded * 100) / e.total);
        onProgress(pct);
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(form);
  });

  return promise;
}

export async function listMedia({ type, q } = {}) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (q) params.set("q", q);
  const res = await fetch(`${API}/api/media?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch media: ${res.status}`);
  return res.json(); // { ok, items: [...] }
}

export async function updateMedia(id, body) {
  const res = await fetch(`${API}/api/media/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error(`Failed to update: ${res.status}`);
  return res.json();
}

export async function deleteMedia(id) {
  const res = await fetch(`${API}/api/media/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
  return res.json();
}
