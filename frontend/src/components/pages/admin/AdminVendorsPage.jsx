import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AdminVendorsPage() {
  const [status, setStatus] = useState("all"); // start with all so submitted rows also show
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0 });
  const [loading, setLoading] = useState(false);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/vendors/admin/vendors`,
        { params: { status, q, page, limit } }
      );
      if (r?.data?.success || r?.data?.ok) {
        const rows = r.data.vendors || r.data.data || [];
        setData(rows);
        setMeta(r.data.meta || { total: rows.length, page, limit });
      } else {
        setData([]);
        setMeta({ total: 0 });
      }
    } catch (e) {
      console.error("list vendors error:", e?.response?.data || e.message);
      setData([]);
      setMeta({ total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(); /* eslint-disable-next-line */
  }, [status, q, page, limit]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((meta?.total || 0) / limit)),
    [meta, limit]
  );

  const safe = (v) => (v === undefined || v === null ? "" : String(v));

  const openReview = async (id) => {
    setSelectedVendorId(id);
    setReviewOpen(true);
    setReviewLoading(true);
    try {
      const r = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/vendors/admin/${id}`
      );
      if (r?.data?.success || r?.data?.ok) setSelectedVendor(r.data.data);
    } catch (e) {
      console.error("get vendor full error:", e?.response?.data || e.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReview = () => {
    setReviewOpen(false);
    setSelectedVendorId(null);
    setSelectedVendor(null);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Vendors</h2>

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
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
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
              data.map((v) => (
                <tr key={v._id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: 10 }}>
                    {safe(v.vendor_fname)} {safe(v.vendor_lname)}
                  </td>
                  <td style={{ padding: 10 }}>{safe(v.pan_number)}</td>
                  <td style={{ padding: 10 }}>{safe(v.gst_number)}</td>
                  <td style={{ padding: 10 }}>
                    {safe(v?.register_business_address?.city)}
                  </td>
                  <td style={{ padding: 10 }}>
                    {safe(v?.register_business_address?.state)}
                  </td>
                  <td style={{ padding: 10 }}>{safe(v.application_status)}</td>
                  <td style={{ padding: 10 }}>
                    {v.updated_at
                      ? new Date(v.updated_at).toLocaleString()
                      : v.updatedAt
                      ? new Date(v.updatedAt).toLocaleString()
                      : ""}
                  </td>
                  <td style={{ padding: 10 }}>
                    <button onClick={() => openReview(v._id)}>View</button>
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
              <h3 style={{ margin: 0 }}>Vendor Details</h3>
              <button onClick={closeReview}>✕</button>
            </div>

            {reviewLoading ? (
              <div style={{ padding: 16 }}>Loading…</div>
            ) : !selectedVendor ? (
              <div style={{ padding: 16 }}>Not found.</div>
            ) : (
              <>
                <div style={{ marginTop: 8 }}>
                  <div>
                    <b>Name:</b> {safe(selectedVendor.vendor_fname)}{" "}
                    {safe(selectedVendor.vendor_lname)}
                  </div>
                  <div>
                    <b>PAN:</b> {safe(selectedVendor.pan_number)}
                  </div>
                  <div>
                    <b>Aadhaar:</b> {safe(selectedVendor.aadhar_number)}
                  </div>
                  <div>
                    <b>GSTIN:</b> {safe(selectedVendor.gst_number)}
                  </div>
                  <div>
                    <b>Status:</b> {safe(selectedVendor.application_status)} |{" "}
                    <b>Active:</b> {String(selectedVendor.is_active)}
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <b>Registered Address:</b>
                  <pre style={{ background: "#f7f7f7", padding: 8 }}>
                    {JSON.stringify(
                      selectedVendor.register_business_address || {},
                      null,
                      2
                    )}
                  </pre>
                </div>
                <div style={{ marginTop: 8 }}>
                  <b>GST Address:</b>
                  <pre style={{ background: "#f7f7f7", padding: 8 }}>
                    {JSON.stringify(selectedVendor.gst_address || {}, null, 2)}
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
