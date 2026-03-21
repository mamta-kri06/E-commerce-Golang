import { useEffect, useState } from 'react';
import { wishlistService } from '../services/wishlistService';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);

useEffect(() => {
  wishlistService.getWishlist().then(setWishlist);
}, []);

const isWishlisted = (id) =>
  wishlist.some(item => item.ProductID === id);

const toggleWishlist = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  try {
    if (isWishlisted(product.id)) {
      await wishlistService.removeFromWishlist(product.id);
    } else {
      await wishlistService.addToWishlist(product.id);
    }

    // Refresh wishlist after action
    const updated = await wishlistService.getWishlist();
    setWishlist(updated);

  } catch (err) {
    console.error("Wishlist error:", err);
  }
};
  // Placeholder image if the product doesn't have one.
  const imageUrl = product.imageUrl || 'https://via.placeholder.com/400x400.png/F8FAFC/94A3B8?text=No+Image';
  const price = (product.pricePaise || 0) / 100;

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${!product.active || product.stock === 0 ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <Link to={`/products/${product.id}`} className="block overflow-hidden relative">
      <button
  onClick={toggleWishlist}
  className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md hover:scale-110 transition"
>
  <span className="text-lg">
    {isWishlisted(product.id) ? '❤️' : '🤍'}
  </span>
</button>
        {!product.active && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
            Inactive
          </div>
        )}
        {product.stock === 0 && product.active && (
          <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
            Out of Stock
          </div>
        )}
        <div className="aspect-w-1 aspect-h-1 w-full h-64">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
            {product.category || 'General'}
          </span>
          <span className="text-[10px] font-bold text-gray-400">
            Stock: {product.stock}
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-900 line-clamp-1">
          <Link to={`/products/${product.id}`} className="hover:text-indigo-600 transition-colors">
            {product.name}
          </Link>
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <p className="text-xl font-extrabold text-gray-900">
            <span className="text-xs font-bold text-gray-500 mr-1">{product.currency === 'INR' || !product.currency ? '₹' : product.currency}</span>
            {price.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="p-4 pt-0">
        <button
          onClick={() => addToCart(product)}
          disabled={!product.active || product.stock === 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          {!product.active ? 'Unavailable' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
