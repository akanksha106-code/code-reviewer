import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { reviewService } from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalReviews: 0,
    languages: [],
    mostUsedLanguage: null,
    lastActive: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getReviews();
      const reviews = response.data || [];
      
      if (reviews.length > 0) {
        // Count languages
        const languageCount = reviews.reduce((acc, review) => {
          const lang = review.language || 'unknown';
          acc[lang] = (acc[lang] || 0) + 1;
          return acc;
        }, {});
        
        // Find most used language
        let mostUsed = null;
        let maxCount = 0;
        Object.entries(languageCount).forEach(([lang, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostUsed = lang;
          }
        });
        
        // Find most recent activity
        const lastActivity = reviews.length > 0 
          ? new Date(Math.max(...reviews.map(r => new Date(r.createdAt).getTime())))
          : null;
        
        setStats({
          totalReviews: reviews.length,
          languages: Object.keys(languageCount),
          mostUsedLanguage: mostUsed ? mostUsed.charAt(0).toUpperCase() + mostUsed.slice(1) : null,
          lastActive: lastActivity
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load profile statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };
  
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch (e) {
      return 'N/A';
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.username?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="profile-title">
          <h1>{user?.username || 'User'}</h1>
          <p className="subtitle">{user?.email || 'No email provided'}</p>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-menu">
            <Link to="/" className="menu-item">
              <i className="icon">📝</i>
              <span>New Review</span>
            </Link>
            <Link to="/dashboard" className="menu-item">
              <i className="icon">📊</i>
              <span>Dashboard</span>
            </Link>
            <Link to="/history" className="menu-item">
              <i className="icon">📚</i>
              <span>Review History</span>
            </Link>
            <div className="menu-item" onClick={handleLogout}>
              <i className="icon">🚪</i>
              <span>Logout</span>
            </div>
          </div>
          
          <div className="profile-membership">
            <h3>Membership</h3>
            <div className="membership-card">
              <div className="membership-header">
                <div className="membership-badge">Free</div>
              </div>
              <div className="membership-body">
                <p className="membership-since">Member Since</p>
                <p className="membership-date">{formatDate(user?.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-content">
          <div className="profile-section">
            <h2>Account Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Username</label>
                <p>{user?.username || 'Not set'}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{user?.email || 'Not set'}</p>
              </div>
              <div className="info-item">
                <label>Joined</label>
                <p>{formatDate(user?.createdAt)}</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p><span className="status-badge active">Active</span></p>
              </div>
            </div>
          </div>
          
          <div className="profile-section">
            <h2>Your Activity</h2>
            {loading ? (
              <div className="loading-spinner">Loading statistics...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{stats.totalReviews}</div>
                  <div className="stat-label">Total Reviews</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🔤</div>
                  <div className="stat-value">{stats.languages.length}</div>
                  <div className="stat-label">Languages Used</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-value">{stats.mostUsedLanguage || 'N/A'}</div>
                  <div className="stat-label">Most Used Language</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🕒</div>
                  <div className="stat-value">{formatTimeAgo(stats.lastActive)}</div>
                  <div className="stat-label">Last Active</div>
                </div>
              </div>
            )}
            
            <div className="activity-cta">
              <Link to="/history" className="btn-view-all">View All Activity</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
