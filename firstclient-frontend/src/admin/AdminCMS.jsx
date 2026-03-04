import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './AdminCMS.css'; 

const AdminCMS = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about'); 
  const [aboutData, setAboutData] = useState({ title: '', description: '', image: '' });
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '', location: '' });
  const [socialData, setSocialData] = useState({ handles: [], care: [] });
  const [messages, setMessages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aboutRes, contactRes, msgRes, socialRes] = await Promise.all([
        API.get('/cms/about'),
        API.get('/cms/contact_info'),
        API.get('/admin/messages'),
        API.get('/cms/social_links')
      ]);

      if (aboutRes.data) setAboutData(aboutRes.data);
      if (contactRes.data) setContactInfo(contactRes.data);
      if (socialRes.data) setSocialData({
        handles: socialRes.data.handles || [],
        care: socialRes.data.care || []
      });
      setMessages(Array.isArray(msgRes.data) ? msgRes.data : []);
    } catch (err) {
      console.error("Error fetching CMS data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  // --- Dynamic Social Logic ---
  const addSocial = () => {
    setSocialData(prev => ({ ...prev, handles: [...prev.handles, { platform: '', handle: '', link: '' }] }));
  };

  const addCare = () => {
    setSocialData(prev => ({ ...prev, care: [...prev.care, { number: '', type: 'WhatsApp' }] }));
  };

  const removeRow = (type, index) => {
    const updated = [...socialData[type]];
    updated.splice(index, 1);
    setSocialData({ ...socialData, [type]: updated });
  };

  const updateSocialField = (type, index, field, value) => {
    const updated = [...socialData[type]];
    updated[index][field] = value;
    setSocialData({ ...socialData, [type]: updated });
  };

  // --- Message Actions ---
  const toggleReplied = (id) => {
    setMessages(messages.map(m => m.id === id ? { ...m, replied: !m.replied } : m));
    // Note: If you want to persist this to DB, you'd add: API.patch(`/admin/messages/${id}`, { replied: true });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await API.post('/admin/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAboutData({ ...aboutData, image: res.data.image });
    } catch (err) { alert("Upload failed"); } 
    finally { setUploading(false); }
  };

  const formatWhatsApp = (num) => {
    if(!num) return "";
    const cleanNum = num.replace(/\D/g, '');
    return cleanNum.startsWith('0') ? `234${cleanNum.slice(1)}` : cleanNum;
  };

  return (
    <div className="essence-cms-container">
      <header className="cms-header">
        <button className="nav-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2 className="cms-main-title">Store Management</h2>
      </header>
      
      <div className="cms-tab-bar">
        <button className={activeTab === 'about' ? 'active' : ''} onClick={() => {setActiveTab('about'); setIsEditing(false);}}>About</button>
        <button className={activeTab === 'contact' ? 'active' : ''} onClick={() => {setActiveTab('contact'); setIsEditing(false);}}>Contact</button>
        <button className={activeTab === 'socials' ? 'active' : ''} onClick={() => {setActiveTab('socials'); setIsEditing(false);}}>Socials</button>
        <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => {setActiveTab('messages'); setIsEditing(false);}}>Inbox ({messages.length})</button>
      </div>

      <main className="cms-main-content">
        {loading ? <div className="cms-loader">Updating dashboard...</div> : (
          <div className="cms-fade-in">
            
            {/* TAB 1: ABOUT */}
            {activeTab === 'about' && (
              <div className="cms-section-card">
                <div className="cms-card-header">
                  <h3>About Us Preview</h3>
                  {!isEditing && <button className="cms-edit-btn" onClick={() => setIsEditing(true)}>Edit About</button>}
                </div>
                {!isEditing ? (
                  <div className="cms-master-preview">
                    <h4>{aboutData.title || "No Title"}</h4>
                    {aboutData.image && <img src={aboutData.image} alt="Preview" className="cms-preview-img" />}
                    <p className="cms-text-preview" style={{whiteSpace: 'pre-wrap'}}>{aboutData.description}</p>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Title</label>
                    <input value={aboutData.title} onChange={e => setAboutData({...aboutData, title: e.target.value})} />
                    <label>Image</label>
                    <input type="file" onChange={handleImageUpload} />
                    {uploading && <p className="uploading-text">Uploading image...</p>}
                    <textarea rows="8" value={aboutData.description} onChange={e => setAboutData({...aboutData, description: e.target.value})} />
                    <div className="edit-actions">
                      <button className="essence-save-btn" onClick={() => handleSave('about', aboutData)}>Save Changes</button>
                      <button className="cms-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CONTACT */}
            {activeTab === 'contact' && (
              <div className="cms-section-card">
                <div className="cms-card-header">
                  <h3>Business Contact Details</h3>
                  {!isEditing && <button className="cms-edit-btn" onClick={() => setIsEditing(true)}>Edit Details</button>}
                </div>
                {!isEditing ? (
                  <div className="cms-master-preview">
                    <p><strong>Email:</strong> {contactInfo.email || "Not set"}</p>
                    <p><strong>Phone:</strong> {contactInfo.phone || "Not set"}</p>
                    <p><strong>Location:</strong> {contactInfo.location || "Not set"}</p>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Business Email</label>
                    <input value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} />
                    <label>Business Phone</label>
                    <input value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} />
                    <label>Store Location</label>
                    <input value={contactInfo.location} onChange={e => setContactInfo({...contactInfo, location: e.target.value})} />
                    <div className="edit-actions">
                      <button className="essence-save-btn" onClick={() => handleSave('contact_info', contactInfo)}>Update Contact</button>
                      <button className="cms-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SOCIALS */}
            {activeTab === 'socials' && (
              <div className="cms-section-card">
                <div className="cms-card-header">
                  <h3>Social Media & Customer Care</h3>
                  {!isEditing && <button className="cms-edit-btn" onClick={() => setIsEditing(true)}>Manage Socials</button>}
                </div>
                
                <div className="social-manager-wrapper">
                  <h4>Customer Care Numbers</h4>
                  {socialData.care.map((item, i) => (
                    <div key={i} className="dynamic-row">
                      <input disabled={!isEditing} placeholder="Phone Number" value={item.number} onChange={e => updateSocialField('care', i, 'number', e.target.value)} />
                      <select disabled={!isEditing} value={item.type} onChange={e => updateSocialField('care', i, 'type', e.target.value)}>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Call">Call</option>
                      </select>
                      {isEditing && <button className="row-del-btn" onClick={() => removeRow('care', i)}>×</button>}
                    </div>
                  ))}
                  {isEditing && <button className="add-row-btn" onClick={addCare}>+ Add Phone</button>}

                  <hr style={{margin: '20px 0', opacity: 0.1}} />

                  <h4>Social Links</h4>
                  {socialData.handles.map((item, i) => (
                    <div key={i} className="dynamic-row">
                      <input disabled={!isEditing} placeholder="Platform (e.g. Instagram)" value={item.platform} onChange={e => updateSocialField('handles', i, 'platform', e.target.value)} />
                      <input disabled={!isEditing} placeholder="Handle/Label" value={item.handle} onChange={e => updateSocialField('handles', i, 'handle', e.target.value)} />
                      <input disabled={!isEditing} placeholder="Link (URL)" value={item.link} onChange={e => updateSocialField('handles', i, 'link', e.target.value)} />
                      {isEditing && <button className="row-del-btn" onClick={() => removeRow('handles', i)}>×</button>}
                    </div>
                  ))}
                  {isEditing && <button className="add-row-btn" onClick={addSocial}>+ Add Social Handle</button>}

                  {isEditing && (
                    <div className="edit-actions" style={{marginTop: '20px'}}>
                      <button className="essence-save-btn" onClick={() => handleSave('social_links', socialData)}>Save Social Media</button>
                      <button className="cms-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: INBOX (WITH TIME STAMP & REPLIED MARKER) */}
            {activeTab === 'messages' && (
              <div className="cms-section-card">
                <h3>Customer Messages</h3>
                <div className="table-responsive">
                  <table className="cms-table">
                    <thead>
                      <tr>
                        <th>Time Received</th>
                        <th>Customer</th>
                        <th>Message</th>
                        <th>Status / Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length > 0 ? messages.map(msg => (
                        <tr key={msg.id} style={{ opacity: msg.replied ? 0.6 : 1 }}>
                          <td className="time-cell">
                            <div style={{fontWeight: '600', fontSize: '12px'}}>{new Date(msg.createdAt).toLocaleDateString()}</div>
                            <div style={{fontSize: '11px', color: '#888'}}>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </td>
                          <td>
                            <strong>{msg.name}</strong><br/>
                            <a href={`https://wa.me/${formatWhatsApp(msg.phone)}`} target="_blank" rel="noreferrer" style={{color: '#25D366', fontSize: '12px', textDecoration: 'none'}}>
                              {msg.phone || "No Phone"}
                            </a>
                          </td>
                          <td className="msg-text-cell">{msg.message}</td>
                          <td>
                            <div className="action-stack">
                              <button 
                                className={`mark-btn ${msg.replied ? 'replied' : ''}`}
                                onClick={() => toggleReplied(msg.id)}
                              >
                                {msg.replied ? '✓ Replied' : 'Mark Replied'}
                              </button>
                              <button className="cms-delete-btn" onClick={() => {
                                if(window.confirm("Delete this message?")) API.delete(`/admin/messages/${msg.id}`).then(() => fetchData());
                              }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#999'}}>No messages found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCMS;
