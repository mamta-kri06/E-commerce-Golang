import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { format } from 'date-fns';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingOrderId, setPayingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePayNow = async (orderId) => {
    setPayingOrderId(orderId);
    try {
      // 1. Initiate payment in backend
      const data = await orderService.initiatePayment(orderId);
      const { razorpay_order_id, razorpay_key_id, amount } = data;

      // 2. Configure Razorpay options
      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: 'INR',
        name: 'ShopHub',
        description: `Payment for Order #${orderId}`,
        order_id: razorpay_order_id,
        handler: async function (response) {
          // 3. Verify payment in backend
          try {
            await orderService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            alert('Payment successful!');
            fetchOrders(); // Refresh order list
          } catch (error) {
            console.error('Verification error:', error);
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#4F46E5',
        },
        modal: {
          ondismiss: function() {
            setPayingOrderId(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Repay error:', error);
      alert(error.message || 'Failed to initiate payment.');
      setPayingOrderId(null);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">Your Orders</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500">When you buy items, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                {/* Order Header */}
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order Placed</p>
                      <p className="text-sm font-bold text-gray-900">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                      <p className="text-sm font-bold text-indigo-600">
                        ₹{(order.totalPaise / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                    <p className="text-sm font-mono text-gray-900">#{order.id}</p>
                  </div>
                  <div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                      order.status === 'paid' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  {order.status === 'paid' && (
  <button
    onClick={() => orderService.downloadInvoice(order.id)}
    className="px-6 py-2 bg-green-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-green-700 transition-all duration-200"
  >
    Download Invoice
  </button>
)}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handlePayNow(order.id)}
                      disabled={payingOrderId === order.id}
                      className={`px-6 py-2 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-indigo-700 transition-all duration-200 ${payingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {payingOrderId === order.id ? 'Processing...' : 'Pay Now'}
                    </button>
                  )}
                </div>

                {/* Order Items */}
                <div className="px-8 py-6 space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-6">
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                        <img 
                          src={item.product?.imageUrl || 'https://via.placeholder.com/150'} 
                          alt={item.product?.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 truncate">{item.product?.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900">
                          ₹{(item.pricePaise / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrders;
