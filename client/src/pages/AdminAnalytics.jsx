import React from 'react';
import Layout from '../components/Layout';

const AdminAnalytics = () => {
  const stats = [
    { label: 'Total Revenue', value: '₹4,52,318', change: '+20.1%', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', color: 'indigo' },
    { label: 'Total Orders', value: '1,205', change: '+12.5%', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'purple' },
    { label: 'Active Customers', value: '2,420', change: '+4.3%', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'blue' },
    { label: 'Conversion Rate', value: '3.42%', change: '+1.2%', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'green' }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-80 flex items-center justify-center">
            <p className="text-gray-400 font-medium">Sales Revenue Chart (Coming Soon)</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-80 flex items-center justify-center">
            <p className="text-gray-400 font-medium">Order Distribution Chart (Coming Soon)</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminAnalytics;
