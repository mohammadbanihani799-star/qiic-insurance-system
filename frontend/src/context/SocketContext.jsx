import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userIp, setUserIp] = useState(null);

  // Get user IP first
  useEffect(() => {
    fetch(`${SOCKET_URL}/api/client-ip`)
      .then(res => res.json())
      .then(data => {
        console.log('📍 User IP fetched:', data.ip);
        setUserIp(data.ip);
        sessionStorage.setItem('userIP', data.ip);
      })
      .catch((err) => {
        console.error('❌ Failed to fetch IP:', err);
        const fallbackIP = '127.0.0.1';
        setUserIp(fallbackIP);
        sessionStorage.setItem('userIP', fallbackIP);
      });
  }, []);

  // Initialize Socket.IO connection after IP is available
  useEffect(() => {
    if (!userIp) return; // Wait for IP to be fetched

    console.log('🔌 Initializing socket for IP:', userIp);

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);
      setConnected(true);
      
      // Identify user to server
      console.log('👤 Identifying user with IP:', userIp);
      newSocket.emit('userIdentify', { ip: userIp });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
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
      const currentPage = window.location.pathname;
      
      // لا نتتبع صفحات الأدمن
      const isAdminPage = currentPage.startsWith('/admin');
      
      if (!isAdminPage) {
        socket.emit('updateLocation', { ip: userIp, page: currentPage });
        console.log('📍 Location updated:', currentPage);
      }
    }
  }, [socket, userIp, connected]);

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
