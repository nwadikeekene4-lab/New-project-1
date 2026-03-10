import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import './AdminPastry.css'; 

export default function AdminPastry() {
  const [pastries, setPastries] = useState([]);
  const [activeTab, setActiveTab] = useState("Cake"); // Matches User Side
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);

  // All categories from the user side
  const categories = useMemo(() => [
    'Cake', 'Bread', 'Doughnuts', 'Bread roll', 
    'sausage', 'egg roll', 'meat pie', 'fish rolls', 
    'cookies', 'others'
  ], []);

  // Form States
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newVideoFile, setNewVideoFile] = useState(null);

  // Edit States
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNewName(""); setNewPrice(""); setNewImageFile(null); setNewVideoFile(null);
  }, [activeTab]);

  useEffect(() => { fetchPastries(); }, []);

  const fetchPastries = async () => {
    try {
      const res = await API.get("/products?category=pastry");
      setPastries(res.data);
    } catch (err) { console.error(err); }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'video') {
      if (file.size > 10 * 1024 * 1024) {
        alert("❌ Video must be under 10MB");
        e.target.value = ""; 
        return;
      }
      setNewVideoFile(file);
    } else {
      setNewImageFile(file);
    }
  };

  const addPastry = async (e) => {
    e.preventDefault();
    if (isUploading) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("name", newName);
    formData.append("price", newPrice);
    formData.append("category", "pastry");
    formData.append("subCategory", activeTab.toLowerCase()); 

    if (newImageFile) formData.append("image", newImageFile);
    if (newVideoFile) formData.append("video", newVideoFile);

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { 
          "Content-Type": "multipart/form-data", 
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}` 
        }
      });
      setPastries([res.data, ...pastries]);
      setNewName(""); setNewPrice(""); 
      alert("Uploaded successfully! ✅");
    } catch (err) { 
      alert("Upload failed."); 
    } finally { setIsUploading(false); }
  };

  const updatePastry = async (id) => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    if (editImageFile) formData.append("image", editImageFile);
    if (editVideoFile) formData.append("video", editVideoFile);

    try {
      const res = await API.put(`/admin/products/${id}`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data", 
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}` 
        }
      });
      setPastries(pastries.map(p => p.id === id ? res.data.updatedProduct : p));
      setEditingId(null);
      alert("Updated! ✅");
    } catch (err) { alert("Update failed."); }
    finally { setIsSaving(false); }
  };

  const deletePastry = async (id) => {
    if (!window.confirm("Delete this?")) return;
    try {
      await API.delete(`/admin/products/${id}`, { 
        headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } 
      });
      setPastries(pastries.filter(p => p.id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  // Logic to filter items by Tab
  const tabFiltered = pastries.filter(p => {
    const match = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const sub = p.subCategory?.toLowerCase();
    const currentTab = activeTab.toLowerCase();

    if (currentTab === 'others') {
        const mains = categories.slice(0, -1).map(c => c.toLowerCase());
        return match && (!sub || !mains.includes(sub));
    }
    return match && sub === currentTab;
  });

  return (
    <div className="pastry-admin-page">
      {previewVideo && (
        <div className="video-modal-overlay" onClick={() => setPreviewVideo(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setPreviewVideo(null)}>✕</button>
            <video src={previewVideo} controls autoPlay />
          </div>
        </div>
      )}

      <div className="pastry-max-width">
        <header className="p-header">
          <div className="p-nav-row">
            <Link to="/admin" className="p-back">←</Link>
            <h1>Manage {activeTab}s</h1>
          </div>

          {/* ↔️ SCROLLABLE TABS WITH INDICATOR */}
          <div className="tabs-container-wrapper">
            <nav className="p-tabs scrollable-tabs">
              {categories.map(t => (
                <button 
                  key={t} 
                  className={activeTab === t ? "p-t active" : "p-t"} 
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </button>
              ))}
            </nav>
            <div className="scroll-hint">❯</div>
          </div>

          <form className="p-upload-card" onSubmit={addPastry}>
             <div className="p-form-grid">
                <input type="text" placeholder={`${activeTab} Name`} value={newName} onChange={e=>setNewName(e.target.value)} required />
                <input type="number" placeholder="Price (₦)" value={newPrice} onChange={e=>setNewPrice(e.target.value)} required />
                <div className="p-file">
                  <label>Image</label>
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'image')} required />
                </div>
                <div className="p-file">
                  <label>Video Clip</label>
                  <input type="file" accept="video/mp4" onChange={e => handleFileChange(e, 'video')} />
                </div>
                <button type="submit" className="p-main-btn" disabled={isUploading}>
                  {isUploading ? <div className="spinner"></div> : `Post to ${activeTab} Section`}
                </button>
             </div>
          </form>
        </header>

        <div className="p-grid">
          {tabFiltered.map((p) => (
            <div key={p.id} className="p-card">
              {editingId === p.id ? (
                <div className="p-edit-overlay">
                  <input value={editName} onChange={e => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                  <button className="p-save-btn" onClick={() => updatePastry(p.id)} disabled={isSaving}>Update</button>
                  <button className="p-cancel-btn" onClick={() => setEditingId(null)}>✕</button>
                </div>
              ) : (
                <>
                  <div className="p-card-media">
                    <img src={p.image} alt="" />
                    {p.videoUrl && <button className="p-vid-badge-btn" onClick={() => setPreviewVideo(p.videoUrl)}>🎥 CLIP</button>}
                  </div>
                  <div className="p-card-info">
                    <h4>{p.name}</h4>
                    <p>₦{Number(p.price).toLocaleString()}</p>
                  </div>
                  <div className="p-card-btns">
                    <button onClick={() => { setEditingId(p.id); setEditName(p.name); setEditPrice(p.price); }}>Edit</button>
                    <button onClick={() => deletePastry(p.id)} className="p-del">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
        }
