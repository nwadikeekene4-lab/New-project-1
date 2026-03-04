import React, { useState, useEffect } from 'react';
import API from '../api';
import './AdminCMS.css'; 

const AdminCMS = () => {
  const [activeTab, setActiveTab] = useState('about'); 
  const [aboutData, setAboutData] = useState({ title: '', description: '', image: '' });
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '', location: '' });
  const [messages, setMessages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetching for speed
      const [aboutRes, contactRes, msgRes] = await Promise.all([
        API.get('/cms/about'),
        API.get('/cms/contact_info'),
        API.get('/admin/messages')
      ]);

      if (aboutRes.data) setAboutData(aboutRes.data);
      if (contactRes.data) setContactInfo(contactRes.data);
      setMessages(msgRes.data || []);
    } catch (err) {
      console.error("Error fetching CMS data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (page, data) => {
    try {
      await API.post('/cms/update', { page_name: page, data });
      alert("✅ Store Updated Successfully!");
      setIsEditing(false);
      fetchData();
    } catch (err) {
      alert("Update failed. Check your network.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await API.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAboutData({ ...aboutData, image: res.data.image });
      alert("Image uploaded successfully!");
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteMsg = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await API.delete(`/admin/messages/${id}`);
      setMessages(messages.filter(m => m.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="essence-cms-container">
      <header className="cms-header">
        <h2 className="cms-main-title">Store Management</h2>
      </header>
      
      {/* KONGA STYLE TAB BAR */}
      <div className="cms-tab-bar">
        <button className={activeTab === 'about' ? 'active' : ''} onClick={() => {setActiveTab('about'); setIsEditing(false);}}>About Page</button>
        <button className={activeTab === 'contact' ? 'active' : ''} onClick={() => {setActiveTab('contact'); setIsEditing(false);}}>Contact Info</button>
        <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => {setActiveTab('messages'); setIsEditing(false);}}>Inbox ({messages.length})</button>
      </div>

      <main className="cms-main-content">
        {loading ? (
          <div className="cms-loader">Updating dashboard...</div>
        ) : (
          <>
            {/* TAB 1: ABOUT PAGE */}
            {activeTab === 'about' && (
              <div className="cms-section-card">
                <div className="cms-card-header">
                  <h3>About Us Preview</h3>
                  {!isEditing && <button className="cms-edit-btn" onClick={() => setIsEditing(true)}>Edit About</button>}
                </div>
                {!isEditing ? (
                  <div className="cms-master-preview">
                    <h4>{aboutData.title || "No Title Set"}</h4>
                    {aboutData.image && <img src={aboutData.image} alt="Preview" className="cms-preview-img" />}
                    <p className="cms-text-preview">{aboutData.description || "No description provided."}</p>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Title</label>
                    <input value={aboutData.title} onChange={e => setAboutData({...aboutData, title: e.target.value})} placeholder="Enter Title" />
                    <label>Update Image</label>
                    <input type="file" onChange={handleImageUpload} />
                    {uploading && <p className="uploading-text">Uploading to Cloudinary...</p>}
                    <label>Write-up</label>
                    <textarea rows="8" value={aboutData.description} onChange={e => setAboutData({...aboutData, description: e.target.value})} placeholder="Enter write-up..." />
                    <div className="edit-actions">
                      <button className="essence-save-btn" onClick={() => handleSave('about', aboutData)}>Save Changes</button>
                      <button className="cms-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CONTACT INFO */}
            {activeTab === 'contact' && (
              <div className="cms-section-card">
                <div className="cms-card-header">
                  <h3>Business Details</h3>
                  {!isEditing && <button className="cms-edit-btn" onClick={() => setIsEditing(true)}>Edit Details</button>}
                </div>
                {!isEditing ? (
                  <div className="cms-master-preview">
                    <div className="info-preview-box">
                      <p><strong>Email:</strong> {contactInfo.email || "Not set"}</p>
                      <p><strong>Phone:</strong> {contactInfo.phone || "Not set"}</p>
                      <p><strong>Location:</strong> {contactInfo.location || "Not set"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Email Address</label>
                    <input value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} />
                    <label>Phone Number</label>
                    <input value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} />
                    <label>Location</label>
                    <input value={contactInfo.location} onChange={e => setContactInfo({...contactInfo, location: e.target.value})} />
                    <div className="edit-actions">
                      <button className="essence-save-btn" onClick={() => handleSave('contact_info', contactInfo)}>Update Contact</button>
                      <button className="cms-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: INBOX */}
            {activeTab === 'messages' && (
              <div className="cms-section-card">
                <h3>Customer Messages</h3>
                <div className="table-responsive">
                  <table className="cms-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Message</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length > 0 ? (
                        messages.map(msg => (
                          <tr key={msg.id}>
                            <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                            <td><strong>{msg.name}</strong><br/><span className="cms-email-sub">{msg.email}</span></td>
                            <td className="msg-text-cell">{msg.message}</td>
                            <td><button className="cms-delete-btn" onClick={() => deleteMsg(msg.id)}>Delete</button></td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="cms-no-data">Your inbox is empty.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminCMS;
