import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AdminAgentsPage() {

  // UI controls (mirrors AdminVendorsPage)
  const [status, setStatus] = useState("approved"); // approved | submitted | under_review | rejected | draft | all
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // review overlay (modal-style)
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Load agents (approved endpoint you already use)
  const fetchAgents = async () => {
    setLoading(true);
    try {
      // Your existing endpoint returns approved agents; we filter client-side for UI parity
      const url = `${import.meta.env.VITE_API_URL}/api/admin/agents`;
      const { data } = await axios.get(url);
      const list = Array.isArray(data?.data) ? data.data : [];
      setRows(list);
    } catch (e) {
      console.error("agents list error:", e?.response?.data || e.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safe = (v) => (v === undefined || v === null ? "" : String(v));

  // Search filter (name/email/mobile/city/state)
  const searched = useMemo(() => {
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

  // Status filter (client-side to match Vendors UI control)
  const statusFiltered = useMemo(() => {
    if (status === "all") return searched;
    return searched.filter(
      (r) => (r.application_status || r.status || "approved") === status
    );
  }, [searched, status]);

  // Pagination
  const total = statusFiltered.length;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );
  const pageData = useMemo(() => {
    const start = (currentPage) => (currentPage - 1) * limit;
    return statusFiltered.slice(start(page), start(page) + limit);
  }, [statusFiltered, page, limit]);

  const fmtTime = (v1, v2, v3) => {
    const t = v1 || v2 || v3;
    return t ? new Date(t).toLocaleString() : "";
  };

  // Review overlay
  const openReview = async (id, row) => {
    setSelectedId(id);
    setReviewOpen(true);
    setReviewLoading(true);
    setSelectedDoc(null);

    // Try to fetch full detail; if not available, fall back to the row
    try {
      const r = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/agents/${id}`
      );
      if (r?.data?.data) {
        setSelectedDoc(r.data.data);
      } else {
        setSelectedDoc(row || null);
      }
    } catch (_e) {
      setSelectedDoc(row || null);
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReview = () => {
    setReviewOpen(false);
    setSelectedId(null);
    setSelectedDoc(null);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Agents</h2>

      {/* Top controls (search, status, limit) */}
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
            setPage(1);
            setQ(e.target.value);
          }}
          style={{ padding: 8, minWidth: 360 }}
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="approved">Approved</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
          <option value="all">All</option>
        </select>
        <select
          value={limit}
          onChange={(e) => {
            setPage(1);
            setLimit(parseInt(e.target.value, 10));
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
              <th style={{ textAlign: "left", padding: 10 }}>Status</th>
              <th style={{ textAlign: "left", padding: 10 }}>Updated</th>
              <th style={{ textAlign: "left", padding: 10 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: 16 }}>
                  Loading…
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 16 }}>
                  No records
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
                    {safe(r.application_status || r.status || "approved")}
                  </td>
                  <td style={{ padding: 10 }}>
                    {fmtTime(r.updatedAt, r.updated_at, r.approvedAt)}
                  </td>
                  <td style={{ padding: 10 }}>
                    <button onClick={() => openReview(r._id, r)}>View</button>
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

      {/* Review overlay (mirrors Vendors “View”) */}
      {reviewOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeReview();
          }}
        >
          <div
            style={{
              width: "min(1000px, 95vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>Agent Details</h3>
              <button onClick={closeReview}>✕</button>
            </div>

            {reviewLoading ? (
              <div style={{ padding: 16 }}>Loading…</div>
            ) : !selectedDoc ? (
              <div style={{ padding: 16 }}>Not found.</div>
            ) : (
              <>
                <div style={{ marginTop: 8 }}>
                  <div>
                    <b>Name:</b> {safe(selectedDoc.vendor_fname)}{" "}
                    {safe(selectedDoc.vendor_lname)}
                  </div>
                  <div>
                    <b>Email:</b> {safe(selectedDoc.email)}
                  </div>
                  <div>
                    <b>Mobile:</b> {safe(selectedDoc.mobile)}
                  </div>
                  <div>
                    <b>Status:</b>{" "}
                    {safe(selectedDoc.application_status || selectedDoc.status)}
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <b>Registered Address:</b>
                  <pre style={{ background: "#f7f7f7", padding: 8 }}>
                    {JSON.stringify(
                      selectedDoc.register_business_address || {},
                      null,
                      2
                    )}
                  </pre>
                </div>
                <div style={{ marginTop: 8 }}>
                  <b>GST Address:</b>
                  <pre style={{ background: "#f7f7f7", padding: 8 }}>
                    {JSON.stringify(selectedDoc.gst_address || {}, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
