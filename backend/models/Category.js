const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    seller_id: { type: ObjectId, ref: 'User', required: true },
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }],
});

module.exports = mongoose.model('Category', CategorySchema);
