import React, { useState, useEffect } from 'react';
import API from '../api';
import './AdminCMS.css'; 

const AdminCMS = () => {
  const [activeTab, setActiveTab] = useState('pages'); 
  const [aboutData, setAboutData] = useState({ title: '', description: '', image: '' });
  const [contactInfo, setContactInfo] = useState({ email: 'gbengababs36@gmail.com', phone: '08168827837', location: 'Lagos, Nigeria' });
  const [messages, setMessages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = () => {
    // 1. Restore About Preview logic
    API.get('/cms/about').then(res => {
      if (res.data) setAboutData(res.data);
    });
    // 2. Fetch Contact Details
    API.get('/cms/contact_info').then(res => {
      if (res.data && res.data.email) setContactInfo(res.data);
    });
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get('/admin/messages');
      setMessages(res.data);
    } catch (err) { console.error("Inbox load error", err); }
  };
  
  useEffect(() => {
    if (activeTab === 'pages') fetchData();
    if (activeTab === 'messages') fetchMessages();
  }, [activeTab]);

  const handleSaveAbout = async () => {
    try {
      await API.post('/cms/update', { page_name: 'about', data: aboutData });
      alert("🚀 About Page Updated!");
      setIsEditing(false);
      fetchData(); 
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
      await API.delete(`/admin/messages/${id}`);
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
        <button onClick={() => setActiveTab('pages')} className={activeTab === 'pages' ? 'active' : ''}>📝 Pages</button>
        <button onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'active' : ''}>📥 Inbox ({messages.length})</button>
      </div>

      <main className="cms-main-content">
        {activeTab === 'pages' && (
          <>
            {/* ABOUT PAGE SECTION (RESTORED PREVIEW) */}
            <div className="cms-section-card" style={{marginBottom: '30px'}}>
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
                    <button className="essence-save-btn" onClick={handleSaveAbout} disabled={uploading}>Update Page</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* CONTACT DETAILS SECTION (NEW & EDITABLE) */}
            <div className="cms-section-card">
              <div className="cms-card-header">
                <h3>Contact Info (Live on Page)</h3>
                {!isEditingContact && <button className="cms-edit-btn" onClick={() => setIsEditingContact(true)}>Edit Details</button>}
              </div>
              {isEditingContact ? (
                <div className="form-group">
                  <label>Email Address</label>
                  <input value={contactInfo.email} onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})} />
                  <label>Phone Number</label>
                  <input value={contactInfo.phone} onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} />
                  <label>Location</label>
                  <input value={contactInfo.location} onChange={(e) => setContactInfo({...contactInfo, location: e.target.value})} />
                  <div className="edit-actions">
                    <button className="essence-save-btn" onClick={handleSaveContact}>Save Contact</button>
                    <button onClick={() => setIsEditingContact(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="cms-master-preview">
                   <p><strong>Email:</strong> {contactInfo.email}</p>
                   <p><strong>Phone:</strong> {contactInfo.phone}</p>
                   <p><strong>Location:</strong> {contactInfo.location}</p>
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
