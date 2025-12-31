import { Request, Response } from 'express';
import { Draft } from '../models/Draft';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        username: string;
    };
}

// Create a new draft
export const createDraft = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content } = req.body;
        
        // Validate word count (max 1000 words)
        const wordCount = content.trim().split(/\s+/).length;
        if (wordCount > 1000) {
            return res.status(400).json({ 
                message: 'Draft exceeds maximum word count of 1000 words' 
            });
        }

        const draft = new Draft({
            user: req.user?.userId,
            title: title || 'Untitled Draft',
            content: content || ''
        });

        await draft.save();
        res.status(201).json(draft);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all drafts for a user
export const getDrafts = async (req: AuthRequest, res: Response) => {
    try {
        const { type } = req.query; // 'drafts', 'locked-notes', or 'trash'
        
        let query: any = { user: req.user?.userId };
        
        if (type === 'trash') {
            query.isDeleted = true;
        } else if (type === 'locked-notes') {
            query.isLocked = true;
            query.isDeleted = false;
        } else {
            // Default: drafts
            query.isDeleted = false;
            query.isLocked = false;
        }

        const drafts = await Draft.find(query).sort({ updatedAt: -1 });
        res.json(drafts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all locked notes for a user
export const getAllLockedNotes = async (req: AuthRequest, res: Response) => {
    try {
        const drafts = await Draft.find({
            user: req.user?.userId,
            isLocked: true,
            isDeleted: false
        }).sort({ updatedAt: -1 });
        
        res.json(drafts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single draft by ID
export const getDraft = async (req: AuthRequest, res: Response) => {
    try {
        const draft = await Draft.findOne({
            _id: req.params.id,
            user: req.user?.userId
        });

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.json(draft);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update a draft
export const updateDraft = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, isLocked, passwordHash, passwordSalt, iv } = req.body;
        
        // Validate word count (max 1000 words)
        if (content) {
            const wordCount = content.trim().split(/\s+/).length;
            if (wordCount > 1000) {
                return res.status(400).json({ 
                    message: 'Draft exceeds maximum word count of 1000 words' 
                });
            }
        }

        const updateData: any = {
            updatedAt: new Date()
        };

        // Only update fields that are provided
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (isLocked !== undefined) updateData.isLocked = isLocked;
        if (passwordHash !== undefined) updateData.passwordHash = passwordHash;
        if (passwordSalt !== undefined) updateData.passwordSalt = passwordSalt;
        if (iv !== undefined) updateData.iv = iv;

        const draft = await Draft.findOneAndUpdate(
            { _id: req.params.id, user: req.user?.userId },
            updateData,
            { new: true }
        );

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.json(draft);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a draft (move to trash)
export const deleteDraft = async (req: AuthRequest, res: Response) => {
    try {
        const draft = await Draft.findOneAndUpdate(
            { _id: req.params.id, user: req.user?.userId },
            { isDeleted: true, updatedAt: new Date() },
            { new: true }
        );

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.json({ message: 'Draft moved to trash', draft });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Restore a draft from trash
export const restoreDraft = async (req: AuthRequest, res: Response) => {
    try {
        const draft = await Draft.findOneAndUpdate(
            { _id: req.params.id, user: req.user?.userId },
            { isDeleted: false, updatedAt: new Date() },
            { new: true }
        );

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.json({ message: 'Draft restored', draft });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Permanently delete a draft
export const permanentDeleteDraft = async (req: AuthRequest, res: Response) => {
    try {
        const draft = await Draft.findOneAndDelete({
            _id: req.params.id,
            user: req.user?.userId
        });

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.json({ message: 'Draft permanently deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
