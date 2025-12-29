import express from 'express';
import { body } from 'express-validator';
import { authRateLimiter } from '../middleware/rateLimiter';
import { signup, login, googleAuth } from '../controllers/authController';

const router = express.Router();

/**
 * @route   POST api/auth/signup
 * @desc    Register user
 * @access  Public
 */
router.post(
    '/signup',
    authRateLimiter,
    [
        body('username', 'Username is required and should be alphanumeric').isAlphanumeric().trim().notEmpty(),
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Please enter a password with 8 or more characters, including at least one letter and one number')
            .isLength({ min: 8 })
            .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)
    ],
    signup
);

/**
 * @route   POST api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
    '/login',
    authRateLimiter,
    [
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password is required').exists()
    ],
    login
);

/**
 * @route   POST api/auth/google
 * @desc    Authenticate user with Firebase (handles login/signup automatically)
 * @access  Public
 */
router.post('/google', authRateLimiter, googleAuth);

export default router;
