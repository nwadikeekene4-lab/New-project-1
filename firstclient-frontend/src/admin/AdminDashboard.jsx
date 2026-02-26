import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import "./adminDashboard.css";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle function for the hamburger menu
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    <div className={`konga-dash-wrapper ${isSidebarOpen ? "sidebar-active" : ""}`}>
      
      {/* 📱 Mobile/Desktop Header Toggle */}
      <div className="mobile-nav-bar">
        <button onClick={toggleSidebar} className="menu-toggle">
          {isSidebarOpen ? "✕" : "☰"}
        </button>
        <span className="mobile-logo">Admin Panel</span>
      </div>

      {/* SIDEBAR - Slide logic controlled by isSidebarOpen */}
      <aside className={`konga-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-brand">
          <h2 className="admin-logo">Konga Admin</h2>
        </div>
        <nav className="konga-nav">
          {/* ✅ Dashboard Home Link REMOVED */}
          <Link to="/admin/products" className="konga-nav-link">Manage Products</Link>
          <Link to="/admin/orders" className="konga-nav-link">View Orders</Link>
          <div className="nav-divider"></div>
          <Link to="/" className="konga-nav-link store-link">Go to Store</Link>
          <button onClick={handleLogout} className="konga-logout-btn">
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Overlay to close sidebar when clicking outside on mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <main className="konga-dash-main">
        <header className="konga-dash-header">
          <div className="header-greeting">
            <h1>Dashboard</h1>
            <p>Welcome back, Admin</p>
          </div>
          <div className="quick-actions">
             <Link to="/admin/products" className="konga-green-btn">+ New Product</Link>
          </div>
        </header>

        <section className="konga-stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>Products</h3>
              <p>Inventory Control</p>
            </div>
            <div className="stat-icon">📦</div>
            <Link to="/admin/products" className="stat-link">Manage Items</Link>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>Orders</h3>
              <p>Sales Tracking</p>
            </div>
            <div className="stat-icon">📜</div>
            <Link to="/admin/orders" className="stat-link">View Details</Link>
          </div>
        </section>

        {/* ✅ System Status Text REMOVED */}
      </main>
    </div>
  );
      }
