import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './PastryPage.css';

const PastryPage = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Updated with your new categories
  const categories = [
    'Cake', 'Bread', 'Doughnuts', 'Bread roll', 
    'sausage', 'egg roll', 'meat pie', 'fish rolls', 
    'cookies', 'others'
  ];
  
  const [activeTab, setActiveTab] = useState('Cake');
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  // Professional dynamic filtering logic
  const filterData = useCallback((all, tab) => {
    if (tab === 'others') {
      // Show products that don't match any of the specific main categories
      return all.filter(p => !categories.slice(0, -1).includes(p.subCategory));
    }
    return all.filter(p => p.subCategory === tab);
  }, [categories]);

  useEffect(() => {
    setLoading(true);
    API.get('/products?category=pastry').then(res => {
      setProducts(res.data);
      setFilteredProducts(filterData(res.data, activeTab));
    }).finally(() => setLoading(false));
  }, [activeTab, filterData]);

  const addToCart = (product) => {
    setAddingId(product.id);
    API.post('/cart/add', { productId: product.id, quantity: 1 }).then(() => {
      return API.get('/cart');
    }).then(res => {
      setCart(res.data);
      setTimeout(() => setAddingId(null), 1000);
    });
  };

  return (
    <div className="product-page-container">
      <header className="shop-header">
        <button onClick={() => navigate(-1)} className="back-link">← Back</button>
        <h2 className="shop-title">Pastry Shop</h2>
        <div className="header-exit" onClick={() => navigate('/')}>Exit</div>
      </header>

      {/* Categories Bar */}
      <nav className="category-tabs">
        {categories.map(t => (
          <button 
            key={t} 
            className={activeTab === t ? 'active' : ''} 
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      <main className="product-grid">
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading treats...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(p => (
            <div key={p.id} className="konga-product-card">
              <div className="img-holder">
                <img src={p.image} alt={p.name} />
                {p.videoUrl && (
                  <button className="vid-btn" onClick={() => setVideoUrl(p.videoUrl)}>
                    <span className="play-icon">▶</span> Video
                  </button>
                )}
              </div>
              <div className="p-info">
                <h3 className="p-name">{p.name}</h3>
                <p className="p-price">₦{Number(p.price).toLocaleString()}</p>
                <button 
                  className={`add-cart-btn ${addingId === p.id ? 'added' : ''}`} 
                  onClick={() => addToCart(p)}
                >
                  {addingId === p.id ? "Added! ✅" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No items in this category yet.</p>
          </div>
        )}
      </main>

      {cart?.length > 0 && (
        <div className="mini-cart-float" onClick={() => navigate('/checkout')}>
          <div className="badge">{cart.reduce((a, b) => a + b.quantity, 0)}</div>
          <span className="total">
            ₦{cart.reduce((s, i) => s + (Number(i.product?.price || i.price) * i.quantity), 0).toLocaleString()}
          </span>
        </div>
      )}

      {videoUrl && (
        <div className="vid-overlay" onClick={() => setVideoUrl(null)}>
          <div className="vid-content" onClick={e => e.stopPropagation()}>
             <button className="close-modal-btn" onClick={() => setVideoUrl(null)}>✕</button>
            <video src={videoUrl} controls autoPlay className="full-vid" />
          </div>
        </div>
      )}
    </div>
  );
};
export default PastryPage;
