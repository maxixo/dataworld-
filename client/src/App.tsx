import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { DatasetView } from './pages/DatasetView';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { AdminDashboard } from './pages/AdminDashboard';
import { BlogEditor } from './pages/BlogEditor';
import { FileUpload } from './components/FileUpload';
import { DatasetList } from './components/DatasetList';
import { DraftsSidebar } from './components/DraftsSidebar';
import { UploadHistory } from './components/UploadHistory';
import { ThemeToggle } from './components/ThemeToggle';

// Protected Route Component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">DataWorld</h1>
        <div className="flex items-center gap-4">
          <Link to="/blog" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            Blog
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
              Admin
            </Link>
          )}
          <ThemeToggle />
          <span>Welcome, {user?.username}</span>
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition">
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl mb-6 font-semibold">Dashboard</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* File Upload Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Upload Dataset</h3>
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Datasets List Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Your Datasets</h3>
              <DatasetList key={refreshKey} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <DraftsSidebar />
            <UploadHistory />
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dataset/:id"
              element={
                <PrivateRoute>
                  <DatasetView />
                </PrivateRoute>
              }
            />
            {/* Public Blog Routes */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/blog/new"
              element={
                <PrivateRoute>
                  <BlogEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/blog/edit/:id"
              element={
                <PrivateRoute>
                  <BlogEditor />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
