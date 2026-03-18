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

  // 🛡️ MATCHING YOUR LOGIN NAME: 'adminToken'
  const getCleanToken = () => {
    const rawToken = localStorage.getItem('adminToken'); 
    if (!rawToken) return null;
    // Clean any accidental quotes from phone/browser formatting
    return rawToken.replace(/['"]+/g, '').trim();
  };

  const token = getCleanToken();

  useEffect(() => { 
    fetchPosts(); 
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/training`);
      setPublishedPosts(res.data);
    } catch (err) { 
      console.error("Load failed"); 
    }
  };

  const showMsg = (type, text, details = '') => {
    setMessage({ type, text, technicalDetails: details });
    if (type === 'success') {
      setTimeout(() => setMessage({ type: '', text: '', technicalDetails: '' }), 5000);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check token before starting
    if (!token) {
        return showMsg('error', 'Session missing.', 'The app could not find "adminToken" in your storage. Please log in again.');
    }

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
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      showMsg('success', 'Upload Successful!');
      setFormData({ title: '', subHeader: '', description: '' });
      setSelectedFiles([]);
      if (e.target) e.target.reset();
      fetchPosts();
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.error || err.response?.data?.message || "Server Communication Error";
      
      let finalTitle = "Upload Failed";
      let finalDetail = `Status: ${status} | Message: ${serverMsg}`;

      if (status === 401 || status === 403) {
        finalTitle = "AUTHENTICATION FAILED";
        finalDetail = "Your login session is invalid or expired. Try logging out and back in.";
      } else if (status === 413) {
        finalTitle = "FILE TOO LARGE";
        finalDetail = "The video file is too big for the current server limits.";
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
    } catch (err) { 
      showMsg('error', 'Delete failed.'); 
    }
  };

  return (
    <div className="admin-training-container">
      <header className="admin-header">
        <h2>🎓 Training School Manager</h2>
        <p>Post photos and videos to the school wall.</p>
      </header>

      {message.text && (
        <div className={`alert ${message.type}`} style={{ textAlign: 'left', wordBreak: 'break-word', marginBottom: '20px' }}>
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
            <p className="helper-text">Pictures appear before videos.</p>
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Uploading... Please wait" : "Post to School Page"}
          </button>
        </form>
      </section>

      <section className="posts-list">
        <h3>Current School Posts</h3>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
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
                  {/* Accessing the trainingMedia alias from your backend */}
                  <td>{post.trainingMedia?.length || 0} Files</td>
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
