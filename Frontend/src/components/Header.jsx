import { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header>
      <div className="header-container">
        <Link to="/" className="header-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1>Code Reviewer</h1>
        </Link>
        
        <div className="header-actions">
          {user ? (
            <div className="user-menu" ref={menuRef}>
              <button 
                className="user-button"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div className="user-avatar">
                  {user.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="user-name">{user.username}</span>
              </button>
              
              {menuOpen && (
                <div className="user-menu-dropdown">
                  <Link to="/profile" className="user-menu-item">
                    <i>👤</i>
                    <span>Profile</span>
                  </Link>
                  <Link to="/history" className="user-menu-item">
                    <i>📋</i>
                    <span>Review History</span>
                  </Link>
                  <div className="user-menu-item logout" onClick={handleLogout}>
                    <i>🚪</i>
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
