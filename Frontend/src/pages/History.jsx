import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services/api';
import Markdown from 'react-markdown';
import '../styles/History.css';

const History = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getReviews();
      console.log('Reviews data received:', response.data);
      setReviews(response.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load your review history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const viewReviewDetails = (review) => {
    setSelectedReview(review);
  };

  const closeReviewDetails = () => {
    setSelectedReview(null);
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get a preview of code (safely)
  const getCodePreview = (code) => {
    if (!code) return 'No code available';
    
    // Safely get a substring
    const preview = typeof code === 'string' 
      ? (code.length > 50 ? code.substring(0, 50) + '...' : code) 
      : 'Invalid code format';
      
    return preview;
  };

  // Language display helper
  const getLanguageDisplay = (lang) => {
    if (!lang) return 'Unknown';
    return lang.charAt(0).toUpperCase() + lang.slice(1);
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
          <h2>Your Review History</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading">Loading your review history...</div>
          ) : reviews.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any code reviews yet.</p>
              <Link to="/" className="btn">Create Your First Review</Link>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <span className="language-tag">{getLanguageDisplay(review.language)}</span>
                    <span className="date">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="review-preview">
                    <pre className="code-preview">{getCodePreview(review.code)}</pre>
                  </div>
                  <button
                    onClick={() => viewReviewDetails(review)}
                    className="view-details-btn"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {selectedReview && (
            <div className="review-modal">
              <div className="review-modal-content">
                <div className="review-modal-header">
                  <h3>Code Review Details</h3>
                  <button onClick={closeReviewDetails} className="close-btn">×</button>
                </div>
                <div className="review-modal-body">
                  <div className="review-details-info">
                    <span className="language-tag">{getLanguageDisplay(selectedReview.language)}</span>
                    <span className="date">{formatDate(selectedReview.createdAt)}</span>
                  </div>
                  
                  <h4>Your Code</h4>
                  <pre className="code-full">{selectedReview.code}</pre>
                  
                  <h4>AI Review</h4>
                  <div className="review-content">
                    <Markdown>{selectedReview.review}</Markdown>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;