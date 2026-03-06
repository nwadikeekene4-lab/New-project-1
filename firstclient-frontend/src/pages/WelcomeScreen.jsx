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

      <div className="welcome-card animate-slide-up">
        <header className="welcome-header">
          <div className="title-container">
            <h1 className="welcome-title pulse-glow">Essence Creations</h1>
            <span className="emoji-sparkle right">🧁</span>
          </div>
          
          <p className="welcome-subtitle">Savor the Essence</p>
          <div className="welcome-divider"></div>
          
          <p className="intro-text">
            Explore our world of sweet treats, baking essentials, and thoughtful gifts. 
            Freshly baked goodness, just for you. Shop now and make every moment a celebration.
          </p>
        </header>

        <div className="welcome-actions">
          <div className="top-grid-actions">
            <button className="option-btn grid-btn" onClick={() => navigate('/hub')}>
              Want to know more?
            </button>
            <button className="option-btn grid-btn primary-shop-btn" onClick={() => navigate('/shop')}>
              Purchase a product 🥖
            </button>
          </div>

          <div className="or-divider">
            <span>explore more</span>
          </div>

          <button className="option-btn catering-btn" onClick={() => navigate('/pastries')}>
            View our pastry services 🎂
          </button>
        </div>
      </div>
    </div>
  );
};


export default WelcomeScreen;
