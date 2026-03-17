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

// --- 🎓 Training School Imports ---
import Training from "./pages/Training"; 
import AdminTraining from "./admin/AdminTraining"; // ✅ Integrated Admin Manager

import WelcomeScreen from './pages/WelcomeScreen';
import NavigationHub from './pages/NavigationHub';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SocialMediaPage from './pages/SocialMediaPage';
import { SuccessPage } from './pages/SuccessPage';
import AdminCMS from './admin/AdminCMS';
import AdminArchive from './admin/AdminArchive';
import PastryPage from './pages/PastryPage';
import AdminPastry from "./admin/AdminPastry";

function App () {
  const [cart, setCart] = useState([]);
  const [allProducts, setAllProducts] = useState([]); 
  const [globalLoading, setGlobalLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter(item => item.id !== cartItemId));
    API.delete(`/cart/${cartItemId}`)
      .catch(err => {
        console.error("Delete failed, rolling back:", err);
        API.get('/cart').then(res => setCart(res.data));
      });
  };

  const updateCartQuantity = (cartItemId, newQuantity) => {
    const itemToUpdate = cart.find(i => i.id === cartItemId);
    if (!itemToUpdate) return;

    setCart((prev) => 
      prev.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item)
    );

    const syncValue = newQuantity === "" ? 0 : newQuantity;
    API.post('/cart/add', { 
      productId: itemToUpdate.productId, 
      quantity: 0, 
      overrideQuantity: syncValue 
    }).catch(err => {
        console.error("Quantity sync failed:", err);
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
        <Route path="/socials" element={<SocialMediaPage />} />
        <Route path="/pastries" element={<PastryPage cart={cart} setCart={setCart} />} />
        
        {/* --- 🌍 PUBLIC SCHOOL ROUTE --- */}
        <Route path="/school" element={<Training />} />
        
        <Route path="/shop" element={
          <HomePage 
            cart={cart} 
            setCart={setCart} 
            allProducts={allProducts} 
            globalLoading={globalLoading} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
          />
        }/>

        <Route path="/checkout" element={
          <Checkout 
            cart={cart} 
            setCart={setCart} 
            removeFromCart={removeFromCart} 
            updateCartQuantity={updateCartQuantity}
          />
        }/>

        <Route path="/success" element={<SuccessPage setCart={setCart} />} />
        
        {/* --- 🔐 ADMIN ROUTES --- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/emergency-reset" element={<EmergencyReset />} />

        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/pastries" element={<ProtectedRoute><AdminPastry /></ProtectedRoute>} />
        <Route path="/admin/cms" element={<ProtectedRoute><AdminCMS /></ProtectedRoute>} />
        <Route path="/admin/archive" element={<ProtectedRoute><AdminArchive /></ProtectedRoute>} />

        {/* ✅ NEW: ADMIN TRAINING ROUTE */}
        <Route 
          path="/admin/training" 
          element={
            <ProtectedRoute>
              <AdminTraining />
            </ProtectedRoute>
          } 
        />
    </Routes>
  );
}

export default App;
