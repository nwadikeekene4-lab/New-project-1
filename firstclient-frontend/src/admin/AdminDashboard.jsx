import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import "./adminDashboard.css";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      window.location.href = "/admin/login";
    }
  }, []);

  return (
    <div className="essence-dash-wrapper">
      <div className="essence-mobile-nav">
        <button onClick={toggleSidebar} className="essence-menu-toggle">
          {isSidebarOpen ? "✕" : "☰"}
        </button>
        <span className="essence-logo-text">Essence Admin</span>
      </div>

      <aside className={`essence-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="essence-sidebar-brand">
          <h2>Essence Board</h2>
        </div>
        <nav className="essence-nav-list">
          <Link to="/admin/products" className="essence-nav-item">Manage Products</Link>
          <Link to="/admin/orders" className="essence-nav-item">View Orders</Link>
          
          {/* ⭐ New Sidebar Link for Quick Filtering */}
          <Link to="/admin/products?filter=pastry" className="essence-nav-item">
            <span className="nav-icon">🍰</span> Pastry Management
          </Link>

          <Link to="/admin/cms" className="essence-nav-item">
            <span className="nav-icon">✍️</span> Page Content
          </Link>
          <Link to="/admin/archive" className="essence-nav-item">
            <span className="nav-icon">🗑️</span> Trash / Archive
          </Link>
          
          <div className="essence-nav-spacer"></div>
          <Link to="/shop" className="essence-nav-item store-link">Go to Store</Link>
          <button onClick={handleLogout} className="essence-logout-btn">Logout</button>
        </nav>
      </aside>

      {isSidebarOpen && <div className="essence-overlay" onClick={toggleSidebar}></div>}

      <main className={`essence-main-content ${isSidebarOpen ? "sidebar-is-open" : ""}`}>
        <header className="essence-content-header">
          <div className="essence-welcome">
            <h1>Essence Admin Board</h1>
            <p>Overview of your store performance</p>
          </div>
          <div className="essence-header-actions">
             <Link to="/admin/products" className="essence-btn-primary">+ New Product</Link>
          </div>
        </header>

        <section className="essence-grid">
          <div className="essence-card">
            <div className="card-top">
              <div className="card-txt">
                <h3>Products</h3>
                <p>Standard Inventory</p>
              </div>
              <div className="card-icon">📦</div>
            </div>
            <Link to="/admin/products" className="card-footer-link">Manage Items</Link>
          </div>

          {/* ⭐ NEW PASTRY CARD */}
          <div className="essence-card pastry-special">
            <div className="card-top">
              <div className="card-txt">
                <h3>Pastries</h3>
                <p>Cakes, Breads & Clips</p>
              </div>
              <div className="card-icon">🥐</div>
            </div>
            <Link to="/admin/products" className="card-footer-link">Manage Pastries</Link>
          </div>

          <div className="essence-card">
            <div className="card-top">
              <div className="card-txt">
                <h3>Orders</h3>
                <p>Sales Tracking</p>
              </div>
              <div className="card-icon">📜</div>
            </div>
            <Link to="/admin/orders" className="card-footer-link">View Details</Link>
          </div>

          <div className="essence-card">
            <div className="card-top">
              <div className="card-txt">
                <h3>Archive</h3>
                <p>Deleted Items</p>
              </div>
              <div className="card-icon">🗑️</div>
            </div>
            <Link to="/admin/archive" className="card-footer-link">Open Trash</Link>
          </div>
        </section>
      </main>
    </div>
  );
        }
