import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { userRepository } from '../database';
import { AuthRequest } from '../middleware/auth';
import { handleError } from '../utils/errorHandler';

const isProduction = process.env.NODE_ENV === 'production';

const setAuthCookie = (res: Response, token: string, maxAgeMs: number) => {
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
export const signup = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const username = String(req.body.username).trim();
        const email = String(req.body.email).toLowerCase().trim();
        const password = String(req.body.password);

        let user = await userRepository.findByEmail(email);
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await userRepository.create({
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

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        setAuthCookie(res, token, 60 * 60 * 1000);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Authenticate user with Firebase (handles both login and signup automatically)
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { email, displayName, photoURL, uid } = req.body;

        if (!email || !uid) {
            return res.status(400).json({ message: 'Email and UID are required' });
        }

        const sanitizedEmail = String(email).toLowerCase().trim();
        const sanitizedUid = String(uid).trim();

        let user = await userRepository.findByEmailOrGoogleId(sanitizedEmail, sanitizedUid);

        if (!user) {
            const username = displayName
                ? String(displayName).split(' ')[0].trim()
                : sanitizedEmail.split('@')[0];

            user = await userRepository.create({
                username,
                email: sanitizedEmail,
                googleId: sanitizedUid,
                picture: photoURL || undefined,
                password: '',
            });
        } else {
            const updates: { googleId?: string; picture?: string; username?: string } = {};

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
                user = await userRepository.update(user.id, updates) || user;
            }
        }

        const tokenPayload = {
            user: {
                userId: user.id,
                email: user.email,
                username: user.username
            }
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

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
    } catch (err: any) {
        console.error('Google auth error:', err);
        res.status(500).json({
            message: 'Google authentication failed',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const email = String(req.body.email).toLowerCase().trim();
        const password = String(req.body.password);

        const user = await userRepository.findByEmail(email, { includePassword: true });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        if (!user.password) {
            return res.status(400).json({ message: 'Please use Google login for this account' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
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

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        setAuthCookie(res, token, 60 * 60 * 1000);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const verifyToken = async (req: AuthRequest, res: Response) => {
    res.status(200).json({ valid: true, user: req.user });
};

export const logout = async (_req: AuthRequest, res: Response) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });

    res.status(200).json({ message: 'Logged out successfully' });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await userRepository.findById(userId);

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
    } catch (err) {
        handleError(res, err, 'getProfile');
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
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

        const updatedUser = await userRepository.update(userId, {
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
    } catch (err) {
        handleError(res, err, 'updateProfile');
    }
};
