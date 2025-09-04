const Product = require("../models/Product");
const Variant = require("../models/Variant");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const User = require("../models/User");
const UserDetails = require("../models/UserDetails");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Parser } = require("json2csv");
const csvParser = require("csv-parser");
const archiver = require("archiver");
const unzipper = require("unzipper");
const ProductGroup = require("../models/ProductGroup");

const toRegex = (s) =>
  new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

// ADD: bulk CSV helpers
const AdmZip = require("adm-zip"); // npm i adm-zip
const { parse: parseCsvSync } = require("csv-parse/sync"); // npm i csv-parse
// Case-insensitive column getter
// Case-insensitive column getter with BOM stripping
function cleanKey(k) {
  return String(k || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, ""); // NEW: normalize spaces/underscores/hyphens
}
function getVal(row, ...names) {
  if (!row) return "";
  const keys = Object.keys(row);
  for (const want of names) {
    const hit = keys.find((k) => cleanKey(k) === cleanKey(want));
    if (hit !== undefined) {
      const v = row[hit];
      return typeof v === "string"
        ? v.replace(/^\uFEFF/, "").trim()
        : (v ?? "");
    }
  }
  return "";
}

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(1 - a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

exports.createProduct = async (req, res) => {
  try {
    console.log("createProduct", req.body);
    console.log("createProductFiles", req.files);

    const {
      _id,
      name,
      description,
      price,
      stock,
      SKU,
      brand,
      weight,
      dimensions,
      tags,
      category_id,
      subcategory_id,
      is_variant,
    } = req.body;

    // 1) Never use client _id on create
    delete req.body._id;

    // 2) Harden variants parsing
    let variantData = [];
    if (req.body.variants) {
      try {
        // Sometimes arrives as '["[]"]' or similar; normalize it
        const raw = JSON.parse(req.body.variants);
        if (Array.isArray(raw)) {
          // if it looks like ["[]"] -> treat as empty
          if (raw.length === 1 && typeof raw[0] === "string" && raw[0].trim() === "[]") {
            variantData = [];
          } else {
            // keep only proper objects
            variantData = raw.filter(v => v && typeof v === "object");
          }
        } else {
          variantData = [];
        }
      } catch (err) {
        return res.status(400).json({ message: "Invalid variants format" });
      }
    }

    let parsedDimensions = {};
    if (dimensions) {
      try {
        parsedDimensions = JSON.parse(dimensions);
      } catch (error) {
        return res.status(400).json({ message: "Invalid dimensions format" });
      }
    }

    let parsedTags = [];
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch (error) {
        console.error("❌ Error parsing tags:", error);
        parsedTags = [];
      }
    } else if (!Array.isArray(tags)) {
      parsedTags = [];
    }

    // Guard file handling in the controller
    // Prevents crashes → no more connection reset
    const files = Array.isArray(req.files) ? req.files : [];
    const pick = (field) => files.find(f => f.fieldname === field);
    const pickAll = (field) => files.filter(f => f.fieldname === field);

    const productImage = pick("product_img")
      ? `/uploads/${pick("product_img").filename}`
      : "";

    const galleryImages = pickAll("gallery_imgs").map(f => `/uploads/${f.filename}`);

    // 3) Resolve seller_id
    let seller_id = null;
    // prefer authenticated user
    if (req.user?.userId) seller_id = req.user.userId;
    else if (req.user?._id) seller_id = req.user._id;
    // allow admin to create for a seller by passing seller_id
    if (!seller_id && req.body.seller_id) seller_id = req.body.seller_id;

    // validate seller_id
    if (!seller_id || !mongoose.Types.ObjectId.isValid(String(seller_id))) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    let newProduct;
    let variantIds = [];

    if (is_variant === "true" && variantData.length > 0) {
      newProduct = new Product({
        name,
        description,
        SKU,
        brand,
        weight,
        dimensions: parsedDimensions,
        tags: parsedTags,
        category_id,
        subcategory_id,
        product_img: productImage,
        gallery_imgs: galleryImages,
        seller_id,
        is_variant: true,
      });

      await newProduct.save();

      const variants = await Variant.insertMany(
        variantData.map((variant, index) => {
          const variantImg = pick(`variant_img_${index}`)
            ? `/uploads/${pick(`variant_img_${index}`).filename}`
            : "";

          const variantGalleryImgs = pickAll(`variant_gallery_imgs_${index}`)
            .map(f => `/uploads/${f.filename}`);

          console.log(`Variant ${index} Image Path:`, variantImg);
          console.log(`Variant ${index} Gallery Paths:`, variantGalleryImgs);

          return {
            product_id: newProduct._id,
            variant_name: variant.variant_name,
            price: variant.price,
            stock: variant.stock,
            SKU: variant.SKU,
            attributes: variant.attributes,
            variant_img: variantImg,
            variant_gallery_imgs: variantGalleryImgs,
          };
        })
      );

      variantIds = variants.map((variant) => variant._id);
      newProduct.variants = variantIds;
      await newProduct.save();
    } else {
      newProduct = new Product({
        name,
        description,
        price,
        stock,
        SKU,
        brand,
        weight,
        dimensions: parsedDimensions,
        tags: parsedTags,
        category_id,
        subcategory_id,
        product_img: productImage,
        gallery_imgs: galleryImages,
        seller_id,
        is_variant: false,
        variants: [],
      });

      await newProduct.save();
    }

    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    const { q: text = "" } = req.query || {};

    const query = {};
    const orVendor = [];

    // Inject vendor filter from middleware
    if (req.assignedVendorUserId) {
      const s = String(req.assignedVendorUserId);
      orVendor.push({ seller_id: s });
      try {
        orVendor.push({ seller_id: new mongoose.Types.ObjectId(s) });
      } catch {}
    }
    if (req.assignedVendorId) {
      try {
        orVendor.push({
          vendor_id: new mongoose.Types.ObjectId(String(req.assignedVendorId)),
        });
      } catch {}
    }
    if (orVendor.length) query.$or = orVendor;

    // Optional text search (very light; adjust if you have an index)
    if (text && String(text).trim()) {
      query.$text = { $search: String(text).trim() };
    }

    const products = await Product.find(query).lean();

    return res.status(200).json({
      products,
      filteredByVendor: !!orVendor.length,
    });
  } catch (e) {
    console.error("getAllProducts error", e);
    return res.status(200).json({ products: [], filteredByVendor: false }); // never 400 here
  }
};
exports.getAllProductTags = async (req, res) => {
  try {
    const products = await Product.find({}, "tags"); // Get only the tags field

    // Flatten and filter unique tags
    const uniqueTags = [
      ...new Set(products.flatMap((product) => product.tags)),
    ];

    res.status(200).json({ tags: uniqueTags });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ: Get a single product by product_id (ADMIN/INTERNAL)
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { pincode } = req.query;

    const product = await Product.findById(id).populate(
      "category_id subcategory_id variants seller_id"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Only check pincode if provided
    if (pincode) {
      const vendor = await Vendor.findById(product.seller_id);
      if (!vendor || vendor.pincode !== pincode) {
        return res
          .status(400)
          .json({ message: "Product not available in this pincode" });
      }
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// READ: Get a single product by seller_id
exports.getProductsBySellerId = async (req, res) => {
  console.log("getProductsBySellerId");
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ seller_id: sellerId }).populate(
      "category_id subcategory_id variants seller_id"
    );
    if (!products) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ: Get products by category_id
exports.getProductsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params; // Get category ID from request params

    const products = await Product.find({ category_id: categoryId }).populate(
      "category_id subcategory_id variants seller_id"
    );

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this category" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ: Get products by subcategory_id
exports.getProductsBySubCategoryId = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const products = await Product.find({
      subcategory_id: subcategoryId,
    }).populate("category_id subcategory_id variants seller_id");

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this subcategory" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ: Filtered product list (ADMIN/INTERNAL; not used by public list)
exports.getProductByFilter = async (req, res) => {
  try {
    const { categories, subcategories, colors, tags, minPrice, maxPrice } =
      req.query;

    let filterConditions = {};

    if (categories) {
      const categoryArray = categories.split(",").map((id) => id.trim());
      filterConditions.category_id = { $in: categoryArray };
    }
    if (subcategories) {
      const subcategoryArray = subcategories.split(",").map((id) => id.trim());
      filterConditions.subcategory_id = { $in: subcategoryArray };
    }
    if (colors) {
      const colorArray = colors.split(",").map((color) => color.trim());
      filterConditions.color = { $in: colorArray };
    }
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      filterConditions.tags = { $in: tagArray };
    }
    if (minPrice || maxPrice) {
      filterConditions.price = {};
      if (minPrice) filterConditions.price.$gte = parseFloat(minPrice);
      if (maxPrice) filterConditions.price.$lte = parseFloat(maxPrice);
    }

    console.log("Filter Conditions:", filterConditions);

    const products = await Product.find(filterConditions).populate(
      "category_id subcategory_id variants seller_id"
    );

    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found matching the filters." });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getNearbySellerProducts = async (req, res) => {
  try {
    console.log("🟡 getNearbySellerProducts req.user:", req.user);

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

    const searchRadius = 5;

    const sellers = await User.find({ role: "seller" }).populate("userdetails");

    const nearbySellers = sellers.filter((seller) => {
      if (seller.userdetails?.latitude && seller.userdetails?.longitude) {
        const distance = haversineDistance(
          latitude,
          longitude,
          seller.userdetails.latitude,
          seller.userdetails.longitude
        );
        return distance <= searchRadius;
      }
      return false;
    });

    const sellerIds = nearbySellers.map((seller) => seller._id);

    const products = await Product.find({ seller_id: { $in: sellerIds } });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching nearby seller products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// UPDATE: Update a product by product_id with image upload
exports.updateProduct = async (req, res) => {
  try {
    console.log("🔄 Received Update Request:", req.body);
    console.log("🔄 Received Update Files:", req.files);
    const productId = req.params.id;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "❌ Product not found" });
    }

    // Parse stringified fields
    let variants = req.body.variants;
    if (typeof variants === "string") {
      try {
        variants = JSON.parse(variants);
      } catch (err) {
        return res.status(400).json({ message: "❌ Invalid variants format" });
      }
    }

    const updatedProductData = { ...req.body };

    if (req.body.dimensions) {
      try {
        updatedProductData.dimensions = JSON.parse(req.body.dimensions);
      } catch (error) {
        return res
          .status(400)
          .json({ message: "❌ Invalid dimensions format" });
      }
    }

    if (req.body.tags) {
      try {
        updatedProductData.tags = Array.isArray(req.body.tags)
          ? req.body.tags
          : JSON.parse(req.body.tags);
      } catch (err) {
        return res.status(400).json({ message: "❌ Invalid tags format" });
      }
    }

    const productImgFile = req.files.find(
      (file) => file.fieldname === "product_img"
    );
    if (productImgFile) {
      if (existingProduct.product_img)
        removeOldImage(existingProduct.product_img);
      updatedProductData.product_img = `/uploads/${productImgFile.filename}`;
    } else {
      updatedProductData.product_img = existingProduct.product_img;
    }

    let retainedImages = [];

    if (req.body.existing_gallery_imgs) {
      try {
        const parsed = JSON.parse(req.body.existing_gallery_imgs);
        if (Array.isArray(parsed)) retainedImages = parsed;
      } catch (err) {
        return res
          .status(400)
          .json({ message: "❌ Invalid existing_gallery_imgs format" });
      }
    }

    const imagesToDelete = (existingProduct.gallery_imgs || []).filter(
      (img) => !retainedImages.includes(img)
    );
    imagesToDelete.forEach(removeOldImage);

    const newGalleryImages = req.files
      .filter((file) => file.fieldname === "new_gallery_imgs")
      .map((file) => `/uploads/${file.filename}`);

    updatedProductData.gallery_imgs = [...retainedImages, ...newGalleryImages];

    delete updatedProductData.variants;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedProductData,
      { new: true }
    );
    console.log("✅ Product Updated:", updatedProduct);

    if (variants) {
      const existingVariants = await Variant.find({
        product_id: updatedProduct._id,
      });
      const existingVariantIds = existingVariants.map((v) => v._id.toString());

      const variantIds = [];
      const bulkOperations = [];

      for (const [index, variant] of variants.entries()) {
        const variantId = variant._id || new mongoose.Types.ObjectId();
        variant._id = variantId;
        variantIds.push(variantId);

        let variantImgPath =
          existingVariants.find(
            (v) => v._id.toString() === variantId.toString()
          )?.variant_img || "";
        const variantImgFile = req.files.find(
          (file) => file.fieldname === `variant_img_${index}`
        );
        if (variantImgFile) {
          if (variantImgPath) removeOldImage(variantImgPath);
          variantImgPath = `/uploads/${variantImgFile.filename}`;
        }

        let retainedGallery = [];

        try {
          if (variant.existing_variant_gallery_imgs) {
            const parsed =
              typeof variant.existing_variant_gallery_imgs === "string"
                ? JSON.parse(variant.existing_variant_gallery_imgs)
                : variant.existing_variant_gallery_imgs;

            if (Array.isArray(parsed)) retainedGallery = parsed;
          }
        } catch (err) {
          return res.status(400).json({
            message: `❌ Invalid existing_variant_gallery_imgs for variant ${index}`,
          });
        }

        const oldVariant = existingVariants.find(
          (v) => v._id.toString() === variantId.toString()
        );
        const oldGalleryImgs = oldVariant?.variant_gallery_imgs || [];

        const removed = oldGalleryImgs.filter(
          (img) => !retainedGallery.includes(img)
        );
        removed.forEach(removeOldImage);

        const newGalleryFiles = req.files.filter(
          (file) => file.fieldname === `variant_gallery_imgs_${index}`
        );
        const newGalleryPaths = newGalleryFiles.map(
          (file) => `/uploads/${file.filename}`
        );

        const finalGallery = [...retainedGallery, ...newGalleryPaths];

        const baseData = {
          product_id: updatedProduct._id,
          variant_name: variant.variant_name,
          price: variant.price,
          stock: variant.stock,
          SKU: variant.SKU,
          attributes: variant.attributes,
          variant_img: variantImgPath,
          variant_gallery_imgs: finalGallery,
        };

        if (existingVariantIds.includes(variantId.toString())) {
          bulkOperations.push({
            updateOne: {
              filter: { _id: variantId, product_id: updatedProduct._id },
              update: baseData,
            },
          });
        } else {
          bulkOperations.push({
            insertOne: {
              document: { _id: variantId, ...baseData },
            },
          });
        }
      }

      if (bulkOperations.length > 0) {
        const bulkResult = await Variant.bulkWrite(bulkOperations);
        console.log("✅ Variant Bulk Write:", bulkResult);
      }

      await Variant.deleteMany({
        product_id: updatedProduct._id,
        _id: { $nin: variantIds },
      });

      updatedProduct.variants = variantIds;
      await updatedProduct.save();
    }

    res.status(200).json({
      message: "✅ Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({
      message: "❌ Internal Server Error",
      error: err.message,
    });
  }
};

// ✅ Utility function to remove old images from the server
function removeOldImage(imagePath) {
  if (!imagePath) return;
  const fullPath = path.join(__dirname, "..", imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error("❌ Error deleting file:", fullPath, err);
      else console.log("🗑️ Deleted old image:", fullPath);
    });
  }
}

// DELETE: Delete a product by product_id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { product_img, gallery_imgs } = product;
    const uploadDir = path.join(__dirname, "../uploads");

    const deleteImage = (filePath) => {
      if (filePath) {
        const fullPath = path.join(uploadDir, path.basename(filePath));
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.error(`Error deleting file ${fullPath}:`, err);
            }
          });
        }
      }
    };

    deleteImage(product_img);
    if (Array.isArray(gallery_imgs) && gallery_imgs.length > 0) {
      gallery_imgs.forEach(deleteImage);
    }

    await Product.findOneAndDelete({ _id: req.params.id });
    res
      .status(200)
      .json({ message: "Product and associated images deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Export Products

exports.exportProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("variants")
      .populate("category_id")
      .populate("subcategory_id")
      .populate("seller_id")
      .lean();

    const csvFields = [
      "Product ID",
      "Product Name",
      "Description",
      "SKU",
      "Brand",
      "Weight",
      "Dimensions",
      "Tags",
      "Product Image",
      "Product Gallery Images",
      "Price",
      "Stock",
      "Is Review",
      "Is Variant",
      "Category ID",
      "Category Name",
      "Category Description",
      "Subcategory ID",
      "Subcategory Name",
      "Subcategory Description",
      "Variant ID",
      "Variant Name",
      "Variant Price",
      "Variant Stock",
      "Variant SKU",
      "Variant Image",
      "Variant Gallery Images",
      "Variant Attributes",
      "Seller ID",
      "Seller Name",
      "Seller Email",
      "Seller Phone",
      "Seller Address",
    ];

    let csvData = [];
    let allImages = new Set(); // Collect unique image paths

    for (const product of products) {
      const category = product.category_id || {};
      const subcategory = product.subcategory_id || {};
      const seller = product.seller_id || {};

      const pushImage = (imgPath) => {
        if (imgPath) allImages.add(imgPath);
      };

      if (product.variants.length > 0) {
        for (const variant of product.variants) {
          // Collect images
          pushImage(product.product_img);
          product.gallery_imgs?.forEach(pushImage);
          pushImage(variant.variant_img);
          variant.variant_gallery_imgs?.forEach(pushImage);

          csvData.push({
            "Product ID": product._id,
            "Product Name": product.name,
            Description: product.description,
            SKU: product.SKU,
            Brand: product.brand,
            Weight: product.weight,
            Dimensions: product.dimensions
              ? `${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height}`
              : "",
            Tags: product.tags ? product.tags.join("|") : "",
            "Product Image": product.product_img,
            "Product Gallery Images": product.gallery_imgs
              ? product.gallery_imgs.join("|")
              : "",
            Price: product.price || "",
            Stock: product.stock || "",
            "Is Review": product.is_review,
            "Is Variant": true,
            "Category ID": category._id || "",
            "Category Name": category.name || "",
            "Category Description": category.description || "",
            "Subcategory ID": subcategory._id || "",
            "Subcategory Name": subcategory.name || "",
            "Subcategory Description": subcategory.description || "",
            "Variant ID": variant._id,
            "Variant Name": variant.variant_name,
            "Variant Price": variant.price,
            "Variant Stock": variant.stock,
            "Variant SKU": variant.SKU,
            "Variant Image": variant.variant_img,
            "Variant Gallery Images": variant.variant_gallery_imgs
              ? variant.variant_gallery_imgs.join("|")
              : "",
            "Variant Attributes": JSON.stringify(variant.attributes),
            "Seller ID": seller._id || "",
            "Seller Name": seller.name || "",
            "Seller Email": seller.email || "",
            "Seller Phone": seller.phone || "",
            "Seller Address": seller.address || "",
          });
        }
      } else {
        pushImage(product.product_img);
        product.gallery_imgs?.forEach(pushImage);

        csvData.push({
          "Product ID": product._id,
          "Product Name": product.name,
          Description: product.description,
          SKU: product.SKU,
          Brand: product.brand,
          Weight: product.weight,
          Dimensions: product.dimensions
            ? `${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height}`
            : "",
          Tags: product.tags ? product.tags.join("|") : "",
          "Product Image": product.product_img,
          "Product Gallery Images": product.gallery_imgs
            ? product.gallery_imgs.join("|")
            : "",
          Price: product.price,
          Stock: product.stock,
          "Is Review": product.is_review,
          "Is Variant": false,
          "Category ID": category._id || "",
          "Category Name": category.name || "",
          "Category Description": category.description || "",
          "Subcategory ID": subcategory._id || "",
          "Subcategory Name": subcategory.name || "",
          "Subcategory Description": subcategory.description || "",
          "Variant ID": "",
          "Variant Name": "",
          "Variant Price": "",
          "Variant Stock": "",
          "Variant SKU": "",
          "Variant Image": "",
          "Variant Gallery Images": "",
          "Variant Attributes": "",
          "Seller ID": seller._id || "",
          "Seller Name": seller.name || "",
          "Seller Email": seller.email || "",
          "Seller Phone": seller.phone || "",
          "Seller Address": seller.address || "",
        });
      }
    }

    const exportDir = path.join(__dirname, "../exports");
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

    const csvPath = path.join(exportDir, "products_with_sellers.csv");
    const zipPath = path.join(exportDir, "products_export.zip");

    const json2csvParser = new Parser({ fields: csvFields });
    const csv = json2csvParser.parse(csvData);
    fs.writeFileSync(csvPath, csv);

    // Create ZIP
    const archive = archiver("zip", { zlib: { level: 9 } });
    const output = fs.createWriteStream(zipPath);

    output.on("close", () => {
      res.download(zipPath, "products_export.zip", (err) => {
        if (err) console.error("Download error:", err);
        // Clean up files
        fs.unlink(csvPath, () => {});
        fs.unlink(zipPath, () => {});
      });
    });

    archive.pipe(output);
    archive.file(csvPath, { name: "products_with_sellers.csv" });

    // Add image files
    allImages.forEach((imgPath) => {
      // const localImgPath = path.join(__dirname, '../uploads', imgPath);
      const localImgPath = path.join(__dirname, "../", imgPath);
      if (fs.existsSync(localImgPath)) {
        archive.file(localImgPath, { name: `${path.basename(imgPath)}` });
      }
    });

    archive.finalize();
  } catch (err) {
    console.error("Export Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Helper to delay (optional for better file handling)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Product Import (ZIP with inside CSV) — EXISTING
exports.importProducts = async (req, res) => {
  try {
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const zipFilePath = req.files[0].path;
    const extractFolder = path.join(
      __dirname,
      "../uploads",
      `extracted_${Date.now()}`
    );

    // 1. Create extraction folder
    fs.mkdirSync(extractFolder);

    // 2. Extract the zip file
    await fs
      .createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: extractFolder }))
      .promise();

    console.log(`✅ ZIP extracted to: ${extractFolder}`);

    // 3. Find the CSV file inside the extracted folder
    const files = fs.readdirSync(extractFolder);
    const csvFileName = files.find((file) => file.endsWith(".csv"));

    if (!csvFileName) {
      return res.status(400).json({ message: "CSV file not found in zip" });
    }

    const csvFilePath = path.join(extractFolder, csvFileName);
    const products = [];

    // 4. Parse CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (row) => products.push(row))
      .on("end", async () => {
        try {
          for (const row of products) {
            try {
              const productId = row["Product ID"]?.trim();
              let finalProductId =
                productId && mongoose.Types.ObjectId.isValid(productId)
                  ? productId
                  : new mongoose.Types.ObjectId();

              const seller_id_from_csv = row["Seller ID"];
              let finalSellerId;
              if (
                seller_id_from_csv &&
                mongoose.Types.ObjectId.isValid(seller_id_from_csv)
              ) {
                finalSellerId = seller_id_from_csv;
              } else if (
                req.user &&
                mongoose.Types.ObjectId.isValid(req.user.userId)
              ) {
                finalSellerId = req.user.userId;
              } else {
                return res
                  .status(401)
                  .json({ message: "Unauthorized: Invalid Seller ID" });
              }

              // Handle Category
              let category = await Category.findOne({
                name: row["Category Name"],
              });
              if (!category) {
                category = new Category({
                  name: row["Category Name"],
                  seller_id: finalSellerId,
                  description: row["Category Description"],
                });
                await category.save();
              }

              // Handle Subcategory
              let subcategory = await Subcategory.findOne({
                name: row["Subcategory Name"],
                category_id: category._id,
              });
              if (!subcategory) {
                subcategory = new Subcategory({
                  name: row["Subcategory Name"],
                  category_id: category._id,
                  seller_id: finalSellerId,
                  description: row["Subcategory Description"],
                });
                await subcategory.save();
              }

              let dimensions = {};
              if (row["Dimensions"]) {
                const dimParts = row["Dimensions"].split("x");
                if (dimParts.length === 3) {
                  dimensions = {
                    length: parseFloat(dimParts[0]) || 0,
                    width: parseFloat(dimParts[1]) || 0,
                    height: parseFloat(dimParts[2]) || 0,
                  };
                }
              }

              // Find or create product
              let existingProduct = await Product.findOne({
                _id: finalProductId,
              });

              // Prepare image paths
              const productImageName = row["Product Image"]?.trim();
              const galleryImageNames = row["Gallery Images"]
                ? row["Gallery Images"].split("|").map((img) => img.trim())
                : [];

              const productImagePath = productImageName ? productImageName : "";
              const galleryImagesPaths = galleryImageNames.map((img) => img);

              if (existingProduct) {
                await Product.updateOne(
                  { _id: finalProductId },
                  {
                    name: row["Product Name"],
                    description: row["Description"],
                    SKU: row["SKU"],
                    brand: row["Brand"],
                    weight: row["Weight"],
                    dimensions: dimensions,
                    tags: row["Tags"] ? row["Tags"].split("|") : [],
                    product_img: productImagePath,
                    gallery_imgs: galleryImagesPaths,
                    price: parseFloat(row["Price"]) || 0,
                    stock: parseInt(row["Stock"]) || 0,
                    category_id: category._id,
                    subcategory_id: subcategory._id,
                    is_review: row["Is Review"] === "true",
                    is_variant: row["Is Variant"] === "true",
                    seller_id: finalSellerId,
                  }
                );
              } else {
                let newProduct = new Product({
                  _id: finalProductId,
                  name: row["Product Name"],
                  description: row["Description"],
                  SKU: row["SKU"],
                  brand: row["Brand"],
                  weight: row["Weight"],
                  dimensions: dimensions,
                  tags: row["Tags"] ? row["Tags"].split("|") : [],
                  product_img: productImagePath,
                  gallery_imgs: galleryImagesPaths,
                  price: parseFloat(row["Price"]) || 0,
                  stock: parseInt(row["Stock"]) || 0,
                  category_id: category._id,
                  subcategory_id: subcategory._id,
                  is_review: row["Is Review"] === "true",
                  is_variant: row["Is Variant"] === "true",
                  seller_id: finalSellerId,
                });
                await newProduct.save();
              }

              // Handle Variants
              if (row["Is Variant"] === "true") {
                let variant = await Variant.findOne({
                  product_id: finalProductId,
                  name: row["Variant Name"],
                });
                if (variant) {
                  await Variant.updateOne(
                    { product_id: finalProductId, name: row["Variant Name"] },
                    {
                      price: parseFloat(row["Variant Price"]) || 0,
                      stock: parseInt(row["Variant Stock"]) || 0,
                      attributes: row["Variant Attributes"]
                        ? JSON.parse(row["Variant Attributes"])
                        : {},
                    }
                  );
                } else {
                  let newVariant = new Variant({
                    product_id: finalProductId,
                    name: row["Variant Name"],
                    price: parseFloat(row["Variant Price"]) || 0,
                    stock: parseInt(row["Variant Stock"]) || 0,
                    attributes: row["Variant Attributes"]
                      ? JSON.parse(row["Variant Attributes"])
                      : {},
                  });
                  await newVariant.save();
                }
              }

              console.log(
                `✅ Product "${row["Product Name"]}" processed successfully.`
              );
            } catch (error) {
              console.error(
                `❌ Error processing product "${row["Product Name"]}":`,
                error
              );
            }
          }

          // 5. Move all extracted images into uploads folder
          const moveFiles = files.filter((file) => file !== csvFileName);
          for (const file of moveFiles) {
            const srcPath = path.join(extractFolder, file);
            const destPath = path.join(__dirname, "../uploads", file);
            if (fs.existsSync(srcPath)) {
              fs.renameSync(srcPath, destPath);
            }
          }

          // Cleanup extracted folder
          fs.rmSync(extractFolder, { recursive: true, force: true });

          return res
            .status(200)
            .json({ message: "Products imported successfully!" });
        } catch (error) {
          console.error("❌ Error after parsing CSV:", error);
          return res.status(500).json({ message: "Failed to import products" });
        }
      });
  } catch (error) {
    console.error("❌ Error importing products:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ====== NEW BULK CSV IMPORT HANDLERS (added without changing existing code) ======

function asBool(v) {
  if (v === true || v === false) return v;
  if (v === undefined || v === null || v === "") return undefined;
  const s = String(v).trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(s)) return true;
  if (["0", "false", "no", "n"].includes(s)) return false;
  return undefined;
}
function asNum(v) {
  if (v === "" || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function toOid(id) {
  if (!id) return null;
  return mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(id)
    : null;
}
function parseNetQty(raw, value, unit) {
  if (raw) return { raw };
  if (value && unit)
    return { raw: `${value} ${unit}`, value: asNum(value), unit };
  return undefined;
}
async function ensureCategory({ categoryId, categoryName, slug }) {
  // Try by id
  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
    const byId = await Category.findById(categoryId);
    if (byId) return byId;

    // If ID not found, create with that ID even if only a name/slug is missing
    const nameForCreate = categoryName || slug || "Uncategorized";
    return await Category.create({
      _id: new mongoose.Types.ObjectId(categoryId),
      name: nameForCreate,
      slug,
    });
  }

  // Try by slug
  if (slug) {
    const bySlug = await Category.findOne({ slug });
    if (bySlug) return bySlug;
  }

  // Try by name
  if (categoryName) {
    let c = await Category.findOne({ name: categoryName });
    if (!c) c = await Category.create({ name: categoryName, slug });
    return c;
  }

  throw new Error("Category reference missing");
}

async function ensureSubcategory({
  subcategoryId,
  subcategoryName,
  category_id,
  slug,
}) {
  if (subcategoryId && toOid(subcategoryId)) {
    const s = await Subcategory.findById(subcategoryId);
    if (s) return s;
  }
  if (subcategoryName && category_id) {
    let s = await Subcategory.findOne({ name: subcategoryName, category_id });
    if (!s)
      s = await Subcategory.create({
        name: subcategoryName,
        category_id,
        slug,
      });
    return s;
  }
  throw new Error("Sub-category reference missing");
}

// Find file by fieldname from req.files (array or fields)
function findFile(req, field) {
  if (!req.files) return null;
  if (Array.isArray(req.files))
    return req.files.find((f) => f.fieldname === field) || null;
  // multer.fields style
  return req.files[field]?.[0] || null;
}

// 1) Import Categories from CSV
exports.importCategoriesCSV = async (req, res) => {
  try {
    const file = findFile(req, "csv");
    if (!file) return res.status(400).json({ message: "csv file required" });

    const rows = parseCsvSync(fs.readFileSync(file.path), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let upserts = 0;
    for (const r of rows) {
      const name = r.name?.trim();
      if (!name) continue;

      const idRaw = (r.id || r._id || "").trim();
      const oid = mongoose.Types.ObjectId.isValid(idRaw)
        ? new mongoose.Types.ObjectId(idRaw)
        : null;

      if (oid) {
        // Upsert by _id from CSV; set fields on insert/update
        await Category.updateOne(
          { _id: oid },
          {
            $setOnInsert: { _id: oid },
            $set: { name, slug: r.slug?.trim(), icon: r.icon?.trim() },
          },
          { upsert: true }
        );
      } else {
        // Fallback: upsert by name
        await Category.updateOne(
          { name },
          { $set: { name, slug: r.slug?.trim(), icon: r.icon?.trim() } },
          { upsert: true }
        );
      }
      upserts++;
    }
    return res.json({ ok: true, upserts });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message });
  }
};

// 2) Import Sub-categories from CSV
exports.importSubcategoriesCSV = async (req, res) => {
  try {
    const file = findFile(req, "csv");
    if (!file) return res.status(400).json({ message: "csv file required" });

    const rows = parseCsvSync(fs.readFileSync(file.path), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let upserts = 0;

    for (let idx = 0; idx < rows.length; idx++) {
      const r = rows[idx];

      // Accept many header spellings (case-insensitive)
      const categoryId = getVal(r, "categoryId", "CategoryId", "category_id");
      const categoryName = getVal(
        r,
        "categoryName",
        "CategoryName",
        "category"
      );
      const categorySlug = getVal(
        r,
        "categorySlug",
        "CategorySlug",
        "category_slug"
      );

      const name = getVal(
        r,
        "name",
        "Name",
        "subcategoryName",
        "subCategoryName"
      );
      if (!name) {
        console.warn(`Row ${idx + 1}: missing sub-category name, skipping`);
        continue;
      }

      const subIdRaw = getVal(r, "id", "_id");
      const subOid = mongoose.Types.ObjectId.isValid(subIdRaw)
        ? new mongoose.Types.ObjectId(subIdRaw)
        : null;

      // Resolve or create parent category by id/name/slug
      const cat = await ensureCategory({
        categoryId,
        categoryName,
        slug: categorySlug,
      });

      const slug = getVal(
        r,
        "slug",
        "Slug",
        "subcategorySlug",
        "subCategorySlug"
      );

      const filter = subOid ? { _id: subOid } : { name, category_id: cat._id };

      await Subcategory.updateOne(
        filter,
        {
          $setOnInsert: { ...(subOid ? { _id: subOid } : {}) },
          $set: { name, slug, category_id: cat._id },
        },
        { upsert: true }
      );

      upserts++;
    }

    return res.json({ ok: true, upserts });
  } catch (e) {
    console.error("importSubcategoriesCSV error:", e);
    return res.status(500).json({ message: e.message });
  }
};

// 3) Import Products from CSV (+ optional images ZIP)
exports.importProductsCSV = async (req, res) => {
  try {
    const csvFile = findFile(req, "csv");
    if (!csvFile) return res.status(400).json({ message: "csv file required" });

    const imagesZip = findFile(req, "images");
    const imagesMap = new Map();
    if (imagesZip) {
      const zip = new AdmZip(imagesZip.path);
      const outDir = path.join(process.cwd(), "uploads", "products");
      fs.mkdirSync(outDir, { recursive: true });
      zip.getEntries().forEach((e) => {
        if (e.isDirectory) return;
        const name = e.entryName.split("/").pop();
        const dest = path.join(outDir, name);
        fs.writeFileSync(dest, e.getData());
        imagesMap.set(name.toLowerCase(), `/uploads/products/${name}`);
      });
    }

    const rows = parseCsvSync(fs.readFileSync(csvFile.path), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`[importProductsCSV] rows=${rows.length}`);

    let upserts = 0;
    const errors = [];

    for (let idx = 0; idx < rows.length; idx++) {
      const r = rows[idx];
      try {
        // Resolve category + subcategory (id/name/slug; case-insensitive)
        const categoryId = getVal(r, "categoryId", "CategoryId", "category_id");
        const categoryName = getVal(
          r,
          "categoryName",
          "CategoryName",
          "category"
        );
        const categorySlug = getVal(
          r,
          "categorySlug",
          "CategorySlug",
          "category_slug"
        );

        const subcategoryId = getVal(
          r,
          "subcategoryId",
          "SubcategoryId",
          "subCategoryId",
          "subcategory_id"
        );
        const subcategoryName = getVal(
          r,
          "subcategoryName",
          "SubcategoryName",
          "subCategoryName",
          "subcategory"
        );
        const subcategorySlug = getVal(
          r,
          "subcategorySlug",
          "SubcategorySlug",
          "subCategorySlug"
        );

        const cat = await ensureCategory({
          categoryId,
          categoryName,
          slug: categorySlug,
        });
        const sub = await ensureSubcategory({
          subcategoryId,
          subcategoryName,
          category_id: cat._id,
          slug: subcategorySlug,
        });

        // Images mapping
        let product_img = getVal(r, "product_img", "productImage", "image");
        const imageFile = getVal(r, "imageFile", "ImageFile", "mainImageFile");
        if (
          !product_img &&
          imageFile &&
          imagesMap.has(imageFile.toLowerCase())
        ) {
          product_img = imagesMap.get(imageFile.toLowerCase());
        }
        const gallery = [];
        const galleryRaw = getVal(
          r,
          "gallery_imgs",
          "gallery",
          "galleryImages"
        );
        const galleryFiles = galleryRaw
          .split(/[;,|]/)
          .map((s) => s.trim())
          .filter(Boolean);
        for (const gf of galleryFiles) {
          if (imagesMap.has(gf.toLowerCase()))
            gallery.push(imagesMap.get(gf.toLowerCase()));
          else if (/^https?:\/\//i.test(gf) || gf.startsWith("/uploads/"))
            gallery.push(gf);
        }

        const price = asNum(getVal(r, "price", "Price"));
        const mrp = asNum(getVal(r, "mrp", "MRP"));
        const sale = asNum(getVal(r, "sale", "SalePrice"));

        const doc = {
          name: getVal(r, "name", "Name", "productName"),
          SKU: getVal(r, "SKU", "sku", "eanNumber"),
          brand: getVal(r, "brand", "Brand"),
          description: getVal(r, "description", "Description"),
          price: price ?? undefined,
          priceInfo: {
            mrp: mrp ?? undefined,
            sale: sale ?? undefined,
            exchangeOffer: getVal(r, "exchangeOffer"),
            gstInvoice: asBool(getVal(r, "gstInvoice")),
            deliveryIn1Day: asBool(getVal(r, "deliveryIn1Day")),
            assured: asBool(getVal(r, "assured")),
            bestseller: asBool(getVal(r, "bestseller")),
          },
          stock: asNum(getVal(r, "stock", "Stock")),
          weight: asNum(getVal(r, "weight", "Weight")),
          dimensions: {
            length: asNum(getVal(r, "length", "Length")),
            width: asNum(getVal(r, "width", "Width")),
            height: asNum(getVal(r, "height", "Height")),
          },
          tags: getVal(r, "tags", "Tags")
            .split(/[;,|]/)
            .map((s) => s.trim())
            .filter(Boolean),
          product_img,
          gallery_imgs: gallery,
          category_id: cat._id,
          subcategory_id: sub._id,
          is_variant: asBool(getVal(r, "is_variant", "isVariant")),
          is_review: asBool(getVal(r, "is_review", "isReview")),
          seller_id: getVal(r, "seller_id", "sellerId") || undefined,
          rating_avg: asNum(getVal(r, "rating_avg")),
          rating_count: asNum(getVal(r, "rating_count")),
          groceries: {
            usedFor: getVal(r, "usedFor", "suitableFor"),
            processingType: getVal(r, "processingType", "type"),
            fssaiNumber: getVal(r, "fssaiNumber"),
            maxShelfLifeDays: asNum(
              getVal(r, "maxShelfLifeDays", "maxShelfLife")
            ),
            foodPreference: getVal(r, "foodPreference"),
            containerType: getVal(r, "containerType"),
            organic: asBool(getVal(r, "organic")),
            addedPreservatives: asBool(getVal(r, "addedPreservatives")),
            ingredients: getVal(r, "ingredients", "baseIngredient"),
            nutrientContent: getVal(r, "nutrientContent"),
            netQuantity: parseNetQty(
              getVal(r, "netQuantityRaw"),
              getVal(r, "netQuantityValue"),
              getVal(r, "netQuantityUnit")
            ),
            packOf: asNum(getVal(r, "packOf")),
            additives: getVal(r, "additives"),
            usageInstructions: getVal(r, "usageInstructions"),
          },
        };

        // Upsert key: prefer product id, else SKU, else (name+cat+sub)
        const prodIdRaw = getVal(r, "id", "_id");
        const prodOid = mongoose.Types.ObjectId.isValid(prodIdRaw)
          ? new mongoose.Types.ObjectId(prodIdRaw)
          : null;

        const filter = prodOid
          ? { _id: prodOid }
          : doc.SKU
            ? { SKU: doc.SKU }
            : { name: doc.name, category_id: cat._id, subcategory_id: sub._id };

        await Product.updateOne(
          filter,
          { $setOnInsert: prodOid ? { _id: prodOid } : {}, $set: doc },
          { upsert: true, strict: false, setDefaultsOnInsert: true } // NEW strict:false
        );

        upserts++;
      } catch (rowErr) {
        console.error(
          `[importProductsCSV] row ${idx + 1} error:`,
          rowErr.message
        );
        errors.push({ row: idx + 1, message: rowErr.message });
        // continue to next row
      }
    }

    const payload = { ok: errors.length === 0, upserts, errors };
    return res.status(errors.length ? 207 : 200).json(payload);
  } catch (e) {
    console.error("importProductsCSV fatal:", e);
    return res.status(500).json({ message: e.message });
  }
};

// PUBLIC product list with filters (categoryId, subcategoryId, q, product, group, brand, organic, price, sort, page, limit)
// ENFORCED: lock results to today's assigned seller (req.assignedVendorId) via seller_id
// exports.listProducts = async (req, res) => {
//   try {
//     const {
//       categoryId,
//       subcategoryId,
//       q,
//       search,
//       product,
//       group,
//       groupId,
//       brand,
//       organic,
//       minPrice,
//       maxPrice,
//       sort = "popularity",
//       page = 1,
//       limit = 24,
//     } = req.query;

//     const find = {};
//     if (categoryId) find.category_id = categoryId;
//     if (subcategoryId) find.subcategory_id = subcategoryId;
//     if (brand) find.brand = brand;
//     if (organic === "true") find["groceries.organic"] = true;
//     if (organic === "false") find["groceries.organic"] = false;

//     if (groupId) {
//       const g = await ProductGroup.findById(groupId).lean();
//       if (g) {
//         if (g.product_ids?.length) {
//           find._id = { $in: g.product_ids };
//         } else if (g.query) {
//           find.name = new RegExp(g.query, "i");
//         }
//         if (!subcategoryId && g.subcategory_id)
//           find.subcategory_id = g.subcategory_id;
//       }
//     } else if (product) {
//       find.name = new RegExp(
//         `^${product.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}$`,
//         "i"
//       );
//     } else if (group) {
//       find.name = new RegExp(group, "i");
//     } else if (q || search) {
//       find.$text = { $search: q || search };
//     }

//     if (minPrice || maxPrice) {
//       const lo = minPrice ? Number(minPrice) : undefined;
//       const hi = maxPrice ? Number(maxPrice) : undefined;
//       find.$or = [
//         {
//           "priceInfo.sale": {
//             ...(lo !== undefined ? { $gte: lo } : {}),
//             ...(hi !== undefined ? { $lte: hi } : {}),
//           },
//         },
//         {
//           price: {
//             ...(lo !== undefined ? { $gte: lo } : {}),
//             ...(hi !== undefined ? { $lte: hi } : {}),
//           },
//         },
//       ];
//     }

//     // ✅ ENFORCE: only the assigned seller for today (assignment middleware must be mounted on this route)
//     if (!req.assignedVendorId) {
//       return res.status(400).json({ message: "Assigned seller missing" });
//     }
//     find.seller_id = req.assignedVendorId;

//     const sortMap = {
//       popularity: { rating_count: -1 },
//       price_asc: { "priceInfo.sale": 1, price: 1 },
//       price_desc: { "priceInfo.sale": -1, price: -1 },
//       new: { created_at: -1 },
//       rating: { rating_avg: -1 },
//     };
//     const sortSpec = sortMap[sort] || sortMap.popularity;

//     const skip = (Number(page) - 1) * Number(limit);

//     const [items, total] = await Promise.all([
//       Product.find(find)
//         .select(
//           "name brand SKU price priceInfo product_img category_id subcategory_id rating_avg rating_count seller_id"
//         )
//         .populate("category_id", "name")
//         .populate("subcategory_id", "name")
//         .sort(sortSpec)
//         .skip(skip)
//         .limit(Number(limit))
//         .lean(),
//       Product.countDocuments(find),
//     ]);

//     res.json({ items, total, page: Number(page), limit: Number(limit) });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
exports.listProducts = async (req, res) => {
  try {
    const { subcategoryId, groupId, limit = 24, page = 1 } = req.query;

    // Ensure the assigned vendor is present
    if (!req.assignedVendorId) {
      return res.status(400).json({ message: "Assigned vendor missing" });
    }

    const query = {
      seller_id: new mongoose.Types.ObjectId(String(req.assignedVendorId)), // Filter by pincode vendor
    };

    // Validate and filter by subcategoryId if provided
    if (subcategoryId) {
      if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
        return res.status(400).json({ message: "Invalid subcategoryId" });
      }
      query.subcategory_id = new mongoose.Types.ObjectId(subcategoryId);
    }

    // Validate and filter by groupId if provided
    if (groupId) {
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ message: "Invalid groupId" });
      }
      const group = await ProductGroup.findById(groupId).lean();
      if (group && group.product_ids?.length) {
        query._id = { $in: group.product_ids };
      }
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch products
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category_id subcategory_id")
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("listProducts error:", err);
    res.status(500).json({ message: "Failed to list products" });
  }
};
// PUBLIC facets for current seller only
exports.getFacets = async (req, res) => {
  try {
    if (!req.assignedVendorId) {
      return res.status(400).json({ message: "Assigned seller missing" });
    }

    const match = {
      seller_id: new mongoose.Types.ObjectId(String(req.assignedVendorId)),
    };

    const agg = await Product.aggregate([
      { $match: match },
      {
        $facet: {
          brands: [
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
          ram: [
            { $group: { _id: "$ram", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
          price: [
            {
              $group: {
                _id: null,
                min: { $min: "$priceInfo.sale" },
                max: { $max: "$priceInfo.sale" },
              },
            },
          ],
        },
      },
    ]);

    const f = agg[0] || {};
    res.json({
      brands: (f.brands || []).map((b) => ({ name: b._id, count: b.count })),
      ram: (f.ram || []).map((r) => ({ value: r._id, count: r.count })),
      price: f.price?.[0]
        ? { min: f.price[0].min, max: f.price[0].max }
        : { min: 0, max: 0 },
    });
  } catch (err) {
    console.error("getFacets error:", err);
    res.status(500).json({ message: err.message });
  }
};

// PUBLIC detail: must belong to today's assigned seller
exports.getProduct = async (req, res) => {
  try {
    if (!req.assignedVendorId) {
      return res.status(400).json({ error: "Assigned seller missing" });
    }
    const p = await Product.findById(req.params.id).lean();
    if (!p || String(p.seller_id) !== String(req.assignedVendorId)) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(p);
  } catch (err) {
    console.error("getProduct error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  const p = await Product.create(req.body);
  res.status(201).json(p);
};

exports.updateProduct = async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
};

exports.deleteProduct = async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
};

// PUBLIC: list all categories (minimal fields for menu)
exports.listCategoriesPublic = async (_req, res) => {
  try {
    const items = await Category.find({}, "name icon slug")
      .sort({ name: 1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listSubcategoriesPublic = async (req, res) => {
  try {
    const { category_id } = req.query;
    const q = category_id ? { category_id } : {};
    const items = await Subcategory.find(q, "name category_id slug")
      .sort({ name: 1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// PUBLIC: distinct product names by subcategory (for third column)
exports.listProductNamesBySubcategory = async (req, res) => {
  try {
    const { subcategory_id, limit = 15 } = req.query;
    if (!subcategory_id)
      return res.status(400).json({ message: "subcategory_id required" });

    // Top names by frequency under the subcategory
    const agg = await Product.aggregate([
      {
        $match: { subcategory_id: new mongoose.Types.ObjectId(subcategory_id) },
      },
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: Number(limit) },
      { $project: { _id: 0, name: "$_id" } },
    ]);

    return res.json({ items: agg });
  } catch (err) {
    console.error("listProductNamesBySubcategory error:", err);
    return res.status(500).json({ message: err.message });
  }
};
exports.listGroupsBySubcategory = async (req, res) => {
  try {
    const { subcategory_id, limit = 30 } = req.query;
    if (!subcategory_id)
      return res.status(400).json({ message: "subcategory_id required" });
    const items = await ProductGroup.find({ subcategory_id, active: true })
      .sort({ priority: 1, label: 1 })
      .limit(Number(limit))
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ message: "slug required" });
    const c = await Category.findOne({ slug: slug.toLowerCase() }).select(
      "_id name slug"
    );
    if (!c) return res.status(404).json({ message: "Category not found" });
    res.json({ item: c });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
exports.searchProducts = async (req, res) => {
  try {
    const {
      q: text = "",
      categoryId,
      subcategoryId,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 24,
      sort = "relevance", // "price_asc" | "price_desc" | "new" | "relevance"
    } = req.query || {};

    const query = {};
    const and = [];

    // Vendor filter from daily assignment (ONE CUSTOMER → ONE VENDOR)
    const orVendor = [];
    if (req.assignedVendorUserId) {
      const s = String(req.assignedVendorUserId);
      orVendor.push({ seller_id: s });
      try {
        orVendor.push({ seller_id: new mongoose.Types.ObjectId(s) });
      } catch {}
    }
    if (req.assignedVendorId) {
      try {
        orVendor.push({
          vendor_id: new mongoose.Types.ObjectId(String(req.assignedVendorId)),
        });
      } catch {}
    }
    if (orVendor.length) and.push({ $or: orVendor });

    // Category filters (optional)
    if (categoryId && mongoose.isValidObjectId(categoryId)) {
      and.push({ category_id: new mongoose.Types.ObjectId(categoryId) });
    }
    if (subcategoryId && mongoose.isValidObjectId(subcategoryId)) {
      and.push({ subcategory_id: new mongoose.Types.ObjectId(subcategoryId) });
    }

    // Brand (if you store it on the product)
    if (brand && String(brand).trim()) {
      and.push({ brand: String(brand).trim() });
    }

    // Price range (never 400; just ignore bad values)
    const min = Number(minPrice);
    const max = Number(maxPrice);
    const priceCond = {};
    if (Number.isFinite(min)) priceCond.$gte = min;
    if (Number.isFinite(max)) priceCond.$lte = max;
    if (Object.keys(priceCond).length) {
      // support either "price" or nested "priceInfo.sale"
      and.push({
        $or: [{ price: priceCond }, { "priceInfo.sale": priceCond }],
      });
    }

    // Text search
    if (text && String(text).trim()) {
      // Use $text if you have index; else fallback to regex on "name"/"title"
      and.push({
        $or: [
          { name: new RegExp(String(text).trim(), "i") },
          { title: new RegExp(String(text).trim(), "i") },
        ],
      });
    }

    if (and.length) query.$and = and;

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortSpec = undefined;
    switch (sort) {
      case "price_asc":
        sortSpec = { "priceInfo.sale": 1, price: 1, _id: 1 };
        break;
      case "price_desc":
        sortSpec = { "priceInfo.sale": -1, price: -1, _id: -1 };
        break;
      case "new":
        sortSpec = { createdAt: -1, _id: -1 };
        break;
      default:
        // "relevance" or unknown → keep Mongo natural order or your preferred default
        sortSpec = { _id: -1 };
    }

    const [items, total] = await Promise.all([
      Product.find(query).sort(sortSpec).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      filteredByVendor: !!orVendor.length,
      products: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (e) {
    console.error("searchProducts error", e);
    // NEVER 400 here; return a safe, empty payload
    return res.status(200).json({
      success: false,
      filteredByVendor: !!(req.assignedVendorUserId || req.assignedVendorId),
      products: [],
      pagination: { page: 1, limit: 24, total: 0, pages: 1 },
      message: "Unable to load products",
    });
  }
};
