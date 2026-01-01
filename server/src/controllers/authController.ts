import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const isProduction = process.env.NODE_ENV === 'production';

const setAuthCookie = (res: Response, token: string, maxAgeMs: number) => {
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: maxAgeMs
    });
};

// Initialize Firebase Admin if credentials are provided

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
        // NoSQL Injection Protection: Explicitly cast to string and trim
        const username = String(req.body.username).trim();
        const email = String(req.body.email).toLowerCase().trim();
        const password = String(req.body.password);

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // Create token
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

        // Validate required fields
        if (!email || !uid) {
            return res.status(400).json({ message: 'Email and UID are required' });
        }

        // Sanitize inputs
        const sanitizedEmail = String(email).toLowerCase().trim();
        const sanitizedUid = String(uid).trim();

        // Check if user exists
        let user = await User.findOne({ 
            $or: [
                { email: sanitizedEmail },
                { googleId: sanitizedUid }
            ]
        });
        
        if (!user) {
            // Create new user
            const username = displayName 
                ? String(displayName).split(' ')[0].trim() 
                : sanitizedEmail.split('@')[0];

            user = new User({
                username,
                email: sanitizedEmail,
                googleId: sanitizedUid,
                picture: photoURL || undefined,
                password: '', // No password for OAuth users
            });
            await user.save();
            console.log('✅ New Google user created:', user.email);
        } else {
            // Update existing user with Google info if needed
            let updated = false;
            
            if (!user.googleId) {
                user.googleId = sanitizedUid;
                updated = true;
            }
            if (!user.picture && photoURL) {
                user.picture = photoURL;
                updated = true;
            }
            if (!user.username && displayName) {
                user.username = displayName;
                updated = true;
            }
            
            if (updated) {
                await user.save();
                console.log('✅ User updated with Google info:', user.email);
            }
        }

        // Create JWT
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
            { expiresIn: '7d' } // Extended for better UX
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
        console.error('❌ Google auth error:', err);
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
        // NoSQL Injection Protection: Force strings
        const email = String(req.body.email).toLowerCase().trim();
        const password = String(req.body.password);

        // Check user (explicitly select password since it's excluded by default)
        let user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Validate password (OAuth users won't have a password)
        if (!user.password) {
            return res.status(400).json({ message: 'Please use Google login for this account' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Return token
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
