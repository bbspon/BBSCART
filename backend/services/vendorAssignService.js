// services/vendorAssignService.js
const PincodeVendors = require("../models/PincodeVendors");
const CustomerVendorAssignment = require("../models/CustomerVendorAssignment");
const PincodeDayCounter = require("../models/PincodeDayCounter"); // comment if using Redis

function toIST(date = new Date()) {
  // Asia/Kolkata is UTC+5:30; compute IST by offset
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 60 * 60 * 1000);
  return ist;
}

function dateKeyIST(d = new Date()) {
  const ist = toIST(d);
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  const da = String(ist.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function msUntilMidnightIST(d = new Date()) {
  const ist = toIST(d);
  const next = new Date(ist);
  next.setHours(24, 0, 0, 0);
  return next - ist + 2 * 60 * 1000; // +2min safety
}

async function getOrCreateAssignment({ customerKey, pincode }) {
  const today = dateKeyIST();
  // 1) Return existing assignment if any
  let existing = await CustomerVendorAssignment.findOne({
    customerKey,
    pincode,
    dateKey: today,
  });
  if (existing) return existing;

  // 2) Load rotation config
  const cfg = await PincodeVendors.findOne({ pincode, active: true });
  if (!cfg || !cfg.vendorIds || cfg.vendorIds.length === 0) {
    throw new Error("No active vendors configured for this pincode");
  }

  // Build today’s active rotation list (skip paused)
  const paused = new Set((cfg.pausedVendorIds || []).map(String));
  const base = cfg.vendorIds.map(String).filter((v) => !paused.has(v));
  if (base.length === 0) throw new Error("All vendors paused for this pincode");

  // 3) Calculate rotation index using Mongo counter
  const todayKey = { pincode, dateKey: today };
  const counter = await PincodeDayCounter.findOneAndUpdate(
    todayKey,
    { $inc: { c: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  // counter.c starts at 1 after first inc; convert to zero-based
  const rotations = base.length;
  const offset = (cfg.dailyStartOffset || 0) % rotations;
  const rawIdx = (counter.c - 1) % rotations;
  const idx = (offset + rawIdx) % rotations;
  const vendorId = base[idx];

  // 4) Persist assignment with TTL at midnight IST
  const expiresAt = new Date(Date.now() + msUntilMidnightIST());
  const doc = await CustomerVendorAssignment.create({
    customerKey,
    pincode,
    dateKey: today,
    vendorId,
    expiresAt,
  });
  return doc;
}

module.exports = {
  getOrCreateAssignment,
  dateKeyIST,
  msUntilMidnightIST,
};
