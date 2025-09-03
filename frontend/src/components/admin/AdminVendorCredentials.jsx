import { useEffect, useState } from "react";
import instance from "../../services/axiosInstance";
export default function AdminVendorCredentials() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    setMsg("");
    try {
      const { data } = await instance.get(
        `${import.meta.env.VITE_API_URL}/api/admin/vendors`,
        {
          params: { status: "approved" },
        }
      );
      if (data?.success) {
        setVendors(data.vendors || []);
      } else {
        setMsg(data?.message || "Failed to load vendors");
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createCreds(id) {
    const ok = window.confirm("Send set-password link to this vendor?");
    if (!ok) return;
    try {
      const { data } = await instance.post(
        `/api/admin/vendors/${id}/create-credentials`
      );
      if (data?.success) {
        setMsg("Link sent successfully");
        await load();
      } else setMsg(data?.message || "Error creating credentials");
    } catch (err) {
      setMsg(err?.response?.data?.message || err.message);
    }
  }

  function copyLink(token) {
    const link = `${
      import.meta.env.VITE_VENDOR_PORTAL_URL
    }/vendor/set-password/${token}`;
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard:\n" + link);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Vendor Credentials</h2>
      {msg && <div style={{ margin: "8px 0", color: "red" }}>{msg}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : vendors.length === 0 ? (
        <div>No approved vendors</div>
      ) : (
        <table
          border="1"
          cellPadding="6"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>User Linked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v._id}>
                <td>{v.display_name || v.legal_name}</td>
                <td>{v.email}</td>
                <td>{v.application_status}</td>
                <td>{v.user_id ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => createCreds(v._id)} disabled={!v._id}>
                    Create / Resend Link
                  </button>
                  {v.passwordResetToken && (
                    <button onClick={() => copyLink(v.passwordResetToken)}>
                      Copy Link
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
