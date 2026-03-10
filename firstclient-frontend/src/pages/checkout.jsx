import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import API from '../api'; 
import './checkout.css';

export function Checkout({ cart = [], setCart, updateCartQuantity }) {
  
  // Local function to handle permanent removal
  const handleRemoveItem = (productId) => {
    // 1. Tell the backend to delete it forever
    API.post('/cart/remove', { productId })
      .then(res => {
        // 2. The backend sends back the NEW cart list
        // 3. Updating setCart here updates the UI and the Cart Icon everywhere
        setCart(res.data); 
      })
      .catch(err => {
        console.error("Remove failed. Did you add the backend route?", err);
        // Fallback: local filter if backend isn't ready yet
        setCart(cart.filter(item => (item.product?.id || item.productId) !== productId));
      });
  };

  const getWorkDay = (index) => {
    let daysAdded = 0;
    let targetDate = dayjs();
    while (daysAdded < index) {
      targetDate = targetDate.add(1, 'day');
      if (targetDate.day() === 0) continue;
      daysAdded++;
    }
    return targetDate.format("dddd, MMMM D, YYYY");
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

  const handleDateSelection = (dateString) => {
    setSelectedDate(dateString);
  };

  const handleClearCart = () => {
    if (window.confirm("Remove all items from cart?")) {
      API.delete('/cart/clear').then(() => setCart([])).catch(err => console.error(err));
    }
  };

  const hasInvalidQuantity = cart.some(item => item.quantity === "" || item.quantity <= 0);

  const itemsTotal = cart.reduce((sum, item) => {
    const itemPrice = item.product?.price || item.price || 0;
    return sum + (Number(itemPrice) * (Number(item.quantity) || 0));
  }, 0);
  
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
    if (hasInvalidQuantity) return alert("Please set a valid quantity for all items.");
    if (!selectedDate) return alert("Please select a delivery date."); 
    if (!customerDetails.location) return alert("Please select your delivery location.");
    if (!customerDetails.name || !customerDetails.email || !customerDetails.address || !customerDetails.phone || !customerDetails.country) {
      return alert("Please fill in all shipping details.");
    }

    setIsProcessing(true);
    const detailsToSave = { 
        ...customerDetails, 
        selectedDate, 
        shippingFee: shippingTotal, 
        itemsTotal, 
        totalAmount: orderTotal,
        items: cart 
    };

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
      <div className="checkout-minimal-header">
        <div className="header-inner">
          <Link to="/" className="checkout-logo">Essence Creations</Link>
          <div className="checkout-step-label">Secure Checkout</div>
          <Link to="/shop" className="back-link">Continue Shopping</Link>
        </div>
      </div>

      <div className="checkout-main-content">
        <div className="checkout-layout-grid">
          <div className="checkout-left-column">
            <div className="checkout-section-card">
              <div className="section-header">
                <h3>1. Review Your Order ({cart.length} Items)</h3>
                {cart.length > 0 && <button className="text-btn" onClick={handleClearCart}>Clear All</button>}
              </div>
              <div className="checkout-items-list">
                {cart.map(cartItem => {
                   const productData = cartItem.product || cartItem;
                   const pid = productData.id || cartItem.productId;
                   return (
                    <div key={cartItem.id} className="checkout-product-row">
                      <img className="checkout-item-img" src={getImageUrl(productData.image)} alt="" />
                      <div className="checkout-item-info">
                        <div className="item-title">{productData.name}</div>
                        <div className="item-meta">
                          <div className="qty-edit-wrapper">
                            <span>Qty: </span>
                            <input 
                              type="number" 
                              min="1" 
                              className={`qty-input-enhanced ${cartItem.quantity <= 0 ? 'qty-error' : ''}`}
                              value={cartItem.quantity} 
                              onChange={(e) => updateCartQuantity(cartItem.id, parseInt(e.target.value) || 0)}
                            />
                            <span className="unit-price"> • ₦{Number(productData.price).toLocaleString()}</span>
                          </div>
                        </div>
                        {/* ⭐ UPDATED REMOVE BUTTON */}
                        <button className="delete-btn" onClick={() => handleRemoveItem(pid)}>Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="checkout-section-card">
              <div className="section-header"><h3>2. Delivery Date</h3></div>
              <div className="delivery-date-picker">
                {deliveryOptions.map(option => (
                  <label key={option.date} className={`date-option ${selectedDate === option.date ? 'active' : ''}`}>
                    <input type="radio" name="deliveryDate" value={option.date} onChange={(e) => handleDateSelection(e.target.value)} />
                    <span>{option.date}</span>
                  </label>
                ))}
              </div>
            </div>

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

          <div className="checkout-right-column">
            <div className="order-summary-box">
              <h3>Order Summary</h3>
              <div className="summary-line"><span>Subtotal:</span><span>₦{itemsTotal.toLocaleString()}</span></div>
              <div className="summary-line"><span>Shipping:</span><span>₦{shippingTotal.toLocaleString()}</span></div>
              <hr />
              <div className="summary-line total"><span>Total:</span><span>₦{orderTotal.toLocaleString()}</span></div>
              <button 
                className="place-order-btn" 
                onClick={handlePlaceOrder} 
                disabled={isProcessing || cart.length === 0 || hasInvalidQuantity}
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
