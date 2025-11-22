import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
      const loginTime = sessionStorage.getItem('adminLoginTime');

      if (!isAuthenticated || isAuthenticated !== 'true') {
        navigate('/admin/login');
        return;
      }

      // التحقق من انتهاء الجلسة (8 ساعات)
      if (loginTime) {
        const currentTime = new Date().getTime();
        const eightHours = 8 * 60 * 60 * 1000;
        
        if (currentTime - parseInt(loginTime) > eightHours) {
          sessionStorage.removeItem('adminAuthenticated');
          sessionStorage.removeItem('adminLoginTime');
          navigate('/admin/login');
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
  
  if (!isAuthenticated || isAuthenticated !== 'true') {
    return null;
  }

  return children;
};

export default ProtectedRoute;
