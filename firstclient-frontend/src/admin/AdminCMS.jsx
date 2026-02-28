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
          title: res.data.title || '',
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
      setAboutData({ title: '', legacy: '', image: '' }); // Clear boxes
      fetchContent(); // Show updated Master Card
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
            <div className="cms-card-header">
              <h3>About Page Preview</h3>
              {!isEditing && <button className="cms-edit-btn" onClick={() => setIsEditing(true)}>Edit Page</button>}
            </div>
            
            {!isEditing ? (
              <div className="cms-master-preview">
                <p className="cms-label">Current Title</p>
                <h4>{aboutData.title}</h4>
                
                <p className="cms-label">Current Image</p>
                {aboutData.image ? <img src={aboutData.image} alt="Live" className="cms-preview-img" /> : <p>No Image Uploaded</p>}
                
                <p className="cms-label">Current Content</p>
                <p className="cms-text-preview">{aboutData.legacy}</p>
              </div>
            ) : (
              <div className="form-group">
                <label>Hero Title</label>
                <input value={aboutData.title} onChange={(e) => setAboutData({...aboutData, title: e.target.value})} />
                
                <label>About Image</label>
                <input type="file" onChange={async (e) => {
                  const formData = new FormData();
                  formData.append('image', e.target.files[0]);
                  setUploading(true);
                  const res = await API.post('/admin/products', formData);
                  setAboutData({...aboutData, image: res.data.image});
                  setUploading(false);
                }} />
                {uploading && <p className="upload-notice">Uploading image...</p>}
                
                <label>About Write-up</label>
                <textarea rows="8" value={aboutData.legacy} onChange={(e) => setAboutData({...aboutData, legacy: e.target.value})} />
                
                <div className="edit-actions">
                  <button className="essence-save-btn" onClick={handleSaveAbout}>Update Website</button>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCMS;
