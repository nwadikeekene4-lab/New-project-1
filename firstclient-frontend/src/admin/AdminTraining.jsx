import React, { useState } from 'react';
import axios from 'axios';
import './AdminTraining.css';

const AdminTraining = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

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
    if (selectedFiles.length === 0) return showMsg('error', 'Please select media files.');

    setLoading(true);

    // ⭐ Sorting: Images first, then Videos
    const sortedFiles = [...selectedFiles].sort((a, b) => {
      const aImg = a.type.startsWith('image');
      const bImg = b.type.startsWith('image');
      return aImg === bImg ? 0 : aImg ? -1 : 1;
    });

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    sortedFiles.forEach(file => data.append('files', file));

    try {
      await axios.post(`${API_BASE}/admin/training`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showMsg('success', 'Masterclass published successfully!');
      setFormData({ title: '', description: '' });
      setSelectedFiles([]);
      e.target.reset();
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Upload failed. Check file sizes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-training-container">
      <header className="admin-header">
        <h2>🎓 Training School Manager</h2>
        <p>Upload your professional pastry masterclasses</p>
      </header>

      {message.text && (
        <div className={`alert ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      <section className="upload-section">
        <form onSubmit={handleSubmit} className="training-form">
          <div className="form-group">
            <label>Masterclass Title</label>
            <input 
              type="text" 
              placeholder="e.g., The Ultimate Croissant Guide" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>

          <div className="form-group">
            <label>Description & Recipe Notes</label>
            <textarea 
              placeholder="Provide details about what students will learn..." 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required 
            />
          </div>

          <div className="form-group">
            <label>Select Media (Videos & Images)</label>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              accept="video/*,image/*" 
            />
            <p style={{fontSize: '11px', color: '#888', marginTop: '5px'}}>
              {selectedFiles.length > 0 ? `Selected: ${selectedFiles.length} files` : "Images will automatically appear before videos."}
            </p>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <div className="loader-container">
                <span className="spinner"></span>
                <span>Publishing to School...</span>
              </div>
            ) : "Publish Masterclass"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminTraining;
