import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminTraining.css';

const AdminTraining = () => {
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', subHeader: '', description: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '', technicalDetails: '' });

  const API_BASE = "https://firstclient-backend.onrender.com/api"; 
  const token = localStorage.getItem('token');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/training`);
      setPublishedPosts(res.data);
    } catch (err) { console.error("Load failed"); }
  };

  const showMsg = (type, text, details = '') => {
    setMessage({ type, text, technicalDetails: details });
    // We won't hide the message automatically if it's an error, 
    // so you have time to read/screenshot it on your phone.
    if (type === 'success') {
      setTimeout(() => setMessage({ type: '', text: '', technicalDetails: '' }), 5000);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return showMsg('error', 'No files selected.');

    setLoading(true);

    // Sorting Logic: Pictures first, then Videos
    const sortedFiles = [...selectedFiles].sort((a, b) => {
      const aImg = a.type.startsWith('image');
      const bImg = b.type.startsWith('image');
      return aImg === bImg ? 0 : aImg ? -1 : 1;
    });

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subHeader', formData.subHeader);
    data.append('description', formData.description);
    sortedFiles.forEach(file => data.append('files', file));

    try {
      await axios.post(`${API_BASE}/admin/training`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      showMsg('success', 'Upload Successful!');
      setFormData({ title: '', subHeader: '', description: '' });
      setSelectedFiles([]);
      e.target.reset();
      fetchPosts();
    } catch (err) {
      // 🛠️ DETECT THE SPECIFIC FAULT
      const status = err.response?.status; // e.g. 413, 500, 404
      const serverMsg = err.response?.data?.error || err.response?.data?.message || "Unknown Server Error";
      const rawData = JSON.stringify(err.response?.data);

      let finalTitle = "Upload Failed";
      let finalDetail = `Status: ${status} | Message: ${serverMsg} | Raw: ${rawData}`;

      if (status === 413) {
        finalTitle = "FILE TOO LARGE (Error 413)";
        finalDetail = "The server settings are blocking this file. You MUST increase the 'limit' in your Backend server.js file.";
      } else if (status === 500) {
        finalTitle = "SERVER CRASHED (Error 500)";
        finalDetail = `The backend code broke while trying to process the file. Message: ${serverMsg}`;
      } else if (!err.response) {
        finalTitle = "NETWORK TIMEOUT";
        finalDetail = "The connection took too long. This happens if the video is high-quality and your internet or Render is slow.";
      }

      showMsg('error', finalTitle, finalDetail);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this post?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/training/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showMsg('success', 'Removed.');
      fetchPosts();
    } catch (err) { showMsg('error', 'Delete failed.'); }
  };

  return (
    <div className="admin-training-container">
      <header className="admin-header">
        <h2>🎓 Training School Manager</h2>
        <p>Post photos and videos to the school wall.</p>
      </header>

      {message.text && (
        <div className={`alert ${message.type}`} style={{ textAlign: 'left', wordBreak: 'break-word' }}>
          <strong>{message.type === 'success' ? '✅' : '❌'} {message.text}</strong>
          {message.technicalDetails && (
            <div style={{ marginTop: '10px', fontSize: '11px', background: 'rgba(0,0,0,0.05)', padding: '10px', borderRadius: '5px' }}>
              <code>{message.technicalDetails}</code>
            </div>
          )}
          {message.type === 'error' && (
            <button onClick={() => setMessage({type:'', text:''})} style={{marginTop: '10px', display: 'block', padding: '5px', fontSize: '10px'}}>Dismiss</button>
          )}
        </div>
      )}

      {/* --- FORM SECTION --- */}
      <section className="upload-section">
        <form onSubmit={handleSubmit} className="training-form">
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              placeholder="Content Title" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Sub Heading</label>
            <input 
              type="text" 
              placeholder="Sub Topic" 
              value={formData.subHeader}
              onChange={(e) => setFormData({...formData, subHeader: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Writeup</label>
            <textarea 
              placeholder="Body Content" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Photos & Videos</label>
            <input type="file" multiple onChange={handleFileChange} accept="video/*,image/*" />
            <p className="helper-text">Pictures will appear before videos.</p>
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <div className="loader-container">
                <span className="spinner"></span>
                <span>Uploading... (Don't close)</span>
              </div>
            ) : "Post to School Page"}
          </button>
        </form>
      </section>

      {/* --- LIST SECTION --- */}
      <section className="posts-list">
        <h3>Current School Posts</h3>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Media Info</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {publishedPosts.map(post => (
                <tr key={post.id}>
                  <td><strong>{post.title}</strong><br/><small>{post.subHeader}</small></td>
                  <td>{post.media?.length || 0} Files</td>
                  <td><button onClick={() => handleDelete(post.id)} className="delete-btn">Remove</button></td>
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
