"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const rateLimiter_1 = require("../middleware/rateLimiter");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
/**
 * @route   POST api/auth/signup
 * @desc    Register user
 * @access  Public
 */
router.post('/signup', rateLimiter_1.authRateLimiter, [
    (0, express_validator_1.body)('username', 'Username is required and may contain letters, numbers, spaces, dashes, or underscores')
        .trim()
        .notEmpty()
        .matches(/^[A-Za-z0-9 _-]+$/),
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password', 'Please enter a password with 8 or more characters, including at least one letter and one number')
        .isLength({ min: 8 })
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)
], authController_1.signup);
/**
 * @route   POST api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', rateLimiter_1.authRateLimiter, [
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password', 'Password is required').exists()
], authController_1.login);
/**
 * @route   POST api/auth/google
 * @desc    Authenticate user with Firebase (handles login/signup automatically)
 * @access  Public
 */
router.post('/google', rateLimiter_1.authRateLimiter, authController_1.googleAuth);
exports.default = router;
