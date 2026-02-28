import React, { useState, useEffect } from 'react';
import API from '../api';
import './AdminCMS.css'; 

const AdminCMS = () => {
  // We use tabs to keep the interface clean and professional
  const [activeTab, setActiveTab] = useState('pages'); 

  return (
    <div className="essence-cms-container">
      <header className="cms-header">
        <h2>Site Content Management</h2>
        <p>Update your pages, moderate reviews, and check messages.</p>
      </header>

      {/* Internal Navigation Tabs */}
      <div className="cms-tab-bar">
        <button 
          className={activeTab === 'pages' ? 'active' : ''} 
          onClick={() => setActiveTab('pages')}
        >
          📝 Edit Pages
        </button>
        <button 
          className={activeTab === 'reviews' ? 'active' : ''} 
          onClick={() => setActiveTab('reviews')}
        >
          ⭐ Manage Reviews
        </button>
        <button 
          className={activeTab === 'messages' ? 'active' : ''} 
          onClick={() => setActiveTab('messages')}
        >
          📥 Inbox
        </button>
      </div>

      <main className="cms-main-content">
        {activeTab === 'pages' && (
          <div className="cms-section-card">
            <h3>Page Editor</h3>
            <p>Select a page to edit its text and images.</p>
            {/* We will build the forms here in Step 3 */}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="cms-section-card">
            <h3>Review Moderation</h3>
            <p>Approve or delete customer reviews here.</p>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="cms-section-card">
            <h3>Contact Messages</h3>
            <p>Messages sent from the Contact Us form.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCMS;
