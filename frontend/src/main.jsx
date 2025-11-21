import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Log only in development mode
if (import.meta.env.DEV) {
  console.log('🚀 QIIC Insurance System Starting...');
  console.log('🌐 Environment:', import.meta.env.MODE);
  console.log('🔌 VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('🔌 VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
