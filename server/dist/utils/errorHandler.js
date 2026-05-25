"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const handleError = (res, err, context) => {
    console.error(`[ERROR] ${context}:`, err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    if (err.code === '23505') {
        return res.status(409).json({ message: 'Duplicate entry detected' });
    }
    if (err.code === '23503') {
        return res.status(400).json({ message: 'Related record does not exist' });
    }
    if (err.code === '22P02') {
        return res.status(400).json({ message: 'Invalid input format' });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large' });
    }
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({
        message: 'Server error occurred',
        ...(isProduction ? {} : { error: err.message, stack: err.stack })
    });
};
exports.handleError = handleError;
