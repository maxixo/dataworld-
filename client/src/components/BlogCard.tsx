import React from 'react';
import { Link } from 'react-router-dom';

interface BlogPost {
    _id: string;
    title: string;
    content: string;
    author: {
        username: string;
        email: string;
    };
    category: string;
    tags: string[];
    published: boolean;
    createdAt: string;
}

interface BlogCardProps {
    post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    // Create excerpt from content (first 150 characters)
    const excerpt = post.content.length > 150
        ? post.content.substring(0, 150) + '...'
        : post.content;

    return (
        <Link
            to={`/blog/${post._id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
        >
            <div className="p-6">
                {/* Category Badge */}
                <div className="mb-3">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full">
                        {post.category}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {excerpt}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                            <span
                                key={idx}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{post.author.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
