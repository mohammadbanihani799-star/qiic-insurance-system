import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 🔒 حماية الكود الكاملة - Code Protection
if (import.meta.env.PROD) {
  // 1. تعطيل Console بالكامل
  const noop = () => {};
  const methods = ['log', 'warn', 'error', 'info', 'debug', 'trace', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'assert', 'profile', 'profileEnd'];
  methods.forEach(method => {
    window.console[method] = noop;
  });
  
  // 2. منع فتح DevTools - حماية متقدمة
  (function() {
    const devtools = { open: false, orientation: null };
    const threshold = 160;
    
    setInterval(function() {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      const orientation = widthThreshold ? 'vertical' : 'horizontal';
      
      if (!(heightThreshold && widthThreshold) && ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
        if (!devtools.open || devtools.orientation !== orientation) {
          // DevTools مفتوح - إعادة توجيه
          window.location.href = 'about:blank';
        }
        devtools.open = true;
        devtools.orientation = orientation;
      } else {
        devtools.open = false;
        devtools.orientation = null;
      }
    }, 500);
  })();
  
  // 3. منع Right Click
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // 4. منع النسخ والتحديد
  document.addEventListener('copy', (e) => e.preventDefault());
  document.addEventListener('cut', (e) => e.preventDefault());
  document.addEventListener('selectstart', (e) => e.preventDefault());
  
  // 5. منع F12 و Ctrl+Shift+I و Ctrl+U
  document.addEventListener('keydown', (e) => {
    if (
      e.keyCode === 123 || // F12
      (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
      (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
      (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
      (e.ctrlKey && e.shiftKey && e.keyCode === 67) || // Ctrl+Shift+C
      (e.metaKey && e.altKey && e.keyCode === 73) || // Cmd+Option+I (Mac)
      (e.metaKey && e.altKey && e.keyCode === 74) // Cmd+Option+J (Mac)
    ) {
      e.preventDefault();
      return false;
    }
  });
  
  // 6. كشف Debugger
  setInterval(() => {
    const before = performance.now();
    debugger;
    const after = performance.now();
    if (after - before > 100) {
      window.location.href = 'about:blank';
    }
  }, 1000);
  
  // 7. تشفير Source Code
  Object.freeze(Object.prototype);
  Object.freeze(Array.prototype);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
