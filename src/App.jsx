import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import CartDrawer from './components/CartDrawer/CartDrawer';
import Home from './pages/Home/Home';
import Category from './pages/Category/Category';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Customizer from './pages/Customizer/Customizer';
import Cart from './pages/Cart/Cart';

import AdminLayout from './components/AdminLayout/AdminLayout';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminUsers from './pages/Admin/AdminUsers';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyEmail from './pages/Auth/VerifyEmail';
import Orders from './pages/Orders/Orders';
import { useAuthStore } from './store/useAuthStore';

// Component to scroll to top on navigation change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const getMe = useAuthStore((state) => state.getMe);

  useEffect(() => {
    getMe();
  }, [getMe]);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/customizer/:engineId" element={<Customizer />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/orders" element={<Orders />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminProducts />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
