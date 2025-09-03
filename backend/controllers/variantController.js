const Variant = require('../models/Variant');
const Product = require('../models/Product');

// CREATE: Add a new variant
exports.createVariant = async (req, res) => {
    try {
        const { product_id, variant_name, price, stock, SKU, attributes, variant_img } = req.body;

        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const newVariant = new Variant({
            product_id,
            variant_name,
            price,
            stock,
            SKU,
            attributes,
            variant_img
        });

        await newVariant.save();
        res.status(201).json(newVariant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ: Get all variants
exports.getAllVariants = async (req, res) => {
    try {
        const variants = await Variant.find().populate('product_id');
        res.status(200).json(variants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ: Get a single variant by ID
exports.getVariantById = async (req, res) => {
    try {
        const variant = await Variant.findById(req.params.id).populate('product_id');
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }
        res.status(200).json(variant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ: Get variants by Product ID
exports.getVariantsByProductId = async (req, res) => {
    try {
        const variants = await Variant.find({ product_id: req.params.product_id });
        res.status(200).json(variants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE: Update a variant by ID
exports.updateVariant = async (req, res) => {
    try {
        const { variant_name, price, stock, SKU, attributes, variant_img } = req.body;

        const updatedVariant = await Variant.findByIdAndUpdate(
            req.params.id,
            { variant_name, price, stock, SKU, attributes, variant_img, updated_at: Date.now() },
            { new: true }
        );

        if (!updatedVariant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        res.status(200).json(updatedVariant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE: Delete a variant by ID
exports.deleteVariant = async (req, res) => {
    try {
        const variant = await Variant.findById(req.params.id);
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        await Variant.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Variant deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};