import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import './AdminProducts.css'; // Using shared styles for consistency

export default function AdminPastry() {
  const [pastries, setPastries] = useState([]);
  const [activeTab, setActiveTab] = useState("Cakes");
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => { fetchPastries(); }, []);

  const fetchPastries = async () => {
    try {
      const res = await API.get("/products?category=pastry");
      setPastries(res.data);
    } catch (err) { console.error("Failed to load pastries:", err); }
  };

  const addPastry = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("price", newPrice);
    formData.append("category", "pastry");
    formData.append("subCategory", activeTab); // Automatically set based on current tab
    
    if (newImageFile) formData.append("image", newImageFile);
    if (newVideoFile) formData.append("video", newVideoFile);

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setPastries([res.data, ...pastries]);
      setNewName(""); setNewPrice(""); 
      setNewImageFile(null); setNewVideoFile(null);
      e.target.reset();
      alert(`${activeTab} Added! ✅`);
    } catch (err) { alert("Upload failed."); }
  };

  const updatePastry = async (id) => {
    setIsSaving(true);
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    if (editImageFile) formData.append("image", editImageFile);
    if (editVideoFile) formData.append("video", editVideoFile);

    try {
      const res = await API.put(`/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setPastries(pastries.map(p => p.id === id ? res.data.updatedProduct : p));
      setEditingId(null);
      alert("Updated! ✅");
    } catch (err) { alert("Update failed."); }
    finally { setIsSaving(false); }
  };

  const deletePastry = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      await API.delete(`/admin/products/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
      setPastries(pastries.filter(p => p.id !== id));
    } catch (err) { alert("Error deleting."); }
  };

  // Filter logic for tabs
  const displayedPastries = pastries.filter(p => {
    const matchesTab = activeTab === 'Others' 
      ? (p.subCategory !== 'Cakes' && p.subCategory !== 'Breads') 
      : p.subCategory === activeTab;
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="admin-inventory-wrapper">
      <div className="admin-container-max">
        <header className="inventory-header">
          <div className="nav-top">
            <Link to="/admin" className="back-btn-minimal">←</Link>
            <h1 className="inventory-title">Pastry Management</h1>
          </div>

          <nav className="category-tabs">
            {['Cakes', 'Breads', 'Others'].map(tab => (
              <button 
                key={tab} 
                className={activeTab === tab ? 'active' : ''} 
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="inventory-actions">
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="robust-search-bar"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <form className="mini-form" onSubmit={addPastry}>
              <input type="text" placeholder="Name" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
              <input type="number" placeholder="Price" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
              <div className="file-box">
                <label>Img</label>
                <input type="file" accept="image/*" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
              </div>
              <div className="file-box">
                <label>Vid</label>
                <input type="file" accept="video/*" onChange={(e)=>setNewVideoFile(e.target.files[0])} />
              </div>
              <button type="submit" className="mini-add-btn">Add to {activeTab}</button>
            </form>
          </div>
        </header>

        <main className="inventory-grid">
          {displayedPastries.map((p) => (
            <div key={p.id} className="inventory-item">
              {editingId === p.id ? (
                <div className="grid-edit-form">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <label className="edit-label">Update Video:</label>
                  <input type="file" accept="video/*" onChange={(e) => setEditVideoFile(e.target.files[0])} />
                  <div className="edit-grid-btns">
                    <button className="grid-btn-save" onClick={() => updatePastry(p.id)} disabled={isSaving}>Save</button>
                    <button className="grid-btn-cancel" onClick={() => setEditingId(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <div className="item-inner">
                  <div className="item-img-container">
                    <img src={p.image} alt="" />
                    {p.videoUrl && <div className="video-badge">🎥 Video Attached</div>}
                  </div>
                  <div className="item-details">
                    <h3 className="item-name">{p.name}</h3>
                    <p className="item-price">₦{Number(p.price).toLocaleString()}</p>
                  </div>
                  <div className="item-footer-actions">
                    <button className="action-link edit" onClick={() => { 
                        setEditingId(p.id); setEditName(p.name); setEditPrice(p.price); 
                      }}>Edit</button>
                    <button className="action-link delete" onClick={() => deletePastry(p.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
    }
