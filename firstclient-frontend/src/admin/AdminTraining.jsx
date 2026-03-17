import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminTraining.css';

const AdminTraining = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', order: 0 });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // ✅ INTEGRATED: Your specific Render Backend URL
  const API_BASE = "https://firstclient-backend.onrender.com/api"; 
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/training`);
      setSessions(res.data);
    } catch (err) {
      showMsg('error', 'Failed to load training sessions');
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (selectedFiles.length === 0) {
      return showMsg('error', 'Please select at least one video or image.');
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('order', formData.order);
    
    // Append all selected media files
    for (let i = 0; i < selectedFiles.length; i++) {
      data.append('files', selectedFiles[i]);
    }

    try {
      await axios.post(`${API_BASE}/admin/training`, data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      showMsg('success', 'Masterclass uploaded successfully to Cloudinary!');
      
      // ✅ Reset form states
      setFormData({ title: '', description: '', order: 0 });
      setSelectedFiles([]);
      
      // ✅ Reset the actual file input in the DOM
      e.target.reset(); 
      
      // Refresh the table list
      fetchSessions();
    } catch (err) {
      const errorResponse = err.response?.data?.error || 'Upload failed. Check file sizes.';
      showMsg('error', errorResponse);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session and all its media?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/training/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showMsg('success', 'Session deleted from database');
      fetchSessions();
    } catch (err) {
      showMsg('error', 'Delete failed. Session might already be gone.');
    }
  };

  return (
    <div className="admin-training-container">
      <header className="admin-header">
        <h2>🎓 Training School Manager</h2>
        <p>Manage your professional pastry masterclasses</p>
      </header>

      {message.text && (
        <div className={`alert ${message.type}`}>
          {message.type === 'success' ? '✅ ' : '❌ '} {message.text}
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
          <div className="form-row">
            <div className="input-box">
               <label>Display Order</label>
               <input 
                type="number" 
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: e.target.value})}
              />
            </div>
            <div className="input-box">
               <label>Select Media (Videos/Images)</label>
               <input 
                type="file" 
                multiple 
                onChange={handleFileChange} 
                accept="video/*,image/*" 
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "🚀 Processing Media & Uploading..." : "Publish Masterclass"}
          </button>
        </form>
      </section>

      <section className="sessions-list">
        <h3>Live Masterclasses ({sessions.length})</h3>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sort Order</th>
                <th>Session Title</th>
                <th>Media Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length > 0 ? (
                sessions.map(s => (
                  <tr key={s.id}>
                    <td>{s.order}</td>
                    <td><strong>{s.title}</strong></td>
                    <td>{s.media?.length || 0} items</td>
                    <td>
                      <button onClick={() => handleDelete(s.id)} className="delete-btn">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    No sessions found. Start by uploading one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminTraining;
