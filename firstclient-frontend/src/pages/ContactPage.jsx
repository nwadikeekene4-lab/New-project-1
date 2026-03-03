import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import API from '../api';
import './ContactPage.css';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({
    phone: '08168827837',
    email: 'gbengababs36@gmail.com',
    address: 'Lagos, Nigeria'
  });

  useEffect(() => {
    API.get('/cms/contact_info').then(res => {
      if (res.data && res.data.email) setInfo(res.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Direct post to our new message route
      await API.post('/contact', formData);
      alert(`Thank you, ${formData.name}! Your message has been received.`);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      alert("Connection Error: Please ensure your backend is active.");
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
                <div className="info-item"><FaMapMarkerAlt /> {info.address}</div>
                <div className="info-item"><FaPhoneAlt /> {info.phone}</div>
                <div className="info-item"><FaEnvelope /> {info.email}</div>
              </div>
            </div>
            <div className="contact-form-container">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="input-group-large">
                  <input placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="input-group-large">
                  <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="input-group-large">
                  <textarea rows="6" placeholder="Write your message here..." required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                </div>
                <button type="submit" className="send-btn-large" disabled={loading}>
                  {loading ? "SENDING..." : "SEND MESSAGE"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
