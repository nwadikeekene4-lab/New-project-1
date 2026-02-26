import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import "./adminDashboard.css";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem("adminToken");
    if (!auth) {
      window.location.href = "/admin/login";
    }
  }, []);

  return (
    <div className="konga-dash-wrapper">
      {/* 📱 Mobile Header Toggle */}
      <div className="mobile-nav-bar">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="menu-toggle">
          {isSidebarOpen ? "✕ Close" : "☰ Menu"}
        </button>
        <span className="mobile-logo">Admin Panel</span>
      </div>

      <aside className={`konga-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <h2 className="admin-logo">Konga Admin</h2>
        </div>
        <nav className="konga-nav">
          <Link to="/admin/dashboard" className="konga-nav-link active">Dashboard Home</Link>
          <Link to="/admin/products" className="konga-nav-link">Manage Products</Link>
          <Link to="/admin/orders" className="konga-nav-link">View Orders</Link>
          <div className="nav-divider"></div>
          <Link to="/" className="konga-nav-link store-link">Go to Store</Link>
          <button onClick={handleLogout} className="konga-logout-btn">
            Logout
          </button>
        </nav>
      </aside>

      <main className="konga-dash-main">
        <header className="konga-dash-header">
          <div className="header-greeting">
            <h1>Dashboard Overview</h1>
            <p>Welcome back, Admin</p>
          </div>
          <div className="quick-actions">
             <Link to="/admin/products" className="konga-green-btn">+ New Product</Link>
          </div>
        </header>

        {/* 📊 Metrics / Stats Section */}
        <section className="konga-stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>Inventory</h3>
              <p>Product Catalog</p>
            </div>
            <div className="stat-icon">📦</div>
            <Link to="/admin/products" className="stat-link">Manage Inventory</Link>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>Orders</h3>
              <p>Customer Sales</p>
            </div>
            <div className="stat-icon">📜</div>
            <Link to="/admin/orders" className="stat-link">Process Orders</Link>
          </div>
        </section>

        {/* 🛠️ System Status Section */}
        <section className="system-status-section">
           <div className="status-banner">
              <h3>System Live</h3>
              <p>Everything is running smoothly. Your store is active.</p>
           </div>
        </section>
      </main>
    </div>
  );
}
