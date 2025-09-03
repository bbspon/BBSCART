import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminFranchiseNotificationBell({
  apiBase,
  onOpenRequest,
}) {
  const [items, setItems] = useState([]);

  const fetchNotes = async () => {
    try {
      const r = await axios.get(`${apiBase}/api/franchisees/admin/requests`);
      if (r?.data?.ok && Array.isArray(r.data.data)) setItems(r.data.data);
    } catch (e) {
      console.error(
        "franchisee bell fetch error:",
        e?.response?.data || e.message
      );
    }
  };

  useEffect(() => {
    fetchNotes();
    const id = setInterval(fetchNotes, 10000);
    return () => clearInterval(id);
  }, []);

  const open = (rec) => {
    const id = rec._id || rec.id || rec.franchiseeId;
    if (id) onOpenRequest(id);
  };

  const count = items.length;
  return (
    <div style={{ position: "relative", cursor: "pointer" }}>
      <span role="img" aria-label="bell">
        🔔
      </span>
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
              <div style={{ fontWeight: 600 }}>New Franchise Application</div>
              <div style={{ fontSize: 12 }}>
                {`${n.vendor_fname || ""} ${n.vendor_lname || ""}`.trim()}
              </div>
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
