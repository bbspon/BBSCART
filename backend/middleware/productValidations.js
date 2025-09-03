// /validations/productValidations.js
const { body, query } = require("express-validator");

exports.createProductRules = [
  body("title").isString().trim().notEmpty(),
  body("brand").isString().trim().notEmpty(),
  body("images").optional().isArray(),
  body("specs").optional().isArray(),
  body("reviewsText").optional().isString(),
  body("rating").optional().isFloat({ min: 0, max: 5 }),
  body("priceInfo.mrp").isFloat({ min: 0 }),
  body("priceInfo.sale").isFloat({ min: 0 }),
  body("priceInfo.discountText").optional().isString(),
  body("exchangeOffer").optional().isString(),
  body("gstInvoice").optional().isBoolean(),
  body("deliveryIn1Day").optional().isBoolean(),
  body("assured").optional().isBoolean(),
  body("bestseller").optional().isBoolean(),
  body("ram").optional().isInt({ min: 0 }),
];

exports.updateProductRules = exports.createProductRules.map((r) =>
  r.builder.fields[0] === "title"
    ? body("title").optional().isString().trim().notEmpty()
    : r
);

exports.listQueryRules = [
  query("search").optional().isString(),
  query("minPrice").optional().toFloat(),
  query("maxPrice").optional().toFloat(),
  query("brands").optional().isString(), // comma-separated
  query("rating_gte").optional().toFloat(),
  query("ram_gte").optional().toInt(),
  query("gstInvoice").optional().isBoolean().toBoolean(),
  query("deliveryIn1Day").optional().isBoolean().toBoolean(),
  query("sort")
    .optional()
    .isIn(["popularity", "price-asc", "price-desc", "newest"]),
  query("page").optional().toInt(),
  query("limit").optional().toInt(),
];
