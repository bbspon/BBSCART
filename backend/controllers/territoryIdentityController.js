const TerritoryIdentityCard = require("../models/TerritoryIdentityCard");

exports.getTerritoryIdentity = async (req, res) => {
  try {
    const { territoryId } = req.params;

    const card = await TerritoryIdentityCard.findOne({ territoryId });

    return res.status(200).json({
      success: true,
      data: card || null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTerritoryIdentity = async (req, res) => {
  try {
    const { territoryId } = req.params;

    const updateData = req.body;

    if (req.files?.profileImg) {
      updateData.profileImg =
        "/uploads/territory-identity/" + req.files.profileImg[0].filename;
    }

    const updated = await TerritoryIdentityCard.findOneAndUpdate(
      { territoryId },
      updateData,
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
