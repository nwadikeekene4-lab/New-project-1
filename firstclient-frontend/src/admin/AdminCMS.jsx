import React, { useState, useEffect } from 'react';
import API from '../api';
import './AdminCMS.css'; 

const AdminCMS = () => {
  const [activeTab, setActiveTab] = useState('pages'); 
  const [aboutData, setAboutData] = useState({ title: '', description: '', image: '' });
  const [messages, setMessages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchContent = () => {
    API.get('/cms/about').then(res => {
      if (res.data) {
        setAboutData({
          title: res.data.title || '',
          description: res.data.description || '',
          image: res.data.image || '' 
        });
      }
    });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await API.get('/admin/messages', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) { console.error("Inbox load error", err); }
  };
  
  useEffect(() => {
    if (activeTab === 'pages') fetchContent();
    if (activeTab === 'messages') fetchMessages();
  }, [activeTab]);

  const handleSaveAbout = async () => {
    try {
      await API.post('/cms/update', { page_name: 'about', data: aboutData });
      alert("🚀 Website Updated Successfully!");
      setIsEditing(false);
      fetchContent(); 
    } catch (err) { alert("Error saving changes"); }
  };

  const deleteMsg = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await API.delete(`/admin/messages/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
      fetchMessages();
    } catch (err) { alert("Delete failed"); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file, file.name);
    setUploading(true);
    try {
      const res = await API.post('/admin/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.image) setAboutData(prev => ({ ...prev, image: res.data.image }));
    } catch (err) { alert("Upload error"); } 
    finally { setUploading(false); }
  };

  return (
    <div className="essence-cms-container">
      <div className="cms-tab-bar">
        <button onClick={() => {setActiveTab('pages'); setIsEditing(false);}} className={activeTab === 'pages' ? 'active' : ''}>📝 Pages</button>
        <button onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'active' : ''}>📥 Inbox ({messages.length})</button>
      </div>

      <main className="cms-main-content">
        {activeTab === 'pages' && (
          <div className="cms-section-card">
            <div className="cms-card-header">
              <h3>About Page Control</h3>
              {!isEditing && <button className="cms-edit-btn" onClick={() => setIsEditing(true)}>Edit Content</button>}
            </div>
            {!isEditing ? (
              <div className="cms-master-preview">
                <h4>{aboutData.title || "Untitled"}</h4>
                {aboutData.image && <img src={aboutData.image} alt="Preview" className="cms-preview-img" />}
                <p className="cms-text-preview">{aboutData.description}</p>
              </div>
            ) : (
              <div className="form-group">
                <label>Title</label>
                <input value={aboutData.title} onChange={(e) => setAboutData({...aboutData, title: e.target.value})} />
                <label>Image</label>
                <input type="file" onChange={handleImageUpload} />
                <label>Write-up</label>
                <textarea rows="6" value={aboutData.description} onChange={(e) => setAboutData({...aboutData, description: e.target.value})} />
                <div className="edit-actions">
                  <button className="essence-save-btn" onClick={handleSaveAbout} disabled={uploading}>Update</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="cms-section-card">
            <h3>Customer Inquiries</h3>
            <div className="table-responsive">
              <table className="cms-table">
                <thead>
                  <tr><th>Date</th><th>Customer</th><th>Message</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {messages.map(msg => (
                    <tr key={msg.id}>
                      <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                      <td><strong>{msg.name}</strong><br/><small>{msg.email}</small></td>
                      <td className="msg-text-cell">{msg.message}</td>
                      <td><button onClick={() => deleteMsg(msg.id)} className="cms-delete-btn">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {messages.length === 0 && <p className="no-data">No messages yet.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCMS;
