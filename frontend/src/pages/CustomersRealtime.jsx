import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Search, Download, Filter, RefreshCw, Users, TrendingUp } from 'lucide-react';
import '../styles/CustomersRealtime.css';

const SOCKET_URL = 'http://localhost:4000';

export default function CustomersRealtime() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // التحقق من المصادقة
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAuthenticated || isAuthenticated !== 'true') {
      navigate('/admin/login');
      return;
    }

    // إنشاء اتصال Socket.IO
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: {
        token: sessionStorage.getItem('adminToken') || 'demo-token'
      }
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to real-time server:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('initialCustomers', (data) => {
      console.log('📦 Received initial data:', data.length, 'customers');
      setEntries(data);
      setLoading(false);
    });

    newSocket.on('newCustomer', (entry) => {
      console.log('🆕 New customer received:', entry.name);
      setEntries(prev => [entry, ...prev]);
      
      // إشعار صوتي أو مرئي
      showNotification('عميل جديد', `تم إضافة: ${entry.name}`);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  // تحديد الأعمدة ديناميكياً
  const columns = useMemo(() => {
    if (!entries.length) return [];
    const keys = new Set();
    entries.forEach(e => Object.keys(e).forEach(k => keys.add(k)));
    const columnList = Array.from(keys);
    
    // ترتيب الأعمدة المهمة أولاً
    const priority = ['id', 'name', 'phone', 'email', 'qid', 'vehicleMake', 'vehicleModel', 'insuranceType', 'totalAmount', 'status', 'createdAt'];
    return priority.filter(p => columnList.includes(p))
      .concat(columnList.filter(c => !priority.includes(c)));
  }, [entries]);

  // تصفية البحث
  const filtered = useMemo(() => {
    let result = entries;

    // فلتر البحث النصي
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(v =>
          String(v ?? '').toLowerCase().includes(q)
        )
      );
    }

    // فلتر الحالة
    if (filterStatus !== 'الكل') {
      result = result.filter(item => item.status === filterStatus);
    }

    return result;
  }, [entries, query, filterStatus]);

  const handleRefresh = () => {
    if (socket && socket.connected) {
      socket.emit('requestCustomers');
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleExportCSV = () => {
    if (!filtered.length) return;

    const headers = columns.join(',');
    const rows = filtered.map(row =>
      columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const statusOptions = ['الكل', 'جديد', 'قيد المعالجة', 'مكتمل', 'ملغي'];

  return (
    <div className="customers-realtime">
      {/* Header */}
      <div className="customers-realtime__header">
        <div className="customers-realtime__title-section">
          <Users className="customers-realtime__icon" />
          <div>
            <h1 className="customers-realtime__title">العملاء - Real-time</h1>
            <p className="customers-realtime__subtitle">
              عرض فوري لجميع إدخالات العملاء
              {connected && <span className="customers-realtime__status-badge">🟢 متصل</span>}
              {!connected && <span className="customers-realtime__status-badge customers-realtime__status-badge--offline">🔴 غير متصل</span>}
            </p>
          </div>
        </div>

        <div className="customers-realtime__actions">
          <button onClick={handleRefresh} className="customers-realtime__btn customers-realtime__btn--secondary">
            <RefreshCw size={18} />
            تحديث
          </button>
          <button onClick={handleExportCSV} className="customers-realtime__btn customers-realtime__btn--primary">
            <Download size={18} />
            تصدير CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="customers-realtime__stats">
        <div className="customers-realtime__stat-card">
          <div className="customers-realtime__stat-icon customers-realtime__stat-icon--blue">
            <Users size={24} />
          </div>
          <div>
            <div className="customers-realtime__stat-value">{entries.length}</div>
            <div className="customers-realtime__stat-label">إجمالي العملاء</div>
          </div>
        </div>

        <div className="customers-realtime__stat-card">
          <div className="customers-realtime__stat-icon customers-realtime__stat-icon--green">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="customers-realtime__stat-value">{filtered.length}</div>
            <div className="customers-realtime__stat-label">نتائج البحث</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="customers-realtime__filters">
        <div className="customers-realtime__search">
          <Search size={20} />
          <input
            placeholder="ابحث (اسم، جوال، إيميل، رقم هوية، ...)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="customers-realtime__search-input"
          />
        </div>

        <div className="customers-realtime__filter-group">
          <Filter size={18} />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="customers-realtime__select"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="customers-realtime__table-container">
        {loading ? (
          <div className="customers-realtime__loading">
            <div className="customers-realtime__spinner"></div>
            <p>جارٍ التحميل...</p>
          </div>
        ) : (
          <table className="customers-realtime__table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col}>{translateColumnName(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={row.id ?? idx} className={idx % 2 ? 'customers-realtime__row--odd' : ''}>
                  {columns.map(col => (
                    <td key={col}>{renderCell(row[col], col)}</td>
                  ))}
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={columns.length} className="customers-realtime__empty">
                    لا توجد نتائج
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ترجمة أسماء الأعمدة
function translateColumnName(col) {
  const translations = {
    id: 'الرقم',
    name: 'الاسم',
    phone: 'الجوال',
    email: 'البريد الإلكتروني',
    qid: 'رقم الهوية',
    vehicleType: 'نوع المركبة',
    vehicleMake: 'الصانع',
    vehicleModel: 'الموديل',
    vehicleYear: 'السنة',
    plateNumber: 'رقم اللوحة',
    insuranceType: 'نوع التأمين',
    policyStartDate: 'تاريخ البداية',
    totalAmount: 'المبلغ الإجمالي',
    status: 'الحالة',
    createdAt: 'تاريخ الإنشاء'
  };
  return translations[col] || col;
}

// عرض محتوى الخلية
function renderCell(value, col) {
  if (value == null) return '-';

  // تاريخ
  if (col.toLowerCase().includes('date') || col.toLowerCase().includes('created') || isIsoDate(value)) {
    const d = new Date(value);
    if (!isNaN(d)) return d.toLocaleString('ar-QA');
  }

  // مبلغ مالي
  if (col === 'totalAmount') {
    return `${parseFloat(value).toLocaleString('ar-QA')} ر.ق`;
  }

  // حالة
  if (col === 'status') {
    return <span className={`customers-realtime__status customers-realtime__status--${getStatusClass(value)}`}>{value}</span>;
  }

  // JSON
  if (typeof value === 'object') {
    return <pre className="customers-realtime__json">{JSON.stringify(value, null, 2)}</pre>;
  }

  return String(value);
}

function getStatusClass(status) {
  const statusMap = {
    'جديد': 'new',
    'قيد المعالجة': 'processing',
    'مكتمل': 'completed',
    'ملغي': 'cancelled'
  };
  return statusMap[status] || 'default';
}

function isIsoDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(s);
}

function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}
