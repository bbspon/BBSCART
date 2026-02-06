// src/services/mediaApi.js
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function uploadMedia(files, onProgress) {
  const form = new FormData();
  
  console.log(`📦 Preparing ${files.length} files for upload...`);
  for (const f of files) {
    console.log(`  - ${f.name} (${(f.size / 1024).toFixed(2)} KB)`);
    form.append("files", f);
  }

  const xhr = new XMLHttpRequest();
  const url = `${API}/api/media/upload`;

  const promise = new Promise((resolve, reject) => {
    xhr.open("POST", url);
    
    // ✅ CRITICAL: Enable credentials (cookies, auth headers)
    xhr.withCredentials = true;
    
    // ✅ Add Authorization header if token exists
    const token = localStorage.getItem("token");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    
    // ✅ Timeout to avoid hanging requests
    xhr.timeout = 120000; // 2 minutes
    
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        // ✅ Handle all status cases properly
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log("✅ Upload success:", response);
            
            // ✅ Return response with items (support both formats)
            resolve({
              ok: response.ok !== false,
              items: response.items || [],
              ...response
            });
          } catch (e) {
            console.error("❌ JSON parse error:", e);
            reject(new Error("Invalid server response"));
          }
        } else if (xhr.status === 0) {
          // Network error or CORS issue
          console.error("❌ Network/CORS error - HTTP 0");
          reject(new Error("Network error or CORS issue. Check browser console for details."));
        } else {
          console.error(`❌ Upload failed with HTTP ${xhr.status}:`, xhr.responseText);
          try {
            const errData = JSON.parse(xhr.responseText);
            const errorMsg = errData.message || errData.error || `HTTP ${xhr.status}`;
            
            // ✅ Detect specific multer errors
            if (errorMsg.includes("Unexpected field")) {
              reject(new Error("Form field error - please try again or refresh the page"));
            } else if (errorMsg.includes("File too large")) {
              reject(new Error("One or more files exceed the 100MB size limit"));
            } else {
              reject(new Error(errorMsg));
            }
          } catch {
            const msg = xhr.responseText || `HTTP ${xhr.status}`;
            reject(new Error(msg));
          }
        }
      }
    };
    
    // ✅ Upload progress tracking
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        const pct = Math.round((e.loaded * 100) / e.total);
        onProgress(pct);
      }
    };
    
    // ✅ Proper error handlers
    xhr.onerror = () => {
      console.error("❌ XHR onerror event");
      reject(new Error("Network error - request failed"));
    };
    
    xhr.ontimeout = () => {
      console.error("❌ XHR timeout");
      reject(new Error("Upload timeout - request took too long (max 2 minutes)"));
    };
    
    xhr.onabort = () => {
      console.error("❌ XHR abort");
      reject(new Error("Upload cancelled"));
    };
    
    console.log("📤 Starting upload to", url);
    xhr.send(form);
  });

  return promise;
}

export async function listMedia({ type, q, search, page = 1, limit = 40 } = {}) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  const searchVal = q ?? search ?? "";
  if (searchVal) params.set("q", searchVal);
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const res = await fetch(`${API}/api/media?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch media: ${res.status}`);
  const data = await res.json();
  return { items: data.items || [], total: data.total ?? (data.items?.length ?? 0) };
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
