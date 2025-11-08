import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const DELIVERY_PUBLIC_BASE =
  import.meta.env.VITE_DELIVERY_PUBLIC_BASE ||
  "http://localhost:5000/api/assigned-orders/public";

export default function SlotPicker({ pincode, value, onChange, disabled }) {
  const [loading, setLoading] = useState(false);
  const [serviceable, setServiceable] = useState(null);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState(null);

  const selectedKey = useMemo(() => {
    if (!value) return "";
    return `${value.date}__${value.id}`;
  }, [value]);

  useEffect(() => {
    async function load() {
      if (!pincode || String(pincode).length < 5) return;
      setLoading(true);
      setError(null);
      try {
        const svc = await axios.get(
          `${DELIVERY_PUBLIC_BASE}/api/assigned-orders/public/serviceability/${pincode}`,
          { timeout: 10000 }
        );
        const sl = await axios.get(
          `${DELIVERY_PUBLIC_BASE}/api/assigned-orders/public/slots/${pincode}`,
          {
            timeout: 15000,
          }
        );
        setServiceable(svc.data?.data?.serviceable === true);
        setSlots(Array.isArray(sl.data?.data?.slots) ? sl.data.data.slots : []);
      } catch (e) {
        setError("Could not load slots.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pincode]);

  if (!pincode) return <div>Please enter pincode.</div>;
  if (loading) return <div>Loading delivery slots…</div>;
  if (error) return <div>{error}</div>;
  if (serviceable === false) return <div>This pincode is not serviceable.</div>;

  // group by date
  const byDate = slots.reduce((acc, s) => {
    acc[s.date] = acc[s.date] || [];
    acc[s.date].push(s);
    return acc;
  }, {});

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {Object.keys(byDate)
        .sort()
        .map((date) => (
          <div
            key={date}
            style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{date}</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 8,
              }}
            >
              {byDate[date].map((s) => {
                const key = `${s.date}__${s.id}`;
                const active = key === selectedKey;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange?.(s)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: active ? "2px solid #111" : "1px solid #ccc",
                      background: active ? "#f3f3f3" : "#fff",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {s.start}–{s.end}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      {(!slots || slots.length === 0) && (
        <div>No slots available for this pincode.</div>
      )}
    </div>
  );
}
