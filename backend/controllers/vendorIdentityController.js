const VendorIdentityCard = require("../models/VendorIdentityCard");

// GET — fetch vendor identity card by vendorId
exports.getVendorIdentity = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const card = await VendorIdentityCard.findOne({ vendorId });
    if (!card) {
      return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({ success: true, data: card });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE / CREATE identity card
exports.updateVendorIdentity = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const updateData = req.body;

    // File uploads
    if (req.files?.profileImg) {
      updateData.profileImg =
        "/uploads/vendor-identity/" + req.files.profileImg[0].filename;
    }
    if (req.files?.signature) {
      updateData.signature =
        "/uploads/vendor-identity/" + req.files.signature[0].filename;
    }

    const updated = await VendorIdentityCard.findOneAndUpdate(
      { vendorId },
      updateData,
      { new: true, upsert: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
