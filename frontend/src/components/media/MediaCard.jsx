// src/components/media/MediaCard.jsx
const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

function copy(text) {
  navigator.clipboard.writeText(text).then(
    () => {},
    () => alert("Copy failed")
  );
}

export default function MediaCard({ item }) {
  const isImage = item.type === "image";
  const isVideo = item.type === "video";
  const thumb =
    (item.variants || []).find((v) => v.label === "thumb")?.url ||
    (item.variants || []).find((v) => v.label === "poster")?.url ||
    item.url;

  const filename = item.filename;
  const url = item.url;

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
      <div style={{ aspectRatio: "4/3", background: "#fafafa" }}>
        {isImage ? (
          <img
            src={thumb}
            alt={filename}
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
      </div>

      <div style={{ padding: 10, display: "grid", gap: 6 }}>
        <div
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
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => copy(filename)}
            title="Copy filename (use in CSV)"
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #ddd",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Copy filename
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
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #ddd",
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
