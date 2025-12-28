import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
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
        required: true,
        select: false  // Prevent password from being returned in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'  // Default role for new users
    },
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
UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && new Date(this.lockUntil) > new Date());
});

// Ensure virtuals are included in JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });



export const User = mongoose.model('User', UserSchema);
