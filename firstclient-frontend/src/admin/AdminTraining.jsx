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
  
  // NEW: Additive Media States
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [formData, setFormData] = useState({ title: '', subHeader: '', description: '' });

  // Edit States
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', subHeader: '', description: '' });
  const [editImages, setEditImages] = useState([]);
  const [editVideos, setEditVideos] = useState([]);
  const [activeGalleryId, setActiveGalleryId] = useState(null);

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

  // ➕ Additive File Logic
  const handleFileChange = (e, type, mode = 'create') => {
    const files = Array.from(e.target.files);
    if (mode === 'create') {
      if (type === 'image') setSelectedImages(prev => [...prev, ...files]);
      else setSelectedVideos(prev => [...prev, ...files]);
    } else {
      if (type === 'image') setEditImages(prev => [...prev, ...files]);
      else setEditVideos(prev => [...prev, ...files]);
    }
  };

  const removeSelectedFile = (index, type, mode = 'create') => {
    if (mode === 'create') {
      if (type === 'image') setSelectedImages(prev => prev.filter((_, i) => i !== index));
      else setSelectedVideos(prev => prev.filter((_, i) => i !== index));
    } else {
      if (type === 'image') setEditImages(prev => prev.filter((_, i) => i !== index));
      else setEditVideos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Session expired.");
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subHeader', formData.subHeader);
    data.append('description', formData.description);
    
    [...selectedImages, ...selectedVideos].forEach(file => data.append('files', file));

    try {
      await axios.post(`${API_BASE}/admin/training`, data, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
      });
      setFormData({ title: '', subHeader: '', description: '' });
      setSelectedImages([]);
      setSelectedVideos([]);
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
    [...editImages, ...editVideos].forEach(file => data.append('files', file));

    try {
      await axios.put(`${API_BASE}/admin/training/${id}`, data, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setEditingId(null);
      setEditImages([]);
      setEditVideos([]);
      fetchPosts();
      alert("Post Updated! ✅");
    } catch (err) { alert("Update failed."); }
    finally { setLoading(false); }
  };

  const deleteExistingMedia = async (postId, mediaId) => {
    if(!window.confirm("Delete this file permanently from the server?")) return;
    try {
        await axios.delete(`${API_BASE}/admin/training/${postId}/media/${mediaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchPosts();
    } catch (err) { alert("Delete failed."); }
  };

  return (
    <div className="admin-training-page">
      <button className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`} onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>↑</button>

      <div className="content-container">
        <header className="page-header">
          <Link to="/admin" className="back-link">← Dashboard</Link>
          <h1>Training School</h1>
          <input 
            type="text" className="search-input" placeholder="Search by title or text..." 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </header>

        {/* --- CREATION FORM --- */}
        <section className="form-section">
          <form className="pro-form" onSubmit={handleSubmit}>
            <h3>New Session</h3>
            {loading && (
              <div className="loading-overlay">
                <div className="spinner-box"><div className="loader-circle"></div><div className="progress-text">{uploadProgress}%</div></div>
                <p>Uploading Media...</p>
              </div>
            )}

            <div className="input-group">
              <label>Title</label>
              <input type="text" value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>Category / Sub Header</label>
              <input type="text" value={formData.subHeader} onChange={(e)=>setFormData({...formData, subHeader: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>Writeup</label>
              <textarea className="expansive-textarea" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} required />
            </div>

            {/* Split Upload Sections */}
            <div className="split-upload-grid">
               <div className="upload-box">
                  <label>Add Images</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                  <div className="mini-preview-grid">
                    {selectedImages.map((f, i) => (
                      <div key={i} className="mini-item">
                        <img src={URL.createObjectURL(f)} alt="" />
                        <button type="button" onClick={() => removeSelectedFile(i, 'image')}>✕</button>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="upload-box">
                  <label>Add Videos</label>
                  <input type="file" multiple accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                  <div className="mini-preview-grid">
                    {selectedVideos.map((f, i) => (
                      <div key={i} className="mini-item">
                        <div className="vid-placeholder">VID</div>
                        <button type="button" onClick={() => removeSelectedFile(i, 'video')}>✕</button>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <button type="submit" className="publish-btn" disabled={loading}>
              {loading ? "Please wait..." : "Publish Session"}
            </button>
          </form>
        </section>

        {/* --- POST FEED --- */}
        <main className="feed-section">
          {filteredPosts.map((post) => (
            <article key={post.id} className="post-card">
              {editingId === post.id ? (
                <div className="professional-edit-ui">
                   <div className="edit-header">Editing: {post.title}</div>
                   
                   <div className="edit-body">
                      <label>Session Title</label>
                      <input className="edit-input-large" value={editData.title} onChange={(e)=>setEditData({...editData, title: e.target.value})} />
                      
                      <label>Sub Header</label>
                      <input className="edit-input-large" value={editData.subHeader} onChange={(e)=>setEditData({...editData, subHeader: e.target.value})} />
                      
                      <label>Main Content</label>
                      <textarea className="edit-area-large" value={editData.description} onChange={(e)=>setEditData({...editData, description: e.target.value})} />

                      <div className="media-management-zone">
                         <h4>Existing Files</h4>
                         <div className="existing-media-grid">
                            {post.trainingMedia?.map(m => (
                               <div key={m.id} className="existing-item">
                                  {m.type === 'video' ? <div className="vid-tag">Video</div> : <img src={m.url} alt="" />}
                                  <button onClick={() => deleteExistingMedia(post.id, m.id)}>Delete</button>
                               </div>
                            ))}
                         </div>

                         <h4>Append New Media</h4>
                         <div className="split-upload-grid">
                            <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'image', 'edit')} />
                            <input type="file" multiple accept="video/*" onChange={(e) => handleFileChange(e, 'video', 'edit')} />
                         </div>
                      </div>
                   </div>

                   <div className="edit-footer">
                      <button className="save-btn" onClick={() => handleUpdate(post.id)}>Save All Changes</button>
                      <button className="cancel-btn" onClick={() => setEditingId(null)}>Discard</button>
                   </div>
                </div>
              ) : (
                /* Standard View Mode (Kept Consistent) */
                <>
                  <div className="post-media" onClick={() => setActiveGalleryId(activeGalleryId === post.id ? null : post.id)}>
                    <div className="main-thumb">
                       {post.trainingMedia?.[0]?.type === 'video' ? 
                        <video src={post.trainingMedia[0].url} muted /> : 
                        <img src={post.trainingMedia?.[0]?.url || "https://placehold.co/800x450"} alt="" />
                       }
                       <div className="media-count-tag">{post.trainingMedia?.length || 0} Files</div>
                    </div>
                  </div>
                  <div className="post-body">
                    <h2 className="post-headline">{post.title}</h2>
                    <p className="post-text">{post.description}</p>
                    <div className="post-controls">
                      <button className="edit-link" onClick={() => {
                        setEditingId(post.id);
                        setEditData({ title: post.title, subHeader: post.subHeader, description: post.description });
                      }}>Edit Session</button>
                      <button className="delete-link" onClick={() => {if(window.confirm("Delete post?")) axios.delete(`${API_BASE}/admin/training/${post.id}`, {headers:{'Authorization':`Bearer ${token}`}}).then(fetchPosts)}}>Delete</button>
                    </div>
                  </div>
                </>
              )}
            </article>
          ))}
        </main>
      </div>
    </div>
  );
};

export default AdminTraining;
