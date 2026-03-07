import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import dayjs from "dayjs"; 
import API from "../api";
import './AdminOrders.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => { 
    document.title = "Manage Orders | Essence Creations";
    fetchOrders(); 
  }, []);

  const fetchOrders = () => {
    API.get("/orders")
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

  // ⭐ PRINT RECEIPT LOGIC (Matches your client's receipt style)
  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₦${Number(item.product?.price || item.price || 0).toLocaleString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.reference}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #1e293b; letter-spacing: 1px; }
            .details { margin-bottom: 30px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
            .total { text-align: right; margin-top: 25px; font-size: 1.4rem; font-weight: 800; color: #059669; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ESSENCE CREATIONS</h1>
            <p>Order Payment Receipt</p>
          </div>
          <div class="details">
            <div>
              <p><strong>Billed To:</strong><br>${order.customerName}<br>${order.phone}<br>${order.address}, ${order.city}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Order Ref:</strong> #${order.reference}<br>
              <strong>Date:</strong> ${dayjs(order.createdAt).format("DD MMM YYYY")}<br>
              <strong>Delivery:</strong> ${order.selectedDate || "Standard"}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Item Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="total">Amount Paid: ₦${Number(order.amount).toLocaleString()}</div>
          <div class="footer">Thank you for your business! Essence Creations.</div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await API.delete(`/admin/orders/${orderId}`);
        setOrders(orders.filter(order => order.id !== orderId));
      } catch (err) { alert("Error deleting order."); }
    }
  };

  const deleteAllOrders = async () => {
    if (window.confirm("CRITICAL: Delete ALL order history? This cannot be undone.")) {
      try {
        await API.delete("/admin/orders/all/bulk");
        setOrders([]);
      } catch (err) { alert("Error clearing orders."); }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.patch(`/admin/orders/${orderId}`, { status: newStatus });
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
      <Link to="/admin" className="back-btn-minimal" title="Back to Dashboard">←</Link>

      <div className="admin-controls-container">
        <h2 className="page-title">Essence Creations Orders</h2>
        <div className="controls-row">
          <input type="text" placeholder="Search by name or ref..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Delivered">Delivered</option>
          </select>
          <button onClick={deleteAllOrders} className="bulk-delete-btn">Clear History</button>
        </div>
      </div>

      <div className="orders-container">
        {filteredOrders.length === 0 ? <div className="no-orders">No matching orders found.</div> : (
          filteredOrders.map(order => {
            const isDelivered = (order.status || "").toLowerCase() === "delivered";
            
            return (
              <div key={order.id} className={`order-card ${isDelivered ? "delivered-card" : ""}`}>
                <div className="order-card-header">
                  <div className="ref-group">
                    <span className="label">REF NUMBER</span>
                    <span className="value">#{order.reference}</span>
                  </div>
                  <div className="date-group">
                    <span className="label">ORDER DATE</span>
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
                    <p className="cust-detail address">{order.address}, {order.city}</p>
                  </div>
                  <div className="grid-section">
                    <h4>Items</h4>
                    <div className="items-list">
                      {order.items.map((item, idx) => {
                        const price = item.product?.price || item.price || 0;
                        return (
                          <div key={idx} className="admin-item-row">
                            <div className="admin-item-info">
                              <p className="admin-item-name">{item.product?.name || item.name}</p>
                              <p className="admin-item-price">{item.quantity} x ₦{Number(price).toLocaleString()}</p>
                            </div>
                            <span className="admin-item-total">₦{(price * item.quantity).toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid-section summary-section">
                    <div className="delivery-highlight">
                      <span>Delivery Date:</span>
                      <strong>{order.selectedDate || "Standard"}</strong> 
                    </div>
                    <div className="total-line">
                      <span>Total Paid:</span>
                      <span className="total-amt">₦{Number(order.amount).toLocaleString()}</span>
                    </div>
                    {/* ⭐ INTEGRATED BUTTONS ROW */}
                    <div className="action-buttons-row">
                      <button className="print-btn" onClick={() => handlePrint(order)}>Print Receipt</button>
                      <button className="del-btn" onClick={() => deleteOrder(order.id)}>Delete Record</button>
                    </div>
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
