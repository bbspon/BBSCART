const jwt = require("jsonwebtoken");
const redis = require("redis");

// Initialize Redis Client
const client = redis.createClient({
    socket: {
        host: "127.0.0.1", // Change if Redis is hosted elsewhere
        port: 6379,
    },
});

client.on("error", (err) => console.error("❌ Redis Client Error:", err));
client.connect().catch((err) => console.error("❌ Redis Connection Failed:", err));

// Authentication Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }

        // Check if token is blacklisted
        const isBlacklisted = await client.get(token);
        if (isBlacklisted) {
            return res.status(401).json({ success: false, message: "Token expired. Please login again" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ JWT Verification Error:", error.message);
        return res.status(401).json({ success: false, message: "Token is not valid" });
    }
};

// Admin-Only Middleware
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
};

// Logout Function (Blacklist Token)
const logout = async (req, res) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        // Blacklist token by storing it in Redis with expiration
        const decoded = jwt.decode(token);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000); // Get remaining time

        if (expiresIn > 0) {
            await client.setEx(token, expiresIn, "blacklisted"); // Store token in Redis
        }

        return res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("❌ Logout Error:", error.message);
        return res.status(500).json({ success: false, message: "Error logging out" });
    }
};

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.cookies?.accessToken;;

        if (!token) {
            req.user = null;
            return next();
        }

        // Check if token is blacklisted
        const isBlacklisted = await client.get(token);
        if (isBlacklisted) {
            req.user = null;
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;  
        } catch (error) {
            console.error("❌ Token Verification Failed:", error.message);
            req.user = null;
        }

        next();
    } catch (error) {
        console.error("❌ JWT Middleware Error:", error.message);
        req.user = null;
        next();
    }
};


module.exports = { auth, adminOnly, logout, authUser };