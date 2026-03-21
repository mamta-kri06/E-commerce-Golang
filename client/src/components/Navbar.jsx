import { useEffect, useState } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);

useEffect(() => {
  const fetchWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlistCount(data.length);
    } catch (err) {
      console.error(err);
    }
  };

  if (isAuthenticated) {
    fetchWishlist();
  }
}, [isAuthenticated]);
  const navigate = useNavigate();

  // Array of human face emojis to pick from based on user ID
  const emojis = ['👨‍💼', '👩‍', '🧑‍🎨', '👩‍🎓', '🧑‍', '👨‍🎨'];
  const userEmoji = emojis[(user?.id || 0) % emojis.length];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div 
              className="flex items-center cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-900 tracking-tight">ShopHub</h1>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">E-Commerce</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {/* Navigation Menu */}
                <div className="hidden md:flex items-center space-x-2">
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="text-gray-500 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:bg-indigo-50"
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/')}
                    className="text-gray-500 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:bg-indigo-50"
                  >
                    Products
                  </button>
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="text-gray-500 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:bg-indigo-50"
                  >
                    My Orders
                  </button>
                </div>

                <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

                {/* Cart and User Info */}
                <div className="flex items-center space-x-4">
                  <Link to="/wishlist" className="relative p-2 text-gray-500 hover:text-pink-600 transition-colors">
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21 4.318 12.682a4.5 4.5 0 010-6.364z" 
    />
  </svg>

  {wishlistCount > 0 && (
    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
      {wishlistCount}
    </span>
  )}
</Link>
                  <Link to="/cart" className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{cartCount}</span>
                    )}
                  </Link>

                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div 
                    onClick={() => navigate('/profile')}
                    className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:scale-110 transition-all duration-200"
                    title="View Profile"
                  >
                    <span className="text-xl">
                      {userEmoji}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 p-2.5 rounded-xl transition-all duration-200 group"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                {/* Auth Links */}
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transform hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
