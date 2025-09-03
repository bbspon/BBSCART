import { useEffect, useState } from "react";
import { assignVendor } from "../services/geoApi";
import { ensureGuestKey, getGuestKey } from "../utils/guestKey";

export default function DeliverTo({ onAssigned }) {
  const [pincode, setPincode] = useState(
    localStorage.getItem("deliveryPincode") || ""
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isOpen, setIsOpen] = useState(
    !localStorage.getItem("deliveryPincode")
  ); // 👈 replace here

  useEffect(() => {
    ensureGuestKey();
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
      localStorage.setItem("deliveryPincode", pincode);

      const customerId = null;
      const data = await assignVendor(pincode, customerId);

      localStorage.setItem("assignedStore", JSON.stringify(data));

      setMsg(
        `Vendor assigned for ${data.pincode} until ${new Date(
          data.expiresAt
        ).toLocaleString()}`
      );
      onAssigned?.(data);
      setIsOpen(false); // 👈 close modal after success
    } catch (err) {
      console.error(err);
      setMsg(
        err?.response?.data?.message ||
          "Service not available for this pincode."
      );
      localStorage.removeItem("deliveryPincode");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">Deliver To</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={pincode}
            onChange={(e) => setPincode(e.target.value.trim())}
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="Enter 6-digit pincode"
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {loading ? "Assigning…" : "Set Pincode"}
          </button>
          {msg ? <p className="text-sm">{msg}</p> : null}
          <p className="text-xs text-gray-500">
            Not logged in? We’ll use a guest key:{" "}
            {getGuestKey() || "(creating…)"}
          </p>
        </form>
      </div>
    </div>
  );
}
