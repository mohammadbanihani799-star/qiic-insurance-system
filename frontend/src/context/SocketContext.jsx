import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
const isDev = import.meta.env.DEV;

// Log only in development
if (isDev) {
  console.log('🔧 SocketContext initializing...');
  console.log('🔧 SOCKET_URL:', SOCKET_URL);
  console.log('🔧 import.meta.env.VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userIp, setUserIp] = useState(null);
  const location = useLocation(); // تتبع تغييرات المسار
  
  if (isDev) console.log('🔧 SocketProvider rendering...');

  // Get user IP first
  useEffect(() => {
    if (isDev) console.log('🔍 Attempting to fetch IP from:', `${SOCKET_URL}/api/client-ip`);
    
    fetch(`${SOCKET_URL}/api/client-ip`)
      .then(res => {
        if (isDev) console.log('📡 IP fetch response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (isDev) console.log('✅ User IP fetched successfully:', data.ip);
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
      if (isDev) console.log('⏳ Waiting for user IP before connecting socket...');
      return;
    }

    if (isDev) {
      console.log('🔌 Initializing socket connection...');
      console.log('🔌 SOCKET_URL:', SOCKET_URL);
      console.log('🔌 User IP:', userIp);
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      if (isDev) {
        console.log('✅ Socket connected successfully!');
        console.log('✅ Socket ID:', newSocket.id);
      }
      setConnected(true);
      
      // Identify user to server
      if (isDev) console.log('👤 Identifying user with IP:', userIp);
      newSocket.emit('userIdentify', { ip: userIp });
    });

    newSocket.on('disconnect', () => {
      if (isDev) console.log('❌ Socket disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ SOCKET_URL:', SOCKET_URL);
      setConnected(false);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      if (isDev) console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ All reconnection attempts failed');
    });

    // Listen for admin navigation commands
    newSocket.on('navigateTo', ({ ip, page }) => {
      if (ip === userIp) {
        if (isDev) console.log('🎯 Admin redirecting you to:', page);
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
        if (isDev) console.log('📍 Page changed to:', currentPage);
        
        // إرسال تحديث الصفحة للسيرفر
        socket.emit('pageChange', { 
          ip: userIp, 
          page: currentPage,
          timestamp: new Date().toISOString()
        });
        
        if (isDev) console.log('📤 Location update sent:', currentPage);
      }
    }
  }, [socket, userIp, connected, location.pathname]); // إضافة location.pathname للتتبع

  // Handle user leaving the site (beforeunload)
  useEffect(() => {
    if (!socket || !userIp) return;

    const handleBeforeUnload = () => {
      const currentPage = location.pathname;
      const isAdminPage = currentPage.startsWith('/admin');
      
      if (!isAdminPage) {
        // إرسال إشعار بالخروج
        socket.emit('pageChange', {
          ip: userIp,
          page: 'OFFLINE',
          status: 'INACTIVE',
          timestamp: new Date().toISOString()
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, userIp, location.pathname]);

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
