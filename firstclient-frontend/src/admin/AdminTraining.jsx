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
  
  // Edit States
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', subHeader: '', description: '' });
  const [newFilesToAppend, setNewFilesToAppend] = useState([]);
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
        alert("Published! ✅");
      }, 500);
    } catch (err) { alert("Upload failed."); setLoading(false); setUploadProgress(0); }
  };

  // --- NEW: FULL EDIT LOGIC (TEXT + MEDIA) ---
  const handleUpdate = async (id) => {
    setLoading(true);
    const data = new FormData();
    data.append('title', editData.title);
    data.append('subHeader', editData.subHeader);
    data.append('description', editData.description);
    newFilesToAppend.forEach(file => data.append('files', file));

    try {
      await axios.put(`${API_BASE}/admin/training/${id}`, data, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setEditingId(null);
      setNewFilesToAppend([]);
      fetchPosts();
      alert("Post Fully Updated! ✅");
    } catch (err) { alert("Update failed."); }
    finally { setLoading(false); }
  };

  const deleteSingleMedia = async (postId, mediaId) => {
    if(!window.confirm("Remove this specific file?")) return;
    try {
        await axios.delete(`${API_BASE}/admin/training/${postId}/media/${mediaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchPosts();
    } catch (err) { alert("Could not remove file."); }
  };

  const handleDeletePost = async (id) => {
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
          <h1>Training School Manager</h1>
        </header>

        <section className="form-section">
          <form className="pro-form" onSubmit={handleSubmit}>
            <h3>Create New Content</h3>
            {loading && (
              <div className="progress-wrapper">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                <span className="progress-label">{uploadProgress}%</span>
              </div>
            )}
            <div className="input-group"><label>Title</label><input type="text" placeholder="Enter title" value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} required /></div>
            <div className="input-group"><label>Sub Header</label><input type="text" placeholder="Enter sub header" value={formData.subHeader} onChange={(e)=>setFormData({...formData, subHeader: e.target.value})} required /></div>
            <div className="input-group"><label>Writeup</label><textarea placeholder="Type your content..." value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} required /></div>
            <div className="form-footer">
              <input type="file" multiple onChange={(e) => setSelectedFiles(Array.from(e.target.files))} accept="video/*,image/*" required />
              <button type="submit" className="publish-btn" disabled={loading}>Publish</button>
            </div>
          </form>
        </section>

        <main className="feed-section">
          {publishedPosts.map((post) => (
            <article key={post.id} className={`post-card ${editingId === post.id ? 'is-editing' : ''}`}>
              
              <div className="post-media">
                {editingId === post.id ? (
                  <div className="edit-media-manager">
                    <h4>Manage Media</h4>
                    <div className="media-edit-grid">
                        {post.trainingMedia.map((m) => (
                            <div key={m.id} className="media-edit-item">
                                {m.url.match(/\.(mp4|mov|webm)$/) ? <video src={m.url} /> : <img src={m.url} alt="" />}
                                <button className="remove-media-btn" onClick={() => deleteSingleMedia(post.id, m.id)}>✕</button>
                            </div>
                        ))}
                    </div>
                    <div className="add-more-media">
                        <label>Add more photos/videos:</label>
                        <input type="file" multiple onChange={(e) => setNewFilesToAppend(Array.from(e.target.files))} />
                    </div>
                  </div>
                ) : (
                  <div className="media-preview" onClick={() => setActiveGalleryId(activeGalleryId === post.id ? null : post.id)}>
                     {activeGalleryId === post.id ? (
                        <div className="gallery-stack">
                           {post.trainingMedia.map((m, i) => (
                             <div key={i} className="gallery-item">
                               {m.url.match(/\.(mp4|mov|webm)$/) ? <video src={m.url} controls /> : <img src={m.url} alt="" />}
                             </div>
                           ))}
                        </div>
                     ) : (
                        <div className="main-thumb">
                           {post.trainingMedia?.[0]?.url.match(/\.(mp4|mov|webm)$/) ? 
                            <div className="vid-thumb"><video src={post.trainingMedia[0].url} muted /><div className="play-ui">▶</div></div> : 
                            <img src={post.trainingMedia?.[0]?.url || "https://placehold.co/800x450"} alt="" />
                           }
                           <div className="media-count-tag">{post.trainingMedia?.length} Files</div>
                        </div>
                     )}
                  </div>
                )}
              </div>

              <div className="post-body">
                {editingId === post.id ? (
                  <div className="full-edit-mode">
                    <label className="edit-label">Title</label>
                    <input className="edit-field" value={editData.title} onChange={(e)=>setEditData({...editData, title: e.target.value})} />
                    <label className="edit-label">Sub Header</label>
                    <input className="edit-field" value={editData.subHeader} onChange={(e)=>setEditData({...editData, subHeader: e.target.value})} />
                    <label className="edit-label">Description</label>
                    <textarea className="edit-field area" value={editData.description} onChange={(e)=>setEditData({...editData, description: e.target.value})} />
                    <div className="edit-final-btns">
                      <button className="save-btn" onClick={() => handleUpdate(post.id)}>{loading ? 'Saving...' : 'Save All Changes'}</button>
                      <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="post-badge">{post.subHeader}</span>
                    <h2 className="post-headline">{post.title}</h2>
                    <p className="post-text">{post.description}</p>
                    <div className="post-controls">
                      <button className="edit-link" onClick={() => {
                        setEditingId(post.id);
                        setEditData({ title: post.title, subHeader: post.subHeader, description: post.description });
                      }}>Edit Post</button>
                      <button className="delete-link" onClick={() => handleDeletePost(post.id)}>Delete</button>
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
