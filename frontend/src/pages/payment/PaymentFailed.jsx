import { useNavigate } from 'react-router-dom';

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* أيقونة الفشل */}
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* العنوان */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          فشلت عملية الدفع
        </h1>
        
        <p className="text-gray-600 mb-6">
          عذراً، لم نتمكن من إتمام عملية الدفع
        </p>

        {/* أسباب محتملة */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-right">
          <h3 className="font-semibold text-gray-800 mb-2">الأسباب المحتملة:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>❌ رصيد غير كافٍ في البطاقة</li>
            <li>❌ بيانات البطاقة غير صحيحة</li>
            <li>❌ البطاقة منتهية الصلاحية</li>
            <li>❌ تم رفض العملية من البنك</li>
          </ul>
        </div>

        {/* الأزرار */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/paydcc')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
          <button
            onClick={() => navigate('/payqpay')}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            تجربة طريقة دفع أخرى
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
