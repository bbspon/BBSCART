import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import SlotPicker from "../../components/SlotPicker"; // adjust path if needed
import { toast } from "react-hot-toast";

export default function ReturnRequestForm({ order, onClose, onSubmitted }) {
  const items = order?.orderItems || [];

  // UI state
  const [reason, setReason] = useState("");
  const [sel, setSel] = useState({}); // { [orderItemId]: true }
  const [addr, setAddr] = useState(() => {
    const s = order?.shipping_address || {};
    return {
      name: s?.name || "",
      phone: s?.phone || "",
      line1: s?.address || s?.line1 || "",
      line2: s?.landmark || s?.line2 || "",
      city: s?.city || "",
      state: s?.state || "",
      postalCode: s?.postalCode || s?.pincode || "",
    };
  });
  const [slot, setSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const allChecked = useMemo(
    () => items.length > 0 && items.every((i) => !!sel[i._id]),
    [items, sel]
  );

  function toggleAll(e) {
    const v = e.target.checked;
    const next = {};
    if (v) items.forEach((i) => (next[i._id] = true));
    setSel(v ? next : {});
  }

  function toggleOne(id) {
    setSel((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function submit() {
    try {
      const chosen = items.filter((i) => sel[i._id]);
      if (!chosen.length) return toast.error("Select at least one item.");
      if (!reason.trim()) return toast.error("Choose a return reason.");
      if (!slot) return toast.error("Choose a pickup slot.");
      if (!addr?.postalCode || String(addr.postalCode).length < 6) {
        return toast.error("Enter a valid pickup pincode.");
      }
      setSubmitting(true);

      const payload = {
        items: chosen.map((i) => ({
          orderItemId: i._id,
          sku: i.sku || i.product || "",
          qty: Number(i.quantity || 1),
        })),
        reason,
        pickupAddress: {
          name: addr.name,
          phone: addr.phone,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          pincode: String(addr.postalCode),
        },
        pickupSlot: slot,
      };

      const res = await axios.post(
        `/api/orders/${order._id}/returns`,
        payload,
        {
          timeout: 20000,
        }
      );

      if (res?.data?.success) {
        toast.success("Return requested.");
        onSubmitted?.(res.data.data); // { rmaId, trackingId }
        onClose?.();
      } else {
        toast.error(res?.data?.message || "Failed to request return.");
      }
    } catch (e) {
      console.error("[ReturnRequestForm.submit]", e);
      toast.error(e?.response?.data?.message || "Server error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Items */}
      <div className="mb-4 border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-[15px]">Select items to return</h3>
          <label className="text-[13px] flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            Select all
          </label>
        </div>
        <div className="grid gap-2">
          {items.map((it) => (
            <label
              key={it._id}
              className="flex items-center gap-3 p-2 border rounded-md"
            >
              <input
                type="checkbox"
                checked={!!sel[it._id]}
                onChange={() => toggleOne(it._id)}
              />
              <div className="flex-1">
                <div className="text-[14px] font-medium">
                  {it.title || it.name || it.sku || it._id}
                </div>
                <div className="text-[12px] opacity-70">
                  Qty: {it.quantity} • Price: ₹{it.price}
                </div>
              </div>
            </label>
          ))}
          {items.length === 0 && (
            <div className="text-[13px] opacity-70">
              No items on this order.
            </div>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="mb-4 border rounded-lg p-3">
        <h3 className="font-semibold text-[15px] mb-2">Reason</h3>
        <select
          className="w-full border rounded-md px-3 py-2 text-[14px]"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">Select a reason</option>
          <option value="Damaged">Damaged</option>
          <option value="Wrong item">Wrong item</option>
          <option value="Quality issue">Quality issue</option>
          <option value="Not as described">Not as described</option>
          <option value="Other">Other</option>
        </select>
        {reason === "Other" && (
          <textarea
            className="w-full border rounded-md px-3 py-2 text-[14px] mt-2"
            placeholder="Describe the issue"
            rows={3}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
      </div>

      {/* Pickup address */}
      <div className="mb-4 border rounded-lg p-3">
        <h3 className="font-semibold text-[15px] mb-2">Pickup address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded-md px-3 py-2 text-[14px]"
            placeholder="Full name"
            value={addr.name}
            onChange={(e) => setAddr({ ...addr, name: e.target.value })}
          />
          <input
            className="border rounded-md px-3 py-2 text-[14px]"
            placeholder="Phone"
            value={addr.phone}
            onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
          />
          <input
            className="border rounded-md px-3 py-2 text-[14px] md:col-span-2"
            placeholder="Address line 1"
            value={addr.line1}
            onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
          />
          <input
            className="border rounded-md px-3 py-2 text-[14px] md:col-span-2"
            placeholder="Address line 2"
            value={addr.line2}
            onChange={(e) => setAddr({ ...addr, line2: e.target.value })}
          />
          <input
            className="border rounded-md px-3 py-2 text-[14px]"
            placeholder="City"
            value={addr.city}
            onChange={(e) => setAddr({ ...addr, city: e.target.value })}
          />
          <input
            className="border rounded-md px-3 py-2 text-[14px]"
            placeholder="State"
            value={addr.state}
            onChange={(e) => setAddr({ ...addr, state: e.target.value })}
          />
          <input
            className="border rounded-md px-3 py-2 text-[14px]"
            placeholder="Pincode"
            value={addr.postalCode}
            onChange={(e) => setAddr({ ...addr, postalCode: e.target.value })}
          />
        </div>
      </div>

      {/* Pickup slot */}
      <div className="mb-4 border rounded-lg p-3">
        <h3 className="font-semibold text-[15px] mb-2">Pickup time slot</h3>
        <div className="p-2 border rounded-md">
          <SlotPicker
            pincode={addr.postalCode}
            value={slot}
            onChange={setSlot}
          />
        </div>
        {slot && (
          <div className="mt-2 text-[12px] opacity-80">
            Selected: {slot.label} ({slot.start}–{slot.end}) on {slot.date}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded-md border"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-md bg-blue-600 text-white"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Request return"}
        </button>
      </div>
    </div>
  );
}
