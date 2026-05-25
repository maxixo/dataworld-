import { Response } from 'express';
import { draftRepository, DraftListType } from '../database';
import { AuthRequest } from '../middleware/auth';

const getAuthenticatedUserId = (req: AuthRequest) => req.user?.userId;

export const createDraft = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, label } = req.body;
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const safeContent = content || '';
        const wordCount = safeContent.trim().length === 0 ? 0 : safeContent.trim().split(/\s+/).length;
        if (wordCount > 1000) {
            return res.status(400).json({
                message: 'Draft exceeds maximum word count of 1000 words'
            });
        }

        const draft = await draftRepository.create({
            userId,
            title: title || 'Untitled Draft',
            content: safeContent,
            label: label || null
        });

        res.status(201).json(draft);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getDrafts = async (req: AuthRequest, res: Response) => {
    try {
        const { type } = req.query;
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const listType: DraftListType =
            type === 'trash' || type === 'locked-notes' ? type : 'drafts';

        const drafts = await draftRepository.listByUser(userId, listType);
        res.json(drafts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllLockedNotes = async (req: AuthRequest, res: Response) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const drafts = await draftRepository.listByUser(userId, 'locked-notes');
        res.json(drafts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getDraft = async (req: AuthRequest, res: Response) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const draft = await draftRepository.findByIdForUser(req.params.id, userId);

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.json(draft);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDraft = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, isEncrypted, passwordHash, passwordSalt, iv, label } = req.body;
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

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

        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (isEncrypted !== undefined) updateData.isEncrypted = isEncrypted;
        if (passwordHash !== undefined) updateData.passwordHash = passwordHash;
        if (passwordSalt !== undefined) updateData.passwordSalt = passwordSalt;
        if (iv !== undefined) updateData.iv = iv;
        if (label !== undefined) updateData.label = label;

        const draft = await draftRepository.updateByIdForUser(req.params.id, userId, updateData);

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.json(draft);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDraft = async (req: AuthRequest, res: Response) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const draft = await draftRepository.softDeleteByIdForUser(req.params.id, userId);

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.json({ message: 'Draft moved to trash', draft });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const restoreDraft = async (req: AuthRequest, res: Response) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const draft = await draftRepository.restoreByIdForUser(req.params.id, userId);

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.json({ message: 'Draft restored', draft });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const permanentDeleteDraft = async (req: AuthRequest, res: Response) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const draft = await draftRepository.deleteByIdForUser(req.params.id, userId);

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.json({ message: 'Draft permanently deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkPermanentDeleteDrafts = async (req: AuthRequest, res: Response) => {
    try {
        const { ids } = req.body;
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'ids must be a non-empty array' });
        }

        const uniqueIds = Array.from(
            new Set(ids.filter((id) => typeof id === 'string' && id.trim() !== ''))
        );

        if (uniqueIds.length === 0) {
            return res.status(400).json({ message: 'ids must contain valid draft ids' });
        }

        const deletedIds = await draftRepository.bulkPermanentDeleteTrashed(userId, uniqueIds);

        if (deletedIds.length === 0) {
            return res.json({
                message: 'No trashed drafts found for deletion',
                deletedCount: 0,
                deletedIds
            });
        }

        res.json({
            message: 'Drafts permanently deleted',
            deletedCount: deletedIds.length,
            deletedIds
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
