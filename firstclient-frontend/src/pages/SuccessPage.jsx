import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import dayjs from "dayjs"; 
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
    
    if (!ref) {
        setStatus('error');
        return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const savedDetails = localStorage.getItem("pendingCustomerDetails");

    const syncOrderData = (data) => {
      setOrderDetails(data);
      // Backend uses 'amount' for the total paid from Paystack
      const total = Number(data.amount || data.totalAmount || 0);
      const shipping = Number(data.shippingFee || 0);
      setPrices({ 
        shipping, 
        total, 
        subtotal: total - shipping 
      });
    };

    // LOGIC: If we have details in storage, verify and then RE-FETCH from DB
    // This ensures the PDF and WhatsApp see exactly what the server saved.
    if (savedDetails) {
      const customerDetails = JSON.parse(savedDetails);
      syncOrderData(customerDetails); // Immediate UI update

      API.post("/orders/verify", { reference: ref })
      .then((res) => {
        if (res.data.success) {
          // Success! Now fetch the official record for the receipt
          return API.get(`/orders/receipt/${ref}`);
        } else {
          throw new Error("Verification failed");
        }
      })
      .then((res) => {
        syncOrderData(res.data);
        setStatus('success');
        setCart([]); 
        localStorage.removeItem("pendingCustomerDetails"); 
      })
      .catch((err) => {
        console.error("Verification Error:", err);
        setStatus('error');
      });
    } else {
      // If user is returning via a shared link/refresh
      API.get(`/orders/receipt/${ref}`)
      .then((res) => {
        syncOrderData(res.data);
        setStatus('success');
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setStatus('error');
      });
    }
  }, [location, setCart]);

  // ⭐ PDF RECEIPT GENERATOR (FIXED LAYOUT & NO CUTOUT)
  const handleDownloadReceipt = () => {
    if (!orderDetails) return;
    const currentTime = dayjs().format("DD MMM YYYY, hh:mm:ss A");
    const itemsArray = typeof orderDetails.items === 'string' ? JSON.parse(orderDetails.items) : orderDetails.items;
    
    const itemsHtml = itemsArray.map(item => {
        const p = item.product || item;
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #edf2f7; color: #4a5568;">${p.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold;">₦${Number(p.price).toLocaleString()}</td>
          </tr>
        `;
    }).join('');

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: sans-serif; width: 750px; margin: 0; padding: 40px; color: #2d3748; background: white; box-sizing: border-box;">
          <div style="text-align: center; border-bottom: 4px solid #1c1c1c; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; color: #1a202c; font-size: 32px; letter-spacing: 2px;">ESSENCE CREATIONS</h1>
            <p style="color: #28a745; font-weight: bold; margin-top: 5px; font-size: 14px;">OFFICIAL PAYMENT RECEIPT</p>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 40px; line-height: 1.6; font-size: 14px;">
            <div style="width: 45%;">
              <strong style="color: #1c1c1c; text-transform: uppercase; font-size: 11px;">Billed To:</strong><br>
              <span style="font-size: 18px; font-weight: bold;">${orderDetails.customerName || orderDetails.name}</span><br>
              ${orderDetails.phone}<br>
              <strong>Address:</strong> ${orderDetails.address}, ${orderDetails.city || ''}<br>
              <strong>Location:</strong> ${orderDetails.location || 'N/A'}
            </div>
            <div style="text-align: right; width: 45%;">
              <strong style="color: #1c1c1c; text-transform: uppercase; font-size: 11px;">Order Summary:</strong><br>
              Ref: #${reference}<br>
              Paid On: ${currentTime}<br>
              <strong>Delivery Date: ${orderDetails.selectedDate}</strong>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
            <thead>
              <tr style="background: #f7fafc;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Item Description</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          
          <div style="float: right; min-width: 280px; border-top: 2px solid #1c1c1c; padding-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; color: #718096;">
              <span style="padding-right: 20px;">Subtotal:</span>
              <span>₦${prices.subtotal.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; color: #718096;">
              <span style="padding-right: 20px;">Shipping:</span>
              <span>₦${prices.shipping.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #edf2f7; padding-top: 12px; gap: 40px;">
              <strong style="color: #1c1c1c; font-size: 18px; text-transform: uppercase;">Total:</strong>
              <strong style="color: #1c1c1c; font-size: 24px; white-space: nowrap;">₦${prices.total.toLocaleString()}</strong>
            </div>
          </div>
          <div style="clear: both;"></div>

          <div style="margin-top: 60px; text-align: center; font-size: 12px; color: #cbd5e0; border-top: 1px solid #f0f0f0; padding-top: 20px;">
            This is an automated receipt for your payment to Essence Creations. Thank you!
          </div>
      </div>
    `;

    const opt = {
      margin: 0.3,
      filename: `EssenceCreations_Receipt_${reference}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, width: 750, windowWidth: 750 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    window.html2pdf().from(element).set(opt).save();
  };

  // ⭐ WHATSAPP RECEIPT (FULL CONTENT RESTORED)
  const handleShareReceipt = async () => {
    if (!orderDetails) return;
    const currentTime = dayjs().format("DD MMM YYYY, hh:mm:ss A");
    const itemsArray = typeof orderDetails.items === 'string' ? JSON.parse(orderDetails.items) : orderDetails.items;
    
    const itemSummary = itemsArray.map(item => {
        const p = item.product || item;
        return `• ${item.quantity}x ${p.name} (₦${Number(p.price).toLocaleString()})`;
    }).join('\n');

    const persistentLink = `${window.location.origin}/success?reference=${reference}`;

    const receiptText = `*ESSENCE CREATIONS RECEIPT* 🛍️\n\n` +
      `*Ref:* #${reference}\n` +
      `*Paid On:* ${currentTime}\n` +
      `*Customer:* ${orderDetails.customerName || orderDetails.name}\n` +
      `*Phone:* ${orderDetails.phone}\n` +
      `*Address:* ${orderDetails.address}, ${orderDetails.city || ''}\n` +
      `*Delivery Location:* ${orderDetails.location || 'N/A'}\n\n` +
      `*Items Ordered:* \n${itemSummary}\n\n` +
      `*Subtotal:* ₦${prices.subtotal.toLocaleString()}\n` +
      `*Shipping Fee:* ₦${prices.shipping.toLocaleString()} (${orderDetails.location || 'Standard'})\n` +
      `*Total Paid:* ₦${prices.total.toLocaleString()}\n\n` +
      `*Delivery Date:* ${orderDetails.selectedDate}\n\n` +
      `*View Online:* ${persistentLink}\n\n` +
      `Thank you for choosing Essence Creations! 🎂`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Essence Creations Receipt', text: receiptText });
      } catch (err) { console.log("Share cancelled"); }
    } else {
      const encodedMsg = encodeURIComponent(receiptText);
      window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
    }
  };

  if (status === 'processing') return <div className="success-wrapper"><div className="status-box"><h2>Verifying Payment...</h2></div></div>;
  
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
        <p className="thanks-text">Thank you, <strong>{orderDetails?.customerName || orderDetails?.name}</strong>!</p>
        
        <div className="order-summary-box">
          <div className="summary-item"><span>Subtotal:</span><strong>₦{prices.subtotal.toLocaleString()}</strong></div>
          <div className="summary-item"><span>Shipping:</span><strong>₦{prices.shipping.toLocaleString()}</strong></div>
          <div className="summary-item total-row">
            <span>Total:</span>
            <strong className="total-amount">₦{prices.total.toLocaleString()}</strong>
          </div>
          <hr />
          <div className="summary-item"><span>Delivery Date:</span><strong>{orderDetails?.selectedDate}</strong></div>
          <div className="summary-item"><span>Reference:</span><small>{reference}</small></div>
        </div>

        <div className="success-action-buttons">
          <button onClick={handleDownloadReceipt} className="download-receipt-btn">Download PDF Receipt</button>
          <button onClick={handleShareReceipt} className="share-btn">WhatsApp Receipt</button>
        </div>
        <Link to="/shop" className="continue-btn" style={{marginTop: '20px', display: 'block', textAlign: 'center'}}>Continue Shopping</Link>
      </div>
    </div>
  );
      }
