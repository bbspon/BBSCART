// backend/middleware/assignVendorMiddleware.js
const CustomerVendorAssignment = require("../models/CustomerVendorAssignment");
const Vendor = require("../models/Vendor");
const PincodeDayCounter = require("../models/PincodeDayCounter");

// Build YYYY-MM-DD in IST
function todayKeyIST() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

function nextMidnightIST() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(now)
    .reduce((a, p) => ((a[p.type] = p.value), a), {});
  const d = new Date(
    `${parts.year}-${parts.month}-${parts.day}T00:00:00+05:30`
  );
  if (now.getTime() >= d.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

function getCustomerKey(req, res) {
  if (req.user?._id) return String(req.user._id);
  // allow a guest key header for stable assignment
  const g = req.get("x-guest-key");
  if (g) return String(g);
  // fall back to a cookie we set for guests
  if (req.cookies?.cid) return req.cookies.cid;
  const cid =
    "g_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  res.cookie("cid", cid, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  return cid;
}

async function listApprovedVendorsForPincode(pincode) {
  return Vendor.find({
    application_status: "approved",
    "register_business_address.postalCode": String(pincode),
  })
    .select({ _id: 1, user_id: 1, created_at: 1 })
    .sort({ created_at: 1, _id: 1 }) // stable order for fair rotation
    .lean();
}

// Atomic round-robin pick for the day
async function pickVendorRoundRobin(pincode, dateKey) {
  const vendors = await listApprovedVendorsForPincode(pincode);
  if (!vendors.length) return null;
  if (vendors.length === 1) return vendors[0];

  const ctr = await PincodeDayCounter.findOneAndUpdate(
    { pincode: String(pincode), dateKey },
    { $inc: { nextIndex: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  const idx = Math.abs((ctr?.nextIndex || 1) - 1) % vendors.length;
  return vendors[idx];
}

module.exports = async function assignVendorMiddleware(req, res, next) {
  try {
    // IMPORTANT: prefer explicit sources over cookie
    const pincode = (
      req.query?.pincode || // 1) explicit query
      req.get("x-pincode") || // 2) explicit header
      req.cookies?.pincode ||
      ""
    ) // 3) fallback cookie
      .toString()
      .trim();

    // If no pincode given, let downstream decide. Do not force 400 here.
    if (!pincode) return next();

    // Keep cookie in sync with the resolved pincode
    if (req.cookies?.pincode !== pincode) {
      res.cookie("pincode", pincode, {
        httpOnly: false,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    const dateKey = todayKeyIST();
    const customerKey = getCustomerKey(req, res);

    // Reuse existing assignment for this (customer, pincode, day) if present
    let assignment = await CustomerVendorAssignment.findOne({
      customerKey,
      pincode,
      dateKey,
    }).lean();

    if (!assignment) {
      const vendor = await pickVendorRoundRobin(pincode, dateKey);
      if (!vendor) {
        req.assignedVendorId = null;
        req.assignedVendorUserId = null;
        req._resolvedPincode = pincode;
        req._dateKey = dateKey;
        return next();
      }

      assignment = await CustomerVendorAssignment.findOneAndUpdate(
        { customerKey, pincode, dateKey },
        {
          $setOnInsert: {
            customerKey,
            pincode,
            dateKey,
            vendor_id: vendor._id,
            expiresAt: nextMidnightIST(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true, lean: true }
      );
    }

    req.assignedVendorId =
      assignment.vendor_id?.toString?.() || String(assignment.vendor_id || "");
    const vDoc = await Vendor.findById(assignment.vendor_id)
      .select({ user_id: 1 })
      .lean();
    req.assignedVendorUserId = vDoc?.user_id?.toString?.() || "";

    req._resolvedPincode = pincode;
    req._dateKey = dateKey;

    next();
  } catch (err) {
    console.error("assignVendorMiddleware error:", err);
    next(); // fail-open so public endpoints still respond
  }
};
