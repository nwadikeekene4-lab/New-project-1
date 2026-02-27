import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './homepageheader.css';

export function HomePageHeader({ cart = [], onSearch }) {
  const [inputText, setInputText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const totalQuantity = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  // Cart bounce effect
  useEffect(() => {
    if (totalQuantity > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalQuantity]);

  // Live Search Logic with Pulse Trigger
  useEffect(() => {
    if (inputText.length > 0) setIsSearching(true);

    const delayDebounceFn = setTimeout(() => {
      if (onSearch) onSearch(inputText);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [inputText, onSearch]);

  const handleClearSearch = () => {
    setInputText('');
    setIsSearching(false);
    if (onSearch) onSearch('');
  };

  return (
    <>
      {/* Sidebar Drawer */}
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span>Essence Menu</span>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
        </div>
        <nav className="sidebar-links">
          <Link to="/" onClick={() => setIsSidebarOpen(false)}>Welcome</Link>
          <Link to="/shop" onClick={() => setIsSidebarOpen(false)}>Shop Products</Link>
          <Link to="/catering" onClick={() => setIsSidebarOpen(false)}>Pastry Services</Link>
          <Link to="/hub" onClick={() => setIsSidebarOpen(false)}>Heritage Hub</Link>
          <Link to="/socials" onClick={() => setIsSidebarOpen(false)}>Contact Us</Link>
        </nav>
      </div>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <header className={`homepageheader-container ${isSearchFocused ? 'header-active' : ''}`}>
        <div className="header-top-row">
          {/* LEFT: Menu & Brand */}
          <div className="left-section">
            <button className="hamburger-menu" onClick={() => setIsSidebarOpen(true)}>☰</button>
            <Link to="/" className="header-brand-group">
              <span className="company-name">Essence Creations</span>
              <span className="logo-placeholder">EC</span>
            </Link>
          </div>

          {/* MIDDLE: Premium Search Bar */}
          <div className="middle-section">
            <div className="search-bar-wrapper">
              <input 
                className="input" 
                type="text" 
                placeholder="Search bakery treats..." 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {inputText && (
                <button className="clear-search-btn" onClick={handleClearSearch}>×</button>
              )}
              <button className={`search-submit-btn ${isSearching ? 'searching-pulse' : ''}`} onClick={() => onSearch(inputText)}>
                <img className="search-icon-svg" src="images/search-icon.png" alt="search" />
              </button>
            </div>
          </div>

          {/* RIGHT: Animated Slogan & Large Cart */}
          <div className="right-section">
            <span className="header-expression">Savor the Essence</span>
            <Link to="/checkout" className="headercart-link">
              <div className="cart-container">
                <img className="cart-icon" src="images/cart-image.png" alt="cart" />
                {totalQuantity > 0 && (
                  <div className={`item-quantity ${isBouncing ? 'cart-bounce' : ''}`}>
                    {totalQuantity}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}