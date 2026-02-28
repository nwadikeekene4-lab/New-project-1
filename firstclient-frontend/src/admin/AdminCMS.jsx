import React, { useState, useEffect } from 'react';
import API from '../api';
import './AdminCMS.css'; 

const AdminCMS = () => {
  const [activeTab, setActiveTab] = useState('pages'); 
  const [aboutData, setAboutData] = useState({ title: '', legacy: '', image: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      alert("🚀 Website Updated Successfully!");
      setIsEditing(false);
      setAboutData({ title: '', legacy: '', image: '' }); // Clears text boxes
      fetchContent(); // Reloads live card from DB
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
            <div className="preview-header-main">
               <h3>About Page Settings</h3>
               {!isEditing && <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>Edit Page Content</button>}
            </div>
            
            {!isEditing ? (
              <div className="cms-live-preview">
                <div className="preview-body">
                  <div className="preview-item">
                    <label className="preview-label">Live Title</label>
                    <h4 className="preview-title-text">{aboutData.title}</h4>
                  </div>
                  
                  <div className="preview-item">
                    <label className="preview-label">Live Image</label>
                    {aboutData.image ? <img src={aboutData.image} alt="Live" className="cms-preview-img" /> : <p>No image set</p>}
                  </div>
                  
                  <div className="preview-item">
                    <label className="preview-label">Live Write-up</label>
                    <p className="preview-body-text">{aboutData.legacy}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>Update Title</label>
                <input value={aboutData.title} onChange={(e) => setAboutData({...aboutData, title: e.target.value})} />
                
                <label>Update Image</label>
                <input type="file" onChange={async (e) => {
                  const formData = new FormData();
                  formData.append('image', e.target.files[0]);
                  setUploading(true);
                  try {
                    const res = await API.post('/admin/products', formData);
                    setAboutData({...aboutData, image: res.data.image});
                  } finally { setUploading(false); }
                }} />
                {uploading && <p className="uploading-text">Uploading image...</p>}
                
                <label>Update Content</label>
                <textarea rows="10" value={aboutData.legacy} onChange={(e) => setAboutData({...aboutData, legacy: e.target.value})} />
                
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
