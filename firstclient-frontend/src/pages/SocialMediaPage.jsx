import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaPhoneAlt, FaInstagram, FaFacebookF, FaGlobe } from 'react-icons/fa';
import API from '../api';
import './SocialMediaPage.css';

const SocialMediaPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ handles: [], care: [] });

  useEffect(() => {
    API.get('/cms/social_links').then(res => {
      if (res.data) setData(res.data);
    }).catch(() => {});
  }, []);

  const getIcon = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return { icon: <FaInstagram />, color: '#E1306C' };
    if (p.includes('facebook')) return { icon: <FaFacebookF />, color: '#1877F2' };
    if (p.includes('whatsapp')) return { icon: <FaWhatsapp />, color: '#25D366' };
    return { icon: <FaGlobe />, color: '#555' };
  };

  return (
    <div className="social-wrapper">
      <div className="social-container">
        <div className="nav-section-split">
          <button className="nav-back-btn" onClick={() => navigate('/hub')}>← Back</button>
          <button className="nav-shop-btn" onClick={() => navigate('/shop')}>Shop →</button>
        </div>

        <section className="social-content-card">
          <header className="social-header-area">
            <h1 className="social-title">Connect With Us</h1>
            <p className="social-subtitle">We are always a message away</p>
          </header>
          
          <div className="care-section">
            <h2 className="section-label">Customer Care</h2>
            <div className="care-list">
              {data.care.map((item, index) => (
                <a href={item.type === 'WhatsApp' ? `https://wa.me/${item.number.replace(/\D/g,'')}` : `tel:${item.number}`} key={index} className="care-item">
                  <span className="care-icon" style={{ color: item.type === 'WhatsApp' ? '#25D366' : '#16a74d' }}>
                    {item.type === 'WhatsApp' ? <FaWhatsapp /> : <FaPhoneAlt />}
                  </span>
                  <span className="care-number">{item.number}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="divider-line"></div>

          <div className="links-section">
            <h2 className="section-label">Social Handles</h2>
            <div className="social-grid">
              {data.handles.map((social, index) => {
                const style = getIcon(social.platform);
                return (
                  <a href={social.link} key={index} target="_blank" rel="noopener noreferrer" className="social-card">
                    <span className="social-icon-circle" style={{ backgroundColor: style.color }}>{style.icon}</span>
                    <div className="social-info">
                      <h3>{social.platform}</h3>
                      <p>{social.handle}</p>
                    </div>
                    <span className="arrow-link">→</span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SocialMediaPage;
