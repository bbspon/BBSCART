// config/userDB.js
const mongoose = require("mongoose");

const userDB = mongoose.createConnection(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

userDB.on("connected", () => {
  console.log("✅ Connected to BBSCartLocal1 for Users");
});

module.exports = userDB;
