import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';

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

// App content with routing logic
const AppContent = () => {
  const location = useLocation();
  const hideHeaderPaths = ['/', '/dashboard', '/history'];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);
  
  return (
    <div className="app">
      {shouldShowHeader && <Header />}
      
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
