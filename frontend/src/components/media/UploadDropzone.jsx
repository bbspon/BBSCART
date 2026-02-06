// src/components/media/UploadDropzone.jsx
import { useRef, useState } from "react";
import { uploadMedia } from "../../services/mediaApi";
import toast from "react-hot-toast";

export default function UploadDropzone({ onUploaded }) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const dirRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    
    setProgress(0);
    setError(null);
    
    // ✅ Validate files before upload
    const validFiles = Array.from(files).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
      const isVideo = ['mp4', 'mov', 'mkv', 'webm'].includes(ext);
      
      if (!isImage && !isVideo) {
        console.warn(`⚠️ Skipping unsupported file: ${f.name}`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) {
      const msg = "❌ No valid image or video files to upload. Supported: PNG, JPG, JPEG, WEBP (images) and MP4, MOV, MKV, WEBM (videos)";
      setError(msg);
      toast.error(msg);
      return;
    }
    
    console.log(`📤 Uploading ${validFiles.length} files...`);
    
    try {
      const { items } = await uploadMedia(validFiles, setProgress);
      toast.success(`✅ Successfully uploaded ${items.length} file(s)`);
      onUploaded?.(items || []);
    } catch (e) {
      const errorMsg = e.message || "Upload failed";
      console.error("Upload error:", errorMsg);
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
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
            backgroundColor: "#3b82f6",
            color: "white",
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
            backgroundColor: "#10b981",
            color: "white",
          }}
          title="Upload a folder (Chrome/Edge only)"
        >
          Select folder
        </button>

        <span style={{ color: "#666", fontSize: 13 }}>
          or drag & drop files/folders here (images → webp+thumb, videos →
          webm+poster)
        </span>
      </div>

      {error && (
        <div
          style={{
            marginTop: 10,
            padding: 8,
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

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
            {progress}% uploaded...
          </div>
        </div>
      )}
    </div>
  );
}
