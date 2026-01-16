import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';

const quickStartSteps = [
    {
        title: 'Upload a dataset',
        description: 'Drag and drop CSV, JSON, or XLSX files on the Dashboard. Toggle encryption if you want a locked file.',
        cta: 'Go to Dashboard',
        to: '/app',
        tone: 'bg-blue-600',
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
            </svg>
        )
    },
    {
        title: 'Visualize and filter',
        description: 'Open any dataset card to choose a chart type and axes. Use filters and search to narrow rows.',
        cta: 'Browse Files',
        to: '/files',
        tone: 'bg-emerald-600',
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
        )
    },
    {
        title: 'Export results',
        description: 'Use Export buttons to save PNG or PDF charts, and download filtered data as CSV or JSON.',
        cta: 'Open a Dataset',
        to: '/files',
        tone: 'bg-indigo-600',
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v7m0-7l-3 3m3-3l3 3M12 5v7" />
            </svg>
        )
    },
    {
        title: 'Capture insights',
        description: 'Create drafts with autosave, then lock notes with a password for extra privacy.',
        cta: 'Open Drafts',
        to: '/drafts',
        tone: 'bg-amber-600',
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )
    }
];

const faqItems = [
    {
        question: 'Which file types can I upload?',
        answer: 'DataWorld supports CSV, JSON, and XLSX files. Upload them from the Dashboard using drag and drop or the Browse Files button.'
    },
    {
        question: 'How do I build a chart?',
        answer: 'Open a dataset from Dashboard or Files, pick a chart type, then select X and Y axes. The chart updates instantly as you change options.'
    },
    {
        question: 'Can I filter data before exporting?',
        answer: 'Yes. Use the filter panel in the dataset view to apply column filters or search, then export the filtered data as CSV or JSON.'
    },
    {
        question: 'Where do encrypted files and notes live?',
        answer: 'Encrypted datasets appear in Files under the Encrypted Files tab. Encrypted notes appear in Drafts under Encrypted Notes.'
    },
    {
        question: 'How does autosave work for drafts?',
        answer: 'Drafts autosave a few seconds after you stop typing. You can also use the Save button for an immediate update.'
    },
    {
        question: 'How do I export charts?',
        answer: 'In a dataset view, use the Export buttons to download PNG or PDF charts. You can also export the data itself as CSV or JSON.'
    }
];

export const Faq: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const prefersReducedMotion = useReducedMotion();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header
                username={user?.username || 'User'}
                onLogout={handleLogout}
            />

            <main className="max-w-[1200px] mx-auto px-6 py-8">
                <motion.section
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8 lg:p-10"
                >
                    <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-blue-100/70 dark:bg-blue-900/30 blur-3xl" />
                    <div className="absolute -bottom-20 left-6 h-44 w-44 rounded-full bg-cyan-100/70 dark:bg-cyan-900/30 blur-3xl" />

                    <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                                FAQ and Quick Start
                            </span>
                            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                Learn the core workflows in minutes
                            </h1>
                            <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300">
                                Upload datasets, visualize with charts, export results, and capture insights in drafts. This guide covers the main flows new users need to get productive fast.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {['Uploads', 'Charts', 'Filters', 'Exports', 'Drafts', 'Encryption'].map((label) => (
                                    <span
                                        key={label}
                                        className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900"
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <Link
                                    to="/app"
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                                >
                                    Start with Upload
                                </Link>
                                <Link
                                    to="/files"
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Explore Files
                                </Link>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-6"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">First-time checklist</h2>
                            <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                {[
                                    'Create an account or log in.',
                                    'Upload a CSV, JSON, or XLSX dataset.',
                                    'Pick a chart type and axes.',
                                    'Apply filters or search to focus data.',
                                    'Export charts and save insights in drafts.'
                                ].map((item, index) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                                            {index + 1}
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-5 rounded-xl border border-blue-200/60 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-900/20 px-4 py-3 text-xs text-blue-700 dark:text-blue-200">
                                Tip: Encrypted files live under Files and encrypted notes live under Drafts. Keep passwords safe because they cannot be recovered.
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                <section className="mt-10">
                    <motion.div
                        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick start paths</h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Follow these steps in order or jump straight to the task you need.
                            </p>
                        </div>
                        <Link
                            to="/draft/new"
                            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Start a Draft
                        </Link>
                    </motion.div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {quickStartSteps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
                                whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                                className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.tone}`}>
                                        {step.icon}
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Step {index + 1}
                                    </span>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    {step.description}
                                </p>
                                <Link
                                    to={step.to}
                                    className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-500"
                                >
                                    {step.cta}
                                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="mt-12">
                    <motion.div
                        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="flex items-end justify-between gap-4"
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently asked questions</h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Click any question to expand the answer.
                            </p>
                        </div>
                        <span className="hidden sm:inline-flex rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-500">
                            {faqItems.length} questions
                        </span>
                    </motion.div>

                    <div className="mt-6 space-y-3">
                        {faqItems.map((item, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <motion.div
                                    key={item.question}
                                    layout
                                    className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                                            {item.question}
                                        </span>
                                        <motion.span
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </motion.span>
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400">
                                                    {item.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                <motion.section
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="mt-12 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Need a refresher?</h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Jump back into the app and try a workflow with this guide open.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/app"
                                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                            <Link
                                to="/settings"
                                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Review Settings
                            </Link>
                        </div>
                    </div>
                </motion.section>
            </main>
        </div>
    );
};
