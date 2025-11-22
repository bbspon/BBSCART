const AgentIdentityCard = require("../models/AgentIdentityCard");

exports.getAgentIdentity = async (req, res) => {
  try {
    const { agentId } = req.params;
    const card = await AgentIdentityCard.findOne({ agentId });

    return res.status(200).json({
      success: true,
      data: card || null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAgentIdentity = async (req, res) => {
  try {
    const { agentId } = req.params;
    const updateData = req.body;

    if (req.files?.profileImg) {
      updateData.profileImg =
        "/uploads/agent-identity/" + req.files.profileImg[0].filename;
    }

    if (req.files?.signature) {
      updateData.signature =
        "/uploads/agent-identity/" + req.files.signature[0].filename;
    }

    const updated = await AgentIdentityCard.findOneAndUpdate(
      { agentId },
      updateData,
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
