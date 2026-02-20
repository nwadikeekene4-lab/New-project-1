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

      <div className="glass-card">
        <header className="welcome-header">
          <h1 className="fade-in">Welcome To Heritage hub</h1>
          <p className="intro-text fade-in-delay">
  Your home for oven-fresh bakery delights and premium daily provisions. We are dedicated to bringing the finest quality essentials to your table, ensuring every meal starts with the very best.

Quality you can trust. Freshness you can taste.
          </p>
        </header>

        <div className="options-container">
          <div className="top-options">
            <button className="option-btn tour-btn" onClick={() => navigate('/hub')}>
               Want to know more about us?
            </button>
            <button className="option-btn shop-btn" onClick={() => navigate('/shop')}>
              Purchase a product
            </button>
          </div>

          <div className="or-divider">
            <span>or</span>
          </div>

          <button className="option-btn catering-btn" onClick={() => navigate('/catering')}>
            View our pastery services
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;