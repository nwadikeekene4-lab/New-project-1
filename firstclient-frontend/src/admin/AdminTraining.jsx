import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminTraining.css';

const AdminTraining = () => {
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]); // For search
  const [searchQuery, setSearchQuery] = useState(""); // Search state
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

  // Filter posts whenever search query or post list changes
  useEffect(() => {
    const filtered = publishedPosts.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.subHeader.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchQuery, publishedPosts]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/training`);
      setPublishedPosts(res.data);
      setFilteredPosts(res.data);
    } catch (err) { console.error("Load failed"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Session expired.");
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subHeader', formData.subHeader);
    data.append('description', formData.description);
    selectedFiles.forEach(file => data.append('files', file));

    try {
      await axios.post(`${API_BASE}/admin/training`, data, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      setFormData({ title: '', subHeader: '', description: '' });
      setSelectedFiles([]);
      fetchPosts();
      alert("Published! ✅");
    } catch (err) { alert("Upload failed."); }
    finally { setLoading(false); setUploadProgress(0); }
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="admin-training-page">
      <div className="content-container">
        
        <header className="page-header">
          <Link to="/admin" className="back-link">← Dashboard</Link>
          <h1>Training School Manager</h1>
          
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by title or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <section className="form-section">
          <form className="pro-form" onSubmit={handleSubmit}>
            <h3>Create New Content</h3>
            {loading && (
              <div className="progress-wrapper">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                <span className="progress-label">{uploadProgress}% Uploading...</span>
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
          {filteredPosts.map((post) => (
            <article key={post.id} className="post-card">
              
              <div className="post-media">
                {editingId === post.id ? (
                  <div className="edit-media-manager">
                    <h4>Manage Media</h4>
                    <p className="edit-hint">Click ✕ on an image/video to remove it</p>
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
                           <div className="close-hint">Click to Collapse</div>
                        </div>
                     ) : (
                        <div className="main-thumb">
                           {post.trainingMedia?.[0]?.url.match(/\.(mp4|mov|webm)$/) ? 
                            <div className="vid-thumb"><video src={post.trainingMedia[0].url} muted /><div className="play-ui">▶</div></div> : 
                            <img src={post.trainingMedia?.[0]?.url || "https://placehold.co/800x450"} alt="" />
                           }
                           <div className="media-count-tag">View {post.trainingMedia?.length} Files</div>
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
                    <div className="post-meta-header">
                        <span className="post-badge">{post.subHeader}</span>
                        <span className="post-date">{formatDate(post.createdAt)}</span>
                    </div>
                    <h2 className="post-headline">{post.title}</h2>
                    <p className="post-text">{post.description}</p>
                    <div className="post-controls">
                      <button className="edit-link" onClick={() => {
                        setEditingId(post.id);
                        setEditData({ title: post.title, subHeader: post.subHeader, description: post.description });
                      }}>Edit Post Content</button>
                      <button className="delete-link" onClick={() => handleDeletePost(post.id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
          {filteredPosts.length === 0 && <p className="no-results">No posts found matching "{searchQuery}"</p>}
        </main>
      </div>
    </div>
  );
};

export default AdminTraining;
