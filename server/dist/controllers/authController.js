"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.logout = exports.verifyToken = exports.login = exports.googleAuth = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const database_1 = require("../database");
const errorHandler_1 = require("../utils/errorHandler");
const isProduction = process.env.NODE_ENV === 'production';
const setAuthCookie = (res, token, maxAgeMs) => {
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: maxAgeMs
    });
};
/**
 * @desc    Register user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const username = String(req.body.username).trim();
        const email = String(req.body.email).toLowerCase().trim();
        const password = String(req.body.password);
        let user = await database_1.userRepository.findByEmail(email);
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        user = await database_1.userRepository.create({
            username,
            email,
            password: hashedPassword
        });
        const payload = {
            user: {
                userId: user.id,
                email: user.email,
                username: user.username
            }
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        setAuthCookie(res, token, 60 * 60 * 1000);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
exports.signup = signup;
/**
 * @desc    Authenticate user with Firebase (handles both login and signup automatically)
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = async (req, res) => {
    try {
        const { email, displayName, photoURL, uid } = req.body;
        if (!email || !uid) {
            return res.status(400).json({ message: 'Email and UID are required' });
        }
        const sanitizedEmail = String(email).toLowerCase().trim();
        const sanitizedUid = String(uid).trim();
        let user = await database_1.userRepository.findByEmailOrGoogleId(sanitizedEmail, sanitizedUid);
        if (!user) {
            const username = displayName
                ? String(displayName).split(' ')[0].trim()
                : sanitizedEmail.split('@')[0];
            user = await database_1.userRepository.create({
                username,
                email: sanitizedEmail,
                googleId: sanitizedUid,
                picture: photoURL || undefined,
                password: '',
            });
        }
        else {
            const updates = {};
            if (!user.googleId) {
                updates.googleId = sanitizedUid;
            }
            if (!user.picture && photoURL) {
                updates.picture = photoURL;
            }
            if (!user.username && displayName) {
                updates.username = displayName;
            }
            if (Object.keys(updates).length > 0) {
                user = await database_1.userRepository.update(user.id, updates) || user;
            }
        }
        const tokenPayload = {
            user: {
                userId: user.id,
                email: user.email,
                username: user.username
            }
        };
        const token = jsonwebtoken_1.default.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
        setAuthCookie(res, token, 7 * 24 * 60 * 60 * 1000);
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                picture: user.picture,
                googleId: user.googleId,
                createdAt: user.createdAt
            }
        });
    }
    catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({
            message: 'Google authentication failed',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
exports.googleAuth = googleAuth;
/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const email = String(req.body.email).toLowerCase().trim();
        const password = String(req.body.password);
        const user = await database_1.userRepository.findByEmail(email, { includePassword: true });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        if (!user.password) {
            return res.status(400).json({ message: 'Please use Google login for this account' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        const payload = {
            user: {
                userId: user.id,
                email: user.email,
                username: user.username
            }
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        setAuthCookie(res, token, 60 * 60 * 1000);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
exports.login = login;
const verifyToken = async (req, res) => {
    res.status(200).json({ valid: true, user: req.user });
};
exports.verifyToken = verifyToken;
const logout = async (_req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await database_1.userRepository.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            picture: user.picture,
            googleId: user.googleId,
            createdAt: user.createdAt
        });
    }
    catch (err) {
        (0, errorHandler_1.handleError)(res, err, 'getProfile');
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const username = typeof req.body.username === 'string' ? req.body.username.trim() : undefined;
        const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase().trim() : undefined;
        const updatedUser = await database_1.userRepository.update(userId, {
            ...(username ? { username } : {}),
            ...(email ? { email } : {}),
        });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                picture: updatedUser.picture,
                googleId: updatedUser.googleId,
                createdAt: updatedUser.createdAt
            }
        });
    }
    catch (err) {
        (0, errorHandler_1.handleError)(res, err, 'updateProfile');
    }
};
exports.updateProfile = updateProfile;
