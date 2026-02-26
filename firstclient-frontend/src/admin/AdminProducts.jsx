import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
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
    const optimisticProduct = {
      id: tempId,
      name: newName,
      price: newPrice,
      image: localPreview, 
      syncing: true 
    };

    setProducts((prev) => [optimisticProduct, ...prev]);
    setNewName("");
    setNewPrice("");
    setNewImageFile(null);
    e.target.reset();

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
      setProducts((prev) =>
        prev.map((p) => p.id === tempId ? { ...res.data, syncing: false } : p)
      );
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
    <div className="konga-admin-wrapper">
      <header className="konga-admin-header">
        <div className="header-content">
          <div className="header-left">
            {/* ✅ NEW: Back to Dashboard Link */}
            <Link to="/admin/dashboard" className="back-dash-btn">← Dashboard</Link>
            <h1>Product Management</h1>
          </div>
          <span className="product-count">{products.length} Items Total</span>
        </div>
      </header>

      <main className="konga-admin-main">
        <section className="konga-form-section">
          <form className="konga-quick-add-form" onSubmit={addProduct}>
            <h3>Add New Product</h3>
            <div className="konga-form-row">
              <input type="text" placeholder="Product Name" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
              <input type="number" placeholder="Price (₦)" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
              <div className="konga-file-wrapper">
                <input type="file" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
              </div>
              <button type="submit" className="konga-add-submit-btn">
                Add Product
              </button>
            </div>
          </form>
        </section>

        <div className="konga-inventory-grid">
          {products.map((p) => (
            <div key={p.id} className={`konga-product-card ${p.syncing ? 'is-syncing' : ''}`}>
              {editingId === p.id ? (
                <div className="konga-edit-overlay">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <input type="file" onChange={(e) => setEditImageFile(e.target.files[0])} />
                  <div className="konga-edit-actions">
                    <button className="konga-save-btn" onClick={() => updateProduct(p.id)} disabled={isSaving}>
                      {isSaving ? "..." : "Save"}
                    </button>
                    <button className="konga-cancel-btn" onClick={() => setEditingId(null)}>X</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="konga-img-container">
                    <img 
                      key={p.image}
                      src={getImageUrl(p.image)} 
                      alt={p.name} 
                      style={{ opacity: p.syncing ? 0.5 : 1 }}
                    />
                    {p.syncing && <div className="konga-uploading-tag">Uploading...</div>}
                  </div>
                  <div className="konga-product-info">
                    <p className="konga-p-name">{p.name}</p>
                    <p className="konga-p-price">₦{Number(p.price || 0).toLocaleString()}</p>
                  </div>
                  <div className="konga-product-actions">
                    <button className="konga-action-edit" onClick={() => { 
                      setEditingId(p.id); 
                      setEditName(p.name); 
                      setEditPrice(p.price); 
                    }}>Edit</button>
                    <button className="konga-action-delete" onClick={() => deleteProduct(p.id)}>Remove</button>
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
