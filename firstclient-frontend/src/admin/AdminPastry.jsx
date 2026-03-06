import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import API from "../api"; 
import './AdminProducts.css';

export default function AdminPastry() {
  const [pastries, setPastries] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  // Form States
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [pastryType, setPastryType] = useState("Other"); // Default to normal pastry

  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [editPastryType, setEditPastryType] = useState("Other");

  useEffect(() => { fetchPastries(); }, []);

  const fetchPastries = async () => {
    try {
      const res = await API.get("/products");
      const pastryOnly = res.data.filter(p => p.category === 'pastry');
      setPastries(pastryOnly);
    } catch (err) { console.error("Failed to load pastries:", err); }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === "null") return "https://placehold.co/200x200?text=No+Image";
    if (imagePath.startsWith('blob:') || imagePath.startsWith('http')) return imagePath;
    const fileName = imagePath.split('/').pop();
    return `https://res.cloudinary.com/dw4jcixiu/image/upload/f_auto,q_auto/v1/shop_products/${fileName}`;
  };

  const addPastry = async (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newImageFile) return alert("All fields required");
    
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("price", newPrice);
    formData.append("image", newImageFile);
    formData.append("category", "pastry"); 
    formData.append("subCategory", pastryType); 

    // Video only uploads if user selected Cake/Bread and provided a file
    if ((pastryType === "Cakes" || pastryType === "Breads") && newVideoFile) {
      formData.append("video", newVideoFile);
    }

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setPastries([res.data, ...pastries]);
      setNewName(""); setNewPrice(""); setNewImageFile(null); setNewVideoFile(null);
      e.target.reset();
      alert("Pastry added! ✅");
    } catch (err) { alert("Upload failed."); }
  };

  const updatePastry = async (id) => {
    setIsSaving(true);
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    formData.append("category", "pastry");
    formData.append("subCategory", editPastryType);

    if (editImageFile) formData.append("image", editImageFile);
    if (editVideoFile && (editPastryType === "Cakes" || editPastryType === "Breads")) {
      formData.append("video", editVideoFile);
    }

    try {
      const res = await API.put(`/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setPastries(pastries.map(p => p.id === id ? res.data.updatedProduct : p));
      setEditingId(null); setEditImageFile(null); setEditVideoFile(null);
      alert("Updated! ✅");
    } catch (err) { alert("Error updating."); }
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

  return (
    <div className="admin-inventory-wrapper">
      <div className="admin-container-max">
        <header className="inventory-header">
          <div className="nav-top">
            <Link to="/admin" className="back-btn-minimal">←</Link>
            <h1 className="inventory-title">Pastry Shop Management</h1>
          </div>

          <div className="inventory-actions">
            <input 
              type="text" 
              placeholder="Search pastries..." 
              className="robust-search-bar"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <form className="mini-form" onSubmit={addPastry}>
              <input type="text" placeholder="Item Name" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
              <input type="number" placeholder="Price" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
              
              <select className="type-toggle" value={pastryType} onChange={(e) => setPastryType(e.target.value)}>
                <option value="Other">General Pastry</option>
                <option value="Cakes">Cake (Video enabled)</option>
                <option value="Breads">Bread (Video enabled)</option>
              </select>

              <div className="video-section-mini">
                <div style={{display:'flex', flexDirection:'column'}}>
                  <label className="file-label">Cover Image</label>
                  <input type="file" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
                </div>

                {/* ⭐ Conditional Video Input: Only shows if Cake or Bread is selected */}
                {(pastryType === "Cakes" || pastryType === "Breads") && (
                  <div style={{display:'flex', flexDirection:'column', borderLeft:'1px solid #ddd', paddingLeft:'10px'}}>
                    <label className="file-label">Showcase Video</label>
                    <input type="file" accept="video/*" onChange={(e)=>setNewVideoFile(e.target.files[0])} />
                  </div>
                )}
              </div>

              <button type="submit" className="mini-add-btn">Add to Shop</button>
            </form>
          </div>
        </header>

        <main className="inventory-grid">
          {pastries.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div key={p.id} className={`inventory-item pastry-tag`}>
              {editingId === p.id ? (
                <div className="grid-edit-form">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <select className="type-toggle" value={editPastryType} onChange={(e) => setEditPastryType(e.target.value)}>
                    <option value="Other">General</option>
                    <option value="Cakes">Cake</option>
                    <option value="Breads">Bread</option>
                  </select>
                  <input type="file" onChange={(e) => setEditImageFile(e.target.files[0])} />
                  {(editPastryType === "Cakes" || editPastryType === "Breads") && (
                    <input type="file" accept="video/*" onChange={(e) => setEditVideoFile(e.target.files[0])} />
                  )}
                  <div className="edit-grid-btns">
                    <button className="grid-btn-save" onClick={() => updatePastry(p.id)} disabled={isSaving}>Save</button>
                    <button className="grid-btn-cancel" onClick={() => setEditingId(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <div className="item-inner">
                  <div className="item-img-container">
                    <img src={getImageUrl(p.image)} alt={p.name} />
                    {p.videoUrl && <span className="video-badge">🎥 Video</span>}
                  </div>
                  <div className="item-details">
                    <h3 className="item-name">{p.name}</h3>
                    <p className="item-price">₦{Number(p.price).toLocaleString()}</p>
                    <span className="cat-badge">{p.subCategory}</span>
                  </div>
                  <div className="item-footer-actions">
                    <button className="action-link edit" onClick={() => { 
                      setEditingId(p.id); setEditName(p.name); setEditPrice(p.price); setEditPastryType(p.subCategory || "Other");
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
