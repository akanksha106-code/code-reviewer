import { Routes, Route, useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import { connectionService } from './services/api';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import CodeReview from './pages/CodeReview';
import './App.css';

function App() {
  const { loading } = useContext(AuthContext);
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await connectionService.validateConnection();
        setIsConnected(connected);
        setConnectionError(null);
      } catch (error) {
        setIsConnected(false);
        setConnectionError('Cannot connect to backend service');
      }
    };

    checkConnection();
  }, []);
  
  // Hide header on pages that use the sidebar
  const hideHeaderPaths = ['/', '/dashboard', '/history'];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);

  if (loading) {
    return <div className="loading-app">Loading...</div>;
  }

  if (connectionError) {
    return <div className="error-message">Error: {connectionError}</div>;
  }

  return (
    <div className="app">
      {shouldShowHeader && <Header />}
      
      <div className={shouldShowHeader ? "container" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<CodeReview />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
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
        </Routes>
      </div>
      
      {shouldShowHeader && (
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Code Reviewer - Powered by Gemini AI</p>
        </footer>
      )}
    </div>
  );
}

export default App;
