import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
export default function VendorSetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const { data } = await axiosInstance.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/auth/vendors/verify-token/${token}`
        );
        if (data?.success) {
          setValid(true);
          setEmail(data.email);
        } else {
          setValid(false);
          setMsg(data?.message || "Invalid or expired link");
        }
      } catch (err) {
        setMsg(err?.response?.data?.message || err.message);
        setValid(false);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) {
      setMsg(
        "Password must be at least 8 characters and include letters + numbers"
      );
      return;
    }
    try {
      const { data } = await axiosInstance.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/auth/vendors/set-password`,
        {
          token,
          password,
        }
      );
      if (data?.success) {
        alert("Password set successfully. Redirecting to dashboard…");
        navigate("/vendor/dashboard");
      } else {
        setMsg(data?.message || "Error setting password");
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || err.message);
    }
  }

  if (loading) return <div>Checking link…</div>;

  if (!valid) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Set Password</h2>
        <div style={{ color: "red" }}>{msg || "Link expired"}</div>
        <button onClick={() => alert("Ask admin to resend link")}>
          Request new link
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Set Your Vendor Password</h2>
      <p>Email: {email}</p>
      {msg && <div style={{ color: "red" }}>{msg}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          New Password
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ marginLeft: 8 }}
          />
        </label>
        <label style={{ marginLeft: 12 }}>
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
          />
          Show
        </label>
        <div style={{ marginTop: 12 }}>
          <button type="submit">Set Password</button>
        </div>
      </form>
    </div>
  );
}
