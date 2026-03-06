import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';
import './PastryPage.css';

const PastryPage = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Cakes');
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoized filter function to prevent unnecessary re-renders
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
        // Apply initial filter
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
    API.post('/cart/add', { productId: product.id, quantity: 1 })
      .then(() => {
        if(setCart) setCart(prev => [...prev, product]);
        alert(`${product.name} added to cart! 🛒`);
      })
      .catch(err => alert("Could not add to cart. Please try again."));
  };

  return (
    <div className="pastry-container">
      {/* Category Tabs - Konga Style */}
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
        <div className="loader">Loading fresh pastries...</div>
      ) : (
        <main className="pastry-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className="konga-card">
                <div className="image-wrapper">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  
                  {product.videoUrl && (
                    <button className="watch-video-btn" onClick={() => setVideoUrl(product.videoUrl)}>
                      <span>▶</span> Watch Video
                    </button>
                  )}
                </div>
                
                <div className="card-details">
                  <h3>{product.name}</h3>
                  <p className="price">₦{Number(product.price || 0).toLocaleString()}</p>
                  <button className="add-btn" onClick={() => addToCart(product)}>Add to Cart</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">No {activeTab} available at the moment.</div>
          )}
        </main>
      )}

      {/* Professional Video Modal with Related Shelf */}
      {videoUrl && (
        <div className="video-modal-overlay" onClick={() => setVideoUrl(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-video" onClick={() => setVideoUrl(null)}>✕</button>
            
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              playsInline
              className="main-video" 
            />

            {/* ⭐ Integrated Related Items Shelf */}
            <div className="modal-related-shelf">
              <h4>More from {activeTab}</h4>
              <div className="related-items-list">
                {products
                  .filter(p => p.subCategory === activeTab && p.videoUrl !== videoUrl)
                  .slice(0, 4) // Show up to 4 related items
                  .map(item => (
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
