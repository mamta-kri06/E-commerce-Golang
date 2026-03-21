import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import WishlistPage from './pages/WishlistPage';
import './App.css';

import { CartProvider } from './contexts/CartContext';
import HomePage from './pages/HomePage';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminAnalytics from './pages/AdminAnalytics';

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/wishlist" element={isAuthenticated ? <WishlistPage /> : <Navigate to="/login" />} />
      <Route path="/my-orders" element={isAuthenticated ? <MyOrders /> : <Navigate to="/login" />} />
      
      {/* Auth Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? (user?.role === 'admin' ? <Navigate to="/dashboard" /> : <Navigate to="/" />) : <Login />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? (user?.role === 'admin' ? <Navigate to="/dashboard" /> : <Navigate to="/" />) : <Signup />} 
      />

      {/* Admin Dashboard Routes */}
      <Route 
        path="/dashboard" 
        element={isAdmin ? <Dashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/dashboard/products" 
        element={isAdmin ? <AdminProducts /> : <Navigate to="/" />} 
      />
      <Route 
        path="/dashboard/orders" 
        element={isAdmin ? <AdminOrders /> : <Navigate to="/" />} 
      />
      <Route 
        path="/dashboard/users" 
        element={isAdmin ? <AdminUsers /> : <Navigate to="/" />} 
      />
      <Route 
        path="/dashboard/analytics" 
        element={isAdmin ? <AdminAnalytics /> : <Navigate to="/" />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
