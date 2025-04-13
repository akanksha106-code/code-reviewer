import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        
        <div className="not-found-illustration">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 10C9 9.44772 9.44772 9 10 9C10.5523 9 11 9.44772 11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10Z" fill="currentColor"/>
            <path d="M13 10C13 9.44772 13.4477 9 14 9C14.5523 9 15 9.44772 15 10C15 10.5523 14.5523 11 14 11C13.4477 11 13 10.5523 13 10Z" fill="currentColor"/>
            <path d="M15 15C15 15 14 13 12 13C10 13 9 15 9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="not-found-actions">
          <Link to="/" className="btn-primary">Go to Home</Link>
          <button onClick={() => window.history.back()} className="btn-outline">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
