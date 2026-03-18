import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminTraining.css';

const AdminTraining = () => {
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Creation States (Additive)
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [formData, setFormData] = useState({ title: '', subHeader: '', description: '' });

  // Edit States (Focus Mode)
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', subHeader: '', description: '' });
  const [editImages, setEditImages] = useState([]);
  const [editVideos, setEditVideos] = useState([]);

  const API_BASE = "https://firstclient-backend.onrender.com/api"; 
  const token = localStorage.getItem('adminToken')?.replace(/['"]+/g, '').trim();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    const filtered = publishedPosts.filter(post => 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Additive File Logic: Merges new files with existing ones
  const handleFileChange = (e, type, mode = 'create') => {
    const files = Array.from(e.target.files);
    if (mode === 'create') {
      type === 'image' ? setSelectedImages(p => [...p, ...files]) : setSelectedVideos(p => [...p, ...files]);
    } else {
      type === 'image' ? setEditImages(p => [...p, ...files]) : setEditVideos(p => [...p, ...files]);
    }
  };

  const removeFile = (index, type, mode = 'create') => {
    if (mode === 'create') {
      type === 'image' ? setSelectedImages(p => p.filter((_, i) => i !== index)) : setSelectedVideos(p => p.filter((_, i) => i !== index));
    } else {
      type === 'image' ? setEditImages(p => p.filter((_, i) => i !== index)) : setEditVideos(p => p.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subHeader', formData.subHeader);
    data.append('description', formData.description);
    [...selectedImages, ...selectedVideos].forEach(f => data.append('files', f));

    try {
      await axios.post(`${API_BASE}/admin/training`, data, {
        headers: { 'Authorization': `Bearer ${token}` },
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
      });
      setFormData({ title: '', subHeader: '', description: '' });
      setSelectedImages([]); setSelectedVideos([]);
      fetchPosts();
      alert("Published Successfully! ✅");
    } catch (err) { alert("Upload failed."); }
    finally { setLoading(false); setUploadProgress(0); }
  };

  const handleUpdate = async (id) => {
    setLoading(true);
    const data = new FormData();
    data.append('title', editData.title);
    data.append('subHeader', editData.subHeader);
    data.append('description', editData.description);
    [...editImages, ...editVideos].forEach(f => data.append('files', f));

    try {
      await axios.put(`${API_BASE}/admin/training/${id}`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEditingId(null);
      setEditImages([]); setEditVideos([]);
      fetchPosts();
      alert("Session Updated! ✅");
    } catch (err) { alert("Update failed."); }
    finally { setLoading(false); }
  };

  const deleteMedia = async (postId, mediaId) => {
    if(!window.confirm("Remove this file from server?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/training/${postId}/media/${mediaId}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      fetchPosts();
    } catch (err) { alert("Delete failed."); }
  };

  // 1. FOCUS MODE UI (Only shows when editing)
  if (editingId) {
    const activePost = publishedPosts.find(p => p.id === editingId);
    return (
      <div className="admin-training-page focus-mode">
        <div className="content-container">
          <div className="professional-edit-ui">
            <div className="edit-header">
              <h2>Focus Mode: Editing Session</h2>
              <button className="close-focus" onClick={() => setEditingId(null)}>✕ Exit Editor</button>
            </div>
            
            <div className="edit-body">
              <div className="input-group">
                <label>Update Title</label>
                <input className="edit-input-large" value={editData.title} onChange={(e)=>setEditData({...editData, title: e.target.value})} />
              </div>

              <div className="input-group">
                <label>Update Category</label>
                <input className="edit-input-large" value={editData.subHeader} onChange={(e)=>setEditData({...editData, subHeader: e.target.value})} />
              </div>

              <div className="input-group">
                <label>Content Description</label>
                <textarea className="edit-area-large" value={editData.description} onChange={(e)=>setEditData({...editData, description: e.target.value})} />
              </div>

              <div className="media-management-zone">
                <h4>Existing Server Files</h4>
                <div className="existing-media-grid">
                  {activePost?.trainingMedia?.map(m => (
                    <div key={m.id} className="existing-item">
                      {m.type === 'video' ? <div className="vid-box">VIDEO FILE</div> : <img src={m.url} alt="" />}
                      <button onClick={() => deleteMedia(editingId, m.id)}>Delete from Server</button>
                    </div>
                  ))}
                </div>

                <h4>Append New Files</h4>
                <div className="split-upload-grid">
                  <div className="upload-box image-zone">
                    <label>🖼️ Add New Images</label>
                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'image', 'edit')} />
                    <div className="mini-preview-grid">
                      {editImages.map((f, i) => (
                        <div key={i} className="mini-item"><img src={URL.createObjectURL(f)} alt="" /><button onClick={() => removeFile(i, 'image', 'edit')}>✕</button></div>
                      ))}
                    </div>
                  </div>
                  <div className="upload-box video-zone">
                    <label>🎥 Add New Videos</label>
                    <input type="file" multiple accept="video/*" onChange={(e) => handleFileChange(e, 'video', 'edit')} />
                    <div className="mini-preview-grid">
                      {editVideos.map((f, i) => (
                        <div key={i} className="mini-item"><div className="vid-placeholder">NEW VID</div><button onClick={() => removeFile(i, 'video', 'edit')}>✕</button></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="edit-footer">
               <button className="save-btn" onClick={() => handleUpdate(editingId)} disabled={loading}>
                 {loading ? <div className="btn-spinner"></div> : "Apply All Changes"}
               </button>
               <button className="cancel-btn" onClick={() => setEditingId(null)}>Discard Changes</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. STANDARD MODE UI
  return (
    <div className="admin-training-page">
      <button className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`} onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>↑</button>

      <div className="content-container">
        <header className="page-header">
          <Link to="/admin" className="back-link">← Dashboard</Link>
          <h1>Training School</h1>
          <input type="text" className="search-input" placeholder="Search by title or text..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </header>

        <section className="form-section">
          <form className="pro-form" onSubmit={handleSubmit}>
            <h3>New Session</h3>
            <div className="input-group"><label>Title</label><input type="text" value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} required /></div>
            <div className="input-group"><label>Category / Sub Header</label><input type="text" value={formData.subHeader} onChange={(e)=>setFormData({...formData, subHeader: e.target.value})} required /></div>
            <div className="input-group"><label>Writeup</label><textarea className="expansive-textarea" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} required /></div>

            <div className="split-upload-grid">
               <div className="upload-box image-zone">
                  <label>🖼️ Image Gallery</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                  <div className="mini-preview-grid">
                    {selectedImages.map((f, i) => (
                      <div key={i} className="mini-item"><img src={URL.createObjectURL(f)} alt="" /><button type="button" onClick={() => removeFile(i, 'image')}>✕</button></div>
                    ))}
                  </div>
               </div>
               <div className="upload-box video-zone">
                  <label>🎥 Video Content</label>
                  <input type="file" multiple accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                  <div className="mini-preview-grid">
                    {selectedVideos.map((f, i) => (
                      <div key={i} className="mini-item"><div className="vid-placeholder">VID</div><button type="button" onClick={() => removeFile(i, 'video')}>✕</button></div>
                    ))}
                  </div>
               </div>
            </div>

            <button type="submit" className="publish-btn" disabled={loading}>
              {loading ? (
                <div className="btn-loading-content">
                  <div className="btn-spinner"></div>
                  <span>Uploading {uploadProgress}%</span>
                </div>
              ) : "Publish Session"}
            </button>
          </form>
        </section>

        <main className="feed-section">
          {filteredPosts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="main-thumb">
                 {post.trainingMedia?.[0]?.type === 'video' ? <video src={post.trainingMedia[0].url} muted /> : <img src={post.trainingMedia?.[0]?.url || "https://placehold.co/800x450"} alt="" />}
                 <div className="media-count-tag">{post.trainingMedia?.length || 0} Files</div>
              </div>
              <div className="post-body">
                <h2 className="post-headline">{post.title}</h2>
                <p className="post-text">{post.description}</p>
                <div className="post-controls">
                  <button className="edit-link" onClick={() => { 
                    setEditingId(post.id); 
                    setEditData({ title: post.title, subHeader: post.subHeader, description: post.description }); 
                    window.scrollTo(0,0);
                  }}>Edit Session</button>
                  <button className="delete-link" onClick={() => { if(window.confirm("Delete post?")) axios.delete(`${API_BASE}/admin/training/${post.id}`, {headers:{'Authorization':`Bearer ${token}`}}).then(fetchPosts) }}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
};

export default AdminTraining;
