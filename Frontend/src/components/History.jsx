import { useState, useEffect } from 'react';
import { reviewService } from '../services/api';

const History = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewService.getReviews();
      
      // Ensure we have valid data
      if (response && response.data) {
        setReviews(Array.isArray(response.data) ? response.data : []);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error?.response?.data?.message || 'Failed to fetch reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div>
      {loading && <div>Loading reviews...</div>}
      {error && <div className="error-message">Error: {error}</div>}
      {!loading && !error && reviews.length === 0 && (
        <div>No reviews found</div>
      )}
      {!loading && !error && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review._id} className="review-item">
              <pre>{review.code}</pre>
              <p>{review.review}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
