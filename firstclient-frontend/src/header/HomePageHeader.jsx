import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './homepageheader.css';

export function HomePageHeader({ cart = [], onSearch }) {
  const [inputText, setInputText] = useState('');
  const [isBouncing, setIsBouncing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Calculate total quantity for the cart badge
  let totalQuantity = 0;
  cart.forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
  });

  // Bounce effect when items are added
  useEffect(() => {
    if (totalQuantity > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalQuantity]);

  const handleButtonClick = () => {
    if (onSearch) onSearch(inputText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <>
      {/* --- RESTORED SIDEBAR DRAWER --- */}
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span>Menu</span>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
        </div>
        <nav className="sidebar-links">
          <Link to="/" onClick={() => setIsSidebarOpen(false)}>Welcome</Link>
          <Link to="/hub" onClick={() => setIsSidebarOpen(false)}>Heritage Hub</Link>
          <Link to="/about" onClick={() => setIsSidebarOpen(false)}>About</Link>
          <Link to="/socials" onClick={() => setIsSidebarOpen(false)}>Contact</Link>
          <Link to="/orderpage" onClick={() => setIsSidebarOpen(false)}>Orders</Link>
          <Link to="/catering" onClick={() => setIsSidebarOpen(false)}>Catering</Link>
        </nav>
      </div>

      {/* Overlay to close sidebar when clicking outside */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <header className={`homepageheader-container ${isSearchFocused ? 'search-active' : ''}`}>
        {/* TOP ROW: Branding and Cart */}
        <div className="header-top-row">
          <div className="left-section">
            <button className="hamburger-menu" onClick={() => setIsSidebarOpen(true)}>
              ☰
            </button>
            <Link to="/" className="header-brand-group">
              <span className="company-name">Heritage Hub</span>
              <span className="logo-placeholder">LOGO</span>
            </Link>
          </div>

          <div className="right-section">
            <span className="header-expression">We sell good products</span>
            <Link to="/checkout" className="headercart-link">
              <div className="cart-container">
                <img className="cart-icon" src="images/cart-image.png" alt="cart" />
                <div className={`item-quantity ${isBouncing ? 'cart-bounce' : ''}`}>
                  {totalQuantity}
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* BOTTOM ROW: Search Bar (Full width on mobile) */}
        <div className="middle-section">
          <div className="search-bar-wrapper">
            <input 
              className="input" 
              type="text" 
              placeholder="Search products..." 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyPress={handleKeyPress}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <button className="enter" onClick={handleButtonClick}>
              <img className="search-icon" src="images/search-icon.png" alt="search" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}