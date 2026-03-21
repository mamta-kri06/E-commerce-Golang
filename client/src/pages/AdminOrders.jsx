import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { orderService } from '../services/orderService';
import { format } from 'date-fns';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      // Sort by newest first
      const sorted = data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      setOrders(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
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
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Management</h1>
            <p className="text-gray-500 mt-1">Manage and track all customer orders</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <span className="text-sm font-bold text-gray-500 mr-2">Total Orders:</span>
              <span className="text-sm font-black text-indigo-600">{orders.length}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Order Info</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Items</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-bold">No orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-indigo-50/30 transition-colors duration-200">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900">#{order.id}</span>
                          <span className="text-xs font-bold text-gray-400 mt-1">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-black text-indigo-600">
                              {order.user?.name ? order.user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{order.user?.name || 'Unknown'}</span>
                            <span className="text-xs text-gray-500">{order.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex -space-x-3 overflow-hidden">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <div key={item.id || idx} className="inline-block h-8 w-8 rounded-lg ring-2 ring-white overflow-hidden bg-gray-100">
                              <img 
                                src={item.product?.imageUrl || 'https://via.placeholder.com/150'} 
                                alt="" 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg ring-2 ring-white bg-gray-100 border border-gray-200">
                              <span className="text-[10px] font-black text-gray-500">+{order.items.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-indigo-600">
                          ₹{(order.totalPaise / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' :
                          order.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-200 group shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Order Details</h3>
                  <p className="text-sm font-bold text-gray-400 mt-0.5">#{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Customer</h4>
                    <p className="text-sm font-bold text-gray-900">{selectedOrder.user?.name}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.user?.email}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Status</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      selectedOrder.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' :
                      selectedOrder.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Ordered Items</h4>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                        <img 
                          src={item.product?.imageUrl || 'https://via.placeholder.com/150'} 
                          alt="" 
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{item.product?.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{(item.pricePaise / 100).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-900">₹{((item.pricePaise * item.quantity) / 100).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-indigo-50/50 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between text-sm font-bold text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{((selectedOrder.totalPaise - 4000 - (selectedOrder.totalPaise / 1.18 * 0.18)) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-600">
                    <span>Shipping</span>
                    <span>₹40.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-indigo-600 pt-3 border-t border-indigo-100">
                    <span className="text-lg font-black uppercase tracking-tight">Total Paid</span>
                    <span className="text-lg font-black tracking-tight">₹{(selectedOrder.totalPaise / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminOrders;
