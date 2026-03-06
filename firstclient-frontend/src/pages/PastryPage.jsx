import React, { useState, useEffect } from 'react';
import API from '../api';
import './PastryPage.css';

const PastryPage = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Cakes');
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    // Fetch products specifically tagged as pastries
    API.get('/products?category=pastry')
      .then(res => {
        setProducts(res.data);
        // Initial filter for the default tab
        setFilteredProducts(res.data.filter(p => p.subCategory === 'Cakes'));
      })
      .catch(err => console.error(err));
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'Others') {
      // Ensure "Others" shows everything that isn't specifically a Cake or Bread
      setFilteredProducts(products.filter(p => p.subCategory === 'Others' || (p.subCategory !== 'Cakes' && p.subCategory !== 'Breads')));
    } else {
      setFilteredProducts(products.filter(p => p.subCategory === tab));
    }
  };

  const addToCart = (product) => {
    // Assuming you have a setCart or similar state lifting 
    // If using the backend API:
    API.post('/cart/add', { productId: product.id, quantity: 1 })
      .then(() => alert(`${product.name} added to cart!`))
      .catch(err => console.error(err));
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
      <main className="pastry-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="konga-card">
            <div className="image-wrapper">
              <img src={product.image} alt={product.name} />
              
              {/* ⭐ UPDATED: Video button now shows for ANY item that has a videoUrl, regardless of tab */}
              {product.videoUrl && (
                <button className="watch-video-btn" onClick={() => setVideoUrl(product.videoUrl)}>
                  <span>▶</span> Watch Video
                </button>
              )}
            </div>
            
            <div className="card-details">
              <h3>{product.name}</h3>
              <p className="price">₦{Number(product.price).toLocaleString()}</p>
              <button className="add-btn" onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </main>

      {/* Professional Video Modal */}
      {videoUrl && (
        <div className="video-modal-overlay" onClick={() => setVideoUrl(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-video" onClick={() => setVideoUrl(null)}>✕</button>
            {/* Added playsInline for better mobile support */}
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              playsInline
              className="main-video" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PastryPage;
