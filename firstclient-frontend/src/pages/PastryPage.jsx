import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './PastryPage.css';

const PastryPage = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState(null); 
  const [videoUrl, setVideoUrl] = useState(null);
  const [zoomImage, setZoomImage] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [quantities, setQuantities] = useState({});

  const categories = useMemo(() => [
    'Cake', 'Bread', 'Doughnuts', 'Bread roll', 
    'sausage', 'egg roll', 'meat pie', 'fish rolls', 
    'cookies', 'others'
  ], []);

  useEffect(() => {
    setLoading(true);
    API.get('/products?category=pastry')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const getFilteredItems = (catName, allProducts) => {
    const search = catName.toLowerCase();
    if (search === 'others') {
      const mains = categories.slice(0, -1).map(c => c.toLowerCase());
      return allProducts.filter(p => !p.subCategory || !mains.includes(p.subCategory.toLowerCase()));
    }
    return allProducts.filter(p => p.subCategory?.toLowerCase() === search);
  };

  const filteredProducts = useMemo(() => {
    if (!activeTab) return [];
    return getFilteredItems(activeTab, products);
  }, [products, activeTab, categories]);

  const handleQtyChange = (id, val) => {
    if (val === "") {
      setQuantities(prev => ({ ...prev, [id]: "" }));
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      setQuantities(prev => ({ ...prev, [id]: Math.max(1, num) }));
    }
  };

  const addToCart = (product) => {
    const qtyVal = quantities[product.id];
    const finalQty = (qtyVal === "" || isNaN(parseInt(qtyVal))) ? 1 : parseInt(qtyVal);
    
    setAddingId(product.id);
    
    // Sending both id and productId to ensure Remove button works on Checkout
    API.post('/cart/add', { 
      id: product.id, 
      productId: product.id, 
      quantity: finalQty 
    }).then(() => {
      return API.get('/cart');
    }).then(res => {
      setCart(res.data);
      setTimeout(() => setAddingId(null), 1200);
    }).catch(() => setAddingId(null));
  };

  return (
    <div className="pastry-module">
      <header className="konga-header">
        <div className="header-left">
           <button onClick={() => activeTab ? setActiveTab(null) : navigate(-1)} className="k-back-btn">
            {activeTab ? "❮ Categories" : "❮ Back"}
           </button>
           <h1 className="k-title">{activeTab || "Pastry Menu"}</h1>
        </div>
        <div className="k-exit" onClick={() => navigate('/')}>Exit</div>
      </header>

      <div className="main-content-scroll">
        {loading ? (
          <div className="k-loader"><div className="k-spinner"></div></div>
        ) : (
          <>
            {!activeTab && (
              <div className="k-menu-list">
                {categories.map(t => {
                  const itemCount = getFilteredItems(t, products).length;
                  return (
                    <div key={t} className="k-menu-row" onClick={() => setActiveTab(t)}>
                      <div className="k-row-info">
                        <span className="k-cat-name">{t}</span>
                        <span className="k-cat-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                      </div>
                      <span className="k-arrow">❯</span>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab && (
              <div className="k-product-grid">
                {filteredProducts.map(p => (
                  <div key={p.id} className="k-card">
                    <div className="k-card-media">
                      <img src={p.image} alt={p.name} onClick={() => setZoomImage(p.image)} />
                      {p.videoUrl && (
                        <button className="k-vid-badge" onClick={() => setVideoUrl(p.videoUrl)}>▶ View Clip</button>
                      )}
                    </div>
                    <div className="k-card-body">
                      <h3 className="k-p-name">{p.name}</h3>
                      <p className="k-p-price">₦{Number(p.price).toLocaleString()}</p>
                      
                      <div className="qty-input-group">
                        <button type="button" onClick={() => {
                          const current = parseInt(quantities[p.id]) || 1;
                          handleQtyChange(p.id, String(current - 1));
                        }}>−</button>
                        
                        <input 
                          type="number" 
                          placeholder="1"
                          value={quantities[p.id] !== undefined ? quantities[p.id] : ""}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleQtyChange(p.id, e.target.value)}
                        />
                        
                        <button type="button" onClick={() => {
                          const current = parseInt(quantities[p.id]) || 1;
                          handleQtyChange(p.id, String(current + 1));
                        }}>+</button>
                      </div>

                      <button 
                        className={`k-add-btn ${addingId === p.id ? 'added' : ''}`} 
                        onClick={() => addToCart(p)}
                      >
                        {addingId === p.id ? "Success! ✅" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {videoUrl && (
        <div className="pip-video-frame">
          <div className="pip-header">
             <span>Preview</span>
             <button onClick={() => setVideoUrl(null)}>✕</button>
          </div>
          <video src={videoUrl} controls autoPlay muted />
        </div>
      )}

      {zoomImage && (
        <div className="k-zoom-overlay" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="Zoomed" />
          <div className="zoom-hint">Tap anywhere to close</div>
        </div>
      )}

      {cart?.length > 0 && (
        <div className="k-cart-pill" onClick={() => navigate('/checkout')}>
          <div className="k-pill-badge">{cart.reduce((a, b) => a + b.quantity, 0)}</div>
          <span className="k-pill-total">₦{cart.reduce((s, i) => s + (Number(i.product?.price || i.price) * i.quantity), 0).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default PastryPage;
