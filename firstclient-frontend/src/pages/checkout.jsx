import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import API from '../api'; 
import './checkout.css';

export function Checkout({ cart = [], setCart }) {
  const getWorkDay = (daysToAdd) => {
    let targetDate = dayjs().add(daysToAdd, 'day');
    if (targetDate.day() === 0) targetDate = targetDate.add(1, 'day');
    return targetDate.format("dddd, MMMM D");
  };

  const deliveryOptions = [
    { date: getWorkDay(1) },
    { date: getWorkDay(2) },
    { date: getWorkDay(3) }
  ];

  const [selectedDate, setSelectedDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '', email: '', address: '', city: '', country: '', phone: '', location: ''
  });

  const getImageUrl = (img) => img || "https://placehold.co/100x100?text=No+Image";

  const handleInputChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  const handleDelete = (cartItemId) => {
    API.delete(`/cart/${cartItemId}`)
      .then(() => API.get('/cart'))
      .then((response) => setCart(response.data))
      .catch(err => console.error(err));
  };

  const handleClearCart = () => {
    if (window.confirm("Remove all items from cart?")) {
      API.delete('/cart/clear').then(() => setCart([])).catch(err => console.error(err));
    }
  };

  const itemsTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0);
  
  const getShippingFee = (loc) => {
    if (loc === "Ikorodu") return 2000;
    if (loc === "Island") return 10000;
    if (loc === "Outside Ikorodu") return 5000;
    return 0; 
  };

  const shippingTotal = getShippingFee(customerDetails.location);
  const orderTotal = itemsTotal + shippingTotal;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return alert("Your cart is empty.");
    if (!selectedDate) return alert("Please select a delivery date."); 
    if (!customerDetails.location) return alert("Please select your delivery location.");
    if (!customerDetails.name || !customerDetails.email || !customerDetails.address || !customerDetails.phone || !customerDetails.country) {
      return alert("Please fill in all shipping details.");
    }

    setIsProcessing(true);
    const detailsToSave = { ...customerDetails, selectedDate, shippingFee: shippingTotal, itemsTotal, totalAmount: orderTotal };

    try {
      const response = await API.post("/paystack/init", {
        email: customerDetails.email, 
        amount: orderTotal,
        customerDetails: detailsToSave,
        callback_url: `${window.location.origin}/success` 
      });

      if (response.data.status && response.data.data.authorization_url) {
        localStorage.setItem("pendingCustomerDetails", JSON.stringify(detailsToSave));
        window.location.href = response.data.data.authorization_url;
      }
    } catch (err) {
      alert("Payment failed to initialize.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page-wrapper">
      {/* HEADER SECTION */}
      <div className="checkout-minimal-header">
        <div className="header-inner">
          <Link to="/" className="checkout-logo">Heritage Hub</Link>
          <div className="checkout-step-label">Secure Checkout</div>
          <Link to="/hub" className="back-link">Continue Shopping</Link>
        </div>
      </div>

      <div className="checkout-main-content">
        <div className="checkout-layout-grid">
          
          {/* LEFT SIDE: ITEMS & FORM */}
          <div className="checkout-left-column">
            
            {/* 1. REVIEW ITEMS */}
            <div className="checkout-section-card">
              <div className="section-header">
                <h3>1. Review Your Order ({cart.length} Items)</h3>
                {cart.length > 0 && <button className="text-btn" onClick={handleClearCart}>Clear All</button>}
              </div>
              
              <div className="checkout-items-list">
                {cart.map(cartItem => (
                  <div key={cartItem.id} className="checkout-product-row">
                    <img className="checkout-item-img" src={getImageUrl(cartItem.product?.image)} alt="" />
                    <div className="checkout-item-info">
                      <div className="item-title">{cartItem.product?.name}</div>
                      <div className="item-meta">Qty: {cartItem.quantity} • ₦{Number(cartItem.product?.price).toLocaleString()}</div>
                      <button className="delete-btn" onClick={() => handleDelete(cartItem.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. DELIVERY DATE */}
            <div className="checkout-section-card">
              <div className="section-header"><h3>2. Delivery Date</h3></div>
              <div className="delivery-date-picker">
                {deliveryOptions.map(option => (
                  <label key={option.date} className={`date-option ${selectedDate === option.date ? 'active' : ''}`}>
                    <input type="radio" name="deliveryDate" value={option.date} onChange={(e) => setSelectedDate(e.target.value)} />
                    <span>{option.date}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. SHIPPING ADDRESS */}
            <div className="checkout-section-card">
              <div className="section-header"><h3>3. Shipping Information</h3></div>
              <div className="shipping-form-grid">
                <input type="text" name="name" placeholder="Full Name" onChange={handleInputChange} className="form-input" />
                <input type="email" name="email" placeholder="Email Address" onChange={handleInputChange} className="form-input" />
                <select name="location" onChange={handleInputChange} className="form-input">
                  <option value="">Select Location</option>
                  <option value="Ikorodu">Ikorodu (₦2,000)</option>
                  <option value="Outside Ikorodu">Outside Ikorodu (₦5,000)</option>
                  <option value="Island">Island (₦10,000)</option>
                </select>
                <input type="text" name="address" placeholder="Street Address" onChange={handleInputChange} className="form-input" />
                <div className="form-row">
                  <input type="text" name="city" placeholder="City" onChange={handleInputChange} className="form-input" />
                  <input type="text" name="country" placeholder="Country" onChange={handleInputChange} className="form-input" />
                </div>
                <input type="text" name="phone" placeholder="Phone Number" onChange={handleInputChange} className="form-input" />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SUMMARY BOX */}
          <div className="checkout-right-column">
            <div className="order-summary-box">
              <h3>Order Summary</h3>
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>₦{itemsTotal.toLocaleString()}</span>
              </div>
              <div className="summary-line">
                <span>Shipping:</span>
                <span>₦{shippingTotal.toLocaleString()}</span>
              </div>
              <hr />
              <div className="summary-line total">
                <span>Total:</span>
                <span>₦{orderTotal.toLocaleString()}</span>
              </div>
              <button 
                className="place-order-btn" 
                onClick={handlePlaceOrder} 
                disabled={isProcessing || cart.length === 0}
              >
                {isProcessing ? "Processing..." : "Pay Now with Paystack"}
              </button>
              <p className="secure-text">🔒 Secure Checkout Guaranteed</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}