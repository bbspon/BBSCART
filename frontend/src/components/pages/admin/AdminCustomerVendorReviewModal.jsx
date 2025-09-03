import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminCustomerVendorReviewModal({ id, onClose }) {
  const [doc, setDoc] = useState(null);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/customer-become-vendors/admin/customer-vendor/requests/${id}`
      );
      setDoc(data?.data || null);
    })();
  }, [id]);

  const approve = async () => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/customer-become-vendors/admin/customer-vendor/approve/${id}`,
      { notes }
    );
    alert("Approved.");
    onClose();
  };

  const reject = async () => {
    if (!reason.trim()) return alert("Enter a rejection reason.");
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/customer-become-vendors/admin/customer-vendor/reject/${id}`,
      { reason }
    );
    alert("Rejected.");
    onClose();
  };

  if (!doc) return null;

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-xl" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Review Customer Become Vendor</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div><strong>Name:</strong> {[doc.vendor_fname, doc.vendor_lname].filter(Boolean).join(" ") || "-"}</div>
                <div><strong>PAN:</strong> {doc.pan_number || "-"}</div>
                <div><strong>Aadhaar:</strong> {doc.aadhar_number || "-"}</div>
                <div><strong>GSTIN:</strong> {doc.gst_number || "-"}</div>
              </div>
              <div className="col-md-6">
                <div><strong>City:</strong> {doc.register_business_address?.city || "-"}</div>
                <div><strong>State:</strong> {doc.register_business_address?.state || "-"}</div>
                <div><strong>Status:</strong> {doc.status}</div>
                <div><strong>Updated:</strong> {doc.updated_at ? new Date(doc.updated_at).toLocaleString() : "-"}</div>
              </div>
            </div>

            <hr className="my-3" />

            <label className="form-label">Notes (for approval)</label>
            <textarea className="form-control mb-3" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />

            <label className="form-label">Reject reason</label>
            <textarea className="form-control" rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="Fill only if rejecting" />
          </div>
          <div className="modal-footer">
            <button className="btn btn-success" onClick={approve}>Approve</button>
            <button className="btn btn-outline-danger" onClick={reject}>Reject</button>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
