import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReviews: 0,
    languages: [],
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getReviews();
      const reviews = response.data || [];
      
      // Calculate stats
      const languageCounts = {};
      reviews.forEach(review => {
        const lang = review.language || 'unknown';
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      });
      
      // Sort by date for recent reviews
      const sortedReviews = [...reviews].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setStats({
        totalReviews: reviews.length,
        languages: Object.entries(languageCounts).map(([language, count]) => ({ 
          language, 
          count,
          percentage: Math.round(count / reviews.length * 100)
        })),
        recentReviews: sortedReviews.slice(0, 5)
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <h2>Code Reviewer</h2>
        </div>
        
        <div className="sidebar-menu">
          <Link to="/" className="sidebar-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>New Review</span>
          </Link>
          
          <Link to="/dashboard" className="sidebar-item active">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
            </svg>
            <span>Dashboard</span>
          </Link>
          
          <Link to="/history" className="sidebar-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span>History</span>
          </Link>
          
          <Link to="/profile" className="sidebar-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Profile</span>
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className="main-content">
        <div className="dashboard-container">
          <h1>Dashboard</h1>
          <p className="dashboard-greeting">Welcome back, {user?.username || 'User'}!</p>
          
          {loading ? (
            <div className="loading-container">Loading your dashboard...</div>
          ) : (
            <div className="dashboard-content">
              {/* Overview Stats */}
              <div className="dashboard-section overview-stats">
                <h2>Overview</h2>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-icon reviews-icon">📊</div>
                    <div className="stat-details">
                      <h3>{stats.totalReviews}</h3>
                      <p>Total Reviews</p>
                    </div>
                  </div>
                  
                  <div className="stat-box">
                    <div className="stat-icon languages-icon">🔤</div>
                    <div className="stat-details">
                      <h3>{stats.languages.length}</h3>
                      <p>Languages</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Language Distribution */}
              <div className="dashboard-section language-distribution">
                <h2>Language Distribution</h2>
                {stats.languages.length > 0 ? (
                  <div className="languages-list">
                    {stats.languages.map(lang => (
                      <div className="language-item" key={lang.language}>
                        <div className="language-name">
                          {lang.language.charAt(0).toUpperCase() + lang.language.slice(1)}
                        </div>
                        <div className="language-bar-container">
                          <div 
                            className="language-bar" 
                            style={{width: `${lang.percentage}%`}}
                          ></div>
                        </div>
                        <div className="language-count">{lang.count}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No language data available yet</p>
                )}
              </div>
              
              {/* Recent Reviews */}
              <div className="dashboard-section recent-reviews">
                <h2>Recent Reviews</h2>
                {stats.recentReviews.length > 0 ? (
                  <div className="reviews-list">
                    {stats.recentReviews.map(review => (
                      <Link to={`/history?id=${review._id}`} className="review-item" key={review._id}>
                        <div className="review-language">{review.language}</div>
                        <div className="review-date">{formatDate(review.createdAt)}</div>
                        <div className="review-preview">
                          {review.code.substring(0, 60)}...
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="no-reviews">
                    <p>You don't have any reviews yet.</p>
                    <Link to="/" className="create-review-btn">Create Your First Review</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;