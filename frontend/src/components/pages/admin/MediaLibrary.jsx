// src/pages/admin/MediaLibrary.jsx — Thiaworld-style Media Library
import { useEffect, useMemo, useRef, useState } from "react";
import UploadDropzone from "../../media/UploadDropzone";
import MediaCard from "../../media/MediaCard";
import { listMedia, deleteMedia } from "../../../services/mediaApi";
import Sidebar from "../../admin/layout/sidebar";
import Navbar from "../../admin/layout/Navbar";
import useDashboardLogic from "../../admin/hooks/useDashboardLogic";
import "../../admin/assets/dashboard.css";

const BTN_PRIMARY = { background: "#2563EB", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 500, cursor: "pointer" };
const BTN_DANGER = { background: "#dc2626", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 500, cursor: "pointer" };
const BTN_GRAY = { background: "#e5e7eb", color: "#374151", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 500, cursor: "pointer" };

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {}, () => alert("Copy failed"));
}

export default function MediaLibrary() {
  const {
    isSidebarHidden,
    toggleSidebar,
    isSearchFormShown,
    toggleSearchForm,
    isDarkMode,
    toggleDarkMode,
    isNotificationMenuOpen,
    toggleNotificationMenu,
    isProfileMenuOpen,
    toggleProfileMenu,
  } = useDashboardLogic();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(40);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [toDelete, setToDelete] = useState(null); // id string or "bulk"
  const lastRefreshedAt = useRef(null);

  const load = async (overrides = {}) => {
    setLoading(true);
    const p = overrides.page ?? page;
    const ty = overrides.type ?? type;
    const q = overrides.search ?? search;
    try {
      const { items: list, total: tot } = await listMedia({
        page: p,
        limit,
        type: ty || undefined,
        q: q || undefined,
      });
      setItems(list || []);
      setTotal(tot ?? 0);
      lastRefreshedAt.current = new Date();
    } catch (e) {
      alert(e.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, type]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load({ page: 1, search });
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const selectedUrls = useMemo(
    () =>
      Array.from(selected)
        .map((id) => items.find((x) => String(x._id) === String(id))?.url)
        .filter(Boolean),
    [selected, items]
  );

  const handleDeleteConfirmed = async () => {
    const ids = toDelete === "bulk" ? Array.from(selected) : [toDelete];
    if (!ids.length) return;
    try {
      for (const id of ids) await deleteMedia(id);
      setToDelete(null);
      clearSelection();
      load();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  const onUploaded = (newItems) => {
    if (newItems?.length) {
      setPage(1);
      load();
    }
  };

  return (
    <>
      <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
      <div className={isDarkMode ? "dark" : ""}>
        <Sidebar isSidebarHidden={isSidebarHidden} toggleSidebar={toggleSidebar} />
        <section id="content">
          <Navbar
            toggleSidebar={toggleSidebar}
            isSidebarHidden={isSidebarHidden}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            isNotificationMenuOpen={isNotificationMenuOpen}
            toggleNotificationMenu={toggleNotificationMenu}
            isProfileMenuOpen={isProfileMenuOpen}
            toggleProfileMenu={toggleProfileMenu}
            isSearchFormShown={isSearchFormShown}
            toggleSearchForm={toggleSearchForm}
          />
            <main>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0, marginRight: 12, display: "inline-block" }}>Media Library</h2>
            <span style={{ fontSize: 12, color: "#555" }}>
              {lastRefreshedAt.current ? `Updated ${lastRefreshedAt.current.toLocaleTimeString()}` : ""}
            </span>
          </div>

          {/* Row 1: Upload, Search filename, All types, Sort, View */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <UploadDropzone onUploaded={onUploaded} />
            <input
              placeholder="Search filename"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", minWidth: 200 }}
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc" }}
            >
              <option value="">All types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
            <span style={{ color: "#666", fontSize: 13 }}>Sort by</span>
            <span style={{ color: "#666", fontSize: 13 }}>View</span>
          </div>

          {/* Row 2: Copy URLs, Delete selected, Clear selection, Total */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #eee" }}>
            <button
              type="button"
              style={{ ...BTN_PRIMARY }}
              disabled={selected.size === 0}
              onClick={() => selectedUrls.length && copyToClipboard(selectedUrls.join("\n"))}
            >
              Copy URLs
            </button>
            <button
              type="button"
              style={BTN_DANGER}
              disabled={selected.size === 0}
              onClick={() => setToDelete("bulk")}
            >
              Delete selected
            </button>
            <button type="button" style={BTN_GRAY} onClick={clearSelection}>
              Clear selection
            </button>
            <div style={{ marginLeft: "auto", fontWeight: 500, background: "#f3f4f6", padding: "6px 12px", borderRadius: 8 }}>
              Total: {total}
            </div>
          </div>

          {toDelete && (
            <div style={{ marginBottom: 12, padding: 12, background: "#fef2f2", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span>
                {toDelete === "bulk" ? "Delete selected items?" : "Delete this item?"}
              </span>
              <button type="button" style={BTN_DANGER} onClick={handleDeleteConfirmed}>
                Delete
              </button>
              <button type="button" style={BTN_GRAY} onClick={() => setToDelete(null)}>
                Cancel
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ padding: 24, color: "#666" }}>Loading…</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 24, color: "#666" }}>No media found. Upload files above or use the dropzone.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {items.map((it) => (
                <MediaCard
                  key={it._id}
                  item={it}
                  selected={selected.has(String(it._id))}
                  onSelect={() => toggleSelect(String(it._id))}
                  onEdit={() => {}}
                  onDelete={() => setToDelete(String(it._id))}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                style={BTN_GRAY}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span style={{ fontSize: 14 }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                style={BTN_GRAY}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
          </main>
        </section>
      </div>
    </>
  );
}
