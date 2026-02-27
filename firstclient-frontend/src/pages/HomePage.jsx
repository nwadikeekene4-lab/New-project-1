import { useEffect, useState } from 'react';
import API from '../api';
import { HomePageHeader } from '../header/HomePageHeader';
import './HomePage.css';

// Added searchTerm and setSearchTerm as props to sync with App.jsx and Header
export function HomePage({ cart, setCart, allProducts, globalLoading, searchTerm, setSearchTerm }) {
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [quantities, setQuantities] = useState({}); 
  const [addedItemId, setAddedItemId] = useState(null);

  // Initial load and staggered animation effect
  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      setVisibleProducts(allProducts.slice(0, 12));
      const timer = setTimeout(() => {
        setVisibleProducts(allProducts);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [allProducts]);

  const handleQuantityChange = (productId, value) => {
    setQuantities({ ...quantities, [productId]: Number(value) });
  };

  const handleAddToCart = (product) => {
    if (!product || !product.id) return;
    const quantity = quantities[product.id] || 1;

    API.post('/cart/add', {
      productId: product.id,
      quantity: quantity,
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

  // Improved Search: Now updates the global state
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Filter products based on global searchTerm prop
  const filteredProducts = allProducts.filter((p) => 
    p.name?.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="shop-layout">
      {/* Header now receives searchTerm to keep the input box in sync */}
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
                    <div
                      key={product.id}
                      id={`product-${product.id}`}
                      className="product-card"
                    >
                      <div className="product-image-wrapper">
                        <img 
                          className="product-img" 
                          src={displayImage} 
                          alt={product.name}
                          loading="lazy"
                        />
                      </div>

                      <div className="product-details">
                        <h3 className="product-title">{product.name}</h3>
                        <div className="product-price">₦{Number(product.price || 0).toLocaleString()}</div>

                        <div className="product-action-row">
                          <select
                            className="qty-selector"
                            value={quantities[product.id] || 1}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                          >
                            {[...Array(10).keys()].map((n) => (
                              <option key={n + 1} value={n + 1}>{n + 1}</option>
                            ))}
                          </select>
                          
                          <button
                            className="buy-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product);
                            }}
                          >
                            Add
                          </button>
                        </div>

                        {addedItemId === product.id && (
                          <div className="status-badge">✅ Added</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* PROFESSIONAL NO RESULTS STATE */
              <div className="no-results-container animate-fade-in">
                <div className="no-results-icon">🧁</div>
                <h3>No treats found for "{searchTerm}"</h3>
                <p>We couldn't find any products matching your search. Try a different keyword or browse our full collection.</p>
                
                {/* This button now triggers the global state reset */}
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