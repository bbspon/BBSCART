// AdminNotificationBell.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminNotificationBell({ apiBase, onOpenRequest }) {
  const [items, setItems] = useState([]);
  const fetchNotes = async () => {
    const r = await axios.get(`${apiBase}/api/vendors/admin/notifications`);
    if (r?.data?.ok) setItems(r.data.data || []);
  };
  useEffect(() => {
    fetchNotes();
    const id = setInterval(fetchNotes, 10000); // poll every 10s
    return () => clearInterval(id);
  }, []);

  const open = (n) => {
    onOpenRequest(n.vendorId);
    axios
      .post(`${apiBase}/api/vendors/admin/notifications/${n._id}/read`)
      .catch(() => {});
  };

  const count = items.length;
  return (
    <div style={{ position: "relative", cursor: "pointer" }}>
      <span>🔔</span>
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            background: "red",
            color: "#fff",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: 12,
          }}
        >
          {count}
        </span>
      )}
      {/* Simple popup list */}
      {count > 0 && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 24,
            background: "#fff",
            border: "1px solid #ddd",
            width: 320,
            zIndex: 1000,
          }}
        >
          {items.map((n) => (
            <div
              key={n._id}
              style={{ padding: 10, borderBottom: "1px solid #eee" }}
            >
              <div style={{ fontWeight: 600 }}>{n.title}</div>
              <div style={{ fontSize: 12 }}>{n.message}</div>
              <button onClick={() => open(n)} style={{ marginTop: 6 }}>
                Open
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
