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
      // Backend handles ?category query, but we filter here for safety
      const res = await API.get("/products");
      const generalItems = res.data.filter(p => p.category === 'general' || !p.category);
      setProducts(generalItems);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", newName); 
    formData.append("price", newPrice);
    formData.append("image", newImageFile); 
    formData.append("category", "general");

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      // Backend returns the product object directly
      setProducts([res.data, ...products]);
      setNewName(""); setNewPrice(""); setNewImageFile(null);
      e.target.reset();
      alert("Added! ✅");
    } catch (err) { alert("Upload failed."); }
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
      // Fixed: Backend returns { success: true, updatedProduct: {...} }
      const updated = res.data.updatedProduct;
      setProducts(products.map(p => p.id === id ? updated : p));
      setEditingId(null);
      alert("Updated! ✅");
    } catch (err) { alert("Update failed."); }
    finally { setIsSaving(false); }
  };

  const deleteProduct = async (id) => {
    if(!window.confirm("Delete this product?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      await API.delete(`/admin/products/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <div className="admin-inventory-wrapper">
      <div className="admin-container-max">
        <header className="inventory-header">
          <div className="nav-top">
            <Link to="/admin" className="back-btn-minimal">←</Link>
            <h1 className="inventory-title">General Inventory</h1>
          </div>
          <div className="inventory-actions">
            <input type="text" placeholder="Search..." className="robust-search-bar" onChange={(e) => setSearchTerm(e.target.value)} />
            <form className="mini-form" onSubmit={addProduct}>
              <input type="text" placeholder="Name" value={newName} onChange={(e)=>setNewName(e.target.value)} required />
              <input type="number" placeholder="Price" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} required />
              <input type="file" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
              <button type="submit" className="mini-add-btn">Add</button>
            </form>
          </div>
        </header>

        <main className="inventory-grid">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div key={p.id} className="inventory-item">
              {editingId === p.id ? (
                <div className="grid-edit-form">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <div className="edit-grid-btns">
                    <button className="grid-btn-save" onClick={() => updateProduct(p.id)} disabled={isSaving}>Save</button>
                    <button className="grid-btn-cancel" onClick={() => setEditingId(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <div className="item-inner">
                  <div className="item-img-container"><img src={p.image} alt="" /></div>
                  <div className="item-details">
                    <h3 className="item-name">{p.name}</h3>
                    <p className="item-price">₦{Number(p.price).toLocaleString()}</p>
                  </div>
                  <div className="item-footer-actions">
                    <button className="action-link edit" onClick={() => { setEditingId(p.id); setEditName(p.name); setEditPrice(p.price); }}>Edit</button>
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
