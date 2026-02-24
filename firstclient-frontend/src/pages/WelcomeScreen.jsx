import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeScreen.css';

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-wrapper">
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/welcome-video/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="video-overlay"></div>

      <div className="welcome-card">
        <header className="welcome-header">
          <h1 className="welcome-title fade-in">Heritage Hub</h1>
          <p className="welcome-subtitle">Quality you can trust. Freshness you can taste.</p>
          <div className="welcome-divider"></div>
          <p className="intro-text fade-in-delay">
            Your home for oven-fresh bakery delights and premium daily provisions. 
            We are dedicated to bringing the finest quality essentials to your table.
          </p>
        </header>

        <div className="welcome-actions">
          {/* Top Grid: Two buttons with orange borders */}
          <div className="top-grid-actions">
            <button className="option-btn grid-btn" onClick={() => navigate('/hub')}>
              Want to know more?
            </button>
            <button className="option-btn grid-btn" onClick={() => navigate('/shop')}>
              Purchase a product
            </button>
          </div>

          <div className="or-divider">
            <span>explore more</span>
          </div>

          {/* Bottom Button: Solid black, hovers green */}
          <button className="option-btn catering-btn" onClick={() => navigate('/catering')}>
            View our pastry services
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;