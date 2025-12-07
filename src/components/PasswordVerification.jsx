import React, { useState } from 'react';
import './PasswordVerification.css';
import Notification from './Notification';

const PasswordVerification = ({ isOpen, onClose, onVerify, targetSection }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setNotification({
        message: 'Please enter your password',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          message: 'Password verified successfully',
          type: 'success'
        });
        
        setTimeout(() => {
          onVerify();
          handleClose();
        }, 1000);
      } else {
        setNotification({
          message: data.message || 'Incorrect password',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setNotification({
        message: 'Failed to verify password. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setNotification(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="password-verification-overlay" onClick={handleClose}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}
      
      <div className="password-verification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="verification-header">
          <h2>Security Verification</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="verification-content">
          <div className="security-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <p className="verification-message">
            To access your <span className="highlight">{targetSection}</span>, please verify your identity by entering your current password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="verify-password">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="verify-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="verification-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="verify-btn"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordVerification;
