// Public API for delivery serviceability and slots (used by checkout SlotPicker).
// Mount at: /api/assigned-orders/public
// No separate delivery app needed — this runs inside the BBSCART backend.
const express = require("express");
const router = express.Router();

// GET /serviceability/:pincode — mark pincode as serviceable if 5+ digits
router.get("/serviceability/:pincode", (req, res) => {
  const pincode = String(req.params.pincode || "").trim();
  const serviceable = pincode.length >= 5;
  return res.json({ ok: true, data: { serviceable } });
});

// Build default slots for next 7 days (2–3 slots per day)
function buildDefaultSlots() {
  const slots = [];
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const ranges = [
    { start: "09:00", end: "12:00", label: "Morning (9 AM – 12 PM)" },
    { start: "12:00", end: "15:00", label: "Afternoon (12 PM – 3 PM)" },
    { start: "15:00", end: "18:00", label: "Evening (3 PM – 6 PM)" },
  ];
  for (let d = 0; d < 7; d++) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + d);
    const dateStr = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
    ranges.forEach((r, i) => {
      slots.push({
        id: `slot-${dateStr}-${i}`,
        label: r.label,
        start: r.start,
        end: r.end,
        date: dateStr,
      });
    });
  }
  return slots;
}

// GET /slots/:pincode — return available delivery slots for pincode
router.get("/slots/:pincode", (req, res) => {
  const pincode = String(req.params.pincode || "").trim();
  if (pincode.length < 5) {
    return res.json({ ok: true, data: { slots: [] } });
  }
  const slots = buildDefaultSlots();
  return res.json({ ok: true, data: { slots } });
});

module.exports = router;
