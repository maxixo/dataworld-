import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { encryptDraft } from '../utils/encryption';

interface DraftData {
    _id?: string;
    title: string;
    content: string;
    isEncrypted?: boolean;
    passwordHash?: string | null;
    passwordSalt?: string | null;
    iv?: string | null;
}

interface UseAutosaveOptions {
    draftId: string | undefined;
    isEncrypted: boolean;
    password: string | null;
    onSaved?: () => void;
    onError?: (error: string) => void;
}

interface AutosaveState {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaveTime: Date | null;
    error: string | null;
    triggerImmediateSave: () => void;
}

export const useAutosave = (
    title: string,
    content: string,
    options: UseAutosaveOptions
): AutosaveState => {
    const { draftId, isEncrypted, password, onSaved, onError } = options;
    
    const [status, setStatus] = useState<AutosaveState['status']>('idle');
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSavingRef = useRef(false);
    const previousContentRef = useRef({ title: '', content: '' });

    // Debounced save function
    const saveDraft = useCallback(async () => {
        // Prevent concurrent saves
        if (isSavingRef.current) {
            return;
        }

        // Validate content before saving
        if (!content.trim()) {
            return;
        }

        // Check word count (max 1000 words)
        const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount > 1000) {
            setError('Draft exceeds maximum word count of 1000 words');
            setStatus('error');
            if (onError) {
                onError('Draft exceeds maximum word count of 1000 words');
            }
            return;
        }

        // Clear any pending save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        try {
            isSavingRef.current = true;
            setStatus('saving');
            setError(null);

            const token = localStorage.getItem('token');

            if (isEncrypted && password) {
                // Re-encrypt the draft
                const encrypted = await encryptDraft(title, content, password);
                
                const draftData = {
                    title: encrypted.encryptedTitle,
                    content: encrypted.encryptedContent,
                    isEncrypted: true,
                    passwordHash: encrypted.passwordHash,
                    passwordSalt: encrypted.passwordSalt,
                    iv: encrypted.iv
                };

                if (draftId) {
                    // Update existing encrypted draft
                    await axios.put(`${API_BASE_URL}/drafts/${draftId}`, draftData, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } else {
                    // Create new encrypted draft
                    const response = await axios.post(`${API_BASE_URL}/drafts`, draftData, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    // The parent component should handle the new draft ID
                }
            } else {
                // Save unencrypted draft
                const draftData = { title, content };

                if (draftId) {
                    // Update existing draft
                    await axios.put(`${API_BASE_URL}/drafts/${draftId}`, draftData, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } else {
                    // Create new draft
                    const response = await axios.post(`${API_BASE_URL}/drafts`, draftData, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    // The parent component should handle the new draft ID
                }
            }

            setStatus('saved');
            setLastSaveTime(new Date());
            
            if (onSaved) {
                onSaved();
            }

            // Reset status to idle after 2 seconds
            setTimeout(() => {
                setStatus('idle');
            }, 2000);

        } catch (err: any) {
            console.error('Autosave error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to autosave';
            setError(errorMessage);
            setStatus('error');
            
            if (onError) {
                onError(errorMessage);
            }

            // Reset status after 3 seconds on error
            setTimeout(() => {
                setStatus('idle');
            }, 3000);
        } finally {
            isSavingRef.current = false;
        }
    }, [title, content, draftId, isEncrypted, password, onSaved, onError]);

    // Trigger debounced save when title or content changes
    useEffect(() => {
        // Check if content actually changed
        const titleChanged = previousContentRef.current.title !== title;
        const contentChanged = previousContentRef.current.content !== content;

        if (!titleChanged && !contentChanged) {
            return;
        }

        // Update previous content
        previousContentRef.current = { title, content };

        // Clear any pending save timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for debounced save (5 seconds)
        saveTimeoutRef.current = setTimeout(() => {
            saveDraft();
        }, 5000);

        // Cleanup on unmount
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [title, content, saveDraft]);

    // Trigger save when component unmounts (optional - save on page close)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (status === 'saving') {
                // Show warning if save is in progress
                e.preventDefault();
                e.returnValue = '';
            } else if (title.trim() && content.trim() && status !== 'saved') {
                // Optionally save on page close using navigator.sendBeacon
                // For now, we'll just show a warning
                const titleChanged = previousContentRef.current.title !== title;
                const contentChanged = previousContentRef.current.content !== content;
                
                if (titleChanged || contentChanged) {
                    e.preventDefault();
                    e.returnValue = '';
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [title, content, status]);

    // Save when visibility changes (user switches tabs)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && title.trim() && content.trim()) {
                const titleChanged = previousContentRef.current.title !== title;
                const contentChanged = previousContentRef.current.content !== content;
                
                if (titleChanged || contentChanged) {
                    // Immediately save when user switches away
                    if (saveTimeoutRef.current) {
                        clearTimeout(saveTimeoutRef.current);
                    }
                    saveDraft();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [title, content, saveDraft]);

    // Manual trigger function for immediate save
    const triggerImmediateSave = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveDraft();
    }, [saveDraft]);

    return {
        status,
        lastSaveTime,
        error,
        triggerImmediateSave
    };
};
