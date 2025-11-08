// src/pages/admin/MediaLibrary.jsx
import { useEffect, useMemo, useState } from "react";
import UploadDropzone from "../../../components/media/UploadDropzone";
import MediaCard from "../../../components/media/MediaCard";
import { listMedia } from "../../../services/mediaApi";

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchList = async (params = {}) => {
    setLoading(true);
    try {
      const { items } = await listMedia(params);
      setItems(items || []);
    } catch (e) {
      alert(e.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList({ type, q });
  }, []); // initial

  const onSearch = async (e) => {
    e.preventDefault();
    fetchList({ type, q });
  };

  const onUploaded = (newItems) => {
    // Prepend new items for quick feedback
    setItems((prev) => [...(newItems || []), ...prev]);
  };

  const count = useMemo(() => items.length, [items]);

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Media Library</h2>

      <UploadDropzone onUploaded={onUploaded} />

      <form
        onSubmit={onSearch}
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
        >
          <option value="">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search filename or tag"
          style={{
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ccc",
            minWidth: 260,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setType("");
            setQ("");
            fetchList({});
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
        <div style={{ marginLeft: "auto", color: "#666", alignSelf: "center" }}>
          {loading ? "Loading..." : `${count} item(s)`}
        </div>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {items.map((it) => (
          <MediaCard key={it._id} item={it} />
        ))}
      </div>
    </div>
  );
}
