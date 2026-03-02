import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './AboutPage.css';

const AboutPage = () => {
  const navigate = useNavigate();
  const [cmsContent, setCmsContent] = useState(null);

  useEffect(() => {
    API.get('/cms/about')
      .then(res => {
        if (res.data && res.data.title) {
          setCmsContent(res.data);
        } else {
          setCmsContent({
            title: 'Essence Creations',
            description: `Welcome to Essence Creations!`
          });
        }
      })
      .catch(() => {
        setCmsContent({
          title: 'Essence Creations',
          description: `Welcome to Essence Creations!`
        });
      });
  }, []);

  if (!cmsContent) return <div className="about-loading">Loading...</div>;

  return (
    <div className="about-wrapper">
      <div className="about-container">
        <div className="nav-section">
          <button className="nav-back-btn" onClick={() => navigate('/hub')}>
            <span className="arrow-icon">←</span> Back to Hub
          </button>
        </div>

        <section className="about-content">
          <header className="about-header-area">
            <h1 className="about-title">{cmsContent.title}</h1>
            <div className="about-divider"></div>
          </header>

          {/* This is the key section for the image display */}
          {cmsContent.image && (
            <div className="about-image-wrapper">
              <img src={cmsContent.image} alt="Essence" className="about-display-img" />
            </div>
          )}

          <div className="about-text-section">
            <p className="about-description">
              {cmsContent.description}
            </p>
          </div>

          <div className="cta-section">
            <button className="action-btn" onClick={() => navigate('/shop')}>
              Browse the Shop
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
