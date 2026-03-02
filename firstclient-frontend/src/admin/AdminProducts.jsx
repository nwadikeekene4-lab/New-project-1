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
  const [isSaving, setIsSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) { console.error("Failed to load products:", err); }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === "null" || typeof imagePath !== 'string') {
      return "https://placehold.co/200x200?text=No+Image";
    }
    if (imagePath.startsWith('blob:') || imagePath.startsWith('http')) return imagePath;
    const fileName = imagePath.split('/').pop();
    return `https://res.cloudinary.com/dw4jcixiu/image/upload/f_auto,q_auto/v1/shop_products/${fileName}`;
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newImageFile) return alert("All fields required");
    const localPreview = URL.createObjectURL(newImageFile);
    const tempId = Date.now();
    const optimisticProduct = { id: tempId, name: newName, price: newPrice, image: localPreview, syncing: true };
    setProducts((prev) => [optimisticProduct, ...prev]);
    
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("price", newPrice);
    formData.append("image", newImageFile);

    setNewName(""); setNewPrice(""); setNewImageFile(null);
    e.target.reset();

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setProducts((prev) => prev.map((p) => p.id === tempId ? { ...res.data, syncing: false } : p));
      URL.revokeObjectURL(localPreview);
    } catch (err) {
      setProducts((prev) => prev.filter((p) => p.id !== tempId));
      alert("Upload failed.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      await API.delete(`/admin/products/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) { alert("Error deleting product."); }
  };

  const updateProduct = async (id) => {
    setIsSaving(true);
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    if (editImageFile) formData.append("image", editImageFile);
    try {
      const res = await API.put(`/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...res.data.updatedProduct } : p)));
      setEditingId(null); setEditImageFile(null); 
    } catch (err) { alert("Error updating product."); } 
    finally { setIsSaving(false); }
  };

  // --- SAFE FILTER LOGIC ---
  // We check if p.name exists before calling toLowerCase() to prevent crashing
  const filteredProducts = products.filter(p => 
    p.name && typeof p.name === 'string' && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-inventory-wrapper">
      <div className="admin-container-max">
        
        <header className="inventory-header">
          <div className="nav-top">
            <Link to="/admin" className="back-btn-minimal" title="Back to Dashboard">
              ←
            </Link>
            <h1 className="inventory-title">Manage Inventory</h1>
          </div>

          <div className="inventory-actions">
            <div className="search-box-container">
              <input 
                type="text" 
                placeholder="Search products by name..." 
                className="robust-search-bar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <section className="add-product-mini-card">
              <form className="mini-form" onSubmit={addProduct}>
                <input type="text" placeholder="Name" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
                <input type="number" placeholder="Price" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
                <input type="file" className="mini-file" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
                <button type="submit" className="mini-add-btn">Add Product</button>
              </form>
            </section>
          </div>
        </header>

        <main className="inventory-grid">
          {filteredProducts.length === 0 ? (
            <div style={{ color: 'white', textAlign: 'center', gridColumn: '1/-1', padding: '40px' }}>
              No valid products found.
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div key={p.id} className="inventory-item">
                {editingId === p.id ? (
                  <div className="grid-edit-form">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                    <div className="edit-grid-btns">
                      <button className="grid-btn-save" onClick={() => updateProduct(p.id)}>{isSaving ? "..." : "Save"}</button>
                      <button className="grid-btn-cancel" onClick={() => setEditingId(null)}>✕</button>
                    </div>
                  </div>
                ) : (
                  <div className="item-inner">
                    <div className="item-img-container">
                      <img src={getImageUrl(p.image)} alt={p.name || "Product"} loading="lazy" />
                      {p.syncing && <div className="sync-overlay"><span>Syncing...</span></div>}
                    </div>
                    <div className="item-details">
                      {/* Safety fallback for missing names/prices */}
                      <h3 className="item-name">{p.name || "Untitled Product"}</h3>
                      <p className="item-price">₦{Number(p.price || 0).toLocaleString()}</p>
                    </div>
                    <div className="item-footer-actions">
                      <button className="action-link edit" onClick={() => { setEditingId(p.id); setEditName(p.name || ""); setEditPrice(p.price || 0); }}>Edit</button>
                      <button className="action-link delete" onClick={() => deleteProduct(p.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
      }
