import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import './AdminPastry.css'; 

export default function AdminPastry() {
  const [pastries, setPastries] = useState([]);
  const [activeTab, setActiveTab] = useState("Cakes"); // Default tab
  const [searchTerm, setSearchTerm] = useState("");

  // New Item Form
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newVideoFile, setNewVideoFile] = useState(null);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchPastries(); }, []);

  const fetchPastries = async () => {
    try {
      const res = await API.get("/products?category=pastry");
      setPastries(res.data);
    } catch (err) { console.error(err); }
  };

  const addPastry = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("price", newPrice);
    formData.append("category", "pastry");
    formData.append("subCategory", activeTab); // Important: Tags it as Cake or Bread
    formData.append("image", newImageFile);
    if (newVideoFile) formData.append("video", newVideoFile);

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setPastries([res.data, ...pastries]);
      setNewName(""); setNewPrice(""); setNewImageFile(null); setNewVideoFile(null);
      e.target.reset();
      alert(`Added to ${activeTab}! ✅`);
    } catch (err) { alert("Upload failed."); }
  };

  const updatePastry = async (id) => {
    setIsSaving(true);
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    if (editVideoFile) formData.append("video", editVideoFile);

    try {
      const res = await API.put(`/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setPastries(pastries.map(p => p.id === id ? res.data.updatedProduct : p));
      setEditingId(null);
    } catch (err) { alert("Update failed."); }
    finally { setIsSaving(false); }
  };

  const deletePastry = async (id) => {
    if (!window.confirm("Archive this?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      await API.delete(`/admin/products/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
      setPastries(pastries.filter(p => p.id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  // Logic to show items based on current tab
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
        <header className="pastry-dashboard-header">
          <div className="pastry-title-row">
            <Link to="/admin" className="pastry-back-arrow">←</Link>
            <h1>Pastry Kitchen</h1>
          </div>

          {/* ⭐ THE TABS */}
          <div className="pastry-tabs-nav">
            {["Cakes", "Breads", "Others"].map(tab => (
              <button 
                key={tab} 
                className={activeTab === tab ? "pastry-tab active" : "pastry-tab"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="pastry-controls">
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="pastry-search-box"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <form className="pastry-upload-form" onSubmit={addPastry}>
              <input type="text" placeholder="Name" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
              <input type="number" placeholder="Price" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
              <div className="file-field">
                <label>Img</label>
                <input type="file" accept="image/*" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
              </div>
              <div className="file-field">
                <label>Vid</label>
                <input type="file" accept="video/*" onChange={(e)=>setNewVideoFile(e.target.files[0])} />
              </div>
              <button type="submit" className="pastry-submit-btn">Add {activeTab}</button>
            </form>
          </div>
        </header>

        <div className="pastry-inventory-grid">
          {tabFiltered.map((p) => (
            <div key={p.id} className="pastry-card">
              {editingId === p.id ? (
                <div className="pastry-edit-ui">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <label>Update Video:</label>
                  <input type="file" accept="video/*" onChange={(e) => setEditVideoFile(e.target.files[0])} />
                  <div className="edit-actions">
                    <button onClick={() => updatePastry(p.id)} disabled={isSaving}>Save</button>
                    <button onClick={() => setEditingId(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <div className="pastry-card-inner">
                  <div className="pastry-media-wrap">
                    <img src={p.image} alt="" />
                    {p.videoUrl && <span className="video-icon">🎥 Video</span>}
                  </div>
                  <div className="pastry-body">
                    <h3>{p.name}</h3>
                    <p>₦{Number(p.price).toLocaleString()}</p>
                  </div>
                  <div className="pastry-footer">
                    <button onClick={() => { setEditingId(p.id); setEditName(p.name); setEditPrice(p.price); }}>Edit</button>
                    <button onClick={() => deletePastry(p.id)} className="p-del">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
          }
