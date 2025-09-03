import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminTerritoryReviewPage from "../../components/pages/admin/AdminTerritoryReviewPage"; // adjust path

export default function AdminTerritoryRequestsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewId, setReviewId] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/territory-heads/admin/requests`
      );
      if (r?.data?.ok && Array.isArray(r.data.data)) setRows(r.data.data);
    } catch (e) {
      console.error(
        "territory requests error:",
        e?.response?.data || e.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Territory Head’s Request</h2>
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          overflow: "hidden",
          marginTop: 12,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              <th style={{ textAlign: "left", padding: 10 }}>Name</th>
              <th style={{ textAlign: "left", padding: 10 }}>PAN</th>
              <th style={{ textAlign: "left", padding: 10 }}>Aadhaar</th>
              <th style={{ textAlign: "left", padding: 10 }}>GST</th>
              <th style={{ textAlign: "left", padding: 10 }}>Submitted</th>
              <th style={{ textAlign: "left", padding: 10 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 16 }}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 16 }}>
                  No pending requests
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr key={t._id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: 10 }}>
                    {(t.vendor_fname || "") + " " + (t.vendor_lname || "")}
                  </td>
                  <td style={{ padding: 10 }}>{t.pan_number || ""}</td>
                  <td style={{ padding: 10 }}>{t.aadhar_number || ""}</td>
                  <td style={{ padding: 10 }}>{t.gst_number || ""}</td>
                  <td style={{ padding: 10 }}>
                    {t.submitted_at
                      ? new Date(t.submitted_at).toLocaleString()
                      : ""}
                  </td>
                  <td style={{ padding: 10 }}>
                    <button onClick={() => setReviewId(t._id)}>Review</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {reviewId && (
        <AdminTerritoryReviewPage
          apiBase={import.meta.env.VITE_API_URL}
          territoryId={reviewId}
          onClose={(refresh) => {
            setReviewId(null);
            if (refresh) fetchList();
          }}
        />
      )}
    </div>
  );
}
