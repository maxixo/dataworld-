"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: false,
        select: false // Prevent password from being returned in queries by default
    },
    // Google OAuth fields
    googleId: { type: String, required: false },
    picture: { type: String, required: false },
    // Security fields
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    lastLogin: Date,
    refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now }
});
// Virtual for checking if account is locked
UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && new Date(this.lockUntil) > new Date());
});
// Ensure virtuals are included in JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
exports.User = mongoose_1.default.model('User', UserSchema);
