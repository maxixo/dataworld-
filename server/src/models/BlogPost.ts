import mongoose from 'mongoose';

const BlogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    published: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp on save
BlogPostSchema.pre('save', function (this: any, next: any) {
    this.updatedAt = new Date();
    next();
});

export const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
