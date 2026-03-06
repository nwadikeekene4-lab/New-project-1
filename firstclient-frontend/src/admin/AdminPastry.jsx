import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import './AdminPastry.css'; 

export default function AdminPastry() {
  const [pastries, setPastries] = useState([]);
  const [activeTab, setActiveTab] = useState("Cakes");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);

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

  // ⭐ INSTANT SIZE CHECKER FUNCTION
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'video') {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert("❌ File too large! Video must be under 10MB to ensure fast upload.");
        e.target.value = ""; // Clear the input
        setNewVideoFile(null);
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
    formData.append("subCategory", activeTab); 
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
      alert("Upload failed. Try a smaller video or check connection."); 
    } finally { 
      setIsUploading(false); 
    }
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
      setEditImageFile(null); setEditVideoFile(null);
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

  const tabFiltered = pastries.filter(p => {
    const match = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return activeTab === "Others" 
      ? (match && p.subCategory !== "Cakes" && p.subCategory !== "Breads")
      : (match && p.subCategory === activeTab);
  });

  return (
    <div className="pastry-admin-page">
      {/* 🎬 CINEMA MODE MODAL */}
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
            <h1>{activeTab} Shop</h1>
          </div>

          <nav className="p-tabs">
            {["Cakes", "Breads", "Others"].map(t => (
              <button key={t} className={activeTab === t ? "p-t active" : "p-t"} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </nav>

          <form className="p-upload-card" onSubmit={addPastry}>
             <div className="p-form-grid">
                <input type="text" placeholder="Product Name" value={newName} onChange={e=>setNewName(e.target.value)} required />
                <input type="number" placeholder="Price (₦)" value={newPrice} onChange={e=>setNewPrice(e.target.value)} required />
                <div className="p-file">
                  <label>Image (JPG/PNG)</label>
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'image')} required />
                </div>
                <div className="p-file">
                  <label>Video (MP4 - MAX 10MB)</label>
                  <input type="file" accept="video/mp4" onChange={e => handleFileChange(e, 'video')} />
                </div>
                <button type="submit" className="p-main-btn" disabled={isUploading}>
                  {isUploading ? <div className="spinner"></div> : `Add to ${activeTab}`}
                </button>
             </div>
          </form>
        </header>

        {/* 📱 SMART GRID VIEW */}
        <div className="p-grid">
          {tabFiltered.map((p) => (
            <div key={p.id} className="p-card">
              {editingId === p.id ? (
                <div className="p-edit-overlay">
                  <h3 style={{fontSize:'14px', marginBottom:'10px'}}>Editing {p.name}</h3>
                  <input value={editName} onChange={e => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                  <div className="p-edit-files">
                    <label>Update Photo: <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files[0])} /></label>
                    <label>Update Video: <input type="file" accept="video/*" onChange={e => setEditVideoFile(e.target.files[0])} /></label>
                  </div>
                  <div className="p-edit-actions">
                    <button className="p-save-btn" onClick={() => updatePastry(p.id)} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Update"}
                    </button>
                    <button className="p-cancel-btn" onClick={() => setEditingId(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-card-media">
                    <img src={p.image} alt="" />
                    {p.videoUrl && (
                      <button className="p-vid-badge-btn" onClick={() => setPreviewVideo(p.videoUrl)}>
                        🎥 PREVIEW
                      </button>
                    )}
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
