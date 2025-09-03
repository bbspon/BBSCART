import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminFranchiseReviewPage({
  franchiseeId,
  onClose,
}) {
  const [f, setF] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisionLoading, setDecisionLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const r = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/franchisees/admin/${franchiseeId}`
        );
        if (r?.data?.ok) setF(r.data.data);
      } catch (e) {
        console.error(
          "getFranchiseFull error:",
          e?.response?.data || e.message
        );
      } finally {
        setLoading(false);
      }
    };
    if (franchiseeId) run();
  }, [import.meta.env.VITE_API_URL, franchiseeId]);

  const decide = async (decision) => {
    if (!franchiseeId) return;
    const body = { decision };
    if (decision === "reject") {
      const reason = window.prompt("Reason for rejection:");
      if (!reason) return;
      body.reason = reason;
    }
    setDecisionLoading(true);
    try {
      const r = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/franchisees/admin/${franchiseeId}/decision`,
        body
      );
      if (!r?.data?.ok) throw new Error(r?.data?.message || "Failed");
      alert(`Franchise ${decision}`);
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed");
    } finally {
      setDecisionLoading(false);
    }
  };

  const safe = (v) => (v === undefined || v === null ? "" : String(v));
  const pretty = (obj) => (
    <pre style={{ background: "#f7f7f7", padding: 8, whiteSpace: "pre-wrap" }}>
      {JSON.stringify(obj || {}, null, 2)}
    </pre>
  );
  const fileUrl = (fpath) => {
    if (!fpath) return null;
    return fpath.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL}${fpath}`
      : `${import.meta.env.VITE_API_URL}/uploads/${fpath}`;
    // adjust if your controller returns absolute URLs already
  };

  return (
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
        if (e.target === e.currentTarget) onClose?.();
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
          <h3 style={{ margin: 0 }}>Franchise Review</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>Loading…</div>
        ) : !f ? (
          <div style={{ padding: 16 }}>Not found</div>
        ) : (
          <>
            <section style={{ margin: "8px 0" }}>
              <h4>Identity</h4>
              <div>
                Name: {safe(f.vendor_fname)} {safe(f.vendor_lname)}
              </div>
              <div>
                DOB: {f.dob ? new Date(f.dob).toLocaleDateString() : ""}
              </div>
              <div>PAN: {safe(f.pan_number)}</div>
              {f.pan_pic && (
                <a href={fileUrl(f.pan_pic)} target="_blank" rel="noreferrer">
                  View PAN
                </a>
              )}
            </section>

            <section style={{ margin: "8px 0" }}>
              <h4>Aadhaar</h4>
              <div>Number: {safe(f.aadhar_number)}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {f.aadhar_pic_front && (
                  <img
                    src={fileUrl(f.aadhar_pic_front)}
                    alt="Aadhaar Front"
                    style={{ maxWidth: 240 }}
                  />
                )}
                {f.aadhar_pic_back && (
                  <img
                    src={fileUrl(f.aadhar_pic_back)}
                    alt="Aadhaar Back"
                    style={{ maxWidth: 240 }}
                  />
                )}
              </div>
            </section>

            <section style={{ margin: "8px 0" }}>
              <h4>Registered Address</h4>
              {pretty(f.register_business_address)}
            </section>

            <section style={{ margin: "8px 0" }}>
              <h4>GST</h4>
              <div>GSTIN: {safe(f.gst_number)}</div>
              <div>Legal Name: {safe(f.gst_legal_name)}</div>
              <div>Constitution: {safe(f.gst_constitution)}</div>
              {pretty(f.gst_address)}
              {f.gst_cert_pic && (
                <a
                  href={fileUrl(f.gst_cert_pic)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View GST Certificate
                </a>
              )}
            </section>

            <section style={{ margin: "8px 0" }}>
              <h4>Bank</h4>
              <div>Account Holder: {safe(f.account_holder_name)}</div>
              <div>Account No: {safe(f.account_no)}</div>
              <div>IFSC: {safe(f.ifcs_code)}</div>
              <div>
                Bank: {safe(f.bank_name)} | Branch: {safe(f.branch_name)}
              </div>
              <div>Address: {safe(f.bank_address)}</div>
              {f.cancel_cheque_passbook && (
                <a
                  href={fileUrl(f.cancel_cheque_passbook)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Bank Proof
                </a>
              )}
            </section>

            <section style={{ margin: "8px 0" }}>
              <h4>Outlet</h4>
              <div>
                Manager: {safe(f.outlet_manager_name)} | Phone:{" "}
                {safe(f.outlet_contact_no)}
              </div>
              {pretty(f.outlet_location)}
              {f.outlet_nameboard_image && (
                <img
                  src={fileUrl(f.outlet_nameboard_image)}
                  alt="Outlet"
                  style={{ maxWidth: 320 }}
                />
              )}
            </section>

            <section style={{ margin: "8px 0" }}>
              <h4>Status</h4>
              <div>Application: {safe(f.application_status)}</div>
              <div>
                Submitted:{" "}
                {f.submitted_at
                  ? new Date(f.submitted_at).toLocaleString()
                  : "-"}
              </div>
              <div>
                Active: {String(f.is_active)} | Declined: {String(f.is_decline)}
              </div>
              {f.decline_reason && (
                <div>Decline Reason: {safe(f.decline_reason)}</div>
              )}
            </section>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => decide("approve")}
                disabled={decisionLoading}
              >
                Approve
              </button>
              <button
                onClick={() => decide("reject")}
                disabled={decisionLoading}
              >
                Reject
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
