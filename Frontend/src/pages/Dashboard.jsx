import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { reviewService } from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    reviewCount: 0,
    languagesUsed: 0,
    daysActive: 0
  });

  useEffect(() => {
    console.log("Dashboard mounted, user:", user);
    if (user && user.token) {
      console.log("User has token, fetching reviews...");
      fetchReviews();
    } else {
      console.error("No user token available!");
      setLoading(false);
      setError('You need to be logged in to view dashboard data');
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      console.log("Fetching reviews from API...");
      setLoading(true);
      const response = await reviewService.getReviews();
      console.log("Reviews data received:", response.data);
      setReviews(response.data);
      
      // Calculate stats from reviews
      calculateStats(response.data);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews details:', err);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
      }
      setError('Failed to load your dashboard data. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewData) => {
    if (!reviewData || reviewData.length === 0) {
      console.log("No review data to calculate stats from");
      return;
    }

    console.log("Calculating stats from review data");
    // Count total reviews
    const reviewCount = reviewData.length;
    
    // Count unique languages
    const uniqueLanguages = new Set(reviewData.map(review => review.language));
    const languagesUsed = uniqueLanguages.size;
    
    // Calculate days active (from first review to now)
    const firstReviewDate = new Date(
      Math.min(...reviewData.map(review => new Date(review.createdAt)))
    );
    const today = new Date();
    const diffTime = Math.abs(today - firstReviewDate);
    const daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log("Stats calculated:", { reviewCount, languagesUsed, daysActive });
    setStats({
      reviewCount,
      languagesUsed,
      daysActive
    });
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
        </div>
      </div>
      
      {/* Main content */}
      <div className="main-content">
        <div className="dashboard-container">
          <h2>Welcome to Your Dashboard, {user ? user.username : 'User'}!</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Review Code</h3>
              <p>Get AI-powered feedback on your code's quality and best practices.</p>
              <Link to="/" className="dashboard-button">Start a New Review</Link>
            </div>
            
            <div className="dashboard-card">
              <h3>Review History</h3>
              <p>Access your past code reviews and feedback history.</p>
              <Link to="/history" className="dashboard-button">View History</Link>
            </div>
            
            <div className="dashboard-card">
              <h3>Profile Settings</h3>
              <p>Update your account information and preferences.</p>
              <Link to="/profile" className="dashboard-button">Manage Profile</Link>
            </div>
          </div>
          
          <div className="dashboard-stats">
            <h3>Your Stats</h3>
            {loading ? (
              <div className="loading-state">Loading your stats...</div>
            ) : (
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{stats.reviewCount}</span>
                  <span className="stat-label">Code Reviews</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.languagesUsed}</span>
                  <span className="stat-label">Languages Used</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.daysActive}</span>
                  <span className="stat-label">Days Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 