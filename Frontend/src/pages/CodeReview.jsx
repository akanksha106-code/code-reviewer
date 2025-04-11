import { useState, useContext } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { aiService, reviewService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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
      
      const response = await aiService.getCodeReview(code, 'concise');
      setReview(response.data);
      
      // Automatically save review if user is authenticated
      if (isAuthenticated && response.data) {
        await saveReview(response.data);
      }
    } catch (err) {
      setError('Failed to get code review. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function saveReview(aiReview) {
    try {
      await reviewService.saveReview({
        codeSubmitted: code,
        language: language,
        aiReview: aiReview
      });
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error saving review:', err);
      // Don't show error to user as this is a background save
    }
  }

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
      
      {/* Main content */}
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
                  foldGutter: false,
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
              <div className="save-success">Review saved to your history!</div>
            )}
          </div>
          
          <div className="right">
            <h2 className="section-title">AI Review</h2>
            {error && <div className="error-message">{error}</div>}
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