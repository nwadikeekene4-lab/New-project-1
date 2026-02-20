import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationHub.css';

const NavigationHub = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Our Heritage (About)', path: '/about', icon: '🏛️' },
    { label: 'Customer Reviews', path: '/reviews', icon: '⭐' },
    { label: 'Get In Touch', path: '/contact', icon: '📞' },
    { label: 'Social Media', path: '/socials', icon: '📱' }
  ];

  return (
    <div className="hub-wrapper">
      {/* The background is now handled entirely by CSS for a smoother experience */}
      <div className="hub-container">
        <button className="back-btn" onClick={() => navigate('/')}>← Welcome</button>
        
        
        <h1 className="hub-title">Explore Heritage Hub</h1>
        <p className="hub-subtitle">What would you like to know today?</p>

        <div className="hub-grid">
          {menuItems.map((item, index) => (
            <button 
              key={index} 
              className="hub-card" 
              onClick={() => navigate(item.path)}
            >
              <span className="hub-icon">{item.icon}</span>
              <span className="hub-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationHub;