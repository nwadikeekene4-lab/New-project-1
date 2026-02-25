import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../api';
import './Success.css';

export function SuccessPage({ setCart }) {
  const [status, setStatus] = useState('processing');
  const [orderDetails, setOrderDetails] = useState(null);
  const [prices, setPrices] = useState({ subtotal: 0, shipping: 0, total: 0 });
  const [reference, setReference] = useState('');
  
  // 🛡️ THE LOCK: This prevents the frontend from sending the same ref twice
  const hasVerified = useRef(false); 
  
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const ref = query.get('trxref') || query.get('reference');
    setReference(ref);
    
    // 🛑 GUARD: If there is no reference OR we have already fired this request, STOP.
    if (!ref || hasVerified.current) return;

    // Flip the lock to true immediately so no other re-render can pass this point
    hasVerified.current = true;

    const savedDetails = localStorage.getItem("pendingCustomerDetails");

    if (ref) {
      const customerDetails = savedDetails ? JSON.parse(savedDetails) : null;
      
      if (customerDetails) {
        setOrderDetails(customerDetails);
        
        // Calculate prices for the UI display
        const shipping = Number(customerDetails.shippingFee || 0);
        const total = Number(customerDetails.totalAmount || 0);
        setPrices({
          shipping: shipping,
          total: total,
          subtotal: total - shipping
        });
      }

      // 🚀 Send verification to backend
      API.post("/orders/verify", { 
        reference: ref, 
        customerDetails 
      })
      .then((res) => {
        if (res.data.success) {
          setStatus('success');
          setCart([]); // Clear the visual cart state
          localStorage.removeItem("pendingCustomerDetails"); 
        } else {
          setStatus('error');
        }
      })
      .catch((err) => {
        console.error("Verification Error:", err);
        setStatus('error');
      });
    } else {
      setStatus('error');
    }
  }, [location, setCart]);

  // --- UI RENDERING ---

  if (status === 'processing') {
    return (
      <div className="success-wrapper">
        <div className="status-box">
          <div className="loader"></div>
          <h2>Verifying Payment...</h2>
          <p>Please do not refresh the page.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="success-wrapper">
        <div className="success-card error-card">
          <h1>Oops!</h1>
          <p>We couldn't verify your payment. If you were debited, please contact support with reference: <strong>{reference}</strong></p>
          <Link to="/shop" className="continue-btn">Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="success-wrapper">
      <div className="success-card">
        <div className="checkmark-circle">
          <div className="checkmark"></div>
        </div>
        <h1>Payment Successful!</h1>
        <p className="thanks-text">
          Thank you, <strong>{orderDetails?.name || 'Customer'}</strong>! Your order has been placed.
        </p>
        
        <div className="order-summary-box">
          <div className="summary-item">
            <span>Items Total:</span>
            <strong>₦{prices.subtotal.toLocaleString()}</strong>
          </div>
          <div className="summary-item">
            <span>Delivery Fee:</span>
            <strong>₦{prices.shipping.toLocaleString()}</strong>
          </div>
          <div className="summary-item total-row">
            <span>Grand Total Paid:</span>
            <strong className="total-amount">₦{prices.total.toLocaleString()}</strong>
          </div>
          
          <hr />

          <div className="summary-item">
            <span>Delivery Date:</span>
            <strong>{orderDetails?.selectedDate || 'Standard Delivery'}</strong>
          </div>
          <div className="summary-item">
            <span>Shipping To:</span>
            <strong>{orderDetails?.address}, {orderDetails?.location}</strong>
          </div>
          <div className="summary-item">
             <span>Payment Ref:</span>
             <small>{reference}</small>
          </div>
        </div>

        <p className="email-note">
          A receipt has been sent to <strong>{orderDetails?.email}</strong>.
        </p>

        <Link to="/shop" className="continue-btn">Continue Shopping</Link>
      </div>
    </div>
  );
}