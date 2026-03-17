import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminTraining.css';

const AdminTraining = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', order: 0 });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE = "https://your-render-url.onrender.com/api"; // ⚠️ Replace with your actual URL
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
    setLoading(true);
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('order', formData.order);
    
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
      showMsg('success', 'Training session uploaded successfully!');
      setFormData({ title: '', description: '', order: 0 });
      setSelectedFiles([]);
      fetchSessions();
    } catch (err) {
      showMsg('error', 'Upload failed. Check file sizes or token.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/training/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showMsg('success', 'Session deleted');
      fetchSessions();
    } catch (err) {
      showMsg('error', 'Delete failed');
    }
  };

  return (
    <div className="admin-training-container">
      <header className="admin-header">
        <h2>🎓 Training School Manager</h2>
        <p>Upload your pastry masterclasses and tutorials</p>
      </header>

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <section className="upload-section">
        <form onSubmit={handleSubmit} className="training-form">
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Session Title (e.g. Croissant Mastery)" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <textarea 
              placeholder="Description & Recipe Details" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required 
            />
          </div>
          <div className="form-row">
            <input 
              type="number" 
              placeholder="Display Order" 
              value={formData.order}
              onChange={(e) => setFormData({...formData, order: e.target.value})}
            />
            <input type="file" multiple onChange={handleFileChange} accept="video/*,image/*" />
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "🚀 Uploading to Cloudinary..." : "Create Training Session"}
          </button>
        </form>
      </section>

      <section className="sessions-list">
        <h3>Existing Sessions ({sessions.length})</h3>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Title</th>
                <th>Media</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td>{s.order}</td>
                  <td><strong>{s.title}</strong></td>
                  <td>{s.media?.length || 0} items</td>
                  <td>
                    <button onClick={() => handleDelete(s.id)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminTraining;
