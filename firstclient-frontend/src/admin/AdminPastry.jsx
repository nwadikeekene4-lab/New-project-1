import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import './AdminPastry.css'; 

export default function AdminPastry() {
  const [pastries, setPastries] = useState([]);
  const [activeTab, setActiveTab] = useState("Cakes");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false); // New Spinner State

  // Form States
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newVideoFile, setNewVideoFile] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNewName("");
    setNewPrice("");
    setNewImageFile(null);
    setNewVideoFile(null);
  }, [activeTab]);

  useEffect(() => { fetchPastries(); }, []);

  const fetchPastries = async () => {
    try {
      const res = await API.get("/products?category=pastry");
      setPastries(res.data);
    } catch (err) { console.error(err); }
  };

  const addPastry = async (e) => {
    e.preventDefault();
    if (isUploading) return;

    setIsUploading(true); // Start Spinner
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("price", newPrice);
    formData.append("category", "pastry");
    formData.append("subCategory", activeTab); 
    if (newImageFile) formData.append("image", newImageFile);
    if (newVideoFile) formData.append("video", newVideoFile);

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setPastries([res.data, ...pastries]);
      setNewName(""); setNewPrice(""); 
      setNewImageFile(null); setNewVideoFile(null);
      alert(`Successfully added to ${activeTab}! ✅`);
    } catch (err) { 
      alert("Upload failed. Check file size or connection."); 
    } finally {
      setIsUploading(false); // Stop Spinner
    }
  };

  const updatePastry = async (id) => {
    setIsSaving(true);
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);

    try {
      const res = await API.put(`/admin/products/${id}`, formData, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setPastries(pastries.map(p => p.id === id ? res.data.updatedProduct : p));
      setEditingId(null);
    } catch (err) { alert("Update failed."); }
    finally { setIsSaving(false); }
  };

  const deletePastry = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      await API.delete(`/admin/products/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
      setPastries(pastries.filter(p => p.id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  const tabFiltered = pastries.filter(p => {
    const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "Others") {
      return nameMatch && p.subCategory !== "Cakes" && p.subCategory !== "Breads";
    }
    return nameMatch && p.subCategory === activeTab;
  });

  return (
    <div className="pastry-admin-page">
      <div className="pastry-max-width">
        <header className="pastry-header-section">
          <div className="pastry-top-nav">
            <Link to="/admin" className="p-back-btn">←</Link>
            <h1>{activeTab} Management</h1>
          </div>

          <nav className="pastry-tabs-flex">
            {["Cakes", "Breads", "Others"].map(tab => (
              <button 
                key={tab} 
                className={activeTab === tab ? "p-tab active" : "p-tab"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="pastry-action-container">
             <div className="search-wrap">
               <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
             </div>
            
            <form className="pastry-main-form" onSubmit={addPastry}>
              <div className="input-group-row">
                <input type="text" placeholder="Product Name" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
                <input type="number" placeholder="Price (₦)" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
              </div>
              <div className="file-group-row">
                <div className="custom-file">
                  <label>Photo</label>
                  <input type="file" accept="image/*" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
                </div>
                <div className="custom-file">
                  <label>Video (Opt)</label>
                  <input type="file" accept="video/*" onChange={(e)=>setNewVideoFile(e.target.files[0])} />
                </div>
                <button type="submit" className="p-submit-btn" disabled={isUploading}>
                  {isUploading ? <div className="spinner"></div> : `Add ${activeTab}`}
                </button>
              </div>
            </form>
          </div>
        </header>

        <main className="pastry-smart-grid">
          {tabFiltered.map((p) => (
            <div key={p.id} className="p-item-card">
              {editingId === p.id ? (
                <div className="p-edit-box">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <div className="p-edit-btns">
                    <button className="p-save" onClick={() => updatePastry(p.id)} disabled={isSaving}>
                      {isSaving ? "..." : "Save"}
                    </button>
                    <button className="p-cancel" onClick={() => setEditingId(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-card-img">
                    <img src={p.image} alt="" />
                    {p.videoUrl && <span className="p-vid-badge">🎥 CLIP</span>}
                  </div>
                  <div className="p-card-details">
                    <h3>{p.name}</h3>
                    <p className="p-price-tag">₦{Number(p.price).toLocaleString()}</p>
                  </div>
                  <div className="p-card-actions">
                    <button onClick={() => { setEditingId(p.id); setEditName(p.name); setEditPrice(p.price); }}>Edit</button>
                    <button onClick={() => deletePastry(p.id)} className="p-del-btn">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
  }
