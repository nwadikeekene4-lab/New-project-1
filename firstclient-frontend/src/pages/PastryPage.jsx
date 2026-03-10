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

  const filteredProducts = useMemo(() => {
    if (!activeTab) return [];
    const search = activeTab.toLowerCase();
    return products.filter(p => 
      search === 'others' 
      ? !categories.slice(0, -1).map(c => c.toLowerCase()).includes(p.subCategory?.toLowerCase())
      : p.subCategory?.toLowerCase() === search
    );
  }, [products, activeTab, categories]);

  const handleQtyChange = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const addToCart = (product) => {
    const qty = quantities[product.id] || 1;
    setAddingId(product.id);
    API.post('/cart/add', { productId: product.id, quantity: qty }).then(() => {
      return API.get('/cart');
    }).then(res => {
      setCart(res.data);
      setTimeout(() => setAddingId(null), 1200);
    });
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
                {categories.map(t => (
                  <div key={t} className="k-menu-row" onClick={() => setActiveTab(t)}>
                    <div className="k-row-info">
                      <span className="k-cat-name">{t}</span>
                      <span className="k-cat-count">{products.filter(p => p.subCategory?.toLowerCase() === t.toLowerCase()).length} items</span>
                    </div>
                    <span className="k-arrow">❯</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab && (
              <div className="k-product-grid">
                {filteredProducts.map(p => (
                  <div key={p.id} className="k-card">
                    <div className="k-card-media">
                      <img src={p.image} alt={p.name} onClick={() => setZoomImage(p.image)} />
                      {p.videoUrl && (
                        <button className="k-vid-badge" onClick={() => setVideoUrl(p.videoUrl)}>▶ Play</button>
                      )}
                    </div>
                    <div className="k-card-body">
                      <h3 className="k-p-name">{p.name}</h3>
                      <p className="k-p-price">₦{Number(p.price).toLocaleString()}</p>
                      
                      <div className="qty-selector">
                        <button onClick={() => handleQtyChange(p.id, -1)}>−</button>
                        <span>{quantities[p.id] || 1}</span>
                        <button onClick={() => handleQtyChange(p.id, 1)}>+</button>
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

      {/* --- FLOATING VIDEO (PICTURE-IN-PICTURE) --- */}
      {videoUrl && (
        <div className="floating-video-container">
          <div className="vid-drag-handle">
            <span>Video Preview</span>
            <button onClick={() => setVideoUrl(null)}>✕</button>
          </div>
          <video src={videoUrl} controls autoPlay />
        </div>
      )}

      {/* --- IMAGE ZOOM (FULL OVERLAY) --- */}
      {zoomImage && (
        <div className="k-modal-overlay" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} className="zoomed-img" alt="Zoomed" />
          <button className="close-zoom-btn">✕ Tap to Close</button>
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
