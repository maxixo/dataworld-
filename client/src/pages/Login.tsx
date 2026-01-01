import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useReduxAuth } from '../hooks/useReduxAuth';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const navigate = useNavigate();
    
    // Use Redux for Google auth
    const { 
        loading: reduxLoading, 
        error: reduxError, 
        handleGoogleAuth 
    } = useReduxAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            login(res.data.token, res.data.user);
            navigate('/app');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        
        try {
            console.log('🔵 Starting Google sign-in...');
            
            // 1. Sign in with Firebase popup
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            console.log('🟢 Firebase sign-in successful:', result.user.email);
            
            // 2. Extract user info from Firebase
            const firebaseUser = result.user;
            
            // 3. Send user data through Redux (which calls the backend)
            const response = await handleGoogleAuth({
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                uid: firebaseUser.uid,
            });
            
            console.log('🟢 Backend authentication successful');
            
            // 4. Also update AuthContext for compatibility
            login(response.token, response.user);
            
            // 5. Navigate to app
            navigate('/app');
            
        } catch (err: any) {
            console.error('❌ Google sign-in error:', err);
            setError(err.message || 'Failed to sign in with Google');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-main-light dark:text-text-main-dark antialiased transition-colors duration-200 min-h-screen">
            <div className="min-h-screen flex flex-col lg:flex-row">
                <div className="hidden lg:flex flex-col relative w-1/2 p-12 bg-surface-light dark:bg-surface-dark overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20"></div>
                        <div className="absolute right-0 top-1/4 w-[150%] h-[150%] bg-surface-light dark:bg-background-dark rounded-full opacity-30 blur-3xl translate-x-1/3 translate-y-12"></div>
                        <div className="absolute left-10 bottom-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10 flex items-center gap-3 mb-auto">
                        <div className="text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
                                <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
                                <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold leading-tight text-text-main-light dark:text-text-main-dark">Welcome back to <span className="text-primary">DataWorld</span></h2>
                            <p className="text-lg text-text-muted-light dark:text-text-muted-dark leading-relaxed mt-3">Access your analytics dashboard and stay on top of your data insights.</p>
                        </div>
                    </div>
                    <div className="relative z-10 mt-auto text-sm text-text-muted-light dark:text-text-muted-dark">© 2024 DataWorld Inc. All rights reserved.</div>
                </div>

                <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
                    <div className="w-full max-w-md space-y-8">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate('/')}
                            className="group flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary transition-colors mb-4"
                        >
                            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform duration-200">arrow_back</span>
                            <span className="text-sm font-medium">Back</span>
                        </button>

                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="size-8 text-primary">
                                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                                        <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
                                        <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark">DataWorld</span>
                            </div>
                        </div>

                        <div className="text-center lg:text-left space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark">Welcome back</h1>
                            <p className="text-text-muted-light dark:text-text-muted-dark">Don't have an account? <Link to="/signup" className="font-semibold text-primary hover:text-primary-hover">Sign up</Link></p>
                        </div>

                        <div className="rounded-2xl border border-white/50 bg-surface-light/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl dark:border-[#2b263b] dark:bg-surface-dark/80">
                            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                                {(error || reduxError) && (
                                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                                        {error || reduxError}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-1.5" htmlFor="email">Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted-light dark:text-text-muted-dark">
                                                <span className="material-symbols-outlined text-[20px]">mail</span>
                                            </div>
                                            <input 
                                                id="email" 
                                                name="email" 
                                                type="email" 
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)} 
                                                placeholder="name@company.com" 
                                                className="block w-full min-h-[44px] pl-10 pr-3 py-3 rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-main-light dark:text-text-main-dark placeholder:text-text-muted-light/60 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-shadow" 
                                                required 
                                                disabled={reduxLoading}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-sm font-medium text-text-main-light dark:text-text-main-dark" htmlFor="password">Password</label>
                                            <a className="text-xs font-medium text-primary hover:text-primary-hover transition-colors" href="#">Forgot Password?</a>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted-light dark:text-text-muted-dark">
                                                <span className="material-symbols-outlined text-[20px]">lock</span>
                                            </div>
                                            <input 
                                                id="password" 
                                                name="password" 
                                                type={showPassword ? 'text' : 'password'} 
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)} 
                                                placeholder="••••••••" 
                                                className="block w-full min-h-[44px] pl-10 pr-10 py-3 rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-main-light dark:text-text-main-dark placeholder:text-text-muted-light/60 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-shadow" 
                                                required 
                                                disabled={reduxLoading}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(s => !s)} 
                                                className="absolute inset-y-0 right-0 pr-3 flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted-light dark:text-text-muted-dark hover:text-text-main-light dark:hover:text-text-main-dark"
                                                disabled={reduxLoading}
                                            >
                                                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="group relative flex w-full min-h-[44px] justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg dark:ring-offset-surface-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={reduxLoading}
                                >
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-0.5 transition-transform duration-200">arrow_forward</span>
                                    </span>
                                    {reduxLoading ? 'Logging in...' : 'Log In'}
                                </button>
                            </form>

                            <div className="relative my-6 flex items-center py-2">
                                <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                                <span className="flex-shrink-0 mx-4 text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Or continue with</span>
                                <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                            </div>

                            <div className="flex w-full">
                                <button 
                                    type="button" 
                                    onClick={handleGoogleSignIn}
                                    disabled={reduxLoading}
                                    className="flex min-h-[44px] items-center justify-center gap-2 px-4 py-2.5 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {reduxLoading ? (
                                        <span className="material-symbols-outlined animate-spin">hourglass_empty</span>
                                    ) : (
                                        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                                            <path d="M12.0003 20.45c4.6667 0 7.9167-3.25 7.9167-8.1 0-.6-.05-1.15-.15-1.7h-7.7667v3.25h4.4833c-.2 1.2-1.25 3.35-4.4833 3.35-2.7 0-4.9167-2.15-4.9167-4.8 0-2.65 2.2167-4.8 4.9167-4.8 1.5167 0 2.5333.65 3.1167 1.2l2.35-2.35c-1.5-1.4-3.4667-2.2-5.4667-2.2-4.5 0-8.15 3.65-8.15 8.15 0 4.5 3.65 8.15 8.15 8.15z" fill="currentColor"></path>
                                        </svg>
                                    )}
                                    <span className="text-sm font-medium">{reduxLoading ? 'Signing in...' : 'Continue with Google'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="text-center text-xs text-text-muted-light dark:text-text-muted-dark">
                            <div className="flex flex-wrap justify-center gap-3">
                                <a className="hover:text-text-main-light dark:hover:text-text-main-dark" href="#">Privacy Policy</a>
                                <a className="hover:text-text-main-light dark:hover:text-text-main-dark" href="#">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
