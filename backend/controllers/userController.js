const User = require("../models/User");
const UserDetails = require("../models/UserDetails");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Function to generate a 7-digit alphanumeric referral code
const generateReferralCode = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 7);
};

// CREATE: Add a new user
exports.createUser = async (req, res) => {
    const { name, email, password, phone, role } = req.body;
    // console.log('Create Seller Data',req.body);
    try {
        // ✅ Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // ✅ Create new user
        user = new User({ name, email, password, role });

        // ✅ Hash the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // ✅ Save user to the database
        await user.save();

        // ✅ Generate unique referral code
        const referralCode = generateReferralCode();

        // ✅ Create UserDetails record
        const userDetails = new UserDetails({
            userId: user._id,
            referralCode,
            phone
        });

        await userDetails.save();

        // ✅ Link User to UserDetails
        user.userdetails = userDetails._id;
        await user.save();

        // ✅ Send response with tokens and user data
        res.status(201).json({
            message: 'User Created Successfully'
        });

    } catch (error) {
        console.error("User Creation error:", error);
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({ msg: "User already exists" });
        }
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};


// READ: Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate("userdetails");
        res.status(200).json(users);
        console.log('getAllUsers');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ: Get a single user by id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("userdetails");  // Query by id
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// exports.getUserByRole = async (req, res) => {
//     try {
//         const role = req.query.role; // Get role from query parameter
//         console.log("Requested Role:", role); // Debugging

//         if (!role) {
//             return res.status(400).json({ message: 'Role parameter is required' });
//         }

//         const users = await User.find({ role: role }).populate("userdetails"); // Ensure role is correctly filtered
//         console.log("Filtered Users:", users); // Log the filtered users

//         if (!users.length) {
//             return res.status(404).json({ message: 'No users found with this role' });
//         }

//         res.setHeader('Cache-Control', 'no-store'); // Prevent caching
//         return res.status(200).json(users);
//     } catch (err) {
//         console.error("Error Fetching Users:", err);
//         return res.status(500).json({ message: 'Server error', error: err.message });
//     }
// };

exports.getUserByRole = async (req, res) => {
    try {
        let { role } = req.query; // Get role(s) from query parameter

        console.log("Requested Roles:", role); // Debugging

        if (!role) {
            return res.status(400).json({ message: "Role parameter is required" });
        }

        // Ensure role is always an array (supporting multiple roles)
        const roles = Array.isArray(role) ? role : role.split(",");

        // Fetch users with any of the given roles
        const users = await User.find({ role: { $in: roles } }).populate("userdetails");

        console.log("Filtered Users:", users); // Debugging

        if (!users.length) {
            return res.status(404).json({ message: "No users found with the specified roles" });
        }

        res.setHeader("Cache-Control", "no-store"); // Prevent caching
        return res.status(200).json(users);
    } catch (err) {
        console.error("Error Fetching Users:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};



// UPDATE: Update a user by id with image upload
exports.updateUser = async (req, res) => {
    console.log('updateUser');
    try {
        const _id = req.params.id;
        console.log(_id);
        // Fetch the existing user
        const exisingUser = await User.findById({ _id }).populate("userdetails");
        if (!exisingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize updated fields
        let updatedUserData = { ...req.body };

        // Update the user
        const updatedUser = await User.findOneAndUpdate(
            { _id },
            updatedUserData,
            { new: true } // Return the updated document
        );

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};


// DELETE: Delete a user by id
exports.deleteUser = async (req, res) => {
    try {
        // Find the user by id
        const user = await User.findOne({ _id: req.params.id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user from the database
        await User.findOneAndDelete({ _id: req.params.id });

        res.status(200).json({ message: 'User and associated images deleted successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: err.message });
    }
};

