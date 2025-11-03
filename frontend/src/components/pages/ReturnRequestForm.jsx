import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SlotPicker from "../../components/SlotPicker"; // keep your path
import { toast } from "react-hot-toast";

export default function ReturnRequestForm({ order, onClose, onSubmitted }) {
  // If the parent passed an order, use it. Otherwise fetch by :orderId from URL.
  const { orderId } = useParams();
  const [loadedOrder, setLoadedOrder] = useState(order || null);
  const [loading, setLoading] = useState(!orderId && !order ? false : !order);
  const [loadErr, setLoadErr] = useState("");
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5001";

  useEffect(() => {
    let alive = true;
    // Fetch only if there is no order prop or it has no items
    const needsFetch =
      (!order && orderId) ||
      (order &&
        !Array.isArray(order.orderItems) &&
        !Array.isArray(order.items));

    if (!needsFetch) return;

    (async () => {
      try {
        setLoading(true);
        setLoadErr("");
        const res = await axios.get(`${apiBase}/api/orders/${orderId}`, {
          withCredentials: true,
          timeout: 15000,
        });
        const o = res?.data?.data?.order || res?.data?.order || null;
        if (alive) setLoadedOrder(o);
      } catch (e) {
        if (alive)
          setLoadErr(e?.response?.data?.message || "Could not load order");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [order, orderId]);

  // Use whichever we have: prop takes priority, else fetched
  const current = order || loadedOrder || {};

  // Tolerate both shapes: orderItems[] (new) or items[] (legacy)
  const items = Array.isArray(current?.orderItems)
    ? current.orderItems
    : Array.isArray(current?.items)
    ? current.items
    : [];

  // ===== UI state (unchanged visuals/labels) =====
const [reasonType, setReasonType] = useState(""); // Damaged / Wrong item / Other
const [reasonText, setReasonText] = useState(""); // only when "Other"
const reasonValue = reasonType === "Other" ? reasonText.trim() : reasonType;  const [sel, setSel] = useState({}); // { [orderItemId]: true }
  const [addr, setAddr] = useState(() => {
    const s = current?.shipping_address || {};
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

  // If the order loads later, refresh default address once
  useEffect(() => {
    if (!current?._id) return;
    const s = current?.shipping_address || {};
    setAddr((prev) => {
      // don't overwrite if the user already typed something
      const userTyped =
        prev.name ||
        prev.phone ||
        prev.line1 ||
        prev.line2 ||
        prev.city ||
        prev.state ||
        prev.postalCode;
      if (userTyped) return prev;
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
  }, [current?._id]); // run once when order becomes available

  const allChecked = useMemo(
    () =>
      items.length > 0 && items.every((i) => !!sel[i?._id ?? i?.id ?? i?.sku]),
    [items, sel]
  );

  function keyOf(it) {
    return (
      it?._id ??
      it?.id ??
      it?.sku ??
      `${it?.product || it?.sku || "line"}-${it?.quantity || it?.qty || 1}`
    );
  }

  function toggleAll(e) {
    const v = e.target.checked;
    const next = {};
    if (v) items.forEach((i) => (next[keyOf(i)] = true));
    setSel(v ? next : {});
  }

  function toggleOne(k) {
    setSel((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  async function submit() {
    try {
      if (!current?._id) return toast.error("Order not loaded yet.");
      const chosen = items.filter((i) => sel[keyOf(i)]);
      if (!chosen.length) return toast.error("Select at least one item.");
// if (!reasonValue) return toast.error("Choose a return reason.");
//       if (!slot) return toast.error("Choose a pickup slot.");
//       if (!addr?.postalCode || String(addr.postalCode).length < 6) {
//         return toast.error("Enter a valid pickup pincode.");
//       }
      setSubmitting(true);

      const payload = {
        items: chosen.map((i) => ({
          orderItemId: i?._id ?? null, // may be null for legacy lines
          sku: i?.sku || i?.product || "",
          qty: Number(i?.quantity ?? i?.qty ?? 1),
        })),
        // reason: reasonValue,
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
        `${apiBase}/api/orders/${current._id}/returns`,
        payload,
        { timeout: 20000, withCredentials: true }
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

        {loading ? (
          <div className="text-[13px] opacity-70">Loading order…</div>
        ) : loadErr ? (
          <div className="text-[13px] text-red-600">{loadErr}</div>
        ) : (
          <div className="grid gap-2">
            {items.map((it) => {
              const k = keyOf(it);
              return (
                <label
                  key={k}
                  className="flex items-center gap-3 p-2 border rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={!!sel[k]}
                    onChange={() => toggleOne(k)}
                  />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium">
                      {it.title || it.name || it.sku || k}
                    </div>
                    <div className="text-[12px] opacity-70">
                      Qty: {it?.quantity ?? it?.qty ?? 1} • Price: ₹
                      {Number(it?.price || 0)}
                    </div>
                  </div>
                </label>
              );
            })}
            {items.length === 0 && !loading && !loadErr && (
              <div className="text-[13px] opacity-70">
                No items on this order.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reason */}
      <div className="mb-4 border rounded-lg p-3">
        <h3 className="font-semibold text-[15px] mb-2">Reason</h3>
        <select
          className="w-full border rounded-md px-3 py-2 text-[14px]"
          value={reasonType}
          onChange={(e) => {
            const v = e.target.value;
            setReasonType(v);
            if (v !== "Other") setReasonText(""); // clear custom text when switching away
          }}
        >
          <option value="">Select a reason</option>
          <option value="Damaged">Damaged</option>
          <option value="Wrong item">Wrong item</option>
          <option value="Quality issue">Quality issue</option>
          <option value="Not as described">Not as described</option>
          <option value="Other">Other</option>
        </select>

        {reasonType === "Other" && (
          <textarea
            className="w-full border rounded-md px-3 py-2 text-[14px] mt-2"
            placeholder="Describe the issue"
            rows={3}
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
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
