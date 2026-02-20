import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import './ContactPage.css';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you, ${formData.name}! Your message has been sent to Heritage Hub.`);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-wrapper">
      <div className="contact-container">
        <button className="back-btn" onClick={() => navigate('/hub')}>
          ← Back to Hub
        </button>

        <div className="contact-glass-box">
          {/* Left Side: Contact Info */}
          <div className="contact-info">
            <h1 className="contact-title">Get In Touch</h1>
            <p className="contact-desc">
              Whether you're looking for daily provisions or planning a large event, 
              the Heritage Hub team is here to help.
            </p>

            <div className="info-details">
              <div className="info-item">
                <span className="info-icon"><FaMapMarkerAlt /></span>
                <div>
                  <h4>Location</h4>
                  <p>123 Heritage Way, Lagos, Nigeria</p>
                </div>
              </div>
              
              <a href="tel:08065432123" className="info-item link-item">
                <span className="info-icon"><FaPhoneAlt /></span>
                <div>
                  <h4>Phone</h4>
                  <p>08065432123</p>
                </div>
              </a>

              <a href="mailto:hello@heritagehub.com" className="info-item link-item">
                <span className="info-icon"><FaEnvelope /></span>
                <div>
                  <h4>Email</h4>
                  <p>hello@heritagehub.com</p>
                </div>
              </a>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="contact-form-container">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="email@example.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Your Message</label>
                <textarea 
                  rows="4" 
                  placeholder="How can we help you today?" 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="send-btn">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;