import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import "./adminDashboard.css";

export default function AdminDashboard() {

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    
    if (confirmLogout) {
      // ✅ UPDATED: Clear the token from storage
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
  };

  useEffect(() => {
    // ✅ UPDATED: Check for the token key
    const auth = localStorage.getItem("adminToken");
    if (!auth) {
      window.location.href = "/admin/login";
    }
  }, []);

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2 className="admin-logo">Admin Panel</h2>
        <nav className="admin-nav" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Link to="/admin/products" className="admin-link">Manage Products</Link>
          <Link to="/admin/orders" className="admin-link">View Orders</Link>
          <Link to="/" className="admin-link home-btn">Go to Store</Link>

          <button 
            onClick={handleLogout} 
            style={{ 
              backgroundColor: '#d9534f', 
              color: 'white', 
              padding: '12px', 
              cursor: 'pointer', 
              border: 'none', 
              borderRadius: '5px',
              marginTop: '40px',
              fontWeight: 'bold'
            }}
          >
            Logout 
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-text">
            <h1>Dashboard</h1>
            <p>Welcome back, Admin</p>
          </div>
        </header>

        <section className="admin-cards">
          <div className="admin-card">
            <div className="card-icon">📦</div>
            <h3>Products</h3>
            <p>Add, edit, or delete items in your catalog</p>
            <Link to="/admin/products" className="admin-btn">Manage</Link>
          </div>

          <div className="admin-card">
            <div className="card-icon">📜</div>
            <h3>Orders</h3>
            <p>Track and manage customer purchases</p>
            <Link to="/admin/orders" className="admin-btn">View Orders</Link>
          </div>
        </section>
      </main>
    </div>
  );
}