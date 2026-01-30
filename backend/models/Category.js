// const mongoose = require('mongoose');
// const { ObjectId } = mongoose.Schema.Types;

// const CategorySchema = new mongoose.Schema({
//     name: { type: String, required: true, unique: true },
//     description: String,
//     seller_id: { type: ObjectId, ref: 'User', required: true },
//     subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }],
// });

// module.exports = mongoose.model('Category', CategorySchema);
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  slug: { type: String, sparse: true },
  icon: { type: String },
  imageUrl: { type: String },
  // Make seller_id optional so Admin can create global categories
  seller_id: { type: ObjectId, ref: "User", required: false, default: null },
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" }],
});

module.exports = mongoose.model("Category", CategorySchema);
