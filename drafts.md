# Autosave Fix Notes (Kid-Friendly)

## Problem
Autosave created a brand-new draft every time it saved. That happened because the first POST returned an ID, but we never stored that ID, so every save looked like "new draft".

## Implemented changes

### client/src/hooks/useAutosave.ts
- Added an `onDraftCreated` callback in the options so the parent can store the new ID.
- Added `draftIdRef` to keep the latest draft ID inside the hook and avoid stale values.
- Updated save logic:
  - Use `draftIdRef.current` for PUT updates.
  - On POST, read `response.data._id`, store it in the ref, and call `onDraftCreated`.
- Removed `draftId` from the save callback dependencies (the ref now handles current ID).

### client/src/pages/DraftEditor.tsx
- Added `draftId` state seeded from the route param.
- Added `applyDraftId(newDraftId)` to store the ID and update the URL with `navigate(..., { replace: true })`.
- Passed `draftId` into `useAutosave` and handled `onDraftCreated` to call `applyDraftId`.
- Manual save now:
  - Uses PUT when `draftId` exists.
  - On POST, stores the new ID and updates the route.
- Lock flow now:
  - Uses the shared `draftId`.
  - If missing, it creates the draft once, stores the ID, then encrypts with PUT.

## Behavior now
- New drafts: first save is one POST, then all future saves are PUT on the same draft.
- Existing drafts: only PUT updates.
- Encrypted drafts: same behavior as above.
- URL updates to `/draft/:id` after the first save so refreshes keep the same draft.

## How to test
1. New draft: type, wait 5 seconds, see one POST then PUTs.
2. Existing draft: edit, see only PUTs.
3. Lock note: if new, one POST then PUT; if existing, only PUT.

## Explain it like a kid
Think of a draft like one notebook.
Autosave was making a brand-new notebook every time.

We fixed it by:
- Saving the notebook name (the ID) the first time.
- Telling autosave, "Use this same notebook next time."
- Putting the notebook name in the address bar so we never lose it.

Now autosave keeps writing in the same notebook instead of starting over.
