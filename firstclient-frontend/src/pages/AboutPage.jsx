import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api'; // Ensure this path to your api.js is correct
import './AboutPage.css';

const AboutPage = () => {
  const navigate = useNavigate();
  const [cmsContent, setCmsContent] = useState({
    title: 'Essence Creations',
    description: `Welcome to Essence Creations! Your one-stop destination for all things sweet and delightful. We are a passionate team dedicated to bringing you the finest bakery products, delicious pastries, and mouth-watering cakes and desserts. From special occasion cakes to everyday treats, we've got you covered! 

But that's not all - we also offer a wide range of baking materials, perfect for professional bakers and home enthusiasts alike. Plus, explore our curated selection of gift items, ideal for expressing love and appreciation.

And, for your everyday essentials, visit our in-house supermarket, stocked with a variety of products to meet your needs. At Essence Creations, we're committed to quality, freshness, and exceptional customer service. Come experience the essence of delight with us!`
  });

  useEffect(() => {
    // Fetch the live content from your new CMS backend
    API.get('/cms/about')
      .then(res => {
        if (res.data && res.data.title) {
          setCmsContent(res.data);
        }
      })
      .catch(err => console.log("Using default about content"));
  }, []);

  return (
    <div className="about-wrapper">
      <div className="about-container">
        
        {/* Navigation Bar */}
        <div className="nav-section">
          <button className="nav-back-btn" onClick={() => navigate('/hub')}>
            <span className="arrow-icon">←</span> Back to Hub
          </button>
        </div>

        {/* Clean, Single Section Content */}
        <section className="about-content">
          <header className="about-header-area">
            <h1 className="about-title">{cmsContent.title}</h1>
            <div className="about-divider"></div>
          </header>

          <div className="about-text-section">
            <p className="about-description">
              {cmsContent.description || cmsContent.legacy}
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
