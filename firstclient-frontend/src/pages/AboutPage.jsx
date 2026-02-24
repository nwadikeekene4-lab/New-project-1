import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="about-wrapper">
      <div className="about-container">
        
        {/* Konga Standard Navigation Bar */}
        <div className="nav-section">
          <button className="nav-back-btn" onClick={() => navigate('/hub')}>
            <span className="arrow-icon">←</span> Back to Hub
          </button>
        </div>

        {/* Professional Content Card */}
        <section className="about-content">
          <header className="about-header-area">
            <h1 className="about-title">The Heritage Hub</h1>
            <p className="about-subtitle">Traditional Quality • Modern Convenience • Community Heart</p>
            <div className="about-divider"></div>
          </header>

          <div className="info-grid">
            <div className="info-card">
              <h3>Our Legacy</h3>
              <p>
                The Heritage Hub was founded on the principle of trust. We aren't just a store; 
                we are a landmark where quality meets the authentic flavors of our culture.
              </p>
            </div>

            <div className="info-card">
              <h3>The Provision Store</h3>
              <p>
                From premium household staples to hard-to-find local ingredients, our pantry 
                is curated to ensure your home never lacks the essentials of a good life.
              </p>
            </div>

            <div className="info-card">
              <h3>The Heritage Bakery</h3>
              <p>
                Our ovens breathe life into tradition. Our pastries and breads are crafted 
                using time-honored recipes that bring a taste of home to every bite.
              </p>
            </div>

            <div className="info-card">
              <h3>Catering Excellence</h3>
              <p>
                Bringing people together through food. Our catering service handles your 
                milestone events with the dignity and flavor they deserve.
              </p>
            </div>
          </div>

          <div className="cta-section">
            <button className="action-btn" onClick={() => navigate('/shop')}>
              Browse the Shop
            </button>
            <button className="action-btn outline" onClick={() => navigate('/catering')}>
              Event Pastries
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;