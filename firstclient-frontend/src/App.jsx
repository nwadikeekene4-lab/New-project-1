import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react'; 
import API from './api'; 
import { HomePage } from './pages/HomePage';
import { Checkout } from './pages/checkout';
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";
import EmergencyReset from './admin/EmergencyReset';
import { AdminLogin } from "./admin/AdminLogin";
import { ProtectedRoute } from './ProtectedRoute';

import WelcomeScreen from './pages/WelcomeScreen';
import NavigationHub from './pages/NavigationHub';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SocialMediaPage from './pages/SocialMediaPage';
import ReviewsPage from './pages/ReviewsPage';
import { SuccessPage } from './pages/SuccessPage';

function App () {
  const [cart, setCart] = useState([]);
  const [allProducts, setAllProducts] = useState([]); 
  const [globalLoading, setGlobalLoading] = useState(true);

  // --- 1. REMOVE LOGIC ---
  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter(item => item.id !== cartItemId));

    API.delete(`/cart/${cartItemId}`)
      .catch(err => {
        console.error("Delete failed, rolling back:", err);
        API.get('/cart').then(res => setCart(res.data));
      });
  };

  // --- 2. INTEGRATED: QUANTITY UPDATE LOGIC ---
  const updateCartQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent 0 or negative quantities

    // Find the item to get the productId for the API call
    const itemToUpdate = cart.find(i => i.id === cartItemId);
    if (!itemToUpdate) return;

    // Instant UI update for a snappy feel
    setCart((prev) => 
      prev.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item)
    );

    // Background Sync with your backend
    // We send quantity: 0 but include a custom 'override' or simply the new total
    API.post('/cart/add', { 
      productId: itemToUpdate.productId, 
      quantity: 0, 
      overrideQuantity: newQuantity 
    }).catch(err => {
        console.error("Quantity sync failed:", err);
        // Optional: rollback if sync is critical
      });
  };

  useEffect(() => {
    API.get('/products')
      .then((response) => {
        setAllProducts(response.data);
        setGlobalLoading(false);
      })
      .catch(err => {
        console.error("Global product fetch error:", err);
        setGlobalLoading(false);
      });

    API.get('/cart')
      .then((response) => setCart(response.data))
      .catch(err => console.error("Initial cart fetch error:", err));
  }, []);
    
  return (
    <Routes> 
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/hub" element={<NavigationHub />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/socials" element={<SocialMediaPage />} />
        
        <Route path="/shop" element={
          <HomePage 
            cart={cart} 
            setCart={setCart} 
            allProducts={allProducts} 
            globalLoading={globalLoading} 
          />
        }/>
        
        {/* INTEGRATED: Passing both removeFromCart and updateCartQuantity */}
        <Route path="/checkout" element={
          <Checkout 
            cart={cart} 
            setCart={setCart} 
            removeFromCart={removeFromCart} 
            updateCartQuantity={updateCartQuantity}
          />
        }/>

        <Route path="/success" element={<SuccessPage setCart={setCart} />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/emergency-reset" element={<EmergencyReset />} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;