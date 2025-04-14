import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Import components and pages
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import CodeReview from './pages/CodeReview';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Import core styles
import './index.css';
import './styles/App.css';

// Add a debug component for auth state
const AuthDebug = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  
  useEffect(() => {
    // Debug auth state on mount and when it changes
    console.log('Auth state:', { isAuthenticated, user });
    
    // Also check localStorage directly
    try {
      console.log('LocalStorage auth_token:', localStorage.getItem('auth_token')?.substring(0, 15) + '...');
      console.log('LocalStorage auth_user:', localStorage.getItem('auth_user'));
      console.log('LocalStorage auth_expiry:', localStorage.getItem('auth_expiry'));
    } catch (err) {
      console.error('Error accessing localStorage:', err);
    }
  }, [isAuthenticated, user]);
  
  return null; // This component doesn't render anything
};

// App content with routing logic
const AppContent = () => {
  const location = useLocation();
  const hideHeaderPaths = ['/', '/dashboard', '/history'];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);
  
  return (
    <div className="app">
      {shouldShowHeader && <Header />}
      <AuthDebug /> {/* Add the debug component */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <CodeReview />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {shouldShowHeader && (
        <footer className="footer">
          <p>© {new Date().getFullYear()} Code Reviewer</p>
        </footer>
      )}
    </div>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
