// src/components/media/UploadDropzone.jsx
import { useRef, useState } from "react";
import { uploadMedia } from "../../services/mediaApi";

export default function UploadDropzone({ onUploaded }) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);
  const dirRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setProgress(0);
    try {
      const { items } = await uploadMedia(files, setProgress);
      onUploaded?.(items || []);
    } catch (e) {
      alert(e.message || "Upload failed");
    } finally {
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
      if (dirRef.current) dirRef.current.value = "";
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    handleFiles(files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      style={{
        border: "2px dashed #bbb",
        padding: 16,
        borderRadius: 12,
        background: dragOver ? "#f5f5f5" : "transparent",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Select files
        </button>

        <button
          onClick={() => dirRef.current?.click()}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
          title="Upload a folder"
        >
          Select folder
        </button>

        <span style={{ color: "#666" }}>
          or drag & drop files/folders here (images → webp+thumb, videos →
          webm+poster)
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        hidden
        accept="image/*,video/*"
      />

      {/* Folder picker (Chrome/Edge) */}
      <input
        ref={dirRef}
        type="file"
        multiple
        hidden
        webkitdirectory="true"
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        accept="image/*,video/*"
      />

      {progress > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 8, background: "#eee", borderRadius: 6 }}>
            <div
              style={{
                width: `${progress}%`,
                height: 8,
                background: "#3b82f6",
                borderRadius: 6,
                transition: "width 120ms linear",
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
}
