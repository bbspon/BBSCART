const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const SubcategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    seller_id: { type: ObjectId, ref: 'User', required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
});

module.exports = mongoose.model('Subcategory', SubcategorySchema);
