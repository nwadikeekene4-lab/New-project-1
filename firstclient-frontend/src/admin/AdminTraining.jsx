import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminTraining.css';

const AdminTraining = () => {
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Creation States
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [formData, setFormData] = useState({ title: '', subHeader: '', description: '' });

  // Edit States
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('preview'); 
  const [editData, setEditData] = useState({ title: '', subHeader: '', description: '' });
  const [editImages, setEditImages] = useState([]);
  const [editVideos, setEditVideos] = useState([]);

  // Gallery Modal States
  const [galleryPost, setGalleryPost] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const API_BASE = "https://firstclient-backend.onrender.com/api"; 
  const token = localStorage.getItem('adminToken')?.replace(/['"]+/g, '').trim();

  // Scroll visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { fetchPosts(); }, []);

  // 🔍 LIVE SEARCH: Filter by Title Only
  useEffect(() => {
    const filtered = publishedPosts.filter(post => 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchQuery, publishedPosts]);

  // 🎹 Keyboard support for Gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!galleryPost) return;
      if (e.key === 'ArrowRight') nextMedia();
      if (e.key === 'ArrowLeft') prevMedia();
      if (e.key === 'Escape') setGalleryPost(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryPost, currentIndex]);

  const fetchPosts = async () => {
    setIsInitialLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/training`);
      setPublishedPosts(res.data);
      setFilteredPosts(res.data);
    } catch (err) { console.error("Load failed"); }
    finally { setIsInitialLoading(false); }
  };

  const handleExitFocus = () => {
    const lastId = editingId;
    setEditingId(null);
    setTimeout(() => {
      const element = document.getElementById(`post-${lastId}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

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

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? <mark key={i} className="search-highlight">{part}</mark> : part
    );
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
      setEditImages([]); setEditVideos([]);
      fetchPosts();
      alert("Session Updated! ✅");
      handleExitFocus();
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

  const getSortedMedia = (media) => {
    if (!media) return [];
    const images = media.filter(m => m.type !== 'video' && !m.url.match(/\.(mp4|mov|webm)$/i));
    const videos = media.filter(m => m.type === 'video' || m.url.match(/\.(mp4|mov|webm)$/i));
    return [...images, ...videos];
  };

  // Gallery Navigation
  const openGallery = (post, index = 0) => { setGalleryPost(post); setCurrentIndex(index); };
  const nextMedia = () => {
    const media = getSortedMedia(galleryPost.trainingMedia);
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };
  const prevMedia = () => {
    const media = getSortedMedia(galleryPost.trainingMedia);
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  if (editingId) {
    const activePost = publishedPosts.find(p => p.id === editingId);
    const sortedMedia = getSortedMedia(activePost?.trainingMedia);
    const mainDisplay = sortedMedia[0];

    return (
      <div className="admin-training-page focus-mode">
        <div className="content-container">
          <div className="tab-container">
            <button className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>Preview Display</button>
            <button className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`} onClick={() => setActiveTab('edit')}>Edit Content</button>
            <button className="exit-btn" onClick={handleExitFocus}>✕ Exit</button>
          </div>

          {activeTab === 'preview' ? (
            <div className="preview-pane">
              <div className="hero-gallery">
                {mainDisplay?.url.match(/\.(mp4|mov|webm)$/i) || mainDisplay?.type === 'video' ? (
                  <video src={mainDisplay.url} controls className="full-view-media" />
                ) : (
                  <img src={mainDisplay?.url || "https://placehold.co/800x450"} alt="" className="full-view-media" />
                )}
              </div>
              <div className="preview-text-zone">
                <span className="preview-category">{editData.subHeader}</span>
                <h1>{editData.title}</h1>
                <p className="post-text">{editData.description}</p>
              </div>
            </div>
          ) : (
            <div className="edit-pane professional-edit-ui">
              <div className="edit-body">
                <div className="input-group"><label>Session Title</label><input className="edit-input-large" value={editData.title} onChange={(e)=>setEditData({...editData, title: e.target.value})} /></div>
                <div className="input-group"><label>Category</label><input className="edit-input-large" value={editData.subHeader} onChange={(e)=>setEditData({...editData, subHeader: e.target.value})} /></div>
                <div className="input-group"><label>Main Writeup</label><textarea className="edit-area-large" value={editData.description} onChange={(e)=>setEditData({...editData, description: e.target.value})} /></div>
                <div className="media-management-zone">
                  <h4>Manage Files on Server</h4>
                  <div className="existing-media-grid">
                    {activePost?.trainingMedia?.map(m => (
                      <div key={m.id} className="existing-item">
                        {m.type === 'video' || m.url.match(/\.(mp4|mov|webm)$/i) ? <div className="vid-box">VIDEO</div> : <img src={m.url} alt="" />}
                        <button onClick={() => deleteMedia(editingId, m.id)}>Remove</button>
                      </div>
                    ))}
                  </div>
                  <h4>Add New Files</h4>
                  <div className="split-upload-grid">
                    <div className="upload-box image-zone">
                      <label>🖼️ New Images</label>
                      <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'image', 'edit')} />
                      <div className="mini-preview-grid">
                        {editImages.map((f, i) => (
                          <div key={i} className="mini-item"><img src={URL.createObjectURL(f)} alt="" /><button onClick={() => removeFile(i, 'image', 'edit')}>✕</button></div>
                        ))}
                      </div>
                    </div>
                    <div className="upload-box video-zone">
                      <label>🎥 New Videos</label>
                      <input type="file" multiple accept="video/*" onChange={(e) => handleFileChange(e, 'video', 'edit')} />
                      <div className="mini-preview-grid">
                        {editVideos.map((f, i) => (
                          <div key={i} className="mini-item"><div className="vid-placeholder">VID</div><button onClick={() => removeFile(i, 'video', 'edit')}>✕</button></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="edit-footer">
                 <button className="save-btn" onClick={() => handleUpdate(editingId)} disabled={loading}>{loading ? <div className="btn-spinner"></div> : "Save Changes"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-training-page">
      <button className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`} onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>↑</button>

      <div className="content-container">
        <header className="page-header">
          <Link to="/admin" className="back-link">← Dashboard</Link>
          <h1>Training School</h1>
          <input type="text" className="search-input" placeholder="Search sessions by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </header>

        <section className="form-section">
          <form className="pro-form" onSubmit={handleSubmit}>
            <h3>Create New Session</h3>
            <div className="input-group"><label>Title</label><input type="text" value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} required /></div>
            <div className="input-group"><label>Category</label><input type="text" value={formData.subHeader} onChange={(e)=>setFormData({...formData, subHeader: e.target.value})} required /></div>
            <div className="input-group"><label>Full Writeup</label><textarea className="expansive-textarea" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} required /></div>
            <div className="split-upload-grid">
               <div className="upload-box image-zone">
                  <label>🖼️ Add Images</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                  <div className="mini-preview-grid">
                    {selectedImages.map((f, i) => (
                      <div key={i} className="mini-item"><img src={URL.createObjectURL(f)} alt="" /><button type="button" onClick={() => removeFile(i, 'image')}>✕</button></div>
                    ))}
                  </div>
               </div>
               <div className="upload-box video-zone">
                  <label>🎥 Add Videos</label>
                  <input type="file" multiple accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                  <div className="mini-preview-grid">
                    {selectedVideos.map((f, i) => (
                      <div key={i} className="mini-item"><div className="vid-placeholder">VID</div><button type="button" onClick={() => removeFile(i, 'video')}>✕</button></div>
                    ))}
                  </div>
               </div>
            </div>
            <button type="submit" className="publish-btn" disabled={loading}>
              {loading ? <div className="btn-loading-content"><div className="btn-spinner"></div><span>Uploading {uploadProgress}%</span></div> : "Publish Session"}
            </button>
          </form>
        </section>

        <main className="feed-section">
          {isInitialLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="post-card skeleton-card">
                <div className="skeleton-thumb pulse"></div>
                <div className="post-body">
                   <div className="skeleton-line pulse headline"></div>
                   <div className="skeleton-line pulse"></div>
                   <div className="skeleton-line pulse short"></div>
                </div>
              </div>
            ))
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const mediaList = getSortedMedia(post.trainingMedia);
              const displayMedia = mediaList[0];
              return (
                <article key={post.id} id={`post-${post.id}`} className="post-card">
                  <div className="post-media" onClick={() => openGallery(post)}>
                    <div className="main-thumb">
                       {displayMedia?.url.match(/\.(mp4|mov|webm)$/i) ? <video src={displayMedia.url} muted /> : <img src={displayMedia?.url || "https://placehold.co/800x450"} alt="" />}
                       {mediaList.length > 1 && <div className="media-tag-overlay">+{mediaList.length - 1} Files</div>}
                    </div>
                  </div>
                  <div className="post-body">
                    <h2 className="post-headline">{highlightText(post.title, searchQuery)}</h2>
                    <p className="post-text">{post.description}</p>
                    <div className="post-controls">
                      <button className="edit-link" onClick={() => { setEditingId(post.id); setEditData({ title: post.title, subHeader: post.subHeader, description: post.description }); window.scrollTo(0,0); }}>Edit Session</button>
                      <button className="delete-link" onClick={() => { if(window.confirm("Delete?")) axios.delete(`${API_BASE}/admin/training/${post.id}`, {headers:{'Authorization':`Bearer ${token}`}}).then(fetchPosts) }}>Delete</button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty-state-container">
              <div className="empty-icon">🔍</div>
              <h3>No matching sessions</h3>
              <p>We couldn't find anything for "<strong>{searchQuery}</strong>".</p>
              <button className="clear-search-btn" onClick={() => setSearchQuery("")}>Clear Search</button>
            </div>
          )}
        </main>
      </div>

      {galleryPost && (
        <div className="gallery-modal" onClick={() => setGalleryPost(null)}>
          <button className="gallery-close" onClick={() => setGalleryPost(null)}>✕</button>
          <button className="gallery-nav prev" onClick={(e) => { e.stopPropagation(); prevMedia(); }}>‹</button>
          <button className="gallery-nav next" onClick={(e) => { e.stopPropagation(); nextMedia(); }}>›</button>
          <div className="gallery-content" onClick={(e) => e.stopPropagation()}>
            {getSortedMedia(galleryPost.trainingMedia)[currentIndex]?.url.match(/\.(mp4|mov|webm)$/i) ? (
              <video src={getSortedMedia(galleryPost.trainingMedia)[currentIndex].url} controls autoPlay />
            ) : (
              <img src={getSortedMedia(galleryPost.trainingMedia)[currentIndex].url} alt="" />
            )}
          </div>
          <div className="gallery-counter">{currentIndex + 1} / {getSortedMedia(galleryPost.trainingMedia).length}</div>
        </div>
      )}
    </div>
  );
};

export default AdminTraining;
