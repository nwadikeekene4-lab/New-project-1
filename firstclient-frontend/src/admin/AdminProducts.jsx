import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import API from "../api"; 
import './AdminProducts.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newVideoFile, setNewVideoFile] = useState(null); 
  const [pastryType, setPastryType] = useState("Cakes"); // ⭐ Strictly for Cakes/Breads

  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [editPastryType, setEditPastryType] = useState("Cakes");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) { console.error("Failed to load products:", err); }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === "null") return "https://placehold.co/200x200?text=No+Image";
    if (imagePath.startsWith('blob:') || imagePath.startsWith('http')) return imagePath;
    const fileName = imagePath.split('/').pop();
    return `https://res.cloudinary.com/dw4jcixiu/image/upload/f_auto,q_auto/v1/shop_products/${fileName}`;
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newImageFile) return alert("All fields required");
    
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("price", newPrice);
    formData.append("image", newImageFile);

    // ⭐ If video exists, it's a Pastry (Cake or Bread). Otherwise, it's General.
    if (newVideoFile) {
      formData.append("video", newVideoFile);
      formData.append("category", "pastry");
      formData.append("subCategory", pastryType); 
    } else {
      formData.append("category", "general");
    }

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setProducts([res.data, ...products]);
      setNewName(""); setNewPrice(""); setNewImageFile(null); setNewVideoFile(null);
      e.target.reset();
      alert("Product added! ✅");
    } catch (err) { alert("Upload failed."); }
  };

  const updateProduct = async (id, originalCategory, originalSub) => {
    setIsSaving(true);
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    
    // Use the toggled subCategory if a new video is being uploaded
    formData.append("category", editVideoFile ? "pastry" : (originalCategory || "general"));
    formData.append("subCategory", editVideoFile ? editPastryType : (originalSub || ""));

    if (editImageFile) formData.append("image", editImageFile);
    if (editVideoFile) formData.append("video", editVideoFile);

    try {
      const res = await API.put(`/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setProducts(products.map(p => p.id === id ? res.data.updatedProduct : p));
      setEditingId(null); setEditImageFile(null); setEditVideoFile(null);
      alert("Updated! ✅");
    } catch (err) { alert("Error updating."); }
    finally { setIsSaving(false); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Archive this product?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      await API.delete(`/admin/products/${id}`, { 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      setProducts(products.filter(p => p.id !== id));
    } catch (err) { alert("Error archiving."); }
  };

  const filteredProducts = products.filter(p => 
    p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-inventory-wrapper">
      <div className="admin-container-max">
        <header className="inventory-header">
          <div className="nav-top">
            <Link to="/admin" className="back-btn-minimal">←</Link>
            <h1 className="inventory-title">Manage Inventory</h1>
          </div>
          <div className="inventory-actions">
            <input 
              type="text" 
              placeholder="Search..." 
              className="robust-search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <form className="mini-form" onSubmit={addProduct}>
              <input type="text" placeholder="Name" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
              <input type="number" placeholder="Price" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
              
              {/* ⭐ Video Input + Tiny Toggle for Type */}
              <div className="video-section-mini">
                <input type="file" accept="video/*" onChange={(e)=>setNewVideoFile(e.target.files[0])} />
                {newVideoFile && (
                  <select className="type-toggle" onChange={(e) => setPastryType(e.target.value)}>
                    <option value="Cakes">Is Cake</option>
                    <option value="Breads">Is Bread</option>
                  </select>
                )}
              </div>

              <input type="file" className="mini-file" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
              <button type="submit" className="mini-add-btn">Add</button>
            </form>
          </div>
        </header>

        <main className="inventory-grid">
          {filteredProducts.map((p) => (
            <div key={p.id} className="inventory-item">
              {editingId === p.id ? (
                <div className="grid-edit-form">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  
                  <div className="video-section-mini">
                    <input type="file" onChange={(e) => setEditVideoFile(e.target.files[0])} />
                    {editVideoFile && (
                      <select className="type-toggle" onChange={(e) => setEditPastryType(e.target.value)}>
                        <option value="Cakes">Cake</option>
                        <option value="Breads">Bread</option>
                      </select>
                    )}
                  </div>

                  <input type="file" className="mini-file" onChange={(e) => setEditImageFile(e.target.files[0])} />
                  <div className="edit-grid-btns">
                    <button className="grid-btn-save" onClick={() => updateProduct(p.id, p.category, p.subCategory)} disabled={isSaving}>Save</button>
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
                  </div>
                  <div className="item-footer-actions">
                    <button className="action-link edit" onClick={() => { 
                      setEditingId(p.id); setEditName(p.name); setEditPrice(p.price); 
                    }}>Edit</button>
                    <button className="action-link delete" onClick={() => deleteProduct(p.id)}>Delete</button>
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
