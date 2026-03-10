import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './PastryPage.css';

const PastryPage = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState(null); 
  const [videoUrl, setVideoUrl] = useState(null);
  const [zoomImage, setZoomImage] = useState(null); // For close-up view
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const categories = useMemo(() => [
    'Cake', 'Bread', 'Doughnuts', 'Bread roll', 
    'sausage', 'egg roll', 'meat pie', 'fish rolls', 
    'cookies', 'others'
  ], []);

  // Fetch all pastry products once on mount
  useEffect(() => {
    setLoading(true);
    API.get('/products?category=pastry')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter products based on activeTab
  const filteredProducts = useMemo(() => {
    if (!activeTab) return [];
    const search = activeTab.toLowerCase();
    if (search === 'others') {
      const mains = categories.slice(0, -1).map(c => c.toLowerCase());
      return products.filter(p => !p.subCategory || !mains.includes(p.subCategory.toLowerCase()));
    }
    return products.filter(p => p.subCategory?.toLowerCase() === search);
  }, [products, activeTab, categories]);

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
        <button onClick={() => activeTab ? setActiveTab(null) : navigate(-1)} className="back-link">
          {activeTab ? "← Back to Categories" : "← Back"}
        </button>
        <h2 className="shop-title">{activeTab || "Pastry Menu"}</h2>
        <div className="header-exit" onClick={() => navigate('/')}>Exit</div>
      </header>

      {loading ? (
        <div className="loader-container"><div className="spinner"></div><p>Loading...</p></div>
      ) : (
        <>
          {/* VIEW 1: VERTICAL MENU (Shows only when no category is selected) */}
          {!activeTab && (
            <div className="vertical-menu-container">
              <p className="menu-instruction">Select a category to view treats</p>
              {categories.map(t => (
                <div key={t} className="konga-menu-item" onClick={() => setActiveTab(t)}>
                  <div className="menu-text">
                    <span className="cat-name">{t}</span>
                    <span className="cat-count">
                      {products.filter(p => t === 'others' 
                        ? !categories.slice(0, -1).map(c => c.toLowerCase()).includes(p.subCategory?.toLowerCase())
                        : p.subCategory?.toLowerCase() === t.toLowerCase()
                      ).length} Items
                    </span>
                  </div>
                  <div className="chevron">❯</div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW 2: PRODUCT LIST (Shows only when a category is selected) */}
          {activeTab && (
            <main className="product-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => (
                  <div key={p.id} className="konga-product-card">
                    <div className="img-holder">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        onClick={() => setZoomImage(p.image)} /* View Closely */
                        className="clickable-img"
                      />
                      {p.videoUrl && (
                        <button className="vid-btn" onClick={() => setVideoUrl(p.videoUrl)}>▶ Video</button>
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
                  <p>No {activeTab} available right now.</p>
                  <button className="back-to-menu-btn" onClick={() => setActiveTab(null)}>Go Back</button>
                </div>
              )}
            </main>
          )}
        </>
      )}

      {/* MODAL: IMAGE ZOOM (Close-up view) */}
      {zoomImage && (
        <div className="zoom-overlay" onClick={() => setZoomImage(null)}>
          <div className="zoom-content">
            <img src={zoomImage} alt="Zoomed" />
            <button className="close-zoom">✕ Close</button>
          </div>
        </div>
      )}

      {/* MODAL: VIDEO */}
      {videoUrl && (
        <div className="vid-overlay" onClick={() => setVideoUrl(null)}>
          <div className="vid-content" onClick={e => e.stopPropagation()}>
            <video src={videoUrl} controls autoPlay className="full-vid" />
          </div>
        </div>
      )}

      {/* CART FLOAT */}
      {cart?.length > 0 && (
        <div className="mini-cart-float" onClick={() => navigate('/checkout')}>
          <div className="badge">{cart.reduce((a, b) => a + b.quantity, 0)}</div>
          <span className="total">₦{cart.reduce((s, i) => s + (Number(i.product?.price || i.price) * i.quantity), 0).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default PastryPage;
