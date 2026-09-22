import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import SiteHeader from './components/SiteHeader';
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Toast from './components/Toast';
import { getCurrentUserApi, getCartApi, logoutUserApi } from './services/apiService';

// Admin Imports
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminBusinessPage from './pages/admin/AdminBusinessPage';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Restore session on load
  const fetchUserSession = async () => {
    try {
      const savedDetails = localStorage.getItem('toyland_user_details');
      if (savedDetails) {
        setUser(JSON.parse(savedDetails));
      }
      const currentUser = await getCurrentUserApi();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (err) {
      setUser(null);
    }
  };

  // Fetch cart count
  const fetchCartCount = async () => {
    const token = localStorage.getItem('toyland_jwt_token');
    if (!token) {
      setCartItemCount(0);
      return;
    }
    try {
      const cart = await getCartApi();
      setCartItemCount(cart.totalItemsCount || 0);
    } catch (err) {
      setCartItemCount(0);
    }
  };

  useEffect(() => {
    fetchUserSession();
    fetchCartCount();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    fetchCartCount();
  };

  const handleLogout = async () => {
    await logoutUserApi();
    setUser(null);
    setCartItemCount(0);
    showToast('info', 'Logged Out', 'You have been logged out safely.');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!['/', '/home', '/products'].includes(location.pathname)) {
      navigate('/home');
    }
  };

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-viewport" style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Customer Header bar shown on main shop pages */}
      {!isAuthPage && !isAdminRoute && (
        <SiteHeader
          user={user}
          cartItemCount={cartItemCount}
          onSearch={handleSearch}
          onLogout={handleLogout}
        />
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Customer Routes */}
          <Route
            path="/"
            element={
              <HomePage
                user={user}
                searchQuery={searchQuery}
                onCartUpdated={fetchCartCount}
                onShowToast={showToast}
              />
            }
          />
          <Route
            path="/home"
            element={
              <HomePage
                user={user}
                searchQuery={searchQuery}
                onCartUpdated={fetchCartCount}
                onShowToast={showToast}
              />
            }
          />
          <Route
            path="/products"
            element={
              <HomePage
                user={user}
                searchQuery={searchQuery}
                onCartUpdated={fetchCartCount}
                onShowToast={showToast}
              />
            }
          />
          <Route
            path="/products/:productId"
            element={
              <ProductDetailsPage
                user={user}
                onCartUpdated={fetchCartCount}
                onShowToast={showToast}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                user={user}
                onCartUpdated={fetchCartCount}
                onShowToast={showToast}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <OrdersPage
                user={user}
                onShowToast={showToast}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginPage
                onShowToast={showToast}
                onLoginSuccess={handleLoginSuccess}
              />
            }
          />
          <Route
            path="/register"
            element={<RegisterPage onShowToast={showToast} />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage onShowToast={showToast} />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminLoginPage
                onAdminLoginSuccess={handleLoginSuccess}
                onShowToast={showToast}
              />
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminLayout user={user} onLogout={handleLogout}>
                <AdminDashboardPage onShowToast={showToast} />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminLayout user={user} onLogout={handleLogout}>
                <AdminProductsPage onShowToast={showToast} />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminLayout user={user} onLogout={handleLogout}>
                <AdminUsersPage currentUser={user} onShowToast={showToast} />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminLayout user={user} onLogout={handleLogout}>
                <AdminOrdersPage onShowToast={showToast} />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/business"
            element={
              <AdminLayout user={user} onLogout={handleLogout}>
                <AdminBusinessPage onShowToast={showToast} />
              </AdminLayout>
            }
          />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
