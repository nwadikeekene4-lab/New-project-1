import React, { useState } from 'react';
import axios from 'axios';
import './AdminTraining.css';

const AdminTraining = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // ✅ Your Render Backend URL
  const API_BASE = "https://firstclient-backend.onrender.com/api"; 
  const token = localStorage.getItem('token');

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      return showMsg('error', 'Please select at least one media file.');
    }

    setLoading(true);
    
    // ⭐ LOGIC: Sort files so Images come before Videos
    const sortedFiles = [...selectedFiles].sort((a, b) => {
      const aIsImage = a.type.startsWith('image');
      const bIsImage = b.type.startsWith('image');
      if (aIsImage && !bIsImage) return -1;
      if (!aIsImage && bIsImage) return 1;
      return 0;
    });

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    
    // Append sorted files (Images first)
    sortedFiles.forEach((file) => {
      data.append('files', file);
    });

    try {
      // ⭐ FIX: Removed manual Content-Type to prevent "Infinite Spin/Size" errors
      await axios.post(`${API_BASE}/admin/training`, data, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      showMsg('success', 'Masterclass published! Images and videos are now live.');
      
      // Reset
      setFormData({ title: '', description: '' });
      setSelectedFiles([]);
      e.target.reset(); 
      
    } catch (err) {
      console.error("Upload Error:", err);
      const errorResponse = err.response?.data?.error || 'Upload failed. Try smaller files or check connection.';
      showMsg('error', errorResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-training-container">
      <header className="admin-header">
        <div className="header-badge">Admin Portal</div>
        <h2>🎓 Training School Manager</h2>
        <p>Create and publish new pastry masterclasses for your students.</p>
      </header>

      {message.text && (
        <div className={`alert-toast ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      <section className="upload-section">
        <form onSubmit={handleSubmit} className="training-form">
          <div className="form-group">
            <label>Masterclass Title</label>
            <input 
              type="text" 
              placeholder="e.g., Croissant Lamination Masterclass" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>

          <div className="form-group">
            <label>Recipe Details & Instructions</label>
            <textarea 
              placeholder="Enter the full recipe and lesson details here..." 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required 
            />
          </div>

          <div className="form-group">
            <label>Upload Media</label>
            <div className="file-drop-zone">
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange} 
                accept="video/*,image/*" 
                id="file-upload"
              />
              <label htmlFor="file-upload" className="custom-file-label">
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} files selected (Images will be sorted first)` 
                  : "Click to browse Videos & Images"}
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`submit-btn ${loading ? 'loading' : ''}`}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Publishing to School...
              </>
            ) : "Publish Masterclass"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminTraining;
