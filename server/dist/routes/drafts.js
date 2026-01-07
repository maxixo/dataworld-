"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const draftController_1 = require("../controllers/draftController");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.auth);
// Create a new draft
router.post('/', draftController_1.createDraft);
// Get all drafts (with type filter: 'drafts', 'locked-notes', 'trash')
router.get('/', draftController_1.getDrafts);
// Get all locked notes
router.get('/locked', draftController_1.getAllLockedNotes);
// Get a single draft by ID
router.get('/:id', draftController_1.getDraft);
// Update a draft
router.put('/:id', draftController_1.updateDraft);
// Move a draft to trash
router.delete('/:id', draftController_1.deleteDraft);
// Restore a draft from trash
router.post('/:id/restore', draftController_1.restoreDraft);
// Permanently delete a draft
router.delete('/:id/permanent', draftController_1.permanentDeleteDraft);
exports.default = router;
