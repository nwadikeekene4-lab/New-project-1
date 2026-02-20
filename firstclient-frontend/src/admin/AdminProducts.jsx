import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  /**
   * ✅ RETAINED: Helper to resolve the correct image URL
   */
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === "null" || typeof imagePath !== 'string') {
      return "https://placehold.co/100x100?text=No+Image";
    }

    // 1. If it's a blob (local preview) or full URL, use it directly
    if (imagePath.startsWith('blob:') || imagePath.startsWith('http')) return imagePath;
    
    // 2. Fallback for older partial paths (Cloudinary)
    const fileName = imagePath.split('/').pop();
    return `https://res.cloudinary.com/dw4jcixiu/image/upload/f_auto,q_auto/v1/shop_products/${fileName}`;
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newImageFile) return alert("All fields required");

    // ✅ RETAINED: Optimistic UI Logic
    const localPreview = URL.createObjectURL(newImageFile);
    const tempId = Date.now();

    const optimisticProduct = {
      id: tempId,
      name: newName,
      price: newPrice,
      image: localPreview, 
      syncing: true 
    };

    setProducts((prev) => [optimisticProduct, ...prev]);

    // Clear inputs immediately
    setNewName("");
    setNewPrice("");
    setNewImageFile(null);
    e.target.reset();

    // ✅ UPDATED: Manual Token Retrieval
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", optimisticProduct.name);
    formData.append("price", optimisticProduct.price);
    formData.append("image", newImageFile);

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}` 
        }
      });

      // ✅ RETAINED: Syncing flag replacement
      setProducts((prev) =>
        prev.map((p) => 
          p.id === tempId ? { ...res.data, syncing: false } : p
        )
      );
      
      URL.revokeObjectURL(localPreview);

    } catch (err) {
      setProducts((prev) => prev.filter((p) => p.id !== tempId));
      alert("Upload failed. Make sure you are still logged in.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    
    // ✅ UPDATED: Manual Token Retrieval
    const token = localStorage.getItem("adminToken");
    
    try {
      await API.delete(`/admin/products/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Error deleting product.");
    }
  };

  const updateProduct = async (id) => {
    setIsSaving(true);
    
    // ✅ UPDATED: Manual Token Retrieval
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    if (editImageFile) formData.append("image", editImageFile);

    try {
      const res = await API.put(`/admin/products/${id}`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}` 
        }
      });
      
      setProducts((prev) => 
        prev.map((p) => (p.id === id ? { ...p, ...res.data.updatedProduct } : p))
      );
      
      setEditingId(null);
      setEditImageFile(null); 
    } catch (err) {
      alert("Error updating product.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="header-content">
          <h1>Product Management</h1>
          <span className="product-count">{products.length} Items Total</span>
        </div>
      </header>

      <main className="admin-main">
        <section className="form-container">
          <form className="admin-form" onSubmit={addProduct}>
            <h3>Add New Product</h3>
            <div className="form-group-row">
              <input type="text" placeholder="Product Name" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
              <input type="number" placeholder="Price (₦)" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
              <input type="file" className="file-input" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
              <button type="submit" className="add-btn">
                + Add Product
              </button>
            </div>
          </form>
        </section>

        <div className="inventory-grid">
          {products.map((p) => (
            <div key={p.id} className="inventory-card">
              {editingId === p.id ? (
                <div className="edit-overlay">
                  <h3>Editing Product</h3>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <input type="file" onChange={(e) => setEditImageFile(e.target.files[0])} />
                  <div className="edit-actions">
                    <button className="save-btn" onClick={() => updateProduct(p.id)} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="img-wrapper" style={{ position: 'relative' }}>
                    {/* ✅ RETAINED: Image Refresh Key Logic */}
                    <img 
                      key={p.image}
                      src={getImageUrl(p.image)} 
                      alt={p.name} 
                      style={{ opacity: p.syncing ? 0.5 : 1, transition: 'opacity 0.3s' }}
                    />
                    {/* ✅ RETAINED: Syncing Badge Logic */}
                    {p.syncing && (
                      <div className="syncing-badge" style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontSize: '12px'
                      }}>
                        Uploading...
                      </div>
                    )}
                  </div>
                  <div className="info">
                    <p className="p-name">{p.name}</p>
                    <p className="p-price">₦{Number(p.price || 0).toLocaleString()}</p>
                  </div>
                  <div className="actions">
                    <button className="edit-link" onClick={() => { 
                      setEditingId(p.id); 
                      setEditName(p.name); 
                      setEditPrice(p.price); 
                    }}>Edit</button>
                    <button className="delete-link" onClick={() => deleteProduct(p.id)}>Remove</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}