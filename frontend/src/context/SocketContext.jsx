import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

console.log('🔧 SocketContext initializing...');
console.log('🔧 SOCKET_URL:', SOCKET_URL);
console.log('🔧 import.meta.env.VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userIp, setUserIp] = useState(null);
  const location = useLocation(); // تتبع تغييرات المسار
  
  console.log('🔧 SocketProvider rendering...');

  // Get user IP first
  useEffect(() => {
    console.log('🔍 Attempting to fetch IP from:', `${SOCKET_URL}/api/client-ip`);
    
    fetch(`${SOCKET_URL}/api/client-ip`)
      .then(res => {
        console.log('📡 IP fetch response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('✅ User IP fetched successfully:', data.ip);
        setUserIp(data.ip);
        sessionStorage.setItem('userIP', data.ip);
      })
      .catch((err) => {
        console.error('❌ Failed to fetch IP:', err);
        console.error('❌ SOCKET_URL:', SOCKET_URL);
        console.error('❌ Error details:', err.message);
        
        const fallbackIP = '127.0.0.1';
        console.warn('⚠️ Using fallback IP:', fallbackIP);
        setUserIp(fallbackIP);
        sessionStorage.setItem('userIP', fallbackIP);
      });
  }, []);

  // Initialize Socket.IO connection after IP is available
  useEffect(() => {
    if (!userIp) {
      console.log('⏳ Waiting for user IP before connecting socket...');
      return;
    }

    console.log('🔌 Initializing socket connection...');
    console.log('🔌 SOCKET_URL:', SOCKET_URL);
    console.log('🔌 User IP:', userIp);

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully!');
      console.log('✅ Socket ID:', newSocket.id);
      setConnected(true);
      
      // Identify user to server
      console.log('👤 Identifying user with IP:', userIp);
      newSocket.emit('userIdentify', { ip: userIp });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ SOCKET_URL:', SOCKET_URL);
      setConnected(false);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ All reconnection attempts failed');
    });

    // Listen for admin navigation commands
    newSocket.on('navigateTo', ({ ip, page }) => {
      if (ip === userIp) {
        console.log('🎯 Admin redirecting you to:', page);
        window.location.href = page;
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userIp]); // Depend on userIp

  // Update location when page changes (exclude admin pages)
  useEffect(() => {
    if (socket && userIp && connected) {
      const currentPage = location.pathname;
      
      // لا نتتبع صفحات الأدمن
      const isAdminPage = currentPage.startsWith('/admin');
      
      if (!isAdminPage) {
        console.log('📍 Page changed to:', currentPage);
        
        // إرسال تحديث الصفحة للسيرفر
        socket.emit('pageChange', { 
          ip: userIp, 
          page: currentPage,
          timestamp: new Date().toISOString()
        });
        
        console.log('📤 Location update sent:', currentPage);
      }
    }
  }, [socket, userIp, connected, location.pathname]); // إضافة location.pathname للتتبع

  const value = {
    socket,
    connected,
    userIp
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
