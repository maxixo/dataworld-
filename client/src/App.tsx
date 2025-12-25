import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

// Protected Route Component
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};

// Dashboard Placeholder
const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">DataWorld</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.username}</span>
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition">
            Logout
          </button>
        </div>
      </header>
      <main className="p-8">
        <h2 className="text-2xl mb-4">Dashboard</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          <p>No datasets uploaded yet.</p>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
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
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
