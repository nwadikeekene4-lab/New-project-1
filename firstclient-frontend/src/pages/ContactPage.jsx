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
    email: 'gbengababs36@gmail.com',
    phone: '08168827837',
    location: 'Lagos, Nigeria'
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
      const response = await API.post('/contact', formData);
      alert(`Success! Message sent to ${info.email}`);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      // Professional phone debugging: This shows the exact reason in an alert box
      const errorMsg = err.response 
        ? `Server Error (${err.response.status}): ${JSON.stringify(err.response.data)}` 
        : `Connection Error: ${err.message}. (Check if API URL is correct: ${API.defaults.baseURL})`;
      
      alert(errorMsg);
      console.error(err);
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
                <div className="info-item"><div className="info-icon"><FaMapMarkerAlt /></div> <div><h4>Address</h4><p>{info.location}</p></div></div>
                <div className="info-item"><div className="info-icon"><FaPhoneAlt /></div> <div><h4>Phone</h4><p>{info.phone}</p></div></div>
                <div className="info-item"><div className="info-icon"><FaEnvelope /></div> <div><h4>Email</h4><p>{info.email}</p></div></div>
              </div>
            </div>
            <div className="contact-form-container">
              <form onSubmit={handleSubmit} className="contact-form">
                <input placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <textarea rows="6" placeholder="How can we help you today?" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                <button type="submit" className="send-btn" disabled={loading}>
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



