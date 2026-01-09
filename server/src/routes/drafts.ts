import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
    createDraft,
    getDrafts,
    getDraft,
    getAllLockedNotes,
    updateDraft,
    deleteDraft,
    restoreDraft,
    permanentDeleteDraft,
    bulkPermanentDeleteDrafts
} from '../controllers/draftController';

const router = Router();

// All routes require authentication
router.use(auth);

// Create a new draft
router.post('/', createDraft);

// Get all drafts (with type filter: 'drafts', 'locked-notes', 'trash')
router.get('/', getDrafts);

// Get all locked notes
router.get('/locked', getAllLockedNotes);

// Permanently delete multiple drafts from trash
router.post('/trash/bulk-delete', bulkPermanentDeleteDrafts);

// Get a single draft by ID
router.get('/:id', getDraft);

// Update a draft
router.put('/:id', updateDraft);

// Move a draft to trash
router.delete('/:id', deleteDraft);

// Restore a draft from trash
router.post('/:id/restore', restoreDraft);

// Permanently delete a draft
router.delete('/:id/permanent', permanentDeleteDraft);

export default router;
