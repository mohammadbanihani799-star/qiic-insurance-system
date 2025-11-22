import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/LoadingScreen.css';

const LoadingScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading process
    const timer = setTimeout(() => {
      navigate('/select-insurance');
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading-screen rtl">
      <div className="loading-content">
        {/* QIC Logo and Insurance Title */}
        <div className="loading-header">
          <div className="loading-logo">
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 40'%3E%3Cpath fill='%236568F4' d='M20 5C11.7 5 5 11.7 5 20s6.7 15 15 15 15-6.7 15-15S28.3 5 20 5zm0 25c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z'/%3E%3Cpath fill='%236568F4' d='M53 12h5v18h-5zM67 12h5l8 12V12h5v18h-5l-8-12v12h-5zM95 12h5v18h-5z'/%3E%3C/svg%3E"
              alt="QIC Logo" 
              className="qic-logo"
            />
          </div>
          <h2 className="insurance-title">تأمين السيارات</h2>
        </div>

        <div className="loading-animation">
          <div className="car-container">
            <img 
              src="/assets/images/car-with-coins.webp" 
              alt="Loading" 
              className="car-image"
            />
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <h1>الرجاء الانتظار</h1>
        <p>نقوم بمعالجة بياناتك وتحضير أفضل العروض لك</p>

        <div className="progress-container">
          <div className="progress-bar-loading">
            <div className="progress-fill-loading"></div>
          </div>
          <div className="progress-label">جاري التحميل...</div>
        </div>

        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11L12 14L22 4" stroke="#6568F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#6568F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>مقارنة أفضل العروض</span>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#6568F4" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="#6568F4" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span>توفير الوقت والجهد</span>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#6568F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>عروض حصرية</span>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#6568F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="#6568F4" strokeWidth="2"/>
              </svg>
            </div>
            <span>دعم فني متخصص</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
