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
  const [allProducts, setAllProducts] = useState([]); // Shared across app
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    // 1. PRE-WARM: Start fetching products the second the app loads
    API.get('/products')
      .then((response) => {
        setAllProducts(response.data);
        setGlobalLoading(false);
      })
      .catch(err => {
        console.error("Global product fetch error:", err);
        setGlobalLoading(false);
      });

    // 2. Fetch Initial Cart
    API.get('/cart')
      .then((response) => {
        setCart(response.data);
      })
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
        
        {/* Pass global state to HomePage */}
        <Route path="/shop" element={
          <HomePage 
            cart={cart} 
            setCart={setCart} 
            allProducts={allProducts} 
            globalLoading={globalLoading} 
          />
        }/>
        
        <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />}/>
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