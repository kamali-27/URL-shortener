import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';

// Helper component for protecting authentication-required routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

// Helper component for preventing logged-in users from visiting Login/Signup pages
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return !token ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 text-white flex flex-col">
        {/* Custom Toast Notifications Provider */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1f2937', // gray-800
              color: '#f3f4f6',      // gray-100
              border: '1px solid #374151', // gray-700
              borderRadius: '1rem',
            },
            success: {
              iconTheme: {
                primary: '#10b981', // emerald-500
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444', // red-500
                secondary: '#ffffff',
              },
            },
          }}
        />

        {/* Global Navigation Header */}
        <Navbar />

        {/* Page Content Routes */}
        <main className="flex-1">
          <Routes>
            {/* Public Auth Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />

            {/* Protected SaaS App Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics/:id" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />

            {/* Fallback Redirections */}
            <Route 
              path="*" 
              element={<Navigate to={localStorage.getItem('token') ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
