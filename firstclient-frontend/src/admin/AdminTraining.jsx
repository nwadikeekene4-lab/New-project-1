import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminTraining.css';

const AdminTraining = () => {
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({ title: '', subHeader: '', description: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // States for Editing
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', subHeader: '', description: '' });
  const [activeGalleryId, setActiveGalleryId] = useState(null);

  const API_BASE = "https://firstclient-backend.onrender.com/api"; 

  const getCleanToken = () => {
    const rawToken = localStorage.getItem('adminToken'); 
    return rawToken ? rawToken.replace(/['"]+/g, '').trim() : null;
  };

  const token = getCleanToken();

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/training`);
      setPublishedPosts(res.data);
    } catch (err) { console.error("Load failed"); }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Session expired.");
    
    setLoading(true);
    setUploadProgress(30);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subHeader', formData.subHeader);
    data.append('description', formData.description);
    selectedFiles.forEach(file => data.append('files', file));

    try {
      setUploadProgress(70);
      await axios.post(`${API_BASE}/admin/training`, data, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setUploadProgress(100);
      setTimeout(() => {
        setFormData({ title: '', subHeader: '', description: '' });
        setSelectedFiles([]);
        setLoading(false);
        setUploadProgress(0);
        fetchPosts();
        alert("Published Successfully! ✅");
      }, 500);
    } catch (err) {
      alert("Upload failed.");
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdate = async (id) => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE}/admin/training/${id}`, editData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPublishedPosts(publishedPosts.map(p => p.id === id ? { ...p, ...editData } : p));
      setEditingId(null);
      alert("Updated Successfully! ✅");
    } catch (err) {
      alert("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entire post?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/training/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPublishedPosts(publishedPosts.filter(p => p.id !== id));
    } catch (err) { alert("Delete failed."); }
  };

  return (
    <div className="admin-training-page">
      <div className="content-container">
        
        <header className="page-header">
          <Link to="/admin" className="back-link">← Dashboard</Link>
          <h1>Training School Feed</h1>
        </header>

        {/* --- UPLOAD FORM WITH PROGRESS --- */}
        <section className="form-section">
          <form className="pro-form" onSubmit={handleSubmit}>
            <h3>Create Content</h3>
            
            {loading && (
              <div className="progress-wrapper">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                <span className="progress-label">{uploadProgress}% Uploading...</span>
              </div>
            )}

            <div className="input-group">
              <label>Article Title</label>
              <input type="text" placeholder="Enter title" value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>Sub Header</label>
              <input type="text" placeholder="Enter sub header" value={formData.subHeader} onChange={(e)=>setFormData({...formData, subHeader: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>Writeup</label>
              <textarea placeholder="Type your content here..." value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} required />
            </div>
            <div className="form-footer">
              <input type="file" multiple onChange={handleFileChange} accept="video/*,image/*" required />
              <button type="submit" className="publish-btn" disabled={loading}>Publish</button>
            </div>
          </form>
        </section>

        {/* --- BLOG FEED WITH EDIT MODE --- */}
        <main className="feed-section">
          {publishedPosts.map((post) => (
            <article key={post.id} className="post-card">
              
              {/* MEDIA SECTION */}
              <div className="post-media" onClick={() => setActiveGalleryId(activeGalleryId === post.id ? null : post.id)}>
                {activeGalleryId === post.id ? (
                  <div className="gallery-view">
                    {post.trainingMedia.map((m, i) => (
                      <div key={i} className="gallery-item">
                        {m.url.match(/\.(mp4|mov|webm)$/) ? <video src={m.url} controls /> : <img src={m.url} alt="" />}
                      </div>
                    ))}
                    <div className="gallery-close-hint">Click to Collapse</div>
                  </div>
                ) : (
                  <div className="media-preview">
                    {post.trainingMedia?.[0]?.url.match(/\.(mp4|mov|webm)$/) ? (
                       <div className="vid-container"><video src={post.trainingMedia[0].url} muted /><div className="play-btn-ui">▶</div></div>
                    ) : (
                      <img src={post.trainingMedia?.[0]?.url || "https://placehold.co/800x450"} alt="" />
                    )}
                    <div className="media-badge">View {post.trainingMedia?.length} Files</div>
                  </div>
                )}
              </div>
              
              <div className="post-body">
                {editingId === post.id ? (
                  <div className="inline-edit-form">
                    <input className="edit-input" value={editData.title} onChange={(e)=>setEditData({...editData, title: e.target.value})} />
                    <input className="edit-input" value={editData.subHeader} onChange={(e)=>setEditData({...editData, subHeader: e.target.value})} />
                    <textarea className="edit-area" value={editData.description} onChange={(e)=>setEditData({...editData, description: e.target.value})} />
                    <div className="edit-actions">
                      <button className="save-btn" onClick={() => handleUpdate(post.id)}>Save Changes</button>
                      <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="post-badge">{post.subHeader}</span>
                    <h2 className="post-headline">{post.title}</h2>
                    <p className="post-text">{post.description}</p>
                    <div className="post-footer-btns">
                      <button className="btn-edit" onClick={() => {
                        setEditingId(post.id);
                        setEditData({ title: post.title, subHeader: post.subHeader, description: post.description });
                      }}>Edit Post</button>
                      <button className="btn-delete" onClick={() => handleDelete(post.id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
};

export default AdminTraining;
