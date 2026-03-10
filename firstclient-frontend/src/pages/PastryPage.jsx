import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './PastryPage.css';

const PastryPage = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState(null); // Null means "Show Menu"
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const categories = [
    'Cake', 'Bread', 'Doughnuts', 'Bread roll', 
    'sausage', 'egg roll', 'meat pie', 'fish rolls', 
    'cookies', 'others'
  ];

  // Professional filtering: Case-insensitive and handles "others"
  const filterData = useCallback((all, tab) => {
    if (!tab) return [];
    const searchTab = tab.toLowerCase();
    
    if (searchTab === 'others') {
      const mainCats = categories.slice(0, -1).map(c => c.toLowerCase());
      return all.filter(p => !p.subCategory || !mainCats.includes(p.subCategory.toLowerCase()));
    }
    
    return all.filter(p => p.subCategory && p.subCategory.toLowerCase() === searchTab);
  }, [categories]);

  useEffect(() => {
    setLoading(true);
    API.get('/products?category=pastry')
      .then(res => {
        setProducts(res.data);
        if (activeTab) {
          setFilteredProducts(filterData(res.data, activeTab));
        }
      })
      .catch(err => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
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
        <button onClick={() => activeTab ? setActiveTab(null) : navigate(-1)} className="back-link">
          {activeTab ? "← Back to Categories" : "← Back"}
        </button>
        <h2 className="shop-title">{activeTab ? activeTab : "Pastry Menu"}</h2>
        <div className="header-exit" onClick={() => navigate('/')}>Exit</div>
      </header>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Preparing treats...</p>
        </div>
      ) : (
        <>
          {/* VIEW 1: CATEGORY SELECTION (Vertical Grid) */}
          {!activeTab && (
            <div className="category-menu-grid">
              {categories.map(t => (
                <div key={t} className="category-card" onClick={() => setActiveTab(t)}>
                  <div className="category-icon">{t.charAt(0)}</div>
                  <span className="category-label">{t}</span>
                  <span className="count-badge">
                    {products.filter(p => 
                      t === 'others' 
                      ? !categories.slice(0, -1).map(c => c.toLowerCase()).includes(p.subCategory?.toLowerCase())
                      : p.subCategory?.toLowerCase() === t.toLowerCase()
                    ).length}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* VIEW 2: PRODUCT GRID */}
          {activeTab && (
            <main className="product-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => (
                  <div key={p.id} className="konga-product-card">
                    <div className="img-holder">
                      <img src={p.image} alt={p.name} />
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
                  <button className="back-to-menu-btn" onClick={() => setActiveTab(null)}>Choose another category</button>
                </div>
              )}
            </main>
          )}
        </>
      )}

      {/* Mini Cart Floating */}
      {cart?.length > 0 && (
        <div className="mini-cart-float" onClick={() => navigate('/checkout')}>
          <div className="badge">{cart.reduce((a, b) => a + b.quantity, 0)}</div>
          <span className="total">
            ₦{cart.reduce((s, i) => s + (Number(i.product?.price || i.price) * i.quantity), 0).toLocaleString()}
          </span>
        </div>
      )}

      {/* Video Modal */}
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
