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

const app = express();

/* =======================
   ✅ CORS Setup (dev + prod)
   ======================= */
const allowedOrigins = [
  process.env.CLIENT_URL_DEV || "http://localhost:5173",
  process.env.CLIENT_URL_PROD || "https://bbscart.com",
];

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
app.use(require("./middleware/assignVendorMiddleware"));

app.use("/api/products", productRoutes);
app.use("/api/groceries", require("./routes/groceryRoutes"));
app.use("/api/fruits", require("./routes/FruitsRoutes"));

app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/geo", geoRoutes);
app.use("/api/admin/pincode-vendors", adminPincodeVendorsRoutes);
app.use("/api/admin/vendors", adminVendorRoutes);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
