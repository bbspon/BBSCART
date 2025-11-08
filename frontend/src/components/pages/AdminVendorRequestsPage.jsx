import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminVendorReviewPage from "../../components/pages/admin/AdminVendorReviewPage"; // adjust path if different

export default function AdminVendorRequestsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [reviewId, setReviewId] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/vendors/admin/requests`
      );
      if (r?.data?.ok && Array.isArray(r.data.data)) setRows(r.data.data);
    } catch (e) {
      console.error("vendor requests error:", e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div className="bg-slate-300 pt-3 rounded-t-lg  border-b-0">
        <h2 className="text-2xl font-semibold text-gray-700 flex items-center justify-center gap-2 border-b border-black pb-2">
          Vendor’s Request
        </h2>
      </div>
      <div className="flex flex-row  justify-center items-center gap-3 m-4">
        <label htmlFor="">Search :</label>

        <input
          placeholder="Search name / PAN / GST / Aadhaar / City / State"
          className=" pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 text-sm focus:ring-2 focus:ring-red-200 w-[500px]"
        />
        <select value={status}>
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
        </select>
        <select>
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
              rows.map((v) => (
                <tr key={v._id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: 10 }}>
                    {(v.vendor_fname || "") + " " + (v.vendor_lname || "")}
                  </td>
                  <td style={{ padding: 10 }}>{v.pan_number || ""}</td>
                  <td style={{ padding: 10 }}>{v.aadhar_number || ""}</td>
                  <td style={{ padding: 10 }}>{v.gst_number || ""}</td>
                  <td style={{ padding: 10 }}>
                    {v.submitted_at
                      ? new Date(v.submitted_at).toLocaleString()
                      : ""}
                  </td>
                  <td style={{ padding: 10 }}>
                    <button
                      className=" bg-red-900 rounded-xl p-1 text-white px-5"
                      onClick={() => setReviewId(v._id)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-row justify-between items-center px-3 m-4">
        <button className="bg-neutral-500 hover:bg-neutral-800 text-white px-3 rounded-xl">
          Prev
        </button>
        <div className="bg-neutral-500 hover:bg-neutral-800 text-white px-3 rounded-xl">
          Page
        </div>
        <button className="bg-neutral-500 hover:bg-neutral-800 text-white px-3 rounded-xl">
          Next
        </button>
      </div>
      {reviewId && (
        <AdminVendorReviewPage
          apiBase={import.meta.env.VITE_API_URL}
          vendorId={reviewId}
          onClose={() => {
            setReviewId(null);
            fetchList();
          }}
        />
      )}
    </div>
  );
}
