import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AdminFranchiseesPage() {
  const [status, setStatus] = useState("approved");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0 });
  const [loading, setLoading] = useState(false);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/franchisees/admin/franchisees`,
        {
          params: { status, q, page, limit },
        }
      );
      if (r?.data?.ok) {
        setData(r.data.data || []);
        setMeta(r.data.meta || { total: 0 });
      }
    } catch (e) {
      console.error("list franchisees error:", e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q, page, limit]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((meta?.total || 0) / limit)),
    [meta, limit]
  );

  const openReview = async (id) => {
    setSelectedId(id);
    setReviewOpen(true);
    setReviewLoading(true);
    try {
      const r = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/franchisees/admin/${id}`
      );
      if (r?.data?.ok) setSelected(r.data.data);
    } catch (e) {
      console.error(
        "get franchise full error:",
        e?.response?.data || e.message
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReview = () => {
    setReviewOpen(false);
    setSelectedId(null);
    setSelected(null);
  };

  const safe = (v) => (v === undefined || v === null ? "" : String(v));

  return (
    <>
      <div className=" m-8  rounded-lg border border-black">
        <div className="bg-slate-300 pt-3 rounded-t-lg  border-b-0">
          <h2 className="text-2xl font-semibold text-gray-700 flex items-center justify-center gap-2 border-b border-black pb-2">
            Franchisees
          </h2>
        </div>

        <div className="flex flex-row  justify-center items-center gap-3 m-4">
          <label htmlFor="">Search :</label>
          <input
            placeholder="Search name / PAN / GST / Aadhaar / City / State"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className=" pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 text-sm focus:ring-2 focus:ring-red-200 w-[500px]"
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
              className =
                " pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 text-sm focus:ring-2 focus:ring-red-200 w-[500px]";
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
                    <td style={{ padding: 10 }}>
                      {safe(x.application_status)}
                    </td>
                    <td style={{ padding: 10 }}>
                      {x.updated_at
                        ? new Date(x.updated_at).toLocaleString()
                        : ""}
                    </td>
                    <td style={{ padding: 10 }}>
                      <button onClick={() => openReview(x._id)}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-row justify-between items-center px-3 m-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="bg-neutral-500 hover:bg-neutral-800 text-white px-3 rounded-xl"
          >
            Prev
          </button>
          <div className="bg-neutral-500 hover:bg-neutral-800 text-white px-3 rounded-xl">
            Page {page} / {totalPages}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="bg-neutral-500 hover:bg-neutral-800 text-white px-3 rounded-xl"
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
                <h3 style={{ margin: 0 }}>Franchise Details</h3>
                <button onClick={closeReview}>✕</button>
              </div>

              {reviewLoading ? (
                <div style={{ padding: 16 }}>Loading…</div>
              ) : !selected ? (
                <div style={{ padding: 16 }}>Not found.</div>
              ) : (
                <>
                  <div style={{ marginTop: 8 }}>
                    <div>
                      <b>Name:</b> {safe(selected.vendor_fname)}{" "}
                      {safe(selected.vendor_lname)}
                    </div>
                    <div>
                      <b>PAN:</b> {safe(selected.pan_number)}
                    </div>
                    <div>
                      <b>Aadhaar:</b> {safe(selected.aadhar_number)}
                    </div>
                    <div>
                      <b>GSTIN:</b> {safe(selected.gst_number)}
                    </div>
                    <div>
                      <b>Status:</b> {safe(selected.application_status)} |{" "}
                      <b>Active:</b> {String(selected.is_active)}
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <b>Registered Address:</b>
                    <pre style={{ background: "#f7f7f7", padding: 8 }}>
                      {JSON.stringify(
                        selected.register_business_address || {},
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <b>GST Address:</b>
                    <pre style={{ background: "#f7f7f7", padding: 8 }}>
                      {JSON.stringify(selected.gst_address || {}, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
