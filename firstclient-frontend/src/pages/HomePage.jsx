import { useEffect, useState } from 'react';
import API from '../api';
import { HomePageHeader } from '../header/HomePageHeader';
import './HomePage.css';

export function HomePage({ cart, setCart, allProducts, globalLoading, searchTerm, setSearchTerm }) {
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [quantities, setQuantities] = useState({}); 
  const [addedItemId, setAddedItemId] = useState(null);

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      setVisibleProducts(allProducts.slice(0, 12));
      const timer = setTimeout(() => {
        setVisibleProducts(allProducts);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [allProducts]);

  // ⭐ UPDATED: Flexible quantity logic (Typed or Buttons)
  const handleQuantityChange = (productId, value) => {
    if (value === "") {
      setQuantities(prev => ({ ...prev, [productId]: "" }));
      return;
    }
    const num = parseInt(value);
    if (!isNaN(num)) {
      setQuantities(prev => ({ ...prev, [productId]: Math.max(1, num) }));
    }
  };

  const handleAddToCart = (product) => {
    if (!product || !product.id) return;
    
    // Fallback to 1 if the input is empty or invalid
    const qtyVal = quantities[product.id];
    const finalQty = (qtyVal === "" || isNaN(parseInt(qtyVal))) ? 1 : parseInt(qtyVal);

    API.post('/cart/add', {
      productId: product.id,
      quantity: finalQty,
      deliveryOptionId: 'standard'
    })
    .then(() => API.get('/cart'))
    .then((response) => {
      setCart(response.data); 
      setAddedItemId(product.id);
      setTimeout(() => setAddedItemId(null), 2000);
    })
    .catch(err => console.error("Error adding to cart:", err));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes((searchTerm || '').toLowerCase());
    const isNotPastry = p.category !== 'pastry'; 
    return matchesSearch && isNotPastry;
  });

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="shop-layout">
      <HomePageHeader 
        cart={cart} 
        onSearch={handleSearch} 
        searchTerm={searchTerm} 
      />

      <main className="home-page-container">
        {globalLoading && allProducts.length === 0 ? (
          <div className="loading-state">
             <div className="spinner"></div>
             <p>Essence Creations is preparing your treats...</p>
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => {
                  let displayImage = `https://placehold.co/300x300?text=${product.name || 'Product'}`;
                  
                  if (product.image && typeof product.image === 'string' && product.image !== "null") {
                    if (product.image.startsWith('http')) {
                      displayImage = product.image;
                    } else {
                      const fileName = product.image.split('/').pop();
                      displayImage = `https://res.cloudinary.com/dw4jcixiu/image/upload/f_auto,q_auto/shop_products/${fileName}`;
                    }
                  }

                  return (
                    <div key={product.id} className="product-card">
                      <div className="product-image-wrapper">
                        <img className="product-img" src={displayImage} alt={product.name} loading="lazy" />
                      </div>

                      <div className="product-details">
                        <h3 className="product-title">{product.name}</h3>
                        <div className="product-price">₦{Number(product.price || 0).toLocaleString()}</div>

                        {/* ⭐ NEW QUANTITY CONTROLS INTEGRATED HERE */}
                        <div className="product-action-row">
                          <div className="qty-input-group">
                            <button 
                              type="button" 
                              className="qty-btn"
                              onClick={() => {
                                const current = parseInt(quantities[product.id]) || 1;
                                handleQuantityChange(product.id, String(current - 1));
                              }}
                            >
                              −
                            </button>
                            
                            <input 
                              type="number" 
                              className="qty-main-input"
                              placeholder="1"
                              value={quantities[product.id] !== undefined ? quantities[product.id] : ""}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            />
                            
                            <button 
                              type="button" 
                              className="qty-btn"
                              onClick={() => {
                                const current = parseInt(quantities[product.id]) || 1;
                                handleQuantityChange(product.id, String(current + 1));
                              }}
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            className="buy-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product);
                            }}
                          >
                            {addedItemId === product.id ? "Done!" : "Add"}
                          </button>
                        </div>

                        {addedItemId === product.id && (
                          <div className="status-badge">✅ Added to Cart</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-results-container animate-fade-in">
                <div className="no-results-icon">🧁</div>
                <h3>No treats found for "{searchTerm}"</h3>
                <button className="clear-results-btn" onClick={handleClearSearch}>
                  Browse All Products
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
  }
