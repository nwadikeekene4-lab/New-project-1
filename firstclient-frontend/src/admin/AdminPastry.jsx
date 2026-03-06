import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import './AdminPastry.css'; // Dedicated CSS file

export default function AdminPastry() {
  const [pastries, setPastries] = useState([]);
  const [activeTab, setActiveTab] = useState("Cakes");
  const [searchTerm, setSearchTerm] = useState("");

  // Add Form States
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
    if (!newName || !newPrice || !newImageFile) return alert("Missing required fields");
    
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("price", newPrice);
    formData.append("category", "pastry");
    formData.append("subCategory", activeTab); // Auto-assign based on current tab
    
    formData.append("image", newImageFile);
    if (newVideoFile) formData.append("video", newVideoFile);

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setPastries([res.data, ...pastries]);
      setNewName(""); setNewPrice(""); 
      setNewImageFile(null); setNewVideoFile(null);
      e.target.reset();
      alert(`${activeTab} Item Added! ✅`);
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
      // Backend sync: updatedProduct
      setPastries(pastries.map(p => p.id === id ? res.data.updatedProduct : p));
      setEditingId(null);
      alert("Updated Successfully! ✅");
    } catch (err) { alert("Update failed."); }
    finally { setIsSaving(false); }
  };

  const deletePastry = async (id) => {
    if (!window.confirm("Move to archive?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      await API.delete(`/admin/products/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
      setPastries(pastries.filter(p => p.id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  // Filter items based on Tab AND Search
  const filteredPastries = pastries.filter(p => {
    const matchesTab = activeTab === 'Others' 
      ? (p.subCategory !== 'Cakes' && p.subCategory !== 'Breads') 
      : p.subCategory === activeTab;
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="pastry-admin-wrapper">
      <div className="admin-container-max">
        <header className="pastry-header-box">
          <div className="header-top-row">
            <Link to="/admin" className="pastry-back-btn">←</Link>
            <h1 className="pastry-main-title">Pastry Management</h1>
          </div>

          {/* ⭐ THE TABS (Now clearly styled) */}
          <nav className="pastry-tabs-container">
            {['Cakes', 'Breads', 'Others'].map(tab => (
              <button 
                key={tab} 
                className={`tab-item ${activeTab === tab ? 'active-tab' : ''}`} 
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="pastry-action-bar">
            <input 
              type="text" 
              placeholder={`Search in ${activeTab}...`} 
              className="pastry-search-input"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <form className="pastry-quick-add" onSubmit={addPastry}>
              <input type="text" placeholder="Item Name" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
              <input type="number" placeholder="Price" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
              <div className="file-input-group">
                <label>Img</label>
                <input type="file" accept="image/*" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
              </div>
              <div className="file-input-group">
                <label>Vid</label>
                <input type="file" accept="video/*" onChange={(e)=>setNewVideoFile(e.target.files[0])} />
              </div>
              <button type="submit" className="pastry-add-btn">Add {activeTab}</button>
            </form>
          </div>
        </header>

        <main className="pastry-konga-grid">
          {filteredPastries.map((p) => (
            <div key={p.id} className="pastry-item-card">
              {editingId === p.id ? (
                <div className="pastry-edit-mode">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <label>Change Video:</label>
                  <input type="file" accept="video/*" onChange={(e) => setEditVideoFile(e.target.files[0])} />
                  <div className="edit-btn-row">
                    <button className="btn-save" onClick={() => updatePastry(p.id)} disabled={isSaving}>Save</button>
                    <button className="btn-cancel" onClick={() => setEditingId(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <div className="pastry-card-content">
                  <div className="pastry-img-box">
                    <img src={p.image} alt={p.name} />
                    {p.videoUrl && <div className="p-video-tag">🎥 Video</div>}
                  </div>
                  <div className="pastry-card-info">
                    <h3 className="p-item-name">{p.name}</h3>
                    <p className="p-item-price">₦{Number(p.price).toLocaleString()}</p>
                  </div>
                  <div className="pastry-card-footer">
                    <button className="p-edit-link" onClick={() => { 
                        setEditingId(p.id); setEditName(p.name); setEditPrice(p.price); 
                      }}>Edit</button>
                    <button className="p-delete-link" onClick={() => deletePastry(p.id)}>Delete</button>
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
