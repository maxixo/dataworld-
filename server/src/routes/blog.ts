import express from 'express';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import {
    getAllPosts,
    getPostById,
    getUserDrafts,
    getAllPostsAdmin,
    createPost,
    updatePost,
    deletePost
} from '../controllers/blogController';

const router = express.Router();

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// User routes (require authentication)
router.get('/user/drafts', auth, getUserDrafts);

// Admin routes (require authentication + admin role)
router.get('/admin/all', auth, adminAuth, getAllPostsAdmin);
router.post('/', auth, adminAuth, createPost);
router.put('/:id', auth, adminAuth, updatePost);
router.delete('/:id', auth, adminAuth, deletePost);

export default router;
