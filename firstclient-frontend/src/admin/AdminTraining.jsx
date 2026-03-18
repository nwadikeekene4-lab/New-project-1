import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminTraining.css';

const AdminTraining = () => {
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', subHeader: '', description: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE = "https://firstclient-backend.onrender.com/api"; 

  // 🛡️ Clean Token Retrieval
  const getCleanToken = () => {
    const rawToken = localStorage.getItem('adminToken'); 
    if (!rawToken) return null;
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

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Session missing. Please log in again.");
    
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subHeader', formData.subHeader);
    data.append('description', formData.description);
    
    // Sort files: Images first
    const sortedFiles = [...selectedFiles].sort((a, b) => {
      const aImg = a.type.startsWith('image');
      const bImg = b.type.startsWith('image');
      return aImg === bImg ? 0 : aImg ? -1 : 1;
    });
    sortedFiles.forEach(file => data.append('files', file));

    try {
      await axios.post(`${API_BASE}/admin/training`, data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Article Published Successfully! ✅");
      setFormData({ title: '', subHeader: '', description: '' });
      setSelectedFiles([]);
      e.target.reset();
      fetchPosts();
    } catch (err) {
      alert("Upload failed. File might be too large.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this article?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/training/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPublishedPosts(publishedPosts.filter(p => p.id !== id));
    } catch (err) { 
      alert("Delete failed."); 
    }
  };

  return (
    <div className="admin-training-page">
      <div className="content-container">
        
        {/* --- HEADER --- */}
        <header className="page-header">
          <Link to="/admin" className="back-link">← Dashboard</Link>
          <h1>Training School Feed</h1>
          <p>Create and manage educational articles for the school wall.</p>
        </header>

        {/* --- PUBLISHING FORM --- */}
        <section className="form-section">
          <form className="pro-form" onSubmit={handleSubmit}>
            <h3>Create New Article</h3>
            <div className="input-group">
              <label>Main Title</label>
              <input 
                type="text" 
                placeholder="e.g. Introduction to Design" 
                value={formData.title} 
                onChange={(e)=>setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Category / Sub-header</label>
              <input 
                type="text" 
                placeholder="e.g. Module 1" 
                value={formData.subHeader} 
                onChange={(e)=>setFormData({...formData, subHeader: e.target.value})} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Article Content</label>
              <textarea 
                placeholder="Write the full write-up here..." 
                value={formData.description} 
                onChange={(e)=>setFormData({...formData, description: e.target.value})} 
                required 
              />
            </div>
            <div className="form-footer">
              <div className="file-input-wrapper">
                <input type="file" multiple onChange={handleFileChange} accept="video/*,image/*" required />
                <p className="helper-text">Images & Videos supported</p>
              </div>
              <button type="submit" className="publish-btn" disabled={loading}>
                {loading ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        </section>

        {/* --- FEED SECTION (BLOG STYLE) --- */}
        <main className="feed-section">
          <h2 className="section-title">Published Content</h2>
          {publishedPosts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-media">
                {post.trainingMedia?.[0]?.url.match(/\.(mp4|mov|webm)$/) ? (
                  <video src={post.trainingMedia[0].url} className="media-element" muted />
                ) : (
                  <img src={post.trainingMedia?.[0]?.url || "https://placehold.co/800x450"} alt="" className="media-element" />
                )}
                {post.trainingMedia?.length > 1 && (
                  <div className="media-overlay">+{post.trainingMedia.length - 1} More Media</div>
                )}
              </div>
              
              <div className="post-body">
                <span className="post-badge">{post.subHeader}</span>
                <h2 className="post-headline">{post.title}</h2>
                <p className="post-text">{post.description}</p>
                
                <div className="post-actions">
                  <button className="btn-danger" onClick={() => handleDelete(post.id)}>Remove Article</button>
                </div>
              </div>
            </article>
          ))}
          {publishedPosts.length === 0 && <p className="empty-state">No articles published yet.</p>}
        </main>
      </div>
    </div>
  );
};

export default AdminTraining;
