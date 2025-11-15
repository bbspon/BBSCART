const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));

const User = require("../models/User");
const FranchiseHead = require("../models/FranchiseHead");
const TerritoryHead = require("../models/TerritoryHead");
const Agent = require("../models/Agent");
// NOTE: adjust path if your Vendor model file is named differently
const Vendor = require("../models/Vendor");

// simple sanitizer
const clean = (v = "") => String(v || "").trim();

// random string helper for temp password
const rand = () => Math.random().toString(36).substring(2, 8);

exports.createPartnerUser = async (req, res) => {
  try {
    const {
      email,
      partnerId,
      name,
      role = "franchise",
      platform = "BBSCART",
    } = req.body || {};

    if (!email || !partnerId) {
      return res
        .status(400)
        .json({ success: false, message: "email and partnerId required" });
    }

    const _email = clean(email).toLowerCase();

    // 1) find or create user
    let user = await User.findOne({ email: _email });

    // ============ CREATE NEW USER ============ //
    if (!user) {
      const now = new Date();
      const doc = new User({
        email: _email,
        name: clean(name || "Partner User"),
        role, // franchise / territory / agent / vendor / etc.
        password: await bcrypt.hash(rand() + rand(), 10), // temp placeholder
        createdAt: now,
        updatedAt: now,
        platform,
        accountStatus: "pending",
      });

      // attach correct linkage based on role (first pass)
      try {
        if (role === "franchise") {
          doc.franchiseId = mongoose.Types.ObjectId(partnerId);
        } else if (role === "territory") {
          doc.territoryId = mongoose.Types.ObjectId(partnerId);
        } else if (role === "agent") {
          doc.agentId = mongoose.Types.ObjectId(partnerId);
        } else if (role === "vendor") {
          doc.vendorId = mongoose.Types.ObjectId(partnerId);
        }
      } catch (_) {
        // partnerId might be invalid; we will handle via fallbacks below
      }

      user = await doc.save();
    }

    // ============ UPDATE EXISTING USER ============ //
    else {
      const set = {};

      // force correct role if mismatched
      if (user.role !== role) set.role = role;

      // add correct linkage if missing
      try {
        if (role === "franchise" && !user.franchiseId) {
          set.franchiseId = mongoose.Types.ObjectId(partnerId);
        }
        if (role === "territory" && !user.territoryId) {
          set.territoryId = mongoose.Types.ObjectId(partnerId);
        }
        if (role === "agent" && !user.agentId) {
          set.agentId = mongoose.Types.ObjectId(partnerId);
        }
        if (role === "vendor" && !user.vendorId) {
          set.vendorId = mongoose.Types.ObjectId(partnerId);
        }
      } catch (_) {
        // ignore invalid ObjectId – fallbacks will handle
      }

      if (Object.keys(set).length) {
        set.updatedAt = new Date();
        await User.updateOne({ _id: user._id }, { $set: set });
        user = await User.findById(user._id);
      }
    }

    // ========= FALLBACK FIXES PER ROLE =========

    // FRANCHISE: if still no franchiseId, try FranchiseHead by id or email
    if (role === "franchise" && !user.franchiseId) {
      try {
        let fr = null;

        if (partnerId && mongoose.isValidObjectId(partnerId)) {
          fr = await FranchiseHead.findById(partnerId);
        }

        if (!fr) {
          fr = await FranchiseHead.findOne({ email: _email });
        }

        if (fr) {
          user.franchiseId = fr._id;
          user.updatedAt = new Date();
          await user.save();
        }
      } catch (e) {
        console.error("[createPartnerUser] franchise fallback failed:", e);
      }
    }

    // TERRITORY: if still no territoryId, try TerritoryHead by id or email
    if (role === "territory" && !user.territoryId) {
      try {
        let th = null;

        if (partnerId && mongoose.isValidObjectId(partnerId)) {
          th = await TerritoryHead.findById(partnerId);
        }

        if (!th) {
          th = await TerritoryHead.findOne({ email: _email });
        }

        if (th) {
          user.territoryId = th._id;

          // If Territory belongs to a Franchise, also link franchiseId
          if (th.franchiseId && !user.franchiseId) {
            user.franchiseId = th.franchiseId;
          }

          user.updatedAt = new Date();
          await user.save();
        }
      } catch (e) {
        console.error("[createPartnerUser] territory fallback failed:", e);
      }
    }

    // AGENT: if still no agentId, try Agent by id or email
 if (role === "agent" && !user.agentId) {
   try {
     let ag = null;

     if (partnerId && mongoose.isValidObjectId(partnerId)) {
       ag = await Agent.findById(partnerId);
     }

     if (!ag) {
       ag = await Agent.findOne({ email: _email });
     }

     if (ag) {
       user.agentId = ag._id;

       if (ag.franchiseeId && !user.franchiseId) {
         user.franchiseId = ag.franchiseeId;
       }
       if (ag.territoryId && !user.territoryId) {
         user.territoryId = ag.territoryId;
       }

       user.updatedAt = new Date();
       await user.save();
     }
   } catch (e) {
     console.error("[createPartnerUser] agent fallback failed:", e);
   }
 }


    // VENDOR: if still no vendorId, try Vendor by id or email
    if (role === "vendor" && !user.vendorId) {
      try {
        let vd = null;

        if (partnerId && mongoose.isValidObjectId(partnerId)) {
          vd = await Vendor.findById(partnerId);
        }

        if (!vd) {
          vd = await Vendor.findOne({ email: _email });
        }

        if (vd) {
          user.vendorId = vd._id;

          // cascade franchise / territory / agent if present in Vendor
          if (vd.franchiseeId && !user.franchiseId) {
            user.franchiseId = vd.franchiseeId;
          }
          if (vd.territoryId && !user.territoryId) {
            user.territoryId = vd.territoryId;
          }
          if (vd.agentId && !user.agentId) {
            user.agentId = vd.agentId;
          }

          user.updatedAt = new Date();
          await user.save();
        }
      } catch (e) {
        console.error("[createPartnerUser] vendor fallback failed:", e);
      }
    }

    // 2) send reset email via forgot-password endpoint
    const host = req.get("host");
    const base = `${req.protocol}://${host}`;
    const endpoints = [
      `${base}/api/auth/forgot-password`,
      `${base}/auth/forgot-password`,
    ];

    let sent = false;
    let lastText = "";

    for (const url of endpoints) {
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: _email }),
        });
        lastText = await r.text();
        if (r.ok) {
          sent = true;
          break;
        }
      } catch (e) {
        lastText = e.message;
      }
    }

    // 3) return response
    if (!sent) {
      return res.status(200).json({
        success: true,
        userId: String(user._id),
        message:
          "User created/linked. Couldn’t reach forgot-password route automatically; please use 'Send Reset Link' manually.",
        detail: lastText?.slice?.(0, 200) || "",
      });
    }

    return res.status(200).json({
      success: true,
      userId: String(user._id),
      message: `Credentials prepared for ${role}. Reset link sent successfully.`,
    });
  } catch (err) {
    console.error("[createPartnerUser]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
