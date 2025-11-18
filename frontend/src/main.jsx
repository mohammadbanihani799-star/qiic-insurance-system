import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 🔒 حماية الكود من Console في بيئة الإنتاج
if (import.meta.env.PROD) {
  // تعطيل console في الإنتاج
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
  
  // منع النسخ من الصفحة
  document.addEventListener('copy', (e) => e.preventDefault());
  
  // منع تحديد النص
  document.addEventListener('selectstart', (e) => {
    if (window.location.pathname.includes('/admin')) {
      e.preventDefault();
    }
  });
  
  // كشف استخدام debugger
  setInterval(() => {
    const before = new Date();
    debugger; // سيتوقف هنا إذا كان DevTools مفتوحاً
    const after = new Date();
    if (after - before > 100) {
      window.location.href = '/';
    }
  }, 1000);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
