import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminTerritoryReviewPage({
  
  territoryId,
  onClose,
}) {
  const [t, setT] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisionLoading, setDecisionLoading] = useState(false);

  const safe = (x) => (x === undefined || x === null ? "" : String(x));
  const pretty = (obj) => (
    <pre style={{ background: "#f7f7f7", padding: 8, whiteSpace: "pre-wrap" }}>
      {JSON.stringify(obj || {}, null, 2)}
    </pre>
  );
  const fileUrl = (f) =>
    !f
      ? null
      : f.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL}${f}`
      : `${import.meta.env.VITE_API_URL}/uploads/${f}`;

  useEffect(() => {
    const run = async () => {
      if (!territoryId) return;
      setLoading(true);
      try {
        const r = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/territory-heads/admin/${territoryId}`
        );
        if (r?.data?.ok) setT(r.data.data);
      } catch (e) {
        console.error(
          "get territory full error:",
          e?.response?.data || e.message
        );
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [import.meta.env.VITE_API_URL, territoryId]);

  const decide = async (decision) => {
    if (!territoryId) return;
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
        }/api/territory-heads/admin/${territoryId}/decision`,
        body
      );
      if (!r?.data?.ok) throw new Error(r?.data?.message || "Failed");
      alert(`Territory ${decision}`);
      onClose?.(true); // let parent refresh
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed");
    } finally {
      setDecisionLoading(false);
    }
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
          width: "min(1000px,95vw)",
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
          <h3 style={{ margin: 0 }}>Territory Head Review</h3>
          <button onClick={() => onClose?.()}>✕</button>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>Loading…</div>
        ) : !t ? (
          <div style={{ padding: 16 }}>Not found.</div>
        ) : (
          <>
            <section>
              <h4>Identity</h4>
              <div>
                Name: {safe(t.vendor_fname)} {safe(t.vendor_lname)}
              </div>
              <div>
                DOB: {t.dob ? new Date(t.dob).toLocaleDateString() : ""}
              </div>
              <div>Email: {safe(t.email)}</div>
              <div>Mobile: {safe(t.mobile)}</div>
              <div>PAN: {safe(t.pan_number)}</div>
              {t.pan_pic && (
                <a href={fileUrl(t.pan_pic)} target="_blank" rel="noreferrer">
                  View PAN
                </a>
              )}
            </section>

            <section>
              <h4>Aadhaar</h4>
              <div>Number: {safe(t.aadhar_number)}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {t.aadhar_pic_front && (
                  <img
                    src={fileUrl(t.aadhar_pic_front)}
                    alt="Aadhaar Front"
                    style={{ maxWidth: 240 }}
                  />
                )}
                {t.aadhar_pic_back && (
                  <img
                    src={fileUrl(t.aadhar_pic_back)}
                    alt="Aadhaar Back"
                    style={{ maxWidth: 240 }}
                  />
                )}
              </div>
            </section>

            <section>
              <h4>Registered Address</h4>
              {pretty(t.register_business_address)}
            </section>

            <section>
              <h4>GST</h4>
              <div>GSTIN: {safe(t.gst_number)}</div>
              <div>Legal Name: {safe(t.gst_legal_name)}</div>
              <div>Constitution: {safe(t.gst_constitution)}</div>
              {pretty(t.gst_address)}
              {t.gst_cert_pic && (
                <a
                  href={fileUrl(t.gst_cert_pic)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View GST Certificate
                </a>
              )}
            </section>

            <section>
              <h4>Bank</h4>
              <div>Account Holder: {safe(t.account_holder_name)}</div>
              <div>Account No: {safe(t.account_no)}</div>
              <div>IFSC: {safe(t.ifcs_code)}</div>
              <div>
                Bank: {safe(t.bank_name)} | Branch: {safe(t.branch_name)}
              </div>
              <div>Address: {safe(t.bank_address)}</div>
              {t.cancel_cheque_passbook && (
                <a
                  href={fileUrl(t.cancel_cheque_passbook)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Bank Proof
                </a>
              )}
            </section>

            <section>
              <h4>Outlet</h4>
              <div>
                Manager: {safe(t.outlet_manager_name)} | Phone:{" "}
                {safe(t.outlet_contact_no)}
              </div>
              {pretty(t.outlet_location)}
              {t.outlet_nameboard_image && (
                <img
                  src={fileUrl(t.outlet_nameboard_image)}
                  alt="Outlet"
                  style={{ maxWidth: 320 }}
                />
              )}
            </section>

            <section>
              <h4>Status</h4>
              <div>Application: {safe(t.application_status)}</div>
              <div>
                Submitted:{" "}
                {t.submitted_at
                  ? new Date(t.submitted_at).toLocaleString()
                  : "-"}
              </div>
              <div>
                Active: {String(t.is_active)} | Declined: {String(t.is_decline)}
              </div>
              {t.decline_reason && (
                <div>Decline Reason: {safe(t.decline_reason)}</div>
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
