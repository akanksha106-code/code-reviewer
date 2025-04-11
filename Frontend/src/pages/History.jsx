import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const History = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("History component mounted, user:", user);
    if (user && user.token) {
      console.log("User has token, fetching reviews...");
      fetchReviews();
    } else {
      console.error("No user token available!");
      setLoading(false);
      setError('You need to be logged in to view your history');
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      console.log("Fetching reviews from API...");
      setLoading(true);
      const response = await reviewService.getReviews();
      console.log("Reviews data received:", response.data);
      setReviews(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews details:', err);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
      }
      setError('Failed to load your review history. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        console.log("Deleting review with ID:", id);
        await reviewService.deleteReview(id);
        // Remove the deleted review from state
        setReviews(reviews.filter(review => review._id !== id));
        console.log("Review successfully deleted");
      } catch (err) {
        console.error('Error deleting review:', err);
        if (err.response) {
          console.error('Status:', err.response.status);
          console.error('Data:', err.response.data);
        }
        setError('Failed to delete review. ' + (err.message || ''));
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
          
          <Link to="/dashboard" className="sidebar-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
            </svg>
            <span>Dashboard</span>
          </Link>
          
          <Link to="/history" className="sidebar-item active">
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
        <div className="history-container">
          <h2>Your Code Review History</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading-state">Loading your review history...</div>
          ) : reviews.length === 0 ? (
            <div className="empty-history">
              <p>You haven't submitted any code for review yet.</p>
              <Link to="/" className="history-button">Start Your First Review</Link>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <h3>Review from {formatDate(review.createdAt)}</h3>
                    <div className="review-actions">
                      <Link to={`/review/${review._id}`} className="view-button">
                        View
                      </Link>
                      <button 
                        onClick={() => handleDelete(review._id)} 
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="review-details">
                    <span className="language-tag">{review.language}</span>
                    <p className="code-snippet">
                      {review.codeSubmitted.substring(0, 100)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History; 