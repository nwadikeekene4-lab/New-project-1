import React, { useState, useEffect } from 'react';
import API from '../api';
import './AdminCMS.css'; 

const AdminCMS = () => {
  const [activeTab, setActiveTab] = useState('pages'); 
  const [aboutData, setAboutData] = useState({ title: '', description: '', image: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchContent = () => {
    API.get('/cms/about').then(res => {
      if (res.data) {
        setAboutData({
          title: res.data.title || '',
          description: res.data.description || '',
          image: res.data.image || '' 
        });
      }
    });
  };
  
  useEffect(() => {
    if (activeTab === 'pages') fetchContent();
  }, [activeTab]);

  const handleSaveAbout = async () => {
    if (!aboutData.image && !window.confirm("No image selected. Save anyway?")) return;

    try {
      await API.post('/cms/update', { page_name: 'about', data: aboutData });
      alert("🚀 Website Updated Successfully!");
      setIsEditing(false);
      fetchContent(); 
    } catch (err) { 
      alert("Error saving changes"); 
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    // Explicitly naming the file helps mobile OS (iOS/Android) pass it correctly
    const fileName = file.name || `cms-${Date.now()}.jpg`;
    formData.append('image', file, fileName);
    
    setUploading(true);
    try {
      // Using the NEW dedicated upload route we added to routes.js
      const res = await API.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = res.data.image;
      
      if (imageUrl) {
        setAboutData(prev => ({ ...prev, image: imageUrl }));
      } else {
        alert("Upload failed: Server did not return the image link.");
      }
    } catch (err) {
      alert("Upload failed. Try a smaller image or check your connection.");
    } finally {
      setUploading(false);
    }
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
              <h3>About Page Live Control</h3>
              {!isEditing && <button className="cms-edit-btn" onClick={() => setIsEditing(true)}>Edit Content</button>}
            </div>
            
            {!isEditing ? (
              <div className="cms-master-preview">
                <p className="cms-label">Live Title</p>
                <h4>{aboutData.title || "No Title Set"}</h4>
                
                <p className="cms-label">Live Image</p>
                {aboutData.image ? (
                  <img src={aboutData.image} alt="Live" className="cms-preview-img" />
                ) : (
                  <div className="no-image-placeholder">No Image Found in Database</div>
                )}
                
                <p className="cms-label">Live Write-up</p>
                <p className="cms-text-preview">{aboutData.description}</p>
              </div>
            ) : (
              <div className="form-group">
                <label>Update Title</label>
                <input value={aboutData.title} onChange={(e) => setAboutData({...aboutData, title: e.target.value})} />
                
                <label>Update Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {uploading && <p className="upload-notice">⏳ Uploading...</p>}
                
                {aboutData.image && (
                    <div className="image-preview-container" style={{marginTop: '15px', border: '1px dashed #ccc', padding: '10px'}}>
                        <p className="cms-label" style={{color: 'green'}}>✅ Ready to Save:</p>
                        <img src={aboutData.image} alt="Preview" className="cms-preview-img" style={{maxHeight: '150px'}} />
                    </div>
                )}
                
                <label style={{marginTop: '20px'}}>Update Write-up</label>
                <textarea rows="8" value={aboutData.description} onChange={(e) => setAboutData({...aboutData, description: e.target.value})} />
                
                <div className="edit-actions">
                  <button className="essence-save-btn" onClick={handleSaveAbout} disabled={uploading}>Update Website</button>
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
