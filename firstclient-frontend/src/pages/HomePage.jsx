import { useEffect, useState } from 'react';
import API from '../api';
import { HomePageHeader } from '../header/HomePageHeader';
import './HomePage.css'

export function HomePage({ cart, setCart, allProducts, globalLoading }) {
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [quantities, setQuantities] = useState({}); 
  const [searchText, setSearchText] = useState('');
  const [highlightId, setHighlightId] = useState(null);
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

  const handleSearch = (value) => {
    setSearchText(value);
    const normalizedSearch = value.toLowerCase().replace(/[\s-_]/g, '');
    const foundProduct = allProducts.find((p) => 
      p.name?.toLowerCase().replace(/[\s-_]/g, '').includes(normalizedSearch)
    );

    if (foundProduct) {
      setHighlightId(foundProduct.id);
      const element = document.getElementById(`product-${foundProduct.id}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="shop-layout">
      <HomePageHeader cart={cart} onSearch={handleSearch} />

      <main className="home-page-container">
        {globalLoading && visibleProducts.length === 0 ? (
          <div className="loading-state">
             <div className="spinner"></div>
             <p>Heritage Hub is preparing your products...</p>
          </div>
        ) : (
          <div className="products-grid">
            {visibleProducts.map((product) => {
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
                  className={`product-card ${highlightId === product.id ? 'highlight-item' : ''}`}
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
        )}
      </main>
    </div>
  );
}