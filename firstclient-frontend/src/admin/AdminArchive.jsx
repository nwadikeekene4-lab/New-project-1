import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './AdminArchive.css';

const AdminArchive = () => {
  const navigate = useNavigate();
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [archivedMessages, setArchivedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  const fetchArchive = async () => {
    setLoading(true);
    try {
      const [prodRes, msgRes] = await Promise.all([
        API.get('/admin/archive/products'),
        API.get('/admin/archive/messages')
      ]);
      setArchivedProducts(prodRes.data || []);
      setArchivedMessages(msgRes.data || []);
    } catch (err) {
      console.error("Error fetching archive:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArchive(); }, []);

  const handleRestore = async (type, id) => {
    try {
      const endpoint = type === 'product' ? `/admin/products/${id}/restore` : `/admin/messages/${id}/restore`;
      await API.post(endpoint);
      alert("Item restored successfully! ✅");
      fetchArchive();
    } catch (err) {
      alert("Restore failed.");
    }
  };

  const handlePermanentDelete = async (type, id) => {
    if (!window.confirm("WARNING: This will permanently delete this item from the database. This cannot be undone. Proceed?")) return;
    try {
      const endpoint = type === 'product' ? `/admin/products/${id}/permanent` : `/admin/messages/${id}/permanent`;
      await API.delete(endpoint);
      alert("Item permanently removed from database. ✅");
      fetchArchive();
    } catch (err) {
      alert("Permanent deletion failed.");
    }
  };

  return (
    <div className="archive-container">
      <header className="archive-header">
        <button className="archive-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="archive-title-area">
          <h1>Trash Can</h1>
          <p>Products purge in 15 days | Messages purge in 60 days</p>
        </div>
      </header>

      <div className="archive-tabs">
        <button 
          className={activeTab === 'products' ? 'active' : ''} 
          onClick={() => setActiveTab('products')}
        >
          Products ({archivedProducts.length})
        </button>
        <button 
          className={activeTab === 'messages' ? 'active' : ''} 
          onClick={() => setActiveTab('messages')}
        >
          Messages ({archivedMessages.length})
        </button>
      </div>

      <main className="archive-content">
        {loading ? (
          <div className="archive-loader">Fetching deleted items...</div>
        ) : (
          <div className="archive-table-wrapper">
            {activeTab === 'products' ? (
              <table className="archive-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedProducts.length > 0 ? archivedProducts.map(p => (
                    <tr key={p.id}>
                      <td><img src={p.image} alt="" className="archive-mini-img" /></td>
                      <td><strong>{p.name}</strong></td>
                      <td>₦{Number(p.price).toLocaleString()}</td>
                      <td>
                        <div className="archive-action-btns">
                          <button className="restore-btn" onClick={() => handleRestore('product', p.id)}>Restore</button>
                          <button className="perm-delete-btn" onClick={() => handlePermanentDelete('product', p.id)}>Delete Forever</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="empty-msg">No archived products found.</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="archive-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Message Snippet</th>
                    <th>Date Deleted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedMessages.length > 0 ? archivedMessages.map(m => (
                    <tr key={m.id}>
                      <td><strong>{m.name}</strong></td>
                      <td className="archive-msg-cell">{m.message}</td>
                      <td>{new Date(m.deletedAt).toLocaleDateString()}</td>
                      <td>
                        <div className="archive-action-btns">
                          <button className="restore-btn" onClick={() => handleRestore('message', m.id)}>Restore</button>
                          <button className="perm-delete-btn" onClick={() => handlePermanentDelete('message', m.id)}>Delete Forever</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="empty-msg">No archived messages found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminArchive;
