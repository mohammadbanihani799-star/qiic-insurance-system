import { useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* أيقونة النجاح */}
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* العنوان */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          تم الدفع بنجاح! 🎉
        </h1>
        
        <p className="text-gray-600 mb-6">
          شكراً لك! تم تأكيد عملية الدفع الخاصة بك
        </p>

        {/* معلومات الوثيقة */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-right">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">حالة الدفع:</span>
              <span className="text-green-600 font-bold">مكتمل ✓</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">رقم العملية:</span>
              <span className="text-gray-800">#PAY-{Date.now()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">التاريخ:</span>
              <span className="text-gray-800">{new Date().toLocaleDateString('ar-SA')}</span>
            </div>
          </div>
        </div>

        {/* الخطوات التالية */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-right">
          <h3 className="font-semibold text-gray-800 mb-2">الخطوات التالية:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✉️ سيتم إرسال تأكيد بالبريد الإلكتروني</li>
            <li>📄 ستستلم وثيقة التأمين خلال 24 ساعة</li>
            <li>📱 يمكنك متابعة الطلب من حسابك</li>
          </ul>
        </div>

        {/* الأزرار */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
          <button
            onClick={() => window.print()}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            طباعة الإيصال
          </button>
        </div>
      </div>
    </div>
  );
}
