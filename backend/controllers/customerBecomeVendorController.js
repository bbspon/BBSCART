const CustomerVendor = require("../models/CustomerBecomeVendor");

exports.createCustomerVendor = async (req, res) => {
  try {
    const data = req.body;

    if (req.files?.profilePhoto)
      data.profilePhoto =
        "/uploads/customer-vendor/" + req.files.profilePhoto[0].filename;

    if (req.files?.shopPhoto)
      data.shopPhoto =
        "/uploads/customer-vendor/" + req.files.shopPhoto[0].filename;

    if (req.files?.idProofFront)
      data.idProofFront =
        "/uploads/customer-vendor/" + req.files.idProofFront[0].filename;

    if (req.files?.idProofBack)
      data.idProofBack =
        "/uploads/customer-vendor/" + req.files.idProofBack[0].filename;

    const created = await CustomerVendor.create(data);

    res.json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const doc = await CustomerVendor.findOne({ vendorId });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
