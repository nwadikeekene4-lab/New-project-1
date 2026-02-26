import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Ensure Link is imported
import dayjs from "dayjs"; 
import API from "../api";
import './AdminOrders.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    const token = localStorage.getItem("adminToken");
    API.get("/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const sanitizedOrders = res.data.map(order => {
          let parsedItems = [];
          try {
            parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
          } catch (e) { parsedItems = []; }
          return { ...order, items: Array.isArray(parsedItems) ? parsedItems : [] };
        });
        setOrders(sanitizedOrders);
      })
      .catch(err => console.error("Error fetching orders:", err));
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm("Are you sure?")) {
      const token = localStorage.getItem("adminToken");
      try {
        await API.delete(`/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
        setOrders(orders.filter(order => order.id !== orderId));
      } catch (err) { alert("Error deleting order."); }
    }
  };

  const deleteAllOrders = async () => {
    if (window.confirm("CRITICAL: Delete ALL orders?")) {
      const token = localStorage.getItem("adminToken");
      try {
        await API.delete("/orders/all/bulk", { headers: { Authorization: `Bearer ${token}` } });
        setOrders([]);
      } catch (err) { alert("Error clearing orders."); }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("adminToken");
    try {
      await API.patch(`/orders/${orderId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    } catch (err) { alert("Error updating status"); }
  };

  const filteredOrders = orders.filter(order => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = (order.reference?.toLowerCase() || "").includes(searchStr) || 
                          (order.customerName?.toLowerCase() || "").includes(searchStr);
    const targetFilter = filterStatus.toLowerCase();
    return matchesSearch && (targetFilter === "all" || (order.status || "Pending").toLowerCase() === targetFilter);
  });

  return (
    <div className="admin-orders-page">
      {/* Robust Minimal Arrow */}
      <Link to="/admin" className="back-btn-minimal" title="Back to Dashboard">
        ←
      </Link>

      <div className="admin-controls-container">
        <h2 className="page-title">Manage Orders</h2>
        <div className="controls-row">
          <input type="text" placeholder="Search orders..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Delivered">Delivered</option>
          </select>
          <button onClick={deleteAllOrders} className="bulk-delete-btn">Clear All History</button>
        </div>
      </div>

      <div className="orders-container">
        {filteredOrders.length === 0 ? <div className="no-orders">No matching orders found.</div> : (
          filteredOrders.map(order => {
            const deliveryDate = order.selectedDate || "Standard Delivery";
            const isDelivered = (order.status || "").toLowerCase() === "delivered";
            
            return (
              <div key={order.id} className={`order-card ${isDelivered ? "delivered-card" : ""}`}>
                <div className="order-card-header">
                  <div className="ref-group">
                    <span className="label">REF NUMBER</span>
                    <span className="value">#{order.reference}</span>
                  </div>
                  <div className="date-group">
                    <span className="label">PLACED ON</span>
                    <span className="value">
                      {dayjs(order.createdAt).format("DD MMM YYYY")} | {dayjs(order.createdAt).format("hh:mm A")}
                    </span>
                  </div>
                  <div className={`status-badge ${(order.status || "Pending").toLowerCase()}`}>
                    <select value={order.status || "Pending"} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="order-grid">
                  <div className="grid-section">
                    <h4>Customer</h4>
                    <p className="cust-name">{order.customerName}</p>
                    <p className="cust-detail">{order.phone}</p>
                    <p className="cust-detail address">{order.address}</p>
                  </div>
                  <div className="grid-section">
                    <h4>Order Details</h4>
                    <div className="items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="admin-item-row">
                          <div className="admin-item-info">
                            <p className="admin-item-name">{item.product?.name || item.name}</p>
                            <p className="admin-item-price">{item.quantity} x ₦{(item.product?.price || 0).toLocaleString()}</p>
                          </div>
                          <span className="admin-item-total">₦{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid-section summary-section">
                    <div className="delivery-highlight">
                      <span>Preferred Date:</span>
                      <strong>{deliveryDate}</strong> 
                    </div>
                    <div className="total-line">
                      <span>Total Paid:</span>
                      <span className="total-amt">₦{Number(order.amount).toLocaleString()}</span>
                    </div>
                    <button className="del-btn" onClick={() => deleteOrder(order.id)}>Delete Record</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
            }
