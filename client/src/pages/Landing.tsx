import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, useInView } from 'framer-motion';

// Animated section wrapper component
const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const Landing: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);
  
  return (
    <div className="font-body bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark transition-colors duration-200">
      <nav className="fixed top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <a className="flex items-center gap-2 group" href="#">
              <img src="/logo.svg" alt="DataWorld Logo" className="h-8 w-8 transition-transform group-hover:scale-110" />
              <span className="font-display text-xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark">DataWorld</span>
            </a>
            <div className="hidden md:flex gap-6">
              <a className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors" href="#features">Features</a>
              <a className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors" href="#solutions">Solutions</a>
              <a className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors" href="#pricing">Pricing</a>
              <Link className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors" to="/faq">FAQ</Link>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-text-muted-light dark:text-text-muted-dark hover:text-text-main-light dark:hover:text-text-main-dark hover:bg-border-light dark:hover:bg-border-dark transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <button 
              onClick={toggleTheme}
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-text-muted-light dark:text-text-muted-dark hover:text-text-main-light dark:hover:text-text-main-dark hover:bg-border-light dark:hover:bg-border-dark rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link className="hidden text-sm font-medium text-text-muted-light dark:text-text-muted-dark hover:text-primary sm:block transition-colors" to="/login">Log in</Link>
            <Link className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-700 px-4 text-sm font-semibold text-white shadow-md hover:bg-slate-800 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface-dark transition-all hover:-translate-y-0.5" to="/signup">
              Get Started
            </Link>
          </div>
        </div>

        <div
          id="landing-mobile-menu"
          className={`fixed inset-0 z-40 md:hidden ${mobileMenuOpen ? '' : 'pointer-events-none'}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div
            className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className={`absolute top-16 left-4 right-4 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-xl transition-all ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
          >
            <div className="p-4 space-y-2">
              <a
                className="flex items-center justify-between min-h-[48px] rounded-lg px-4 text-sm font-medium text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-gray-800 transition-colors"
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
              <a
                className="flex items-center justify-between min-h-[48px] rounded-lg px-4 text-sm font-medium text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-gray-800 transition-colors"
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
              <a
                className="flex items-center justify-between min-h-[48px] rounded-lg px-4 text-sm font-medium text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-gray-800 transition-colors"
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
              <Link
                className="flex items-center justify-between min-h-[48px] rounded-lg px-4 text-sm font-medium text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-gray-800 transition-colors"
                to="/faq"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <div className="border-t border-border-light dark:border-border-dark p-4 flex flex-col gap-3">
              <Link
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border-light dark:border-border-dark px-4 text-sm font-semibold text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-gray-800 transition-colors"
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-700 px-4 text-sm font-semibold text-white shadow-md hover:bg-slate-800 dark:hover:bg-slate-600 transition-all"
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-16">
        <section className="relative overflow-hidden pt-16 lg:pt-24 hero-gradient dark:bg-gradient-to-b dark:from-surface-dark dark:to-background-dark">
          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="flex flex-wrap items-center justify-center gap-2 mb-6"
            >
              <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/50 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-500/20">New Feature</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mx-auto max-w-4xl font-display text-4xl font-extrabold tracking-tight text-text-main-light dark:text-text-main-dark sm:text-5xl lg:text-6xl mb-6 leading-[1.15]"
            >
              Upload datasets & visualize<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-teal">with instant chart exports</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mx-auto max-w-2xl text-base sm:text-lg text-text-muted-light dark:text-text-muted-dark mb-10 leading-relaxed"
            >
              DataWorld lets you upload CSV datasets, create beautiful interactive charts, and export them instantly in PNG, PDF, CSV, or JSON formats. No complex setup required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface-dark transition-all duration-200 hover:-translate-y-1" to="/signup">
                Start Building for Free
              </Link>
              <Link className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-8 text-base font-semibold text-text-main-light dark:text-text-main-dark shadow-sm hover:bg-background-light dark:hover:bg-gray-800 hover:border-border-dark dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface-dark transition-all duration-200" to="/signup">
                <span className="material-symbols-outlined mr-2 text-[20px]">play_circle</span>
                View Demo
              </Link>
            </motion.div>

            <AnimatedSection className="relative mx-auto max-w-[1100px] perspective-1000">
              <div className="relative rounded-xl border border-slate-200/60 dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-2xl shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-xl overflow-hidden transform transition-transform hover:scale-[1.01] duration-500">
                <div className="flex h-10 items-center border-b border-border-light dark:border-border-dark bg-background-light dark:bg-gray-800/50 px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400/80"></div>
                    <div className="h-3 w-3 rounded-full bg-amber-400/80"></div>
                    <div className="h-3 w-3 rounded-full bg-emerald-400/80"></div>
                  </div>
                  <div className="ml-4 flex h-6 flex-1 max-w-md items-center rounded-md bg-surface-light dark:bg-gray-700 border border-border-light dark:border-border-dark px-3 text-xs text-text-muted-light dark:text-text-muted-dark font-medium font-mono">
                    dataworld.app/dashboard/analytics
                  </div>
                </div>

                <div className="flex h-[420px] sm:h-[520px] lg:h-[550px] bg-background-light dark:bg-gray-800">
                  <div className="hidden md:flex w-64 flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 rounded-lg bg-blue-50 dark:bg-primary/20 px-3 py-2 text-primary font-semibold text-sm">
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        Dashboard
                      </div>
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-gray-700/50 font-medium text-sm transition-colors">
                        <span className="material-symbols-outlined text-[20px]">folder_open</span>
                        Datasets
                      </div>
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-gray-700/50 font-medium text-sm transition-colors">
                        <span className="material-symbols-outlined text-[20px]">pie_chart</span>
                        Reports
                      </div>
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-gray-700/50 font-medium text-sm transition-colors">
                        <span className="material-symbols-outlined text-[20px]">group</span>
                        Team
                      </div>
                    </div>
                    <div className="mt-8">
                      <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Recent Uploads</h3>
                      <div className="mt-3 space-y-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                          <span className="text-sm text-text-muted-light dark:text-text-muted-dark">Q3_Revenue.csv</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                          <span className="text-sm text-text-muted-light dark:text-text-muted-dark">User_Growth.json</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Weekly Overview</h2>
                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Last updated: Just now</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-3 py-2 text-sm font-medium text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-gray-700">
                          <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                          Import
                        </button>
                        <button className="w-full sm:w-auto rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover">
                          Export Report
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-gray-700/30 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark truncate">Sales_Data.csv</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-text-muted-light dark:text-text-muted-dark"><span className="font-medium">1,250</span> rows</span>
                              <span className="text-sm text-text-muted-light dark:text-text-muted-dark"><span className="font-medium">8</span> columns</span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-primary">table_view</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 flex items-center justify-center gap-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 min-h-[36px] transition-colors">
                            <span className="material-symbols-outlined text-sm">bar_chart</span>
                            Visualize
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 min-h-[36px] transition-colors">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Export
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-gray-700/30 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark truncate">Q3_Revenue.csv</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-text-muted-light dark:text-text-muted-dark"><span className="font-medium">3,420</span> rows</span>
                              <span className="text-sm text-text-muted-light dark:text-text-muted-dark"><span className="font-medium">12</span> columns</span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-primary">table_view</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 flex items-center justify-center gap-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 min-h-[36px] transition-colors">
                            <span className="material-symbols-outlined text-sm">bar_chart</span>
                            Visualize
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 min-h-[36px] transition-colors">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Export
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-gray-700/30 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark truncate">User_Analytics.json</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-text-muted-light dark:text-text-muted-dark"><span className="font-medium">5,890</span> rows</span>
                              <span className="text-sm text-text-muted-light dark:text-text-muted-dark"><span className="font-medium">15</span> columns</span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-primary">table_view</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 flex items-center justify-center gap-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 min-h-[36px] transition-colors">
                            <span className="material-symbols-outlined text-sm">bar_chart</span>
                            Visualize
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 min-h-[36px] transition-colors">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Export
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden">
                      <div className="border-b border-border-light dark:border-border-dark px-4 sm:px-6 py-4 flex justify-between items-center">
                        <h3 className="font-semibold text-text-main-light dark:text-text-main-dark">Recent Transactions</h3>
                        <button className="text-xs font-medium text-primary">View All</button>
                      </div>
                      <div className="p-0">
                        <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark px-4 sm:px-6 py-3 hover:bg-background-light dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-background-light dark:bg-gray-700 flex items-center justify-center text-text-muted-light dark:text-text-muted-dark">
                              <span className="material-symbols-outlined text-sm">description</span>
                            </div>
                            <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Invoice #00124</span>
                          </div>
                          <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark">$1,200.00</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark px-4 sm:px-6 py-3 hover:bg-background-light dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-background-light dark:bg-gray-700 flex items-center justify-center text-text-muted-light dark:text-text-muted-dark">
                              <span className="material-symbols-outlined text-sm">description</span>
                            </div>
                            <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Invoice #00125</span>
                          </div>
                          <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark">$2,450.00</span>
                        </div>
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-background-light dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-background-light dark:bg-gray-700 flex items-center justify-center text-text-muted-light dark:text-text-muted-dark">
                              <span className="material-symbols-outlined text-sm">description</span>
                            </div>
                            <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Invoice #00126</span>
                          </div>
                          <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark">$850.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <AnimatedSection>
          <section className="bg-surface-light dark:bg-surface-dark py-24 sm:py-32 transition-colors duration-200" id="features">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-semibold leading-7 text-primary">Powerful features</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark sm:text-4xl font-display">Everything you need for data visualization</p>
                <p className="mt-6 text-lg leading-8 text-text-muted-light dark:text-text-muted-dark">Upload your CSV files, create stunning charts instantly, and export in multiple formats with just one click.</p>
              </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-text-main-light dark:text-text-main-dark">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <span className="material-symbols-outlined text-white">upload_file</span>
                    </div>
                    Easy Dataset Upload
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-text-muted-light dark:text-text-muted-dark">
                    <p className="flex-auto">Upload CSV files instantly with drag-and-drop. View row and column counts, and access your datasets from anywhere.</p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-text-main-light dark:text-text-main-dark">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-teal">
                      <span className="material-symbols-outlined text-white">bar_chart</span>
                    </div>
                    Interactive Charts
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-text-muted-light dark:text-text-muted-dark">
                    <p className="flex-auto">Create beautiful, interactive charts powered by Recharts. Visualize your data with multiple chart types and customizations.</p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-text-main-light dark:text-text-main-dark">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                      <span className="material-symbols-outlined text-white">download</span>
                    </div>
                    Multi-Format Export
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-text-muted-light dark:text-text-muted-dark">
                    <p className="flex-auto">Export charts instantly in PNG, PDF, CSV, or JSON formats. High-quality output with a single click.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
        </AnimatedSection>

        <AnimatedSection>
          <section className="border-y border-border-light dark:border-border-dark bg-background-light dark:bg-gray-800/50 py-16 transition-colors duration-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-sm font-semibold leading-8 text-text-muted-light dark:text-text-muted-dark">TRUSTED BY INNOVATIVE TEAMS AT</h2>
              <div className="mx-auto mt-8 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 grayscale opacity-50 font-bold text-xl text-text-muted-light dark:text-text-muted-dark flex justify-center">Acme Corp</div>
                <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 grayscale opacity-50 font-bold text-xl text-text-muted-light dark:text-text-muted-dark flex justify-center">GlobalBank</div>
                <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 grayscale opacity-50 font-bold text-xl text-text-muted-light dark:text-text-muted-dark flex justify-center">NextGen</div>
                <div className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 grayscale opacity-50 font-bold text-xl text-text-muted-light dark:text-text-muted-dark flex justify-center">Stark Ind</div>
                <div className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1 grayscale opacity-50 font-bold text-xl text-text-muted-light dark:text-text-muted-dark flex justify-center">Umbrella</div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <section className="relative isolate overflow-hidden bg-surface-dark py-16 sm:py-24 lg:py-32 transition-colors duration-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              <div className="max-w-xl lg:max-w-lg">
                <h2 className="text-3xl font-bold tracking-tight text-text-main-dark sm:text-4xl font-display">Ready to visualize your success?</h2>
                <p className="mt-4 text-lg leading-8 text-text-muted-dark">Join thousands of data analysts and business leaders who use DataWorld to make better decisions, faster.</p>
                <div className="mt-6 flex w-full max-w-md flex-col sm:flex-row gap-3">
                  <label className="sr-only" htmlFor="email-address">Email address</label>
                  <input autoComplete="email" className="min-w-0 w-full flex-auto rounded-md border-0 bg-white/5 px-3.5 py-3 text-text-main-dark shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 placeholder-text-muted-dark/50" id="email-address" name="email" placeholder="Enter your email" required />
                  <button className="w-full sm:w-auto rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" type="submit">Get Started</button>
                </div>
              </div>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
                <div className="flex flex-col items-start">
                  <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
                    <span className="material-symbols-outlined text-text-main-dark">calendar_month</span>
                  </div>
                  <dt className="mt-4 font-semibold text-text-main-dark">14-day free trial</dt>
                  <dd className="mt-2 leading-7 text-text-muted-dark">Experience the full power of the platform with no commitment.</dd>
                </div>
                <div className="flex flex-col items-start">
                  <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
                    <span className="material-symbols-outlined text-text-main-dark">credit_card_off</span>
                  </div>
                  <dt className="mt-4 font-semibold text-text-main-dark">No credit card required</dt>
                  <dd className="mt-2 leading-7 text-text-muted-dark">Sign up and start visualizing your data in under 2 minutes.</dd>
                </div>
              </dl>
            </div>
          </div>
          <div aria-hidden="true" className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#06B6D4] to-[#2563EB] opacity-30" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>
        </section>
        </AnimatedSection>
      </main>

      <AnimatedSection>
        <footer className="bg-surface-light dark:bg-surface-dark transition-colors duration-200">
        <div className="mx-auto max-w-7xl overflow-hidden px-4 sm:px-6 py-20 sm:py-24 lg:px-8">
          <nav aria-label="Footer" className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12">
            <div className="pb-6">
              <a className="text-sm leading-6 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors" href="#">About</a>
            </div>
            <div className="pb-6">
              <a className="text-sm leading-6 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors" href="#">Jobs</a>
            </div>
            <div className="pb-6">
              <a className="text-sm leading-6 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors" href="#">Press</a>
            </div>
            <div className="pb-6">
              <a className="text-sm leading-6 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors" href="#">Privacy</a>
            </div>
            <div className="pb-6">
              <a className="text-sm leading-6 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors" href="#">Terms</a>
            </div>
          </nav>
          <div className="mt-10 flex justify-center space-x-10">
            <a className="text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors" href="#">
              <span className="sr-only">GitHub</span>
              <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
              </svg>
            </a>
            <a className="text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors" href="#">
              <span className="sr-only">Twitter</span>
              <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
          </div>
          <p className="mt-10 text-center text-xs leading-5 text-text-muted-light dark:text-text-muted-dark">© 2024 DataWorld Inc. All rights reserved.</p>
        </div>
      </footer>
      </AnimatedSection>
    </div>
  );
};

export default Landing;
