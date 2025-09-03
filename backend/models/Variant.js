const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const VariantSchema = new mongoose.Schema({
    product_id: { type: ObjectId, ref: 'Product', required: true }, // Reference to main product
    variant_name: String, // e.g., "Red - Large"
    price: { type: Number, required: true }, // Variant-specific price
    stock: { type: Number, default: 0 }, // Stock for this variant
    SKU: { type: String, unique: true, required: true }, // Unique identifier
    attributes: { type: Array, default: [] }, // Ensure attributes is always an array
    variant_img: String, // Image for variant
    variant_gallery_imgs: [String],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Middleware to update `updated_at` before saving
VariantSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Variant = mongoose.model('Variant', VariantSchema);
module.exports = Variant;
