const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

// CREATE: Add a new subcategory under a category
exports.createSubcategory = async (req, res) => {
  try {
    const { name, description, category_id } = req.body || {};
    const seller_id = req.user?.userId || null;

    if (!name || !category_id) {
      return res
        .status(400)
        .json({ message: "name and category_id are required" });
    }

    const category = await Category.findById(category_id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const sub = await Subcategory.create({
      name,
      description: description || "",
      category_id,
      seller_id,
    });
    await sub.populate("category_id");

    // add link to category if not present
    if (!category.subcategories?.includes(sub._id)) {
      category.subcategories = category.subcategories || [];
      category.subcategories.push(sub._id);
      await category.save();
    }

    return res.status(201).json(sub);
  } catch (err) {
    console.error("createSubcategory error", err);
    return res.status(500).json({ message: err.message });
  }
};

// READ: Get all subcategories
exports.getAllSubcategories = async (_req, res) => {
  try {
    const subs = await Subcategory.find().populate("category_id");
    return res.status(200).json(subs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// READ: Get a single subcategory by ID
// READ: Get by ID
exports.getSubcategoryById = async (req, res) => {
  try {
    const sub = await Subcategory.findById(req.params.id).populate("category_id");
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });
    return res.status(200).json(sub);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// READ: Get a single subcategory by ID
exports.getSubcategoryBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const subs = await Subcategory.find({ seller_id: sellerId }).populate(
      "category_id"
    );
    return res.status(200).json(subs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// UPDATE: Update a subcategory by ID
exports.updateSubcategory = async (req, res) => {
  try {
    const { name, description, category_id } = req.body || {};
    const seller_id = req.user?.userId || null;

    const old = await Subcategory.findById(req.params.id);
    if (!old) return res.status(404).json({ message: "Subcategory not found" });

    const updated = await Subcategory.findByIdAndUpdate(
      req.params.id,
      { name, description, category_id, seller_id },
      { new: true }
    ).populate("category_id");

    if (!updated)
      return res.status(404).json({ message: "Subcategory not found" });

    // if category changed, sync the relation arrays
    if (category_id && String(old.category_id) !== String(category_id)) {
      await Category.findByIdAndUpdate(old.category_id, {
        $pull: { subcategories: old._id },
      });
      await Category.findByIdAndUpdate(category_id, {
        $addToSet: { subcategories: updated._id },
      });
    }

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE: Delete a subcategory by ID
exports.deleteSubcategory = async (req, res) => {
  try {
    const sub = await Subcategory.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });

    await Category.findByIdAndUpdate(sub.category_id, {
      $pull: { subcategories: sub._id },
    });
    await Subcategory.findByIdAndDelete(req.params.id);

    return res
      .status(200)
      .json({ message: "Subcategory deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};