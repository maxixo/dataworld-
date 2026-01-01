import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { encryptDraft, decryptDraft, verifyPassword, hashPassword } from '../utils/encryption';

interface DraftData {
    _id?: string;
    title: string;
    content: string;
    isEncrypted?: boolean;
    label?: string;
    passwordHash?: string | null;
    passwordSalt?: string | null;
    iv?: string | null;
}

export const DraftEditor: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [title, setTitle] = useState('Untitled Draft');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [locking, setLocking] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // Locked note label (human-readable identifier)
    const [label, setLabel] = useState('My locked notes 1');
    
    // Password states
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [unlockPassword, setUnlockPassword] = useState('');
    
    // Use ref to store password for re-encryption (persists across renders)
    const decryptionPasswordRef = useRef<string | null>(null);

    // Encrypted data from server
    const [serverDraft, setServerDraft] = useState<DraftData | null>(null);

    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const maxWords = 1000;
    const wordCountValid = wordCount <= maxWords;

    useEffect(() => {
        if (id) {
            fetchDraft();
        }
    }, [id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSaved(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [saved]);

    const fetchDraft = async () => {
        try {
            console.log('Fetching draft with ID:', id);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/drafts/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const draft = response.data;
            console.log('Draft loaded:', draft);
            setServerDraft(draft);
            setIsEncrypted(draft.isEncrypted || false);

            if (draft.isEncrypted) {
                console.log('Encrypted title:', draft.title);
                console.log('Encrypted content:', draft.content);
                
                // Show unlock modal for encrypted drafts
                setShowUnlockModal(true);
                setIsEncrypted(true);
            } else {
                // Directly set unencrypted content
                setTitle(draft.title);
                setContent(draft.content);
            }
        } catch (err: any) {
            console.error('Error fetching draft:', err);
            alert(err.response?.data?.message || 'Failed to load draft');
            navigate('/drafts');
        }
    };

    const handleUnlock = async () => {
        if (!serverDraft) return;

        setError(null);
        setSaving(true);
        console.log('Attempting to decrypt draft...');

        try {
            // Verify password first
            console.log('Verifying password...');
            console.log('Unlock password:', unlockPassword);
            console.log('Server passwordHash:', serverDraft.passwordHash);
            console.log('PasswordHash length:', serverDraft.passwordHash?.length);
            
            const isPasswordValid = await verifyPassword(
                unlockPassword,
                serverDraft.passwordHash || ''
            );

            console.log('Password verification result:', isPasswordValid);
            if (!isPasswordValid) {
                console.log('Password verification failed');
                console.log('Expected hash for password:', await hashPassword(unlockPassword));
                setError('Incorrect password');
                setSaving(false);
                return;
            }

            console.log('Password verified successfully');
            
            // Decrypt the draft
            console.log('Decrypting title and content...');
            const decrypted = await decryptDraft(
                serverDraft.title,
                serverDraft.content,
                unlockPassword,
                serverDraft.passwordSalt || '',
                serverDraft.iv || ''
            );

            console.log('Decryption successful!');
            console.log('Decrypted title:', decrypted.title);
            console.log('Decrypted content length:', decrypted.content.length);
            
            // Set the decrypted content in the editor
            setTitle(decrypted.title);
            setContent(decrypted.content);
            
            // Store password in ref for re-encryption (persists across renders)
            decryptionPasswordRef.current = unlockPassword;
            setPassword(unlockPassword);
            
            // Close the modal to reveal the decrypted content
            setShowUnlockModal(false);
            setSaving(false);
            
            // Show success notification to confirm note is accessible
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
            }, 2000);
            
            console.log('Note decrypted and ready for editing');
        } catch (err: any) {
            console.error('Decryption error:', err);
            console.error('Error message:', err.message);
            setError('Incorrect password or corrupted data');
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!wordCountValid) {
            setError(`Draft exceeds maximum word count of ${maxWords} words`);
            return;
        }

        if (!content.trim()) {
            setError('Please enter some content');
            return;
        }

        setSaving(true);
        setError(null);
        console.log('Saving draft...');

        try {
            const token = localStorage.getItem('token');

            if (isEncrypted && (password || decryptionPasswordRef.current)) {
                // Use ref password if available, otherwise fall back to state
                const savePassword = decryptionPasswordRef.current || password;
                console.log('Re-encrypting draft with saved password...');
                
                const encrypted = await encryptDraft(title, content, savePassword);
                console.log('Encryption successful');
                console.log('Encrypted title length:', encrypted.encryptedTitle.length);
                
                const draftData = {
                    title: encrypted.encryptedTitle,
                    content: encrypted.encryptedContent,
                    isEncrypted: true,
                    passwordHash: encrypted.passwordHash,
                    passwordSalt: encrypted.passwordSalt,
                    iv: encrypted.iv
                };

                await axios.put(`${API_BASE_URL}/drafts/${id}`, draftData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('Encrypted draft saved successfully');
            } else {
                // Save normally for unencrypted drafts
                console.log('Saving unencrypted draft...');
                const draftData = { title, content };

                if (id) {
                    await axios.put(`${API_BASE_URL}/drafts/${id}`, draftData, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } else {
                    const response = await axios.post(`${API_BASE_URL}/drafts`, draftData, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    console.log('New draft created with ID:', response.data._id);
                }
                console.log('Draft saved successfully');
            }

            setSaving(false);
            setSaved(true);
        } catch (err: any) {
            console.error('Error saving draft:', err);
            console.error('Error details:', err.response?.data);
            setSaving(false);
            setError(err.response?.data?.message || 'Failed to save draft');
        }
    };

    const handleLock = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!content.trim()) {
            setError('Please enter some content before locking');
            return;
        }

        setLocking(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            
            // If this is a new draft (no id), save it first
            let draftId = id;
            if (!draftId) {
                // Save the draft first to get an ID
                const response = await axios.post(
                    `${API_BASE_URL}/drafts`,
                    { title, content },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                draftId = response.data._id;
            }
            
            // Encrypt the draft with the custom label
            const encrypted = await encryptDraft(label, content, password);
            
            const draftData = {
                title: encrypted.encryptedTitle,
                content: encrypted.encryptedContent,
                isEncrypted: true,
                label: label,
                passwordHash: encrypted.passwordHash,
                passwordSalt: encrypted.passwordSalt,
                iv: encrypted.iv
            };
            
            await axios.put(`${API_BASE_URL}/drafts/${draftId}`, draftData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setIsEncrypted(true);
            setShowLockModal(false);
            setShowSuccessModal(true);

            // Redirect after showing success modal
            setTimeout(() => {
                navigate('/drafts?tab=locked-notes');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to lock draft');
            setLocking(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBack = () => {
        if (content.trim() && !id) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                navigate('/drafts');
            }
        } else {
            navigate('/drafts');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <Header
                username={user?.username || 'User'}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="max-w-[1200px] mx-auto px-6 py-8">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Drafts
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {saved && (
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Saved!
                            </span>
                        )}
                        {!isEncrypted && (
                            <button
                                onClick={() => setShowLockModal(true)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                                Lock & Encrypt
                            </button>
                        )}
                        {isEncrypted && (
                            <button
                                disabled={true}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-green-600 text-white cursor-default"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Encrypted
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                                saving
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {saving ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Editor */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Title Input */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Draft Title"
                            className="w-full px-6 py-4 text-2xl font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-transparent focus:outline-none"
                        />
                    </div>

                    {/* Content Textarea */}
                    <div className="p-6">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your draft here..."
                            className="w-full h-[500px] resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent focus:outline-none text-lg leading-relaxed"
                        />
                    </div>

                    {/* Footer with Word Count */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <span className={`text-sm ${wordCountValid ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
                            {wordCount} / {maxWords} words
                            {!wordCountValid && ' (limit exceeded)'}
                        </span>
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                            Auto-save disabled. Click Save to save changes.
                        </span>
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Tips:</h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Maximum word count is {maxWords} words</li>
                        <li>• Click the Save button to save your draft</li>
                        <li>• You can edit your draft anytime from the Drafts page</li>
                        <li>• Use the Back button to return to the Drafts list</li>
                        {isEncrypted && <li>• This note is encrypted and can only be accessed with the password</li>}
                    </ul>
                </div>
            </main>

            {/* Lock Modal */}
            {showLockModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scaleIn">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Lock & Encrypt Note
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            This will encrypt your note with AES-256-GCM encryption. 
                            The note can only be accessed with password.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Note Label
                                </label>
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="Enter a label to identify this note"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                                You must use a password you remember unless your data is gone forever
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowLockModal(false);
                                    setPassword('');
                                    setConfirmPassword('');
                                    setLabel('My locked notes 1');
                                }}
                                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLock}
                                disabled={locking}
                                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {locking ? 'Encrypting...' : 'Lock & Encrypt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unlock Modal */}
            {showUnlockModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scaleIn">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Encrypted Note
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                This note is encrypted. Enter the password to decrypt it.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={unlockPassword}
                                    onChange={(e) => setUnlockPassword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                                    placeholder="Enter password"
                                    autoFocus
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => navigate('/drafts')}
                                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnlock}
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Decrypting...' : 'Decrypt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scaleIn">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Note Encrypted!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Your note is now encrypted and saved in your locked notes folder.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
