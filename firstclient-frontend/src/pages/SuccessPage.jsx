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
      const shipping = Number(data.shippingFee || 0);
      const total = Number(data.totalAmount || data.amount || 0);
      setPrices({ 
        shipping, 
        total, 
        subtotal: total - shipping 
      });
    };

    if (savedDetails) {
      const customerDetails = JSON.parse(savedDetails);
      syncOrderData(customerDetails);

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

  // ⭐ PDF RECEIPT GENERATOR (UPDATED: 12H TIME & DELIVERY DATE LABEL)
  const handleDownloadReceipt = () => {
    if (!orderDetails) return;
    
    // Explicitly formatting to 12-hour clock with AM/PM
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
      <div style="font-family: sans-serif; max-width: 700px; margin: auto; padding: 40px; color: #2d3748; background: white;">
          <div style="text-align: center; border-bottom: 4px solid #1c1c1c; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; color: #1a202c; font-size: 32px; letter-spacing: 2px;">ESSENCE CREATIONS</h1>
            <p style="color: #28a745; font-weight: bold; margin-top: 5px;">OFFICIAL PAYMENT RECEIPT</p>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px; line-height: 1.6;">
            <div>
              <strong style="color: #1c1c1c; text-transform: uppercase; font-size: 12px;">Customer Details:</strong><br>
              ${orderDetails.name || orderDetails.customerName}<br>
              ${orderDetails.phone}<br>
              <strong>Address:</strong> ${orderDetails.address}, ${orderDetails.city || ''}<br>
              <strong>Location:</strong> ${orderDetails.location || 'N/A'}
            </div>
            <div style="text-align: right;">
              <strong style="color: #1c1c1c; text-transform: uppercase; font-size: 12px;">Order Summary:</strong><br>
              Ref: #${reference}<br>
              Paid On: ${currentTime}<br>
              <strong>Delivery Date: ${orderDetails.selectedDate}</strong>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f7fafc;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Item Description</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="text-align: right; margin-top: 30px; padding-top: 20px; border-top: 2px solid #1c1c1c;">
            <p style="margin-bottom: 5px; font-size: 14px; color: #718096;">Subtotal: ₦${Number(orderDetails.itemsTotal || prices.subtotal).toLocaleString()}</p>
            <p style="margin-bottom: 10px; font-size: 14px; color: #718096;">Shipping (${orderDetails.location || 'Delivery'}): ₦${prices.shipping.toLocaleString()}</p>
            <h2 style="margin: 0; color: #1c1c1c; font-size: 24px;">Total Paid: ₦${prices.total.toLocaleString()}</h2>
          </div>
          <div style="margin-top: 50px; text-align: center; font-size: 11px; color: #cbd5e0; border-top: 1px solid #f0f0f0; padding-top: 20px;">
            This is an automated receipt for your payment to Essence Creations. Thank you for your business!
          </div>
      </div>
    `;

    const opt = {
      margin: 0,
      filename: `EssenceCreations_Receipt_${reference}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    window.html2pdf().from(element).set(opt).save();
  };

  // ⭐ WHATSAPP LOGIC (UPDATED: 12H TIME & DELIVERY DATE LABEL)
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
      `*Customer:* ${orderDetails.name || orderDetails.customerName}\n` +
      `*Phone:* ${orderDetails.phone}\n` +
      `*Address:* ${orderDetails.address}, ${orderDetails.city || ''}\n` +
      `*Area:* ${orderDetails.location || 'N/A'}\n\n` +
      `*Items Ordered:* \n${itemSummary}\n\n` +
      `*Shipping Fee:* ₦${prices.shipping.toLocaleString()}\n` +
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
        <p className="thanks-text">Thank you, <strong>{orderDetails?.name || orderDetails?.customerName}</strong>!</p>
        
        <div className="order-summary-box">
          <div className="summary-item"><span>Items Total:</span><strong>₦{prices.subtotal.toLocaleString()}</strong></div>
          <div className="summary-item"><span>Shipping (${orderDetails?.location}):</span><strong>₦{prices.shipping.toLocaleString()}</strong></div>
          <div className="summary-item total-row"><span>Grand Total:</span><strong className="total-amount">₦{prices.total.toLocaleString()}</strong></div>
          <hr />
          <div className="summary-item"><span>Delivery Date:</span><strong>{orderDetails?.selectedDate}</strong></div>
          <div className="summary-item"><span>Reference:</span><small>{reference}</small></div>
        </div>

        <p className="email-note">Your receipt was sent to <strong>{orderDetails?.email || orderDetails?.customerEmail}</strong></p>

        <div className="success-action-buttons">
          <button onClick={handleDownloadReceipt} className="download-receipt-btn">
            Download PDF Receipt
          </button>
          <button onClick={handleShareReceipt} className="share-btn">
            WhatsApp Receipt
          </button>
        </div>

        <Link to="/shop" className="continue-btn" style={{marginTop: '20px', display: 'block', textAlign: 'center'}}>Continue Shopping</Link>
      </div>
    </div>
  );
            }
