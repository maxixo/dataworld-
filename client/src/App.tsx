import React, { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store, persistor } from './store';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoadingState } from './components/LoadingState';
 
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Signup = lazy(() => import('./pages/Signup').then((module) => ({ default: module.Signup })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Landing = lazy(() => import('./pages/Landing').then((module) => ({ default: module.Landing })));
const DatasetView = lazy(() => import('./pages/DatasetView').then((module) => ({ default: module.DatasetView })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));
const UserProfile = lazy(() => import('./pages/UserProfile').then((module) => ({ default: module.UserProfile })));
const Files = lazy(() => import('./pages/Files').then((module) => ({ default: module.Files })));
const Drafts = lazy(() => import('./pages/Drafts').then((module) => ({ default: module.Drafts })));
const DraftEditor = lazy(() => import('./pages/DraftEditor').then((module) => ({ default: module.DraftEditor })));

// Protected Route Component - redirects to landing if not authenticated
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingState variant="page" size="lg" label="Checking access" description="Preparing your workspace and validating your session." />;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return children;
};

// Public Route Component - redirects to app if already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingState variant="page" size="lg" label="Loading session" description="Checking whether you already have an active account session." />;
  if (isAuthenticated) return <Navigate to="/app" replace />;

  return children;
};

const RouteFallback = () => (
  <LoadingState
    variant="page"
    size="lg"
    label="Loading screen"
    description="Fetching the next view and warming up the interface."
  />
);

function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <LoadingState
            variant="page"
            size="lg"
            label="Restoring app state"
            description="Rehydrating your saved session, theme, and local workspace state."
          />
        }
        persistor={persistor}
      >
          <ThemeProvider>
            <Router>
              <AuthProvider>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                    <Route path="/" element={<Landing />} />
                    <Route
                      path="/app"
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
                    <Route
                      path="/settings"
                      element={
                        <PrivateRoute>
                          <Settings />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute>
                          <UserProfile />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/files"
                      element={
                        <PrivateRoute>
                          <Files />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/drafts"
                      element={
                        <PrivateRoute>
                          <Drafts />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/draft/new"
                      element={
                        <PrivateRoute>
                          <DraftEditor />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/draft/:id"
                      element={
                        <PrivateRoute>
                          <DraftEditor />
                        </PrivateRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
        </AuthProvider>
      </Router>
          </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
