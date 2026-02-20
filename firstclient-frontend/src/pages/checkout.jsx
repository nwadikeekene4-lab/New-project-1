import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import API from '../api'; 
import './checkout.css';

export function Checkout({ cart = [], setCart }) {
  // --- HELPERS: Skip Sundays ---
  const getWorkDay = (daysToAdd) => {
    let targetDate = dayjs().add(daysToAdd, 'day');
    if (targetDate.day() === 0) {
      targetDate = targetDate.add(1, 'day');
    }
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
    name: '', 
    email: '', 
    address: '', 
    city: '', 
    country: '', // Changed from 'Nigeria' to empty string
    phone: '', 
    location: ''
  });

  const getImageUrl = (img) => img || "https://placehold.co/100x100?text=No+Image";

  const handleInputChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  const handleChange = (event) => { 
    setSelectedDate(event.target.value); 
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

  // --- CALCULATIONS: Location-Based Shipping ---
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
      return alert("Please fill in all shipping details, including country.");
    }

    setIsProcessing(true);

    const detailsToSave = { 
      ...customerDetails, 
      selectedDate, 
      shippingFee: shippingTotal,
      itemsTotal: itemsTotal,      
      totalAmount: orderTotal      
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
    <div className="checkout-main-wrapper">
      <div className="checkout-header">
        <div className="header-content">
          <div className="website-name">Heritage Hub</div>
          <div className="quantity-indicator">Checkout ({cart.length} items)</div>
          <div className="link-container"><Link to="/shop" className="home-link">Back to Shop</Link></div>
        </div>
      </div>

      <div className="checkout-container">
        <div className="ordersummarypayment-container">
          <div className="order-summary">
            <div className="review-order-org">
              <strong className="review-order">Review your order</strong>
              {cart.length > 0 && (
                <button className="clear-cart-btn" onClick={handleClearCart}>Clear Cart</button>
              )}
            </div>

            {cart.map(cartItem => (
              <div key={cartItem.id} className="delivery-date-card">
                <div className="delivery-header">
                  Delivery Estimate: <span className="highlight-date">{selectedDate || "Select a date below"}</span>
                </div>
                <div className="img-itemdeliverycontainer">
                  <div className="image-container">
                    <img className="product-checkout-image" src={getImageUrl(cartItem.product?.image)} alt={cartItem.product?.name} />
                  </div>
                  <div className="item-details">
                    <div className="product-checkout-name"><strong>{cartItem.product?.name}</strong></div>
                    <div className="product-checkout-price">₦{Number(cartItem.product?.price).toLocaleString()}</div>
                    <div className="product-checkout-quantity">Qty: {cartItem.quantity}</div>
                    <button className="delete-item-btn" onClick={() => handleDelete(cartItem.id)}>Delete</button>
                  </div>

                  <div className="delivery-options-section">
                    <strong>Choose delivery date:</strong>
                    <div className="options-list">
                      {deliveryOptions.map(option => (
                        <label key={option.date} className="delivery-option-label">
                          <input
                            type="radio"
                            name={`deliveryDate-${cartItem.id}`} 
                            value={option.date}
                            checked={selectedDate === option.date}
                            onChange={handleChange}
                          />
                          <span className="delivery-label-text">
                            {option.date}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="shipping-form-container">
              <h3 className="form-title">Shipping Information</h3>
              <div className="shipping-grid">
                <input type="text" name="name" placeholder="Full Name" onChange={handleInputChange} className="checkout-input" required />
                <input type="email" name="email" placeholder="Email Address" onChange={handleInputChange} className="checkout-input" required />
                
                <select name="location" onChange={handleInputChange} className="checkout-input location-select" required>
                  <option value="">Select Delivery Location</option>
                  <option value="Ikorodu">Ikorodu (₦2,000)</option>
                  <option value="Outside Ikorodu">Outside Ikorodu (₦5,000)</option>
                  <option value="Island">Island (₦10,000)</option>
                </select>

                <input type="text" name="address" placeholder="Street Address / Apartment Number" onChange={handleInputChange} className="checkout-input" required />
                
                <div className="city-country-row">
                  <input type="text" name="city" placeholder="City" onChange={handleInputChange} className="checkout-input" />
                  {/* Removed readOnly and readonly-input class to allow typing */}
                  <input 
                    type="text" 
                    name="country" 
                    placeholder="Country"
                    value={customerDetails.country} 
                    onChange={handleInputChange} 
                    className="checkout-input" 
                    required
                  />
                </div>
                <input type="text" name="phone" placeholder="Phone Number" onChange={handleInputChange} className="checkout-input" required />
              </div>
            </div>
          </div>

          <div className="payment-summary">
            <div className="payment-name"><strong>Order Summary</strong></div>
            
            <div className="payment-row">
              <span>Items ({cart.length}):</span>
              <span>₦{itemsTotal.toLocaleString()}</span>
            </div>
            
            <div className="payment-row">
              <span>Shipping ({customerDetails.location || 'Not selected'}):</span>
              <span>{shippingTotal > 0 ? `₦${shippingTotal.toLocaleString()}` : '₦0'}</span>
            </div>
            
            <hr className="summary-divider" />
            
            <div className="order-total-row">
              <strong>Order Total:</strong>
              <strong className="total-amount">₦{orderTotal.toLocaleString()}</strong>
            </div>
            
            <button 
                className={`placeorder-button ${!customerDetails.location ? 'disabled' : ''}`} 
                onClick={handlePlaceOrder} 
                disabled={isProcessing || cart.length === 0}
            >
              {isProcessing ? "Processing..." : "Place your order"}
            </button>
            
            <p className="secure-note">🛡️ Secure payment powered by Paystack</p>
          </div>
        </div>
      </div>
    </div>
  );
}