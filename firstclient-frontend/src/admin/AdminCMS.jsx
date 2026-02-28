import React, { useState, useEffect } from 'react';
import API from '../api';
import './AdminCMS.css'; 

const AdminCMS = () => {
  const [activeTab, setActiveTab] = useState('pages'); 
  const [aboutData, setAboutData] = useState({ title: '', legacy: '', bakery: '' });

  useEffect(() => {
    if (activeTab === 'pages') {
      API.get('/cms/about').then(res => {
        if (res.data) setAboutData(res.data);
      });
    }
  }, [activeTab]);

  const handleSaveAbout = async () => {
    try {
      await API.post('/cms/update', { page_name: 'about', data: aboutData });
      alert("Changes published to live site!");
    } catch (err) { alert("Error saving changes"); }
  };

  return (
    <div className="essence-cms-container">
      <div className="cms-tab-bar">
        <button onClick={() => setActiveTab('pages')} className={activeTab === 'pages' ? 'active' : ''}>📝 Pages</button>
        <button onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'active' : ''}>📥 Inbox</button>
      </div>

      <main className="cms-main-content">
        {activeTab === 'pages' && (
          <div className="cms-section-card">
            <h3>Edit About Page</h3>
            <div className="form-group">
              <label>Hero Title</label>
              <input value={aboutData.title} onChange={(e) => setAboutData({...aboutData, title: e.target.value})} />
              
              <label>Our Legacy Text</label>
              <textarea rows="5" value={aboutData.legacy} onChange={(e) => setAboutData({...aboutData, legacy: e.target.value})} />
              
              <button className="essence-save-btn" onClick={handleSaveAbout}>Update Website</button>
            </div>
          </div>
        )}
        {activeTab === 'messages' && <div className="cms-section-card"><h3>Customer Inbox</h3><p>No messages yet.</p></div>}
      </main>
    </div>
  );
};

export default AdminCMS;
