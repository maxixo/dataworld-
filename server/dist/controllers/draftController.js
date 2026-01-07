"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permanentDeleteDraft = exports.restoreDraft = exports.deleteDraft = exports.updateDraft = exports.getDraft = exports.getAllLockedNotes = exports.getDrafts = exports.createDraft = void 0;
const Draft_1 = require("../models/Draft");
// Create a new draft
const createDraft = async (req, res) => {
    try {
        const { title, content, label } = req.body;
        // Validate word count (max 1000 words)
        const wordCount = content.trim().split(/\s+/).length;
        if (wordCount > 1000) {
            return res.status(400).json({
                message: 'Draft exceeds maximum word count of 1000 words'
            });
        }
        const draft = new Draft_1.Draft({
            user: req.user?.userId,
            title: title || 'Untitled Draft',
            content: content || '',
            label: label || null
        });
        await draft.save();
        res.status(201).json(draft);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createDraft = createDraft;
// Get all drafts for a user
const getDrafts = async (req, res) => {
    try {
        const { type } = req.query; // 'drafts', 'locked-notes', or 'trash'
        let query = { user: req.user?.userId };
        if (type === 'trash') {
            query.isDeleted = true;
        }
        else if (type === 'locked-notes') {
            query.isEncrypted = true;
            query.isDeleted = false;
        }
        else {
            // Default: drafts
            query.isDeleted = false;
            query.isEncrypted = false;
        }
        const drafts = await Draft_1.Draft.find(query).sort({ updatedAt: -1 });
        res.json(drafts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getDrafts = getDrafts;
// Get all locked notes for a user
const getAllLockedNotes = async (req, res) => {
    try {
        const drafts = await Draft_1.Draft.find({
            user: req.user?.userId,
            isEncrypted: true,
            isDeleted: false
        }).sort({ updatedAt: -1 });
        res.json(drafts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllLockedNotes = getAllLockedNotes;
// Get a single draft by ID
const getDraft = async (req, res) => {
    try {
        const draft = await Draft_1.Draft.findOne({
            _id: req.params.id,
            user: req.user?.userId
        });
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
// Update a draft
const updateDraft = async (req, res) => {
    try {
        const { title, content, isEncrypted, passwordHash, passwordSalt, iv, label } = req.body;
        // Validate word count (max 1000 words)
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
        // Only update fields that are provided
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
        const draft = await Draft_1.Draft.findOneAndUpdate({ _id: req.params.id, user: req.user?.userId }, updateData, { new: true });
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
// Delete a draft (move to trash)
const deleteDraft = async (req, res) => {
    try {
        const draft = await Draft_1.Draft.findOneAndUpdate({ _id: req.params.id, user: req.user?.userId }, { isDeleted: true, updatedAt: new Date() }, { new: true });
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
// Restore a draft from trash
const restoreDraft = async (req, res) => {
    try {
        const draft = await Draft_1.Draft.findOneAndUpdate({ _id: req.params.id, user: req.user?.userId }, { isDeleted: false, updatedAt: new Date() }, { new: true });
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
// Permanently delete a draft
const permanentDeleteDraft = async (req, res) => {
    try {
        const draft = await Draft_1.Draft.findOneAndDelete({
            _id: req.params.id,
            user: req.user?.userId
        });
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
