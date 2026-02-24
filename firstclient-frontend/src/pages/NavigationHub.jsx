import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationHub.css';

const NavigationHub = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Our Heritage', path: '/about', icon: '🏛️', desc: 'Learn about our history' },
    { label: 'Customer Reviews', path: '/reviews', icon: '⭐', desc: 'See what people say' },
    { label: 'Get In Touch', path: '/contact', icon: '📞', desc: '24/7 Support' },
    { label: 'Social Media', path: '/socials', icon: '📱', desc: 'Follow our journey' }
  ];

  return (
    <div className="hub-wrapper">
      <div className="hub-container">
        <nav className="breadcrumb">
          <span onClick={() => navigate('/')}>Home</span> / <span>Heritage Hub</span>
        </nav>

        <header className="hub-header">
          <h1 className="hub-title">Heritage Hub</h1>
          <p className="hub-subtitle">Service and Information Center</p>
        </header>

        <div className="hub-grid">
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className="hub-card" 
              onClick={() => navigate(item.path)}
            >
              <div className="hub-icon-box">{item.icon}</div>
              <div className="hub-text-box">
                <span className="hub-label">{item.label}</span>
                <span className="hub-desc">{item.desc}</span>
              </div>
              <span className="chevron">›</span>
            </div>
          ))}
        </div>
        
        <button className="mobile-home-btn" onClick={() => navigate('/')}>
          Return to Shopping
        </button>
      </div>
    </div>
  );
};

export default NavigationHub;