import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import "./adminDashboard.css";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    // The "sidebar-active" class now pushes the content instead of just covering it
    <div className={`essence-dash-wrapper ${isSidebarOpen ? "sidebar-active" : ""}`}>
      
      <div className="mobile-nav-bar">
        <button onClick={toggleSidebar} className="menu-toggle">
          {isSidebarOpen ? "✕" : "☰"}
        </button>
        <span className="mobile-logo">Essence Admin</span>
      </div>

      <aside className={`essence-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-brand">
          <h2 className="admin-logo">Essence Board</h2>
        </div>
        <nav className="essence-nav">
          <Link to="/admin/products" className="essence-nav-link">Manage Products</Link>
          <Link to="/admin/orders" className="essence-nav-link">View Orders</Link>
          <div className="nav-divider"></div>
          <Link to="/" className="essence-nav-link store-link">Go to Store</Link>
          <button onClick={handleLogout} className="essence-logout-btn">
            Logout
          </button>
        </nav>
      </aside>

      {/* Overlay only active on mobile to dim the background */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <main className="essence-dash-main">
        <header className="essence-dash-header">
          <div className="header-greeting">
            <h1>Essence Admin Board</h1>
            <p>Welcome back, Admin</p>
          </div>
          <div className="quick-actions">
             <Link to="/admin/products" className="essence-action-btn">+ New Product</Link>
          </div>
        </header>

        <section className="essence-stats-grid">
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
      </main>
    </div>
  );
      }
