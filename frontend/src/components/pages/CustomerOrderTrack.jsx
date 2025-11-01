// src/pages/CustomerOrderTrack.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

/**
 * Route options:
 *   /customertracking/:trackingId
 * or
 *   /customertracking?tid=<trackingId>
 */
const CustomerOrderTrack = () => {
  const { trackingId: paramTid } = useParams();
  const [data, setData] = useState(null);
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");

  // Read ID from :trackingId or ?tid=
  const trackingId = useMemo(() => {
    if (paramTid) return paramTid;
    const q = new URLSearchParams(window.location.search).get("tid");
    return q || "";
  }, [paramTid]);

  // Delivery backend base; no spaces around '=' in .env
  const API_BASE =
    import.meta.env.VITE_DELIVERY_PUBLIC_BASE || "http://localhost:5000";

  useEffect(() => {
    if (!trackingId) return;
    let mounted = true;
    (async () => {
      try {
        setState("loading");
        setError("");
        const url = `${API_BASE}/api/assigned-orders/public/track/${encodeURIComponent(
          trackingId
        )}`;
    const res = await axios.get(url, {
      timeout: 12000,
      params: { _: Date.now() }, // avoid 304 during dev
    });

        if (!mounted) return;
        if (!res.data?.ok) throw new Error(res.data?.error || "Not found");
        setData(res.data.data);
        setState("done");
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load");
        setState("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [trackingId, API_BASE]);

  const statusColor = (s) =>
    s === "DELIVERED"
      ? "#198754"
      : s === "PICKED_UP"
      ? "#fd7e14"
      : s === "ACCEPTED"
      ? "#0d6efd"
      : s === "CANCELED"
      ? "#6c757d"
      : "#ffc107";

  if (!trackingId) {
    return (
      <div style={{ padding: 20 }}>
        <div>
          Missing tracking ID. Open as /customertracking/&lt;id&gt; or
          ?tid=&lt;id&gt;.
        </div>
      </div>
    );
  }

  if (state === "loading" || state === "idle") {
    return <div style={{ padding: 20 }}>Loading…</div>;
  }

  if (state === "error") {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ color: "#b91c1c" }}>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 8,
            color: "#fff",
            background: "#0d6efd",
            border: "none",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const slot =
    data?.promiseSlot?.start && data?.promiseSlot?.end
      ? `${new Date(data.promiseSlot.start).toLocaleString()} – ${new Date(
          data.promiseSlot.end
        ).toLocaleString()}`
      : "—";

  return (
    <div
      style={{
        padding: 20,
        margin: "0 auto",
        maxWidth: 1100,
        fontFamily: "Segoe UI, system-ui, -apple-system, Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 1px 8px rgba(0,0,0,.05)",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            Track your delivery
          </div>
          <span
            style={{
              color: "#fff",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 700,
              background: statusColor(data?.status),
            }}
          >
            {data?.status}
          </span>
        </div>
        <div style={{ marginTop: 10, color: "#6b7280", fontSize: 14 }}>
          Tracking ID:{" "}
          <strong style={{ color: "#111827" }}>{data?.trackingId}</strong>
          <span style={{ margin: "0 8px" }}>&middot;</span>
          Order:{" "}
          <strong style={{ color: "#111827" }}>{data?.orderIdMasked}</strong>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 1px 8px rgba(0,0,0,.05)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Timeline</div>
          {(data?.timeline || []).length ? (
            <div
              style={{
                borderLeft: "3px solid #e5e7eb",
                paddingLeft: 12,
                marginTop: 6,
              }}
            >
              {data.timeline.map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 10,
                    margin: "10px 0",
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: "#0d6efd",
                      marginTop: 6,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.status}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {new Date(t.at).toLocaleString()}{" "}
                      {t.note ? `(${t.note})` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#6b7280" }}>No events yet.</div>
          )}
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 1px 8px rgba(0,0,0,.05)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Delivery proofs
          </div>
          {data?.proofs?.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                gap: 10,
              }}
            >
              {data.proofs.map((p, i) => (
                <a
                  key={i}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#fff",
                  }}
                  title={new Date(p.at).toLocaleString()}
                >
                  <img
                    src={p.url}
                    alt={`proof ${p.type}`}
                    style={{
                      width: "100%",
                      height: 96,
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => (e.currentTarget.style.opacity = 0.4)}
                  />
                </a>
              ))}
            </div>
          ) : (
            <div style={{ color: "#6b7280" }}>No delivery proof yet.</div>
          )}
          <div style={{ marginTop: 14, fontSize: 12, color: "#6b7280" }}>
            City / PIN:{" "}
            {(data?.destination?.city || "") +
              (data?.destination?.pincode
                ? " " + data.destination.pincode
                : "")}
            <br />
            Promised slot: {slot}
            <br />
            Last updated: {new Date(data?.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderTrack;
