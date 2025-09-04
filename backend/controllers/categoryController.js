const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const User = require("../models/User");

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// CREATE: Add a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description = "" } = req.body || {};
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "name is required" });
    const exists = await Category.findOne({ name });
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "category already exists" });
    const doc = await Category.create({ name, description });
    res.status(201).json(doc);
  } catch (err) {
    console.error("createCategory error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// READ: Get all categories
exports.getAllCategories = async (_req, res) => {
  try {
    const categories = await Category.find().populate("subcategories");
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getNearbySellerCategories = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }
    const user_id = req.user.userId;
    const user = await User.findById(user_id).populate("userdetails");
    if (!user || !user.userdetails) {
      return res.status(404).json({ message: "User details not found" });
    }
    const { latitude, longitude } = user.userdetails;
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "User location not available" });
    }

    const searchRadius = 5; // km
    const sellers = await User.find({ role: "seller" }).populate("userdetails");

    const nearbySellers = sellers.filter((seller) => {
      if (seller.userdetails?.latitude && seller.userdetails?.longitude) {
        const dist = haversineDistance(
          latitude,
          longitude,
          seller.userdetails.latitude,
          seller.userdetails.longitude
        );
        return dist <= searchRadius;
      }
      return false;
    });

    const sellerIds = nearbySellers.map((s) => s._id);
    const categories = await Category.find({
      seller_id: { $in: sellerIds },
    }).populate("subcategories");
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching nearby seller categories:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// READ: Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "subcategories"
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// READ: Get a single category by ID
exports.getCategoryBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const category = await Category.find({ seller_id: sellerId }).populate(
      "subcategories"
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// UPDATE: Update a category by ID
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;

    const doc = await Category.findByIdAndUpdate(id, update, { new: true });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json(doc);
  } catch (err) {
    console.error("updateCategory error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE: Delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Category.findById(id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });

    await Subcategory.deleteMany({ category_id: doc._id }).catch(() => {});
    await Category.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteCategory error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getVendorCategories = async (req, res) => {
  try {
    const vendor = req.assignedVendor;
    if (!vendor || !vendor._id) {
      return res
        .status(400)
        .json({ success: false, message: "No assigned vendor" });
    }
    if (!Product) {
      return res
        .status(500)
        .json({ success: false, message: "Product model missing" });
    }

    const pipeline = [
      {
        $match: { seller_id: new mongoose.Types.ObjectId(String(vendor._id)) },
      },
      { $project: { category: 1, subcategory: 1 } },
      {
        $group: { _id: { category: "$category", subcategory: "$subcategory" } },
      },
      {
        $group: {
          _id: "$_id.category",
          subs: { $addToSet: "$_id.subcategory" },
        },
      },
    ];

    const grouped = await Product.aggregate(pipeline);

    const categoriesOut = [];
    for (const row of grouped) {
      const catKey = row._id;
      let catName = String(catKey || "");
      let catDoc = null;

      if (mongoose.isValidObjectId(catKey)) {
        catDoc = await Category.findById(catKey).lean();
      } else {
        catDoc =
          (await Category.findOne({ slug: catKey }).lean()) ||
          (await Category.findOne({ name: catKey }).lean());
      }
      if (catDoc) catName = catDoc.name;

      const subNames = [];
      for (const sub of row.subs || []) {
        if (!sub) continue;
        let subName = String(sub);
        if (mongoose.isValidObjectId(sub)) {
          const sdoc = await Category.findById(sub).lean();
          if (sdoc) subName = sdoc.name;
        } else {
          const sdoc =
            (await Category.findOne({ slug: sub }).lean()) ||
            (await Category.findOne({ name: sub }).lean());
          if (sdoc) subName = sdoc.name;
        }
        subNames.push({ name: subName });
      }

      categoriesOut.push({
        key: String(catKey || catName),
        name: catName,
        subcategories: subNames.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }

    categoriesOut.sort((a, b) => a.name.localeCompare(b.name));
    return res.json({ categories: categoriesOut });
  } catch (err) {
    console.error("getVendorCategories error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.listCategories = async (_req, res) => {
  try {
    const rows = await Category.find({}).sort({ name: 1 }).lean();
    res.json(rows);
  } catch (err) {
    console.error("listCategories error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

