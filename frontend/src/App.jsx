import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CompareFloatingBar from './components/common/CompareFloatingBar';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AIAssistantPage from './pages/AIAssistantPage';
import ComparePage from './pages/ComparePage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Guard for logged in customers
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  
                  <main className="flex-1">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:slugOrId" element={<ProductDetailPage />} />
                      <Route path="/ai-assistant" element={<AIAssistantPage />} />
                      <Route path="/compare" element={<ComparePage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />

                      {/* Protected Customer Routes */}
                      <Route
                        path="/wishlist"
                        element={
                          <ProtectedRoute>
                            <WishlistPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <CheckoutPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <ProtectedRoute>
                            <OrdersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders/:orderIdOrNumber"
                        element={
                          <ProtectedRoute>
                            <OrderDetailPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <UserDashboardPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Protected Admin Routes */}
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminDashboardPage />
                          </AdminRoute>
                        }
                      />

                      {/* Fallback 404 */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>

                  <Footer />
                  <CompareFloatingBar />
                </div>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
