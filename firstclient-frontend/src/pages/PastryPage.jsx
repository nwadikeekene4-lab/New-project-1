import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './PastryPage.css';

const PastryPage = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Cakes');
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const filterData = useCallback((all, tab) => {
    return all.filter(p => (tab === 'Others' ? (p.subCategory !== 'Cakes' && p.subCategory !== 'Breads') : p.subCategory === tab));
  }, []);

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
      setCart(prev => [...prev, product]);
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
      <nav className="category-tabs">
        {['Cakes', 'Breads', 'Others'].map(t => (
          <button key={t} className={activeTab === t ? 'active' : ''} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </nav>
      <main className="product-grid">
        {loading ? <p>Loading...</p> : filteredProducts.map(p => (
          <div key={p.id} className="konga-product-card">
            <div className="img-holder">
              <img src={p.image} alt="" />
              {p.videoUrl && <button className="vid-btn" onClick={() => setVideoUrl(p.videoUrl)}>▶ Video</button>}
            </div>
            <div className="p-info">
              <h3 className="p-name">{p.name}</h3>
              <p className="p-price">₦{Number(p.price).toLocaleString()}</p>
              <button className={`add-cart-btn ${addingId === p.id ? 'added' : ''}`} onClick={() => addToCart(p)}>
                {addingId === p.id ? "Added! ✅" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </main>
      {cart?.length > 0 && (
        <div className="mini-cart-float" onClick={() => navigate('/cart')}>
          <div className="badge">{cart.length}</div>
          <span className="total">₦{cart.reduce((s, i) => s + Number(i.price), 0).toLocaleString()}</span>
        </div>
      )}
      {videoUrl && (
        <div className="vid-overlay" onClick={() => setVideoUrl(null)}>
          <div className="vid-content" onClick={e => e.stopPropagation()}>
            <video src={videoUrl} controls autoPlay className="full-vid" />
          </div>
        </div>
      )}
    </div>
  );
};
export default PastryPage;
