const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Load environment variables
dotenv.config();
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected toMongoDBcare (Default DB)"))
  .catch((err) => console.error("❌ Main DB error:", err));

// ✅ Route imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const userRoutes = require("./routes/userRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const franchiseeRoutes = require("./routes/franchiseHeadRoutes");
const territoryHeadRoutes = require("./routes/territoryHeadRoutes");
const agentHeadRoutes = require("./routes/agentRoutes");
const customerBecomeVendorRoutes = require("./routes/customerVendorRoutes");
const geoRoutes = require("./routes/geoRoutes");
const adminPincodeVendorsRoutes = require("./routes/adminPincodeVendorsRoutes");
const adminVendorRoutes = require("./routes/adminVendorRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

/* =======================
   ✅ CORS Setup (dev + prod)
   ======================= */
const allowedOrigins = [
  process.env.CLIENT_URL_DEV || "http://localhost:5173",

  process.env.CLIENT_URL_PROD || "https://bbscart.com",
];

// ---- BEGIN: Scoped vendor+pincode enforcement (BBSCART Supermarket only) ----
const assignVendorMiddleware = require("./middleware/assignVendorMiddleware");
const Product = require("./models/Product");

// ENV knobs (easy to tune without code changes)
const PINCODE_ENFORCE_HOSTS =
  (process.env.PINCODE_ENFORCE_HOSTS || "bbscart.com")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

// which API roots should ever be gated by pincode (products, cart, etc.)
const PINCODE_ENFORCE_PATHS =
  (process.env.PINCODE_ENFORCE_PATHS || "/api/products,/api/cart,/api/wishlist,/api/orders")
    .split(",").map(s => s.trim()).filter(Boolean);

// which categories (by slug) actually require pincode/vendor
const PINCODE_ENFORCE_CATEGORIES =
  (process.env.PINCODE_ENFORCE_CATEGORIES || "supermarket")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

// Attempt to decide if this request is for a "Supermarket" product/category
async function isSupermarketRequest(req) {
  // Fast-path: if you have dedicated supermarket API roots (tweak as needed)
  if (req.path.startsWith("/api/groceries") || req.path.startsWith("/api/fruits")) {
    return true;
  }

  // If it's a product detail URL (/api/products/:id) -> look up the product's category
  const m = req.path.match(/^\/api\/products\/([a-f0-9]{24})(?:\/|$)/i);
  const paramId = (m && m[1]) || req.params?.id || req.body?.product_id;
  if (paramId) {
    try {
      const p = await Product.findById(paramId).populate("category_id").lean();
      const slug = String(p?.category_id?.slug || "").toLowerCase();
      if (PINCODE_ENFORCE_CATEGORIES.includes(slug)) return true;
    } catch (_) {}
  }

  // If the client passes category info in query/body (list/filter/create)
  const catSlug = String(req.query?.category_slug || req.body?.category_slug || "").toLowerCase();
  if (catSlug && PINCODE_ENFORCE_CATEGORIES.includes(catSlug)) return true;

  // If you only have category_id, you can optionally resolve it here (extra DB hit):
  // const catId = req.query?.category_id || req.body?.category_id;
  // if (catId) { const c = await Category.findById(catId).lean(); if (PINCODE_ENFORCE_CATEGORIES.includes((c?.slug||"").toLowerCase())) return true; }

  return false;
}

app.use(async (req, res, next) => {
  // Tenant guard: only bbscart.com (not ThiaWorld Jewellery)
  const host = (req.headers.host || "").split(":")[0].toLowerCase();
const hostOk = PINCODE_ENFORCE_HOSTS.some((h) => host === h);  if (!hostOk) return next();

  // Only for certain API roots
  const pathOk = PINCODE_ENFORCE_PATHS.some(p => req.path.startsWith(p));
  if (!pathOk) return next();

  // Only when the category involved is "supermarket"
  const isSuper = await isSupermarketRequest(req);
  if (!isSuper) return next();

  // Enforce assign-vendor-by-pincode here
  return assignVendorMiddleware(req, res, next);
});
// ---- END: Scoped vendor+pincode enforcement ----


app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser requests (no Origin) and known origins

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",

      "Authorization",

      "X-Pincode",

      "X-Guest-Key",
    ],
  })
);

// Handle preflight for all routes

app.options(
  "*",

  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// (Optional) log incoming Origin for debugging

app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin || "N/A");

  next();
});

// (Optional) log incoming Origin for debugging
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin || "N/A");
  next();
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to bbshealthcare (Default DB)"))
  .catch((err) => console.error("❌ Main DB error:", err));

// ✅ Session & Cookie
app.use(
  session({
    secret: process.env.REFRESH_TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(cookieParser());

// ✅ Body Parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Add body-parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static File Serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/franchisees", franchiseeRoutes);
app.use("/api/territory-heads", territoryHeadRoutes);
app.use("/api/customer-become-vendors", customerBecomeVendorRoutes);

app.use("/api/vendors", vendorRoutes);
app.use("/api/agent-heads", agentHeadRoutes);

app.use("/api/auth", authRoutes); // 🔐 Shared Login/Register from bbs-auth
app.use("/api/admin", adminRoutes);

app.use("/api/products", productRoutes);
app.use("/api/groceries", require("./routes/groceryRoutes"));
app.use("/api/fruits", require("./routes/FruitsRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/subcategories", require("./routes/subcategoryRoutes"));

app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/geo", geoRoutes);
app.use("/api/admin/pincode-vendors", adminPincodeVendorsRoutes);
app.use("/api/admin/vendors", adminVendorRoutes);
app.use("/orders", orderRoutes);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
