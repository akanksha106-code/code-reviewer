import { useState, useContext } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { aiService, reviewService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/CodeReview.css';

const CodeReview = () => {
  const [code, setCode] = useState(`function sum(a, b) {
  return a + b;
}

// Example usage
const result = sum(5, 3);
console.log(result);`);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { isAuthenticated } = useContext(AuthContext);

  const handleChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  async function reviewCode() {
    try {
      setIsLoading(true);
      setError(null);
      setSaveSuccess(false);
      setIsRetrying(false);
      
      const response = await aiService.getCodeReview(code, {
        language,
        reviewStyle: 'detailed'  // Use consistent review style
      });
      
      setReview(response.review);
      
      // Automatically save review if user is authenticated
      if (isAuthenticated && response.review) {
        await saveReviewToHistory(response.review);
      }
    } catch (err) {
      console.error('Error fetching review details:', err);
      
      // Special handling for timeout errors
      if (err.isTimeout) {
        setError(
          'The code review is taking longer than expected. You can retry or try with a smaller code sample.'
        );
        setIsRetrying(true);
      } else {
        setError(`Failed to get code review: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }
  
  // Add function to retry with increased timeout
  async function retryReview() {
    try {
      setIsLoading(true);
      setError('Retrying with extended timeout...');
      setIsRetrying(false);
      
      const response = await aiService.getCodeReview(code, {
        language,
        reviewStyle: 'concise' // Use concise style for retries to speed up response
      });
      
      setReview(response.review);
      setError(null);
      
    } catch (err) {
      setError(`Review failed after retry: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Update the review saving function
  async function saveReviewToHistory(aiReview) {
    try {
      console.log('Saving review to history with:', {
        codeLength: code.length,
        reviewLength: aiReview.length,
        language
      });
      
      // Force trim values to ensure they are valid
      const payload = {
        code: String(code).trim(),
        review: String(aiReview).trim(),
        language: String(language).trim()
      };
      
      console.log('Sending review payload');
      
      // Add timeout to improve reliability
      const response = await reviewService.createReview(payload);
      console.log('Review saved successfully:', response?.data?._id || 'OK');
      
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error saving review:', err);
      
      // Don't show save errors to user for better experience
      // but log them for debugging
      console.warn('Save error details:', 
        err.response?.data || err.message || 'Unknown error');
      
      // Silent failure - don't disturb user experience
      setSaveSuccess(false);
    }
  }

  return (
    <div className="app-container">
      {/* Sidebar with enhanced icons */}
      <div className="sidebar">
        <div className="sidebar-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <h2>Code Reviewer</h2>
        </div>
        
        <div className="sidebar-menu">
          <Link to="/" className="sidebar-item active">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>New Review</span>
          </Link>
          
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="sidebar-item">
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
            </>
          )}
        </div>
        
        {!isAuthenticated && (
          <div className="sidebar-auth">
            <Link to="/login" className="sidebar-auth-button">Login</Link>
            <Link to="/register" className="sidebar-auth-button register">Register</Link>
          </div>
        )}
      </div>
      
      {/* Main content with adjusted spacing */}
      <div className="main-content">
        <main>
          <div className="left">
            <div className="code-options">
              <label htmlFor="language">Language:</label>
              <select 
                id="language" 
                value={language} 
                onChange={handleLanguageChange}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="cpp">C++</option>
                <option value="php">PHP</option>
                <option value="go">Go</option>
                <option value="ruby">Ruby</option>
              </select>
            </div>
            
            <h2 className="section-title">Your Code</h2>
            <div className="code-container">
              <CodeMirror
                value={code}
                height="100%"
                theme="dark"
                extensions={[javascript({ jsx: true })]}
                onChange={handleChange}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  tabSize: 2,
                }}
                className="code-mirror-wrapper"
              />
            </div>
            <button
              onClick={reviewCode}
              disabled={isLoading}
              className={`review-button ${isLoading ? 'loading' : ''}`}>
              {isLoading ? 'Analyzing...' : 'Review Code'}
            </button>
            
            {saveSuccess && isAuthenticated && (
              <div className="save-success">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Review saved to your history!</span>
              </div>
            )}
          </div>
          
          <div className="right">
            <h2 className="section-title">AI Review</h2>
            {error && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
                {isRetrying && (
                  <button 
                    onClick={retryReview} 
                    className="retry-button"
                  >
                    Retry with concise review
                  </button>
                )}
              </div>
            )}
            {isLoading && <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Getting AI review...</p>
            </div>}
            {!isLoading && !error && review && (
              <div className="review-content">
                <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
              </div>
            )}
            {!isLoading && !error && !review && (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>Click the "Review Code" button to get AI feedback</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CodeReview;