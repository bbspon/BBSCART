import { useEffect, useState } from "react";
import { assignVendor } from "../services/geoApi";
import { ensureGuestKey, getGuestKey } from "../utils/guestKey";

export default function DeliverTo({ onAssigned }) {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    ensureGuestKey();
  }, []);

  // ✅ Popup depends ONLY on vendor assignment
  useEffect(() => {
    const storedVendor = localStorage.getItem("assignedStore");

    if (!storedVendor) {
      setIsOpen(true);   // ✅ New / unassigned user
    } else {
      try {
        const data = JSON.parse(storedVendor);

        // ✅ Preload from REAL assigned vendor
        if (data?.pincode) {
          setPincode(data.pincode);
          onAssigned?.(data);
        }
      } catch {
        localStorage.removeItem("assignedStore");
        setIsOpen(true);
      }
    }
  }, []);

  const validate = (v) => /^\d{6}$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!validate(pincode)) {
      setMsg("Enter a valid 6-digit pincode.");
      return;
    }

    try {
      setLoading(true);

      const customerId = null;
      const data = await assignVendor(pincode, customerId);

      // ✅ Save ONLY after success
      localStorage.setItem("deliveryPincode", pincode);
      localStorage.setItem("assignedStore", JSON.stringify(data));

      setMsg(
        `Vendor assigned for ${data.pincode} until ${new Date(
          data.expiresAt
        ).toLocaleString()}`
      );

      onAssigned?.(data);
      setIsOpen(false);

    } catch (err) {
      console.error(err);

      setMsg(
        err?.response?.data?.message ||
        "Service not available for this pincode."
      );

      // ✅ Clear invalid state
      localStorage.removeItem("deliveryPincode");
      localStorage.removeItem("assignedStore");

    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-dark bg-opacity-40">
      <div
        className="bg-white rounded-2xl shadow-lg p-6 px-8 w-full max-w-md relative"
        style={{ backgroundColor: "rgb(255, 174, 95)" }}
      >
        <button
          onClick={() => {
            setIsOpen(false);   // ✅ Just close, save NOTHING
          }}
          className="absolute top-4 right-8 text-gray-800 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold m-4 text-center">
          Deliver To
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ""));
            }}
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit pincode"
            className="w-full border rounded px-3 py-2"
          />

          <p className="text-sm pt-2 pb-1 text-center text-gray-800">
            Guest session key: {getGuestKey() || "(creating…)"}
          </p>

          <div className="flex items-end justify-center w-full">
            <button
              type="submit"
              disabled={loading}
              className={`w-100 px-4 py-2 rounded-xl text-white ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-orange-700 hover:bg-green-800"
              }`}
            >
              {loading ? "Assigning…" : "Set Pincode"}
            </button>
          </div>

          {msg ? <p className="text-sm text-center">{msg}</p> : null}
        </form>
      </div>
    </div>
  );
}
