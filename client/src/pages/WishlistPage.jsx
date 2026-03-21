import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { wishlistService } from '../services/wishlistService';
import { cartService } from '../services/cartService';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const { addToCart: addToCartContext } = useCart();

  // Load wishlist
  const loadWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  // Remove item from wishlist
  const handleRemove = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      loadWishlist(); // reload wishlist
    } catch (err) {
      console.error(err);
    }
  };

  // Move item to cart
  const handleMoveToCart = async (item) => {
    try {
      // 1️⃣ Add to cart via backend
      await cartService.addToCart(item.Product.id, 1);

      // 2️⃣ Remove from wishlist
      await wishlistService.removeFromWishlist(item.ProductID);

      // 3️⃣ Optional: update local cart context
      addToCartContext(item.Product);

      // 4️⃣ Reload wishlist
      loadWishlist();
    } catch (err) {
      console.error(err);
    }
  };

  if (wishlist.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            ❤️
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save items you love for later.</p>
          <Link
            to="/"
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
          >
            Browse Products
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          My Wishlist
        </h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y">
          {wishlist.map((item) => (
            <div key={item.ID} className="flex items-center gap-4 p-4 border rounded-xl">
              {/* Product Image */}
              <img
                src={
                  item.Product?.imageUrl ||
                  'https://dummyimage.com/150x150/cccccc/000000&text=No+Image'
                }
                alt={item.Product?.name || 'Product'}
                className="w-20 h-20 object-cover rounded-lg"
              />

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">
                  {item.Product?.name || 'No Name'}
                </h3>
                <p className="text-gray-600">
                  ₹{((item.Product?.pricePaise || 0) / 100).toFixed(2)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleRemove(item.ProductID)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WishlistPage;