import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import API from "../api"; 
import './AdminProducts.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
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
      return "https://placehold.co/100x100?text=No+Image";
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
    setNewName(""); setNewPrice(""); setNewImageFile(null);
    e.target.reset();

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", optimisticProduct.name);
    formData.append("price", optimisticProduct.price);
    formData.append("image", newImageFile);

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
    if (!window.confirm("Are you sure?")) return;
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

  return (
    <div className="admin-products-page">
      <nav className="konga-top-nav">
        <Link to="/admin/dashboard" className="konga-back-link">
          <span className="arrow">←</span> Back to Dashboard
        </Link>
      </nav>

      <div className="admin-controls-container">
        <h2 className="page-title">Product Management</h2>
        
        <section className="product-form-section">
          <form className="controls-row" onSubmit={addProduct}>
            <input type="text" placeholder="Product Name" className="search-input" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
            <input type="number" placeholder="Price (₦)" className="filter-select" style={{flex: '0.5'}} value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
            <input type="file" className="file-input-custom" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
            <button type="submit" className="konga-submit-btn">Add Product</button>
          </form>
        </section>
      </div>

      <div className="products-container">
        <div className="item-count-label">{products.length} Products in Inventory</div>
        
        {products.map((p) => (
          <div key={p.id} className="product-card">
            {editingId === p.id ? (
              <div className="edit-overlay-container">
                <div className="edit-grid">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <input type="file" onChange={(e) => setEditImageFile(e.target.files[0])} />
                  <div className="edit-actions">
                    <button className="save-btn-alt" onClick={() => updateProduct(p.id)}>{isSaving ? "..." : "Save Changes"}</button>
                    <button className="cancel-btn-alt" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="product-grid-layout">
                {/* Section 1: Image */}
                <div className="grid-section img-section">
                  <div className="admin-img-box">
                    <img src={getImageUrl(p.image)} alt={p.name} />
                    {p.syncing && <div className="sync-tag">Uploading...</div>}
                  </div>
                </div>

                {/* Section 2: Details */}
                <div className="grid-section info-section">
                  <span className="label">PRODUCT NAME</span>
                  <p className="p-name-display">{p.name}</p>
                  <span className="label">BASE PRICE</span>
                  <p className="p-price-display">₦{Number(p.price || 0).toLocaleString()}</p>
                </div>

                {/* Section 3: Actions */}
                <div className="grid-section summary-section">
                   <button className="edit-btn-action" onClick={() => { 
                      setEditingId(p.id); 
                      setEditName(p.name); 
                      setEditPrice(p.price); 
                    }}>Edit Product</button>
                   <button className="del-btn" onClick={() => deleteProduct(p.id)}>Remove from Store</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
        }
