import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { format } from 'date-fns';

import { useCart } from '../contexts/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);
        const productData = await productService.getProductById(id);
        setProduct(productData);
        
        const reviewsData = await reviewService.getProductReviews(id);
        setReviews(reviewsData);
      } catch (err) {
        setError('Could not fetch product details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSubmittingReview(true);
    setReviewError(null);
    try {
      const data = await reviewService.createReview({
        productId: parseInt(id),
        rating: newReview.rating,
        comment: newReview.comment
      });
      setReviews([data, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading Product Details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="text-center py-20 px-4">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-r-lg max-w-md mx-auto shadow-md">
            <h2 className="font-extrabold text-xl mb-2">Oops! Something went wrong.</h2>
            <p>{error || 'Product not found.'}</p>
            <Link to="/" className="mt-4 inline-block bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
              Back to Homepage
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const imageUrl = product.imageUrl || 'https://via.placeholder.com/800x800.png/F8FAFC/94A3B8?text=No+Image';
  const price = product.pricePaise / 100;

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Image */}
        <div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-4 relative overflow-hidden">
          {!product.active && (
            <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase shadow-lg">
              Inactive
            </div>
          )}
          {product.stock === 0 && product.active && (
            <div className="absolute top-4 left-4 z-10 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase shadow-lg">
              Out of Stock
            </div>
          )}
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-2xl h-[500px]">
            <img
              src={imageUrl}
              alt={product.name}
              className={`h-full w-full object-cover object-center ${!product.active || product.stock === 0 ? 'grayscale-[0.5]' : ''}`}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6 text-left">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{product.name}</h1>
            <p className="mt-2 text-white-500 font-medium uppercase tracking-wider text-xl">Category: <span className="text-indigo-600 font-bold">{product.category || 'General'}</span></p>
          </div>
          
          <p className="text-white-600 leading-relaxed text-lg">{product.description}</p>

          <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">Price</p>
              <p className="text-4xl font-black text-gray-900">
                <span className="text-lg font-bold text-gray-500 mr-1">{product.currency === 'INR' || !product.currency ? '₹' : product.currency}</span>
                {price.toFixed(2)}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-xl border font-bold text-sm ${product.stock > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </div>
          </div>

          {/* Quantity Selector and Add to Cart */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className={`flex items-center border border-gray-200 rounded-xl p-1 bg-white ${(!product.active || product.stock === 0) ? 'opacity-50 pointer-events-none' : ''}`}>
              <button 
                onClick={() => handleQuantityChange(-1)} 
                disabled={quantity <= 1}
                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-bold text-xl disabled:opacity-30"
              >-</button>
              <span className="px-6 font-black text-xl text-gray-900 min-w-[60px] text-center">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)} 
                disabled={quantity >= product.stock}
                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-bold text-xl disabled:opacity-30"
              >+</button>
            </div>
            <button
              onClick={() => addToCart(product, quantity)}
              disabled={!product.active || product.stock === 0}
              className="w-full flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {!product.active ? 'Currently Unavailable' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Reviews Section */}
          <div className="pt-12 border-t border-gray-100 mt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-500">({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Review Form */}
            {isAuthenticated ? (
              <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 mb-10">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Leave a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: num })}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${newReview.rating >= num ? 'bg-amber-100 text-amber-600 shadow-inner' : 'bg-white text-gray-300 border border-gray-100'}`}
                        >
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Your Experience</label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="What did you like or dislike? How was the quality?"
                      className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 bg-white min-h-[100px] text-gray-900 font-medium"
                      required
                    ></textarea>
                  </div>
                  {reviewError && <p className="text-red-600 text-xs font-bold">{reviewError}</p>}
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-8 py-3 bg-gray-900 text-white font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all duration-200 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8 text-center mb-10">
                <p className="text-indigo-900 font-bold mb-4">Want to share your thoughts?</p>
                <Link to="/login" className="inline-block px-8 py-3 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all">
                  Login to Review
                </Link>
              </div>
            )}

            {/* Review List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-400 italic">
                  No reviews yet. Be the first to review this product!
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                          {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{review.user?.name || 'Anonymous User'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed font-medium">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
