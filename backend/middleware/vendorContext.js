// backend/middleware/vendorContext.js
module.exports.deriveAssignedVendor = (req, _res, next) => {
  const u = req.user || {};
  if (u && (u.role === 'vendor' || u.role === 'seller')) {
    req.assignedVendorId = u.vendor_id || u._id; // adapt if you store vendor_id differently
  }
  next();
};

module.exports.requireAdmin = (req, res, next) => {
  const r = req.user?.role;
  if (r === 'admin' || r === 'super_admin') return next();
  return res.status(403).json({ success: false, message: 'Admin only' });
};
