import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './homepageheader.css';

export function HomePageHeader({ cart = [], onSearch, searchTerm = '' }) {
  const [inputText, setInputText] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const totalQuantity = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  // Sync internal input with external search changes (fixes the "Browse All" bug)
  useEffect(() => {
    setInputText(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (totalQuantity > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalQuantity]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only trigger search if the input actually changed from the current state
      if (onSearch && inputText !== searchTerm) {
        onSearch(inputText);
      }
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [inputText, onSearch, searchTerm]);

  const handleClearSearch = () => {
    setInputText('');
    if (onSearch) onSearch('');
  };

  return (
    <>
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span>Essence Menu</span>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
        </div>
        <nav className="sidebar-links">
          <Link to="/" onClick={() => setIsSidebarOpen(false)}>Welcome</Link>
          <Link to="/pasteries" onClick={() => setIsSidebarOpen(false)}>Pastry Services</Link>
          <Link to="/hub" onClick={() => setIsSidebarOpen(false)}>Essence Creations</Link>
          <Link to="/socials" onClick={() => setIsSidebarOpen(false)}>Contact Us</Link>
        </nav>
      </div>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <header className="homepageheader-container">
        <div className="header-main-layout">
          
          <div className="brand-section">
            <button className="hamburger-menu" onClick={() => setIsSidebarOpen(true)}>☰</button>
            <Link to="/" className="header-brand-group">
              <span className="company-name">Essence Creations</span>
              <span className="logo-placeholder">EC</span>
            </Link>
          </div>

          <span className="header-expression">Savor the Essence</span>

          <div className="middle-section">
            <div className="search-bar-wrapper">
              <input 
                className="input" 
                type="text" 
                placeholder="Search bakery treats..." 
                value={inputText} 
                onChange={(e) => {
                  setInputText(e.target.value);
                  setIsSearching(true);
                }} 
              />
              {inputText && (
                <button className="clear-search-btn" onClick={handleClearSearch}>×</button>
              )}
              <button className={`search-submit-btn ${isSearching ? 'searching-pulse' : ''}`} onClick={() => onSearch(inputText)}>
                <img className="search-icon-svg" src="images/search-icon.png" alt="search" />
              </button>
            </div>
          </div>

          <div className="right-section">
            <Link to="/checkout" className="headercart-link">
              <div className="cart-wrapper">
                <img className="cart-main-icon" src="images/cart-image.png" alt="cart" />
                {totalQuantity > 0 && (
                  <div className={`cart-badge-edge ${isBouncing ? 'cart-bounce' : ''}`}>
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

