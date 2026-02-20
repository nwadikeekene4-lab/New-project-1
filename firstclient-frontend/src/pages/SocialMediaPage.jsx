import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaPhoneAlt, FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import './SocialMediaPage.css';

const SocialMediaPage = () => {
  const navigate = useNavigate();

  const socialLinks = [
    { 
      platform: 'Instagram', 
      handle: '@HeritageHub_NG', 
      link: 'https://instagram.com', 
      icon: <FaInstagram />,
      color: '#E1306C' 
    },
    { 
      platform: 'Facebook', 
      handle: 'Heritage Hub Provisions', 
      link: 'https://facebook.com', 
      icon: <FaFacebookF />,
      color: '#1877F2' 
    },
    { 
      platform: 'Twitter / X', 
      handle: '@HeritageHub', 
      link: 'https://twitter.com', 
      icon: <FaTwitter />,
      color: '#1DA1F2' 
    }
  ];

  const customerCare = [
    { number: '09123456789', icon: <FaWhatsapp />, color: '#25D366', action: 'https://wa.me/2349123456789' },
    { number: '09123475678', icon: <FaWhatsapp />, color: '#25D366', action: 'https://wa.me/2349123475678' },
    { number: '08065432123', icon: <FaPhoneAlt />, color: '#ffffff', action: 'tel:08065432123' }
  ];

  return (
    <div className="social-wrapper">
      <div className="social-container">
        {/* --- NAVIGATION BUTTONS --- */}
        <div className="top-nav-group">
          <button className="back-btn" onClick={() => navigate('/hub')}>
            ← Back to Hub
          </button>

          <button className="right-button" onClick={() => navigate('/shop')}>
            Back to shop →
          </button>
        </div>

        <section className="social-content">
          <h1 className="social-title">Connect With Us</h1>
          
          <div className="care-section">
            <h2 className="section-label">Customer Care</h2>
            <div className="care-list">
              {customerCare.map((item, index) => (
                <a href={item.action} key={index} className="care-item">
                  <span className="care-icon" style={{ color: item.color }}>{item.icon}</span>
                  <span className="care-number">{item.number}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="divider-line"></div>

          <div className="links-section">
            <h2 className="section-label">Social Handles</h2>
            <div className="social-grid">
              {socialLinks.map((social, index) => (
                <a href={social.link} key={index} target="_blank" rel="noopener noreferrer" className="social-card">
                  <span className="social-icon" style={{ backgroundColor: social.color }}>
                    {social.icon}
                  </span>
                  <div className="social-info">
                    <h3>{social.platform}</h3>
                    <p>{social.handle}</p>
                  </div>
                  <span className="arrow-link">→</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SocialMediaPage;