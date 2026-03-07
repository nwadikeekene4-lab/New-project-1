import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../api';
import './Success.css';

export function SuccessPage({ setCart }) {
  const [status, setStatus] = useState('processing');
  const [orderDetails, setOrderDetails] = useState(null);
  const [prices, setPrices] = useState({ subtotal: 0, shipping: 0, total: 0 });
  const [reference, setReference] = useState('');
  const hasVerified = useRef(false); 
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const ref = query.get('trxref') || query.get('reference');
    setReference(ref);
    
    if (!ref || hasVerified.current) return;
    hasVerified.current = true;

    const savedDetails = localStorage.getItem("pendingCustomerDetails");

    if (ref) {
      const customerDetails = savedDetails ? JSON.parse(savedDetails) : null;
      if (customerDetails) {
        setOrderDetails(customerDetails);
        const shipping = Number(customerDetails.shippingFee || 0);
        const total = Number(customerDetails.totalAmount || 0);
        setPrices({ shipping, total, subtotal: total - shipping });
      }

      API.post("/orders/verify", { reference: ref, customerDetails })
      .then((res) => {
        if (res.data.success) {
          setStatus('success');
          setCart([]); 
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

  // ⭐ UNIVERSAL SHARE LOGIC
  const handleShareReceipt = async () => {
    if (!orderDetails) return;

    const itemSummary = orderDetails.items.map(item => {
        const p = item.product || item;
        return `• ${item.quantity}x ${p.name}`;
    }).join('\n');

    const receiptText = `*HERITAGE HUB RECEIPT* 🛍️\n\n` +
      `*Order Ref:* ${reference}\n` +
      `*Total Paid:* ₦${prices.total.toLocaleString()}\n` +
      `*Delivery:* ${orderDetails.selectedDate}\n\n` +
      `*Items:* \n${itemSummary}\n\n` +
      `Thank you for shopping with us!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Heritage Hub Receipt',
          text: receiptText,
          url: window.location.href, 
        });
      } catch (err) { console.log("Share dismissed"); }
    } else {
      // Desktop Fallback to WhatsApp
      const encodedMsg = encodeURIComponent(receiptText + `\n\nLink: ${window.location.href}`);
      window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
    }
  };

  if (status === 'processing') return (
    <div className="success-wrapper"><div className="status-box"><div className="loader"></div><h2>Verifying Payment...</h2></div></div>
  );

  if (status === 'error') return (
    <div className="success-wrapper">
      <div className="success-card error-card">
        <h1>Oops!</h1>
        <p>Verification failed. Contact support with Ref: <strong>{reference}</strong></p>
        <Link to="/shop" className="continue-btn">Back to Shop</Link>
      </div>
    </div>
  );

  return (
    <div className="success-wrapper">
      <div className="success-card">
        <div className="checkmark-circle"><div className="checkmark"></div></div>
        <h1>Payment Successful!</h1>
        <p className="thanks-text">Thank you, <strong>{orderDetails?.name}</strong>!</p>
        
        <div className="order-summary-box">
          <div className="summary-item"><span>Items Total:</span><strong>₦{prices.subtotal.toLocaleString()}</strong></div>
          <div className="summary-item"><span>Delivery:</span><strong>₦{prices.shipping.toLocaleString()}</strong></div>
          <div className="summary-item total-row"><span>Grand Total:</span><strong className="total-amount">₦{prices.total.toLocaleString()}</strong></div>
          <hr />
          <div className="summary-item"><span>Date:</span><strong>{orderDetails?.selectedDate}</strong></div>
          <div className="summary-item"><span>Ref:</span><small>{reference}</small></div>
        </div>

        <p className="email-note">Receipt sent to <strong>{orderDetails?.email}</strong></p>

        {/* ⭐ THE UNIVERSAL SHARE BUTTON */}
        <button onClick={handleShareReceipt} className="share-btn">
          Share Receipt (WhatsApp/Save)
        </button>

        <Link to="/shop" className="continue-btn" style={{marginTop: '10px', display: 'block', textAlign: 'center'}}>Continue Shopping</Link>
      </div>
    </div>
  );
          }
