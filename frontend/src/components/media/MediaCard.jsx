// src/components/media/MediaCard.jsx
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function copy(text) {
  navigator.clipboard.writeText(text).then(
    () => {},
    () => alert("Copy failed")
  );
}

function uploadUrl(filename) {
  if (!filename) return "";
  return `${API_BASE}/uploads/${encodeURIComponent(filename)}`;
}

export default function MediaCard({ item, selected, onSelect, onEdit, onDelete }) {
  const isImage = item.type === "image";
  const isVideo = item.type === "video";
  const thumbVariant = (item.variants || []).find((v) => v.label === "thumb") || (item.variants || []).find((v) => v.label === "poster");
  const thumbFilename = thumbVariant?.filename || (item.filename && item.filename.replace(/\.webp$/i, ".thumb.webp")) || item.filename;
  const thumb = uploadUrl(thumbFilename || item.filename) || (item.url ? uploadUrl(item.filename) : "");
  const url = item.url && (item.url.startsWith("http") || item.url.startsWith("//")) ? item.url : uploadUrl(item.filename);
  const filename = item.filename;

  const small = (n) =>
    typeof n === "number" && n > 0 ? `${(n / 1024).toFixed(1)} KB` : "";

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4/3", background: "#fafafa" }}>
        {isImage ? (
          <img
            src={thumb}
            alt={filename}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <video
            src={url}
            poster={thumb}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            muted
            controls={false}
          />
        )}
        {typeof onSelect === "function" && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={onSelect}
            style={{ position: "absolute", top: 10, left: 10 }}
          />
        )}
      </div>

      <div style={{ padding: 10, display: "grid", gap: 6 }}>
        <div
          title={filename}
          style={{
            fontSize: 13,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {filename}
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          {item.mime} • {small(item.size)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button
            onClick={() => copy(filename)}
            title="Copy name (use in Products / CSV)"
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #ddd",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Copy name
          </button>
          <button
            onClick={() => copy(url)}
            title="Copy URL"
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #ddd",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Copy URL
          </button>
          {typeof onEdit === "function" && (
            <button
              onClick={onEdit}
              style={{
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid #999",
                background: "#888",
                color: "#fff",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Edit
            </button>
          )}
          {typeof onDelete === "function" && (
            <button
              onClick={onDelete}
              style={{
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid #b91c1c",
                background: "#dc2626",
                color: "#fff",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Delete
            </button>
          )}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #16a34a",
              background: "#22c55e",
              color: "#fff",
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            Open
          </a>
        </div>
      </div>
    </div>
  );
}
