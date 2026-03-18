import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminTraining.css';

const AdminTraining = () => {
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    subHeader: '', 
    description: '' 
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE = "https://firstclient-backend.onrender.com/api"; 
  const token = localStorage.getItem('token');

  // Load the list as soon as the admin opens this page
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/training`);
      setPublishedPosts(res.data);
    } catch (err) {
      console.error("Could not load the list");
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 6000);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return showMsg('error', 'Please pick some photos or videos first.');

    setLoading(true);

    // ⭐ Sorting: Keeps pictures at the top, videos at the bottom for the customer
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
      // Sending data to the server
      await axios.post(`${API_BASE}/admin/training`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      showMsg('success', 'Post uploaded! Your students can see it now.');
      
      // Clear the form for the next post
      setFormData({ title: '', subHeader: '', description: '' });
      setSelectedFiles([]);
      e.target.reset();
      fetchPosts(); // Update the list below
    } catch (err) {
      showMsg('error', 'Upload failed. The files might be too large.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to permanently remove this post?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/training/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showMsg('success', 'Post removed.');
      fetchPosts();
    } catch (err) {
      showMsg('error', 'Could not delete.');
    }
  };

  return (
    <div className="admin-training-container">
      <header className="admin-header">
        <h2>🎓 Training School Manager</h2>
        <p>Use this page to post new photos and videos to your pastry school.</p>
      </header>

      {message.text && (
        <div className={`alert ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* --- SECTION 1: CREATE A NEW POST --- */}
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
            <label>Enter your writeup</label>
            <textarea 
              placeholder="Body Content" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required 
            />
          </div>

          <div className="form-group">
            <label>Attach Photos & Videos</label>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              accept="video/*,image/*" 
            />
            <p className="helper-text">Pictures will always show up before videos on the school page.</p>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <div className="loader-container">
                <span className="spinner"></span>
                <span>Uploading... Please wait</span>
              </div>
            ) : "Post to School Page"}
          </button>
        </form>
      </section>

      {/* --- SECTION 2: VIEW WHAT YOU HAVE POSTED --- */}
      <section className="posts-list">
        <h3>Current School Posts</h3>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Post Title</th>
                <th>Topic</th>
                <th>Media Info</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {publishedPosts.length > 0 ? (
                publishedPosts.map(post => (
                  <tr key={post.id}>
                    <td><strong>{post.title}</strong></td>
                    <td>{post.subHeader}</td>
                    <td>{post.media?.length || 0} Files Attached</td>
                    <td>
                      <button onClick={() => handleDelete(post.id)} className="delete-btn">Remove Post</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{textAlign:'center', padding:'20px'}}>You haven't posted anything to the school yet.</td>
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
