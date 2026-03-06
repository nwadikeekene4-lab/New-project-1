import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import './AdminProducts.css'; // Keep consistent styling

export default function AdminPastry() {
  const [products, setProducts] = useState([]);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [subCategory, setSubCategory] = useState("Cakes"); // Default
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchPastries(); }, []);

  // ⭐ Strictly fetch only pastries
  const fetchPastries = async () => {
    try {
      const res = await API.get("/products");
      const onlyPastries = res.data.filter(p => p.category === 'pastry');
      setProducts(onlyPastries);
    } catch (err) { console.error("Failed to load pastries:", err); }
  };

  const addPastry = async (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newImageFile) return alert("Please add Name, Price, and Image");

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("price", newPrice);
    formData.append("image", newImageFile);
    formData.append("category", "pastry"); // Auto-tag as pastry
    formData.append("subCategory", subCategory);
    if (newVideoFile) formData.append("video", newVideoFile);

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setProducts([res.data, ...products]);
      resetForm(e);
      alert("Pastry added successfully! ✅");
    } catch (err) { alert("Upload failed."); }
  };

  const resetForm = (e) => {
    setNewName(""); setNewPrice(""); setNewImageFile(null); setNewVideoFile(null);
    e.target.reset();
  };

  const deletePastry = async (id) => {
    if (!window.confirm("Delete this pastry?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await API.delete(`/admin/products/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
      setProducts(products.filter(p => p.id !== id));
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
          
          <div className="add-product-mini-card">
            <p style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>Add new Cakes or Breads below:</p>
            <form className="mini-form" onSubmit={addPastry}>
              <input type="text" placeholder="Pastry Name" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
              <input type="number" placeholder="Price" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
              
              <select className="type-toggle" value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
                <option value="Cakes">Cake Item</option>
                <option value="Breads">Bread Item</option>
              </select>

              <div className="video-section-mini">
                <label className="file-label">Image (Required)</label>
                <input type="file" accept="image/*" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
                
                <label className="file-label">Video (Optional clip)</label>
                <input type="file" accept="video/*" onChange={(e)=>setNewVideoFile(e.target.files[0])} />
              </div>

              <button type="submit" className="mini-add-btn">Upload Pastry</button>
            </form>
          </div>
        </header>

        <main className="inventory-grid">
          {products.map((p) => (
            <div key={p.id} className="inventory-item pastry-tag">
              <div className="item-img-container">
                <img src={p.image} alt={p.name} />
                {p.videoUrl && <span className="video-badge">🎥 Video Clip</span>}
              </div>
              <div className="item-details">
                <h3 className="item-name">{p.name}</h3>
                <p className="item-price">₦{Number(p.price).toLocaleString()}</p>
                <span className="type-toggle" style={{display:'inline-block', marginTop:'5px'}}>{p.subCategory}</span>
              </div>
              <div className="item-footer-actions">
                <button className="action-link delete" style={{gridColumn: 'span 2'}} onClick={() => deletePastry(p.id)}>Remove Item</button>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
    }
