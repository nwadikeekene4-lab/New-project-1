import React, { useState, useEffect } from 'react';
import API from '../api';
import './AdminCMS.css'; 

const AdminCMS = () => {
  // We now have 3 distinct tabs
  const [activeTab, setActiveTab] = useState('about'); 
  const [aboutData, setAboutData] = useState({ title: '', description: '', image: '' });
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '', location: '' });
  const [messages, setMessages] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = () => {
    API.get('/cms/about').then(res => res.data && setAboutData(res.data));
    API.get('/cms/contact_info').then(res => res.data && setContactInfo(res.data));
    API.get('/admin/messages').then(res => setMessages(res.data));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (page, data, setter) => {
    try {
      await API.post('/cms/update', { page_name: page, data });
      alert("✅ Update Successful!");
      setIsEditing(false);
      fetchData();
    } catch (err) { alert("Update failed"); }
  };

  return (
    <div className="essence-cms-container">
      <h2 className="cms-main-title">Store Management</h2>
      
      {/* KONGA STYLE TAB BAR */}
      <div className="cms-tab-bar">
        <button className={activeTab === 'about' ? 'active' : ''} onClick={() => {setActiveTab('about'); setIsEditing(false)}}>About Page</button>
        <button className={activeTab === 'contact' ? 'active' : ''} onClick={() => {setActiveTab('contact'); setIsEditing(false)}}>Contact Info</button>
        <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>Inbox ({messages.length})</button>
      </div>

      <main className="cms-main-content">
        
        {/* TAB 1: ABOUT PAGE */}
        {activeTab === 'about' && (
          <div className="cms-section-card">
            <div className="cms-card-header">
              <h3>About Us Preview</h3>
              {!isEditing && <button className="cms-edit-btn" onClick={() => setIsEditing(true)}>Edit About</button>}
            </div>
            {!isEditing ? (
              <div className="cms-master-preview">
                <h4>{aboutData.title}</h4>
                {aboutData.image && <img src={aboutData.image} alt="Preview" className="cms-preview-img" />}
                <p className="cms-text-preview">{aboutData.description}</p>
              </div>
            ) : (
              <div className="form-group">
                <input value={aboutData.title} onChange={e => setAboutData({...aboutData, title: e.target.value})} placeholder="Title" />
                <input type="file" onChange={/* handleImageUpload logic here */} />
                <textarea rows="8" value={aboutData.description} onChange={e => setAboutData({...aboutData, description: e.target.value})} />
                <div className="edit-actions">
                  <button className="essence-save-btn" onClick={() => handleSave('about', aboutData)}>Save Changes</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
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
                <p><strong>Email:</strong> {contactInfo.email}</p>
                <p><strong>Phone:</strong> {contactInfo.phone}</p>
                <p><strong>Location:</strong> {contactInfo.location}</p>
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
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
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
                <thead><tr><th>Date</th><th>Customer</th><th>Message</th><th>Action</th></tr></thead>
                <tbody>
                  {messages.map(msg => (
                    <tr key={msg.id}>
                      <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                      <td><strong>{msg.name}</strong><br/>{msg.email}</td>
                      <td className="msg-text-cell">{msg.message}</td>
                      <td><button className="cms-delete-btn" onClick={() => /* deleteMsg(msg.id) */ {}}>Delete</button></td>
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
