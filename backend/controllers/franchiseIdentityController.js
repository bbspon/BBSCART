const FranchiseIdentityCard = require("../models/FranchiseIdentityCard");

exports.getFranchiseIdentity = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const card = await FranchiseIdentityCard.findOne({ franchiseId });

    return res.json({ success: true, data: card || null });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFranchiseIdentity = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const updateData = req.body;

    if (req.files?.profileImg) {
      updateData.profileImg =
        "/uploads/franchise-identity/" + req.files.profileImg[0].filename;
    }

    if (req.files?.signature) {
      updateData.signature =
        "/uploads/franchise-identity/" + req.files.signature[0].filename;
    }

    const updated = await FranchiseIdentityCard.findOneAndUpdate(
      { franchiseId },
      updateData,
      { new: true, upsert: true }
    );

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
