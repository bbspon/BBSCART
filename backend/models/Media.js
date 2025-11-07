// models/Media.js
const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema(
  {
    label: String, // "webp" | "thumb" | "poster" | "webm"
    url: String, // absolute URL
    width: Number,
    height: Number,
    size: Number,
    mime: String,
    quality: Number,
  },
  { _id: false }
);

const MediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, index: true }, // stored basename, e.g., "a-123.webp"
    type: { type: String, enum: ["image", "video"], index: true },
    status: {
      type: String,
      enum: ["ready", "processing", "failed"],
      default: "ready",
      index: true,
    },
    storageProvider: { type: String, default: "local" },
    folder: { type: String, default: "" },

    url: { type: String, required: true }, // absolute: BASE_ASSETS_URL + /uploads/ + filename

    size: { type: Number, default: 0 },
    mime: { type: String, default: "" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },

    variants: [VariantSchema], // webp, thumb, poster, webm

    tags: { type: [String], default: [] },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    uploaderRole: { type: String, default: "staff" },

    accessLevel: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    linkedProducts: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    linkedCategories: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    linkedCollections: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    referenceCount: { type: Number, default: 0 },

    deleted: { type: Boolean, default: false },
    acl: { type: Array, default: [] },
  },
  { timestamps: true }
);

MediaSchema.index({ filename: 1, deleted: 1 });
module.exports = mongoose.model("Media", MediaSchema);
