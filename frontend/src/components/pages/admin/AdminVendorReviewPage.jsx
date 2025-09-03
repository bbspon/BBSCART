// AdminVendorReviewPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminVendorReviewPage({  vendorId }) {
  const [v, setV] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisionLoading, setDecisionLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const r = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/vendors/admin/${vendorId}`
        );
        if (r?.data?.ok) setV(r.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [import.meta.env.VITE_API_URL, vendorId]);

  const decide = async (decision) => {
    const reason =
      decision === "reject" ? prompt("Reason for rejection:") : undefined;
    setDecisionLoading(true);
    try {
      const r = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/vendors/admin/${vendorId}/decision`,
        { decision, reason }
      );
      if (!r?.data?.ok) throw new Error(r?.data?.message || "Failed");
      alert(`Application ${decision}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setDecisionLoading(false);
    }
  };

  if (loading) return <div>Loading…</div>;
  if (!v) return <div>Not found</div>;

  const fileUrl = (f) =>
    f
      ? f.startsWith("/uploads")
        ? `${import.meta.env.VITE_API_URL}${f}`
        : `${import.meta.env.VITE_API_URL}/uploads/${f}`
      : null;

  return (
    <div style={{ padding: 16 }}>
      <h3>Vendor Review</h3>

      <section>
        <h4>Identity</h4>
        <div>
          Name: {v.vendor_fname} {v.vendor_lname}
        </div>
        <div>DOB: {v.dob ? new Date(v.dob).toLocaleDateString() : ""}</div>
        <div>PAN: {v.email}</div>

        <div>PAN: {v.pan_number}</div>
        {v.pan_pic && (
          <a href={fileUrl(v.pan_pic)} target="_blank">
            View PAN file
          </a>
        )}
      </section>

      <section>
        <h4>Aadhaar</h4>
        <div>Number: {v.aadhar_number}</div>
        {v.aadhar_pic_front && (
          <img
            src={fileUrl(v.aadhar_pic_front)}
            alt="Aadhaar Front"
            style={{ maxWidth: 240 }}
          />
        )}
        {v.aadhar_pic_back && (
          <img
            src={fileUrl(v.aadhar_pic_back)}
            alt="Aadhaar Back"
            style={{ maxWidth: 240 }}
          />
        )}
      </section>

      <section>
        <h4>Registered Address</h4>
        <pre style={{ background: "#f7f7f7", padding: 8 }}>
          {JSON.stringify(v.register_business_address, null, 2)}
        </pre>
      </section>

      <section>
        <h4>GST</h4>
        <div>GSTIN: {v.gst_number}</div>
        <div>Legal Name: {v.gst_legal_name}</div>
        <div>Constitution: {v.gst_constitution}</div>
        <pre style={{ background: "#f7f7f7", padding: 8 }}>
          {JSON.stringify(v.gst_address, null, 2)}
        </pre>
        {v.gst_cert_pic && (
          <a href={fileUrl(v.gst_cert_pic)} target="_blank">
            View GST Certificate
          </a>
        )}
      </section>

      <section>
        <h4>Bank</h4>
        <div>Account Holder: {v.account_holder_name}</div>
        <div>Account No: {v.account_no}</div>
        <div>IFSC: {v.ifcs_code}</div>
        <div>
          Bank: {v.bank_name}, Branch: {v.branch_name}
        </div>
        <div>Address: {v.bank_address}</div>
        {v.cancel_cheque_passbook && (
          <a href={fileUrl(v.cancel_cheque_passbook)} target="_blank">
            View Bank Proof
          </a>
        )}
      </section>

      <section>
        <h4>Outlet</h4>
        <div>
          Manager: {v.outlet_manager_name} | Phone: {v.outlet_contact_no}
        </div>
        <pre style={{ background: "#f7f7f7", padding: 8 }}>
          {JSON.stringify(v.outlet_location, null, 2)}
        </pre>
        {v.outlet_nameboard_image && (
          <img
            src={fileUrl(v.outlet_nameboard_image)}
            alt="Outlet Nameboard"
            style={{ maxWidth: 320 }}
          />
        )}
      </section>

      <section>
        <h4>Status</h4>
        <div>Application: {v.application_status}</div>
        <div>
          Submitted:{" "}
          {v.submitted_at ? new Date(v.submitted_at).toLocaleString() : "-"}
        </div>
        <div>
          Active: {String(v.is_active)} | Declined: {String(v.is_decline)}
        </div>
        {v.decline_reason && <div>Decline Reason: {v.decline_reason}</div>}
      </section>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => decide("approve")} disabled={decisionLoading}>
          Approve
        </button>
        <button
          onClick={() => decide("reject")}
          disabled={decisionLoading}
          style={{ marginLeft: 8 }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
