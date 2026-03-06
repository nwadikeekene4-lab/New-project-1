import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added for navigation
import API from '../api';
import './PastryPage.css';

const PastryPage = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Cakes');
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null); // Track which item is being added

  const filterData = useCallback((allProducts, tab) => {
    if (tab === 'Others') {
      return allProducts.filter(p => 
        p.subCategory === 'Others' || 
        (p.subCategory !== 'Cakes' && p.subCategory !== 'Breads')
      );
    }
    return allProducts.filter(p => p.subCategory === tab);
  }, []);

  useEffect(() => {
    setLoading(true);
    API.get('/products?category=pastry')
      .then(res => {
        setProducts(res.data);
        setFilteredProducts(filterData(res.data, activeTab));
      })
      .catch(err => console.error("Error fetching pastries:", err))
      .finally(() => setLoading(false));
  }, [activeTab, filterData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilteredProducts(filterData(products, tab));
  };

  const addToCart = (product) => {
    setAddingId(product.id); // Start "Adding" animation
    
    API.post('/cart/add', { productId: product.id, quantity: 1 })
      .then(() => {
        if(setCart) setCart(prev => [...prev, product]);
        
        // Reset button text after 2 seconds
        setTimeout(() => setAddingId(null), 2000);
      })
      .catch(err => {
        setAddingId(null);
        alert("Could not add to cart.");
      });
  };

  return (
    <div className="pastry-container">
      {/* ⭐ EASY NAVIGATION HEADER */}
      <header className="pastry-nav-header">
        <button className="nav-back-arrow" onClick={() => navigate(-1)}>
          <span className="arrow-icon">←</span> 
          <span className="back-text">Back</span>
        </button>
        <div className="pastry-logo-section">
          <h2>Pastry Shop</h2>
        </div>
        <Link to="/" className="exit-link">Exit Shop</Link>
      </header>

      {/* Category Tabs */}
      <nav className="pastry-tabs">
        {['Cakes', 'Breads', 'Others'].map(tab => (
          <button 
            key={tab} 
            className={activeTab === tab ? 'active' : ''} 
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Product Grid */}
      {loading ? (
        <div className="loader">Baking your favorites...</div>
      ) : (
        <main className="pastry-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="konga-card">
              <div className="image-wrapper">
                <img src={product.image} alt={product.name} loading="lazy" />
                {product.videoUrl && (
                  <button className="watch-video-btn" onClick={() => setVideoUrl(product.videoUrl)}>
                    <span>▶</span> Video
                  </button>
                )}
              </div>
              
              <div className="card-details">
                <h3>{product.name}</h3>
                <p className="price">₦{Number(product.price || 0).toLocaleString()}</p>
                
                {/* ⭐ REAL-TIME BUTTON UPDATE */}
                <button 
                  className={`add-btn ${addingId === product.id ? 'added-state' : ''}`} 
                  onClick={() => addToCart(product)}
                  disabled={addingId === product.id}
                >
                  {addingId === product.id ? "Added! ✅" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </main>
      )}

      {/* ⭐ FLOATING REAL-TIME CART BUBBLE */}
      {cart && cart.length > 0 && (
        <div className="floating-cart-status" onClick={() => navigate('/cart')}>
          <div className="cart-icon-wrapper">
            <span className="cart-count-badge" key={cart.length}>{cart.length}</span>
            🛒
          </div>
          <div className="cart-text">
            <p>Order Total</p>
            <strong>₦{cart.reduce((total, item) => total + Number(item.price), 0).toLocaleString()}</strong>
          </div>
        </div>
      )}

      {/* Video Modal with Related Items */}
      {videoUrl && (
        <div className="video-modal-overlay" onClick={() => setVideoUrl(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-video" onClick={() => setVideoUrl(null)}>✕</button>
            <video src={videoUrl} controls autoPlay playsInline className="main-video" />
            
            <div className="modal-related-shelf">
              <h4>More {activeTab}</h4>
              <div className="related-items-list">
                {products.filter(p => p.subCategory === activeTab && p.videoUrl !== videoUrl).slice(0, 4).map(item => (
                  <div key={item.id} className="related-mini-card">
                    <img src={item.image} alt={item.name} />
                    <div className="mini-info">
                      <span>{item.name}</span>
                      <button className="mini-add-btn" onClick={() => addToCart(item)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastryPage;
