import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/Header';

export const Settings: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [datasetAlerts, setDatasetAlerts] = useState(true);
    const [weeklyReports, setWeeklyReports] = useState(false);
    const [autoSave, setAutoSave] = useState(true);
    const [defaultView, setDefaultView] = useState('grid');

    const handleSaveSettings = () => {
        // TODO: Implement API call to save settings
        alert('Settings saved successfully!');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Header
                    username={user?.username || 'User'}
                    onLogout={logout}
                />

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Appearance Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Appearance
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                                        Theme
                                    </label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Choose your preferred theme
                                    </p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                    style={{ backgroundColor: theme === 'dark' ? '#8B5CF6' : '#D1D5DB' }}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className={theme === 'light' ? 'font-medium text-gray-900 dark:text-white' : ''}>
                                    Light
                                </span>
                                <span>/</span>
                                <span className={theme === 'dark' ? 'font-medium text-gray-900 dark:text-white' : ''}>
                                    Dark
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Notifications
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                                        Email Notifications
                                    </label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Receive notifications via email
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEmailNotifications(!emailNotifications)}
                                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                    style={{ backgroundColor: emailNotifications ? '#8B5CF6' : '#D1D5DB' }}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                                        Dataset Alerts
                                    </label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Get notified about dataset updates
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDatasetAlerts(!datasetAlerts)}
                                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                    style={{ backgroundColor: datasetAlerts ? '#8B5CF6' : '#D1D5DB' }}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            datasetAlerts ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                                        Weekly Reports
                                    </label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Receive weekly summary reports
                                    </p>
                                </div>
                                <button
                                    onClick={() => setWeeklyReports(!weeklyReports)}
                                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                    style={{ backgroundColor: weeklyReports ? '#8B5CF6' : '#D1D5DB' }}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            weeklyReports ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Preferences
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                                        Auto-save
                                    </label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Automatically save your work
                                    </p>
                                </div>
                                <button
                                    onClick={() => setAutoSave(!autoSave)}
                                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                    style={{ backgroundColor: autoSave ? '#8B5CF6' : '#D1D5DB' }}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            autoSave ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-white">
                                    Default View
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    Choose how datasets are displayed
                                </p>
                                <select
                                    value={defaultView}
                                    onChange={(e) => setDefaultView(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="grid">Grid View</option>
                                    <option value="list">List View</option>
                                    <option value="compact">Compact View</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Storage Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Storage
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Storage used</span>
                                    <span className="font-medium text-gray-900 dark:text-white">2.4 GB / 20 GB</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                                </div>
                            </div>
                            
                            <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                                Manage Storage
                            </button>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveSettings}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
