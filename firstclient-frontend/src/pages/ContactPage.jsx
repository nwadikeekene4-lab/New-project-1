import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import API from '../api';
import './ContactPage.css';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/contact', formData);
      alert(`Thank you, ${formData.name}! Your message has been sent.`);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      alert("Error sending message. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-wrapper">
      <div className="contact-container">
        <div className="nav-section">
          <button className="nav-back-btn" onClick={() => navigate('/hub')}>← Back to Hub</button>
        </div>
        <div className="contact-main-content">
          <div className="contact-grid-box">
            <div className="contact-info">
              <h1 className="contact-title">Get In Touch</h1>
              <div className="info-details">
                <div className="info-item"><span><FaMapMarkerAlt /></span> Lagos, Nigeria</div>
                <div className="info-item"><span><FaPhoneAlt /></span> 08065432123</div>
                <div className="info-item"><span><FaEnvelope /></span> hello@heritagehub.com</div>
              </div>
            </div>
            <div className="contact-form-container">
              <form onSubmit={handleSubmit} className="contact-form">
                <input placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <textarea rows="4" placeholder="Message" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                <button type="submit" className="send-btn" disabled={loading}>{loading ? "Sending..." : "Send Message"}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
