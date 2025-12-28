import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

type StrengthProps = { password: string };

function PasswordStrength({ password }: StrengthProps) {
    const lengthOK = password.length >= 8;
    const upperOK = /[A-Z]/.test(password);
    const numberOK = /[0-9]/.test(password);
    const specialOK = /[^A-Za-z0-9]/.test(password);
    const checks = [lengthOK, upperOK, numberOK, specialOK];
    const score = checks.filter(Boolean).length;

    const pct = Math.round((score / 4) * 100);
    const barColor = score <= 1 ? 'bg-rose-500' : score === 2 ? 'bg-amber-400' : score === 3 ? 'bg-emerald-500' : 'bg-emerald-600';

    const Item = ({ ok, label }: { ok: boolean; label: string }) => (
        <div className="flex items-center gap-2 text-xs">
            <span className={`material-symbols-outlined ${ok ? 'text-emerald-500' : 'text-slate-300'}`}>{ok ? 'check_circle' : 'radio_button_unchecked'}</span>
            <span className={`${ok ? 'text-slate-700 dark:text-white' : 'text-slate-400'}`}>{label}</span>
        </div>
    );

    return (
        <div>
            <div className="mb-2">
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-xs text-slate-500">Strength: <span className="font-medium text-slate-700 dark:text-white">{pct}%</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Item ok={lengthOK} label="8+ characters" />
                <Item ok={upperOK} label="Uppercase letter" />
                <Item ok={numberOK} label="Number" />
                <Item ok={specialOK} label="Special character" />
            </div>
        </div>
    );
}

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            login(res.data.token, res.data.user);
            navigate('/app');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#131118] dark:text-white transition-colors duration-200 min-h-screen flex items-center justify-center">
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
                <div className="absolute -bottom-[20%] -right-[10%] h-[500px] w-[500px] rounded-full bg-accent-teal/20 blur-[120px] pointer-events-none"></div>

                <div className="z-10 w-full max-w-[440px] px-4 py-10">
                    <div className="mb-8 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-teal text-white shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-3xl">ssid_chart</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">Welcome back to DataWorld</h1>
                        <p className="mt-2 text-sm text-[#6e6189] dark:text-gray-400">Enter your credentials to access your dashboard.</p>
                    </div>

                    <div className="rounded-2xl border border-white/50 bg-surface-light/80 p-8 shadow-xl backdrop-blur-xl dark:border-[#2b263b] dark:bg-surface-dark/80">
                        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                            {error && <div className="text-sm text-red-500">{error}</div>}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-[#131118] dark:text-white" htmlFor="email">Email or Username</label>
                                <div className="group relative flex items-center">
                                    <div className="absolute left-3 flex items-center text-[#6e6189] group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 w-full rounded-lg border border-[#dedbe6] bg-white/50 pl-10 pr-3 text-sm text-[#131118] outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-[#3e3552] dark:bg-[#2b263b]/50 dark:text-white dark:focus:border-primary"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-[#131118] dark:text-white" htmlFor="password">Password</label>
                                    <a className="text-xs font-medium text-primary hover:text-primary-hover hover:underline" href="#">Forgot Password?</a>
                                </div>
                                <div className="group relative flex items-center">
                                    <div className="absolute left-3 flex items-center text-[#6e6189] group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">lock</span>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 w-full rounded-lg border border-[#dedbe6] bg-white/50 pl-10 pr-3 text-sm text-[#131118] outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-[#3e3552] dark:bg-[#2b263b]/50 dark:text-white dark:focus:border-primary"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(s => !s)}
                                        className="absolute right-3 flex items-center text-[#6e6189] hover:text-[#131118] dark:hover:text-white transition-colors"
                                        aria-label="Toggle password visibility"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Password strength + validation placed right under password field */}
                            <div>
                                <PasswordStrength password={password} />
                            </div>

                            <button className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98]" type="submit">
                                <span>Log In</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </form>

                        <div className="relative my-8 flex items-center py-2">
                            <div className="flex-grow border-t border-[#dedbe6] dark:border-[#3e3552]"></div>
                            <span className="mx-4 flex-shrink-0 text-xs font-medium text-[#6e6189] dark:text-gray-500">Or continue with</span>
                            <div className="flex-grow border-t border-[#dedbe6] dark:border-[#3e3552]"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dedbe6] bg-white px-4 text-sm font-medium text-[#131118] transition-all hover:bg-[#f6f6f8] hover:border-gray-300 dark:border-[#3e3552] dark:bg-[#2b263b] dark:text-white dark:hover:bg-[#352f44]">
                                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                </svg>
                                Google
                            </button>
                            <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dedbe6] bg-white px-4 text-sm font-medium text-[#131118] transition-all hover:bg-[#f6f6f8] hover:border-gray-300 dark:border-[#3e3552] dark:bg-[#2b263b] dark:text-white dark:hover:bg-[#352f44]">
                                <svg className="h-5 w-5" viewBox="0 0 23 23">
                                    <path d="M0 0h23v23H0z" fill="#f3f3f3"></path>
                                    <path d="M1 1h10v10H1z" fill="#f35325"></path>
                                    <path d="M12 1h10v10H12z" fill="#81bc06"></path>
                                    <path d="M1 12h10v10H1z" fill="#05a6f0"></path>
                                    <path d="M12 12h10v10H12z" fill="#ffba08"></path>
                                </svg>
                                Microsoft
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-xs text-[#6e6189] dark:text-gray-500">
                        <p>Don't have an account? <Link to="/signup" className="font-bold text-primary hover:underline">Sign up</Link></p>
                        <div className="mt-4 flex justify-center gap-4">
                            <a className="hover:text-[#131118] dark:hover:text-white" href="#">Privacy Policy</a>
                            <a className="hover:text-[#131118] dark:hover:text-white" href="#">Terms of Service</a>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};
