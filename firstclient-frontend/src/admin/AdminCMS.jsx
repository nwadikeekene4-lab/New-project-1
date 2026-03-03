import React, { useState, useEffect } from 'react';
import API from '../api';
import './AdminCMS.css'; 

const AdminCMS = () => {
  const [activeTab, setActiveTab] = useState('pages'); 
  const [aboutData, setAboutData] = useState({ title: '', description: '', image: '' });
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '', address: '' });
  const [messages, setMessages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchContent = () => {
    // Fetch About Page
    API.get('/cms/about').then(res => {
      if (res.data) setAboutData({ title: res.data.title || '', description: res.data.description || '', image: res.data.image || '' });
    });
    // Fetch Contact Info
    API.get('/cms/contact_info').then(res => {
      if (res.data) setContactInfo({ phone: res.data.phone || '08168827837', email: res.data.email || 'gbengababs36@gmail.com', address: res.data.address || 'Lagos, Nigeria' });
    });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await API.get('/admin/messages', { headers: { "Authorization": `Bearer ${token}` } });
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
      alert("🚀 About Page Updated!");
      setIsEditing(false);
      fetchContent(); 
    } catch (err) { alert("Error saving changes"); }
  };

  const handleSaveContact = async () => {
    try {
      await API.post('/cms/update', { page_name: 'contact_info', data: contactInfo });
      alert("📞 Contact Details Updated!");
      setIsEditingContact(false);
    } catch (err) { alert("Error updating contact info"); }
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
          <>
            {/* ABOUT PAGE SECTION */}
            <div className="cms-section-card" style={{marginBottom: '30px'}}>
              <div className="cms-card-header">
                <h3>About Page Control</h3>
                {!isEditing && <button className="cms-edit-btn" onClick={() => setIsEditing(true)}>Edit About</button>}
              </div>
              {isEditing ? (
                <div className="form-group">
                  <input placeholder="Title" value={aboutData.title} onChange={(e) => setAboutData({...aboutData, title: e.target.value})} />
                  <input type="file" onChange={handleImageUpload} />
                  <textarea rows="5" placeholder="Description" value={aboutData.description} onChange={(e) => setAboutData({...aboutData, description: e.target.value})} />
                  <div className="edit-actions">
                    <button className="essence-save-btn" onClick={handleSaveAbout}>Update About</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : <p>Manage your "About Us" content here.</p>}
            </div>

            {/* CONTACT INFO SECTION */}
            <div className="cms-section-card">
              <div className="cms-card-header">
                <h3>Contact Details (Public)</h3>
                {!isEditingContact && <button className="cms-edit-btn" onClick={() => setIsEditingContact(true)}>Edit Info</button>}
              </div>
              {isEditingContact ? (
                <div className="form-group">
                  <label>Phone Number</label>
                  <input value={contactInfo.phone} onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} />
                  <label>Email Address</label>
                  <input value={contactInfo.email} onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})} />
                  <label>Physical Address</label>
                  <input value={contactInfo.address} onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})} />
                  <div className="edit-actions">
                    <button className="essence-save-btn" onClick={handleSaveContact}>Save Details</button>
                    <button onClick={() => setIsEditingContact(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="cms-master-preview">
                  <p><strong>Phone:</strong> {contactInfo.phone}</p>
                  <p><strong>Email:</strong> {contactInfo.email}</p>
                  <p><strong>Address:</strong> {contactInfo.address}</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'messages' && (
          <div className="cms-section-card">
            <h3>Customer Inquiries</h3>
            <div className="table-responsive">
              <table className="cms-table">
                <thead><tr><th>Date</th><th>Customer</th><th>Message</th><th>Action</th></tr></thead>
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCMS;
