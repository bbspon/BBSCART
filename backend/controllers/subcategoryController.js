const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

// CREATE: Add a new subcategory under a category
exports.createSubcategory = async (req, res) => {
    try {
        const { name, description, category_id } = req.body;
        const seller_id = req.user?.userId || null; // Ensures seller_id is handled correctly

        // Check if category exists
        const category = await Category.findById(category_id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Create subcategory
        const newSubcategory = new Subcategory({ name, description, category_id, seller_id });
        await newSubcategory.save();

        // Populate category_id after saving
        await newSubcategory.populate("category_id");

        // Update category to include this subcategory (if not already present)
        if (!category.subcategories.includes(newSubcategory._id)) {
            category.subcategories.push(newSubcategory._id);
            await category.save();
        }

        res.status(201).json(newSubcategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ: Get all subcategories
exports.getAllSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find().populate('category_id'); // .populate('category_id')
        res.status(200).json(subcategories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ: Get a single subcategory by ID
exports.getSubcategoryById = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id).populate('category_id');
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        res.status(200).json(subcategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ: Get a single subcategory by ID
exports.getSubcategoryBySellerId = async (req, res) => {
    try {
        const { sellerId } = req.params; 
        const subcategory = await Subcategory.find({ seller_id: sellerId }).populate('category_id');
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        res.status(200).json(subcategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// UPDATE: Update a subcategory by ID
exports.updateSubcategory = async (req, res) => {
    try {
        const { name, description, category_id } = req.body;
        let seller_id = req.user ? req.user.userId : null;
        // Find the subcategory before updating
        const oldSubcategory = await Subcategory.findById(req.params.id);
        if (!oldSubcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        // Update subcategory
        const updatedSubcategory = await Subcategory.findByIdAndUpdate(
            req.params.id,
            { name, description, category_id, seller_id },
            { new: true }
        ).populate('category_id');

        if (!updatedSubcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        // If the category_id has changed, update both old and new categories
        if (oldSubcategory.category_id.toString() !== category_id) {
            // Remove subcategory from old category
            await Category.findByIdAndUpdate(oldSubcategory.category_id, {
                $pull: { subcategories: oldSubcategory._id }
            });

            // Add subcategory to new category (if not already present)
            await Category.findByIdAndUpdate(category_id, {
                $addToSet: { subcategories: updatedSubcategory._id }
            });
        }

        res.status(200).json(updatedSubcategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE: Delete a subcategory by ID
exports.deleteSubcategory = async (req, res) => {
    try {
        // Find the subcategory before deleting
        const subcategory = await Subcategory.findById(req.params.id);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        // Remove the subcategory from the category's subcategories array
        await Category.findByIdAndUpdate(subcategory.category_id, {
            $pull: { subcategories: subcategory._id }
        });

        // Delete the subcategory
        await Subcategory.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Subcategory deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};