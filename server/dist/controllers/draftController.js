"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkPermanentDeleteDrafts = exports.permanentDeleteDraft = exports.restoreDraft = exports.deleteDraft = exports.updateDraft = exports.getDraft = exports.getAllLockedNotes = exports.getDrafts = exports.createDraft = void 0;
const database_1 = require("../database");
const getAuthenticatedUserId = (req) => req.user?.userId;
const createDraft = async (req, res) => {
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
        const draft = await database_1.draftRepository.create({
            userId,
            title: title || 'Untitled Draft',
            content: safeContent,
            label: label || null
        });
        res.status(201).json(draft);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createDraft = createDraft;
const getDrafts = async (req, res) => {
    try {
        const { type } = req.query;
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const listType = type === 'trash' || type === 'locked-notes' ? type : 'drafts';
        const drafts = await database_1.draftRepository.listByUser(userId, listType);
        res.json(drafts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getDrafts = getDrafts;
const getAllLockedNotes = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const drafts = await database_1.draftRepository.listByUser(userId, 'locked-notes');
        res.json(drafts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllLockedNotes = getAllLockedNotes;
const getDraft = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const draft = await database_1.draftRepository.findByIdForUser(req.params.id, userId);
        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }
        res.json(draft);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getDraft = getDraft;
const updateDraft = async (req, res) => {
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
        const updateData = {
            updatedAt: new Date()
        };
        if (title !== undefined)
            updateData.title = title;
        if (content !== undefined)
            updateData.content = content;
        if (isEncrypted !== undefined)
            updateData.isEncrypted = isEncrypted;
        if (passwordHash !== undefined)
            updateData.passwordHash = passwordHash;
        if (passwordSalt !== undefined)
            updateData.passwordSalt = passwordSalt;
        if (iv !== undefined)
            updateData.iv = iv;
        if (label !== undefined)
            updateData.label = label;
        const draft = await database_1.draftRepository.updateByIdForUser(req.params.id, userId, updateData);
        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }
        res.json(draft);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateDraft = updateDraft;
const deleteDraft = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const draft = await database_1.draftRepository.softDeleteByIdForUser(req.params.id, userId);
        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }
        res.json({ message: 'Draft moved to trash', draft });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteDraft = deleteDraft;
const restoreDraft = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const draft = await database_1.draftRepository.restoreByIdForUser(req.params.id, userId);
        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }
        res.json({ message: 'Draft restored', draft });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.restoreDraft = restoreDraft;
const permanentDeleteDraft = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const draft = await database_1.draftRepository.deleteByIdForUser(req.params.id, userId);
        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }
        res.json({ message: 'Draft permanently deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.permanentDeleteDraft = permanentDeleteDraft;
const bulkPermanentDeleteDrafts = async (req, res) => {
    try {
        const { ids } = req.body;
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'ids must be a non-empty array' });
        }
        const uniqueIds = Array.from(new Set(ids.filter((id) => typeof id === 'string' && id.trim() !== '')));
        if (uniqueIds.length === 0) {
            return res.status(400).json({ message: 'ids must contain valid draft ids' });
        }
        const deletedIds = await database_1.draftRepository.bulkPermanentDeleteTrashed(userId, uniqueIds);
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.bulkPermanentDeleteDrafts = bulkPermanentDeleteDrafts;
