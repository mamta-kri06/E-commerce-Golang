import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Layout from '../components/Layout';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(100000); // Initial high value
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        const items = data?.items || [];
        setProducts(items);
        setFilteredProducts(items);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(items.map(p => p.category || 'General'))];
        setCategories(uniqueCategories);
        
        // Set initial max price based on products
        if (items.length > 0) {
          const highestPrice = Math.max(...items.map(p => p.pricePaise / 100));
          setMaxPrice(highestPrice + 10);
        }
      } catch (err) {
        setError('Could not fetch products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || (product.category || 'General') === selectedCategory;
      const matchesPrice = (product.pricePaise / 100) <= maxPrice;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, maxPrice, products]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading Products...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-20 px-4">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-r-lg max-w-md mx-auto shadow-md">
            <h2 className="font-extrabold text-xl mb-2">Oops! Something went wrong.</h2>
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-10">
        {/* Hero Section */}
        <div className="text-center py-16 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-inner-lg border border-white/50">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Discover Our Latest Collection
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 font-medium">
            Explore a wide range of high-quality products, curated just for you. Find everything you need, from electronics to fashion.
          </p>
          
          <div className="mt-8 max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for products (e.g. Boat Airdopes, Nike Air...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-gray-900 font-medium"
            />
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
              Shop Now
            </button>
            <button className="px-8 py-3 bg-white/80 border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-white transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Max Price
                </h3>
                <span className="text-indigo-600 font-black text-lg">₹{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max={products.length > 0 ? Math.max(...products.map(p => p.pricePaise / 100)) + 10 : 100000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>₹0</span>
                <span>₹{(products.length > 0 ? Math.max(...products.map(p => p.pricePaise / 100)) : 100000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Featured Products'}
            </h2>
            <div className="text-sm font-medium text-gray-500">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} found
            </div>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-r-lg max-w-md mx-auto shadow-md">
                <h2 className="font-extrabold text-xl mb-2">No Products Found</h2>
                <p>We couldn't find any products matching your search. Try adjusting your keywords!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
