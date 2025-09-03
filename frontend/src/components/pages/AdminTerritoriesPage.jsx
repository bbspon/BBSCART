import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminTerritoryReviewPage from "../../components/pages/admin/AdminTerritoryReviewPage"; // adjust path

export default function AdminTerritoriesPage() {

  const [status, setStatus] = useState("approved");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0 });
  const [loading, setLoading] = useState(false);

  const [reviewOpenId, setReviewOpenId] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/territory-heads/admin/territories`,
        {
          params: { status, q, page, limit },
        }
      );
      if (r?.data?.ok) {
        setData(r.data.data || []);
        setMeta(r.data.meta || { total: 0 });
      }
    } catch (e) {
      console.error("list territories error:", e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [status, q, page, limit]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((meta?.total || 0) / limit)),
    [meta, limit]
  );

  const safe = (v) => (v === undefined || v === null ? "" : String(v));

  return (
    <div style={{ padding: 16 }}>
      <h2>Territory Heads</h2>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          margin: "12px 0",
        }}
      >
        <input
          placeholder="Search name / PAN / GST / Aadhaar / City / State"
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
              <th style={{ textAlign: "left", padding: 10 }}>PAN</th>
              <th style={{ textAlign: "left", padding: 10 }}>GSTIN</th>
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
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 16 }}>
                  No records
                </td>
              </tr>
            ) : (
              data.map((x) => (
                <tr key={x._id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: 10 }}>
                    {safe(x.vendor_fname)} {safe(x.vendor_lname)}
                  </td>
                  <td style={{ padding: 10 }}>{safe(x.pan_number)}</td>
                  <td style={{ padding: 10 }}>{safe(x.gst_number)}</td>
                  <td style={{ padding: 10 }}>
                    {safe(x?.register_business_address?.city)}
                  </td>
                  <td style={{ padding: 10 }}>
                    {safe(x?.register_business_address?.state)}
                  </td>
                  <td style={{ padding: 10 }}>{safe(x.application_status)}</td>
                  <td style={{ padding: 10 }}>
                    {x.updated_at
                      ? new Date(x.updated_at).toLocaleString()
                      : ""}
                  </td>
                  <td style={{ padding: 10 }}>
                    <button onClick={() => setReviewOpenId(x._id)}>View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      {reviewOpenId && (
        <AdminTerritoryReviewPage
          apiBase={import.meta.env.VITE_API_URL}
          territoryId={reviewOpenId}
          onClose={() => setReviewOpenId(null)}
        />
      )}
    </div>
  );
}
