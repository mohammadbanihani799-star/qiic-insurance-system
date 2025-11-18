import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ],
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // حذف console
        drop_debugger: true, // حذف debugger
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2, // تمريرتين للضغط الأقصى
        dead_code: true, // حذف الكود الميت
        warnings: false, // إخفاء التحذيرات
        ecma: 2020 // استخدام معايير ES2020
      },
      mangle: {
        toplevel: true, // تشويش أسماء المتغيرات العليا
        safari10: true,
        properties: {
          regex: /^_/ // تشويش الخصائص التي تبدأ بـ _
        }
      },
      format: {
        comments: false, // حذف كل التعليقات
        preamble: '/* Protected Code - QIIC Insurance System */'
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'socket-io': ['socket.io-client'],
          'icons': ['lucide-react']
        },
        // تشفير أسماء الملفات
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // 🔒 منع إنشاء Source Maps
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  }
})
