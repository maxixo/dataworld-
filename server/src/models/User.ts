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
    createdAt: { type: Date, default: Date.now }
});



export const User = mongoose.model('User', UserSchema);

