import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminAgentReviewModal from "../../components/pages/admin/AdminAgentReviewModal";

export default function AdminAgentRequestsPage() {

  // UI controls
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // modal
  const [selId, setSelId] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const url = `${
        import.meta.env.VITE_API_URL
      }/api/agent-heads/agent/requests`;
      const { data } = await axios.get(url);
      const list = Array.isArray(data?.data) ? data.data : [];
      setRows(list);
    } catch (e) {
      console.error(
        "Agent requests list error:",
        e?.response?.data || e.message
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safe = (v) => (v === undefined || v === null ? "" : String(v));
  const fmtTime = (t1, t2) => {
    const t = t1 || t2;
    return t ? new Date(t).toLocaleString() : "";
  };

  // client-side search (name/email/mobile/city/state)
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const name = `${safe(r.vendor_fname)} ${safe(
        r.vendor_lname
      )}`.toLowerCase();
      const email = safe(r.email).toLowerCase();
      const mobile = safe(r.mobile).toLowerCase();
      const city = safe(r?.register_business_address?.city).toLowerCase();
      const state = safe(r?.register_business_address?.state).toLowerCase();
      return (
        name.includes(needle) ||
        email.includes(needle) ||
        mobile.includes(needle) ||
        city.includes(needle) ||
        state.includes(needle)
      );
    });
  }, [rows, q]);

  // pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageData = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Agent Requests</h2>

      {/* Top controls: search + page size */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          margin: "12px 0",
        }}
      >
        <input
          placeholder="Search name / email / mobile / city / state"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          style={{ padding: 8, minWidth: 360 }}
        />
        <select
          value={limit}
          onChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(1);
          }}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              <th style={{ textAlign: "left", padding: 10 }}>Name</th>
              <th style={{ textAlign: "left", padding: 10 }}>Email</th>
              <th style={{ textAlign: "left", padding: 10 }}>Mobile</th>
              <th style={{ textAlign: "left", padding: 10 }}>City</th>
              <th style={{ textAlign: "left", padding: 10 }}>State</th>
              <th style={{ textAlign: "left", padding: 10 }}>Submitted</th>
              <th style={{ textAlign: "left", padding: 10 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 16 }}>
                  Loading…
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 16 }}>
                  No pending agent requests.
                </td>
              </tr>
            ) : (
              pageData.map((r) => (
                <tr key={r._id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: 10 }}>
                    {safe(r.vendor_fname)} {safe(r.vendor_lname)}
                  </td>
                  <td style={{ padding: 10 }}>{safe(r.email)}</td>
                  <td style={{ padding: 10 }}>{safe(r.mobile)}</td>
                  <td style={{ padding: 10 }}>
                    {safe(r?.register_business_address?.city)}
                  </td>
                  <td style={{ padding: 10 }}>
                    {safe(r?.register_business_address?.state)}
                  </td>
                  <td style={{ padding: 10 }}>
                    {fmtTime(r.submitted_at, r.created_at)}
                  </td>
                  <td style={{ padding: 10 }}>
                    <button onClick={() => setSelId(r._id)}>Review</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pager */}
      <div
        style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}
      >
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <div>
          Page {page} / {totalPages}
        </div>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>

      {/* Review modal */}
      {selId && (
        <AdminAgentReviewModal
          id={selId}
          onClose={() => {
            setSelId(null);
            fetchList();
          }}
        />
      )}
    </div>
  );
}
