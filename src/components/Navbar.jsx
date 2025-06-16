import React from 'react';
import './Navbar.css';

export default function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">
            <div className="logo-ring">
              <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 8l-4 4-4-4"/>
                <path d="M12 16V8"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">MapAuth</h1>
            <span className="brand-subtitle">Explore & Navigate</span>
          </div>
        </div>
        
        <div className="navbar-center">
          <div className="nav-indicator">
            <div className="indicator-dot"></div>
            <span className="status-text">Online</span>
          </div>
        </div>
        
        <div className="navbar-actions">
          <div className="user-section">
            <div className="user-avatar">
              <div className="avatar-inner">U</div>
              <div className="online-indicator"></div>
            </div>
          </div>
          
          <button onClick={onLogout} className="logout-btn">
            <div className="btn-content">
              <svg className="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="btn-text">Sign Out</span>
            </div>
            <div className="btn-ripple"></div>
          </button>
        </div>
      </div>
      
      <div className="navbar-glow"></div>
    </nav>
  );
}