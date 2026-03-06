import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import API from "../api"; 
import './AdminProducts.css'; 

export default function AdminPastry() {
  const [pastries, setPastries] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [pastryType, setPastryType] = useState("Others");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchPastries(); }, []);

  const fetchPastries = async () => {
    try {
      const res = await API.get("/products");
      setPastries(res.data.filter(p => p.category === 'pastry'));
    } catch (err) { console.error(err); }
  };

  const addPastry = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", newName); formData.append("price", newPrice);
    formData.append("image", newImageFile); formData.append("category", "pastry");
    formData.append("subCategory", pastryType);
    if (newVideoFile) formData.append("video", newVideoFile);

    try {
      const res = await API.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      setPastries([res.data, ...pastries]);
      alert("Pastry Added! ✅");
      e.target.reset();
    } catch (err) { alert("Failed."); }
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
            <input type="text" placeholder="Search pastries..." className="robust-search-bar" onChange={(e)=>setSearchTerm(e.target.value)} />
            <form className="mini-form" onSubmit={addPastry}>
              <input type="text" placeholder="Name" onChange={(e)=>setNewName(e.target.value)} required />
              <input type="number" placeholder="Price" onChange={(e)=>setNewPrice(e.target.value)} required />
              <select onChange={(e)=>setPastryType(e.target.value)}>
                <option value="Cakes">Cakes</option><option value="Breads">Breads</option><option value="Others">Others</option>
              </select>
              <input type="file" accept="image/*" onChange={(e)=>setNewImageFile(e.target.files[0])} required />
              <input type="file" accept="video/*" onChange={(e)=>setNewVideoFile(e.target.files[0])} />
              <button type="submit" className="mini-add-btn">Upload</button>
            </form>
          </div>
        </header>
        <main className="inventory-grid">
          {pastries.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div key={p.id} className="inventory-item">
              <div className="item-inner">
                <div className="item-img-container">
                  <img src={p.image} alt="" />
                  {p.videoUrl && <span className="video-badge">🎥 Video</span>}
                </div>
                <div className="item-details">
                  <h3 className="item-name">{p.name}</h3>
                  <p className="item-price">₦{Number(p.price).toLocaleString()}</p>
                  <span className="item-cat">{p.subCategory}</span>
                </div>
                <div className="item-footer-actions">
                  <button className="action-link edit">Edit</button>
                  <button className="action-link delete">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
      }
