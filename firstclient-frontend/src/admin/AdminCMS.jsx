import React, { useState, useEffect } from 'react';
import API from '../api';
import './AdminCMS.css'; 

const AdminCMS = () => {
  const [activeTab, setActiveTab] = useState('pages'); 
  const [aboutData, setAboutData] = useState({ title: '', legacy: '', image: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch data when the page loads
  const fetchContent = () => {
    API.get('/cms/about').then(res => {
      if (res.data) {
        setAboutData({
          title: res.data.title || 'Essence Creations',
          legacy: res.data.legacy || res.data.description || '',
          image: res.data.image || ''
        });
      }
    });
  };

  useEffect(() => {
    if (activeTab === 'pages') fetchContent();
  }, [activeTab]);

  const handleSaveAbout = async () => {
    try {
      await API.post('/cms/update', { page_name: 'about', data: aboutData });
      alert("🚀 Website Updated!");
      setIsEditing(false); // Close the editor and show the updated card
      fetchContent(); // Refresh the data
    } catch (err) { alert("Error saving changes"); }
  };

  return (
    <div className="essence-cms-container">
      <div className="cms-tab-bar">
        <button onClick={() => {setActiveTab('pages'); setIsEditing(false);}} className={activeTab === 'pages' ? 'active' : ''}>📝 Pages</button>
        <button onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'active' : ''}>📥 Inbox</button>
      </div>

      <main className="cms-main-content">
        {activeTab === 'pages' && (
          <div className="cms-section-card">
            <h3>About Page Management</h3>
            
            {!isEditing ? (
              /* --- LIVE VIEW MODE --- */
              <div className="cms-live-preview">
                <div className="preview-header">
                  <span>Current Live Content</span>
                  <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>Edit Content</button>
                </div>
                <div className="preview-body">
                  {aboutData.image && <img src={aboutData.image} alt="Live" className="cms-preview-img" />}
                  <h4>{aboutData.title}</h4>
                  <p>{aboutData.legacy}</p>
                </div>
              </div>
            ) : (
              /* --- EDIT MODE --- */
              <div className="form-group">
                <label>Hero Title</label>
                <input value={aboutData.title} onChange={(e) => setAboutData({...aboutData, title: e.target.value})} />
                
                <label>About Text</label>
                <textarea rows="8" value={aboutData.legacy} onChange={(e) => setAboutData({...aboutData, legacy: e.target.value})} />
                
                <label>Change Image</label>
                <input type="file" onChange={async (e) => {
                  const formData = new FormData();
                  formData.append('image', e.target.files[0]);
                  setUploading(true);
                  const res = await API.post('/admin/products', formData);
                  setAboutData({...aboutData, image: res.data.image});
                  setUploading(false);
                }} />
                
                <div className="edit-actions">
                  <button className="essence-save-btn" onClick={handleSaveAbout}>Publish Changes</button>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'messages' && <div className="cms-section-card"><h3>Customer Inbox</h3><p>No messages yet.</p></div>}
      </main>
    </div>
  );
};

export default AdminCMS;
