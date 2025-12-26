import { Request, Response } from 'express';
import { BlogPost } from '../models/BlogPost';

// Public: Get all published blog posts
export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await BlogPost.find({ published: true })
            .populate('author', 'username email')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Public: Get single blog post by ID
export const getPostById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const post = await BlogPost.findById(id).populate('author', 'username email');

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Only show published posts to non-admins
        // @ts-ignore
        const isAdmin = req.user?.role === 'admin';
        if (!post.published && !isAdmin) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get current user's draft posts
export const getUserDrafts = async (req: any, res: Response) => {
    try {
        const drafts = await BlogPost.find({
            author: req.user.id,
            published: false
        })
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('title category updatedAt');

        res.json(drafts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Get all posts (including drafts)
export const getAllPostsAdmin = async (req: Request, res: Response) => {
    try {
        const posts = await BlogPost.find()
            .populate('author', 'username email')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Create new blog post
export const createPost = async (req: Request, res: Response) => {
    try {
        const { title, content, category, tags, published } = req.body;
        // @ts-ignore
        const userId = req.user.id;

        const newPost = new BlogPost({
            title,
            content,
            author: userId,
            category,
            tags: tags || [],
            published: published || false
        });

        const savedPost = await newPost.save();
        const populatedPost = await BlogPost.findById(savedPost._id).populate('author', 'username email');

        res.status(201).json(populatedPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Update blog post
export const updatePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, category, tags, published } = req.body;

        const post = await BlogPost.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Update fields
        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
        if (category !== undefined) post.category = category;
        if (tags !== undefined) post.tags = tags;
        if (published !== undefined) post.published = published;

        const updatedPost = await post.save();
        const populatedPost = await BlogPost.findById(updatedPost._id).populate('author', 'username email');

        res.json(populatedPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Delete blog post
export const deletePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const post = await BlogPost.findByIdAndDelete(id);
        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        res.json({ message: 'Blog post deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
