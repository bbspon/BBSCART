const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

// Address Schema (Embedded in UserDetails)
const AddressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
});

// UserDetails Schema
const UserDetailsSchema = new mongoose.Schema({
    userId: { type: ObjectId, ref: 'User', required: true, unique: true }, // Reference to User Schema
    referralCode: { type: String, unique: true }, // Unique referral code
    referredBy: { type: ObjectId, ref: 'User' }, // User who referred them
    phone: { type: String, unique: true, required: true }, // User's phone number

    addresses: AddressSchema, // List of user addresses
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },

    profilePic: { type: String, default: "" }, // Profile picture URL
    dateOfBirth: { type: Date, default: null }, // User's date of birth
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: null }, // Gender selection

    savedCards: [{
        cardNumber: { type: String, required: true },
        cardType: { type: String, enum: ['Visa', 'MasterCard', 'Amex', 'Other'] },
        expiryDate: { type: String, required: true },
        isDefault: { type: Boolean, default: false }
    }], // List of saved payment cards

    shoppingPoints: { type: Number, default: 0 }, // User's shopping points

    created_at: { type: Date, default: Date.now }, // Account creation date
    updated_at: { type: Date, default: Date.now } // Last updated date
});

// Middleware to update `updated_at` before saving
UserDetailsSchema.pre("save", function (next) {
    this.updated_at = new Date();
    next();
});

const UserDetails = mongoose.model('UserDetails', UserDetailsSchema);
module.exports = UserDetails;