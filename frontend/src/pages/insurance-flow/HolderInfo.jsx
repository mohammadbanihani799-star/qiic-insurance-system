import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/HolderInfo.css';

function HolderInfo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    familyName: '',
    dateOfBirth: '',
    gender: 'male',
    nationality: '',
    city: '',
    passportExpiry: '',
    passportNumber: '',
    email: '',
    countryCode: '+974',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const countryCodes = [
    { code: '+974', country: 'QA', flag: '🇶🇦' },
    { code: '+966', country: 'SA', flag: '🇸🇦' },
    { code: '+971', country: 'AE', flag: '🇦🇪' },
    { code: '+965', country: 'KW', flag: '🇰🇼' },
    { code: '+973', country: 'BH', flag: '🇧🇭' },
    { code: '+968', country: 'OM', flag: '🇴🇲' },
    { code: '+20', country: 'EG', flag: '🇪🇬' },
    { code: '+962', country: 'JO', flag: '🇯🇴' },
    { code: '+961', country: 'LB', flag: '🇱🇧' },
  ];

  const nationalities = [
    'السعودية',
    'الإمارات',
    'قطر',
    'الكويت',
    'البحرين',
    'عُمان',
    'مصر',
    'الأردن',
    'لبنان',
    'سوريا',
    'العراق',
    'فلسطين',
    'المغرب',
    'الجزائر',
    'تونس',
    'ليبيا',
    'السودان',
    'اليمن',
    'الصومال',
    'جيبوتي',
    'جزر القمر',
    'موريتانيا',
  ];

  const cities = [
    'الرياض',
    'جدة',
    'مكة المكرمة',
    'المدينة المنورة',
    'الدمام',
    'الخبر',
    'الدوحة',
    'أبو ظبي',
    'دبي',
    'الشارقة',
    'القاهرة',
    'الإسكندرية',
    'عمّان',
    'بيروت',
    'دمشق',
    'بغداد',
    'مسقط',
    'المنامة',
    'الكويت',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (touched[name] && errors[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'الاسم الشخصي مطلوب';
        } else {
          delete newErrors.firstName;
        }
        break;
      
      case 'familyName':
        if (!value.trim()) {
          newErrors.familyName = 'الاسم العائلي مطلوب';
        } else {
          delete newErrors.familyName;
        }
        break;
      
      case 'dateOfBirth':
        if (!value) {
          newErrors.dateOfBirth = 'تاريخ الميلاد مطلوب';
        } else {
          const age = new Date().getFullYear() - new Date(value).getFullYear();
          if (age < 18) {
            newErrors.dateOfBirth = 'يجب أن يكون العمر 18 سنة أو أكثر';
          } else if (age > 100) {
            newErrors.dateOfBirth = 'تاريخ الميلاد غير صحيح';
          } else {
            delete newErrors.dateOfBirth;
          }
        }
        break;
      
      case 'nationality':
        if (!value) {
          newErrors.nationality = 'الجنسية مطلوبة';
        } else {
          delete newErrors.nationality;
        }
        break;
      
      case 'city':
        if (!value) {
          newErrors.city = 'بلد الإقامة مطلوب';
        } else {
          delete newErrors.city;
        }
        break;
      
      case 'passportExpiry':
        if (!value) {
          newErrors.passportExpiry = 'تاريخ انتهاء الجواز مطلوب';
        } else if (new Date(value) < new Date()) {
          newErrors.passportExpiry = 'جواز السفر منتهي الصلاحية';
        } else {
          delete newErrors.passportExpiry;
        }
        break;
      
      case 'passportNumber':
        if (!value.trim()) {
          newErrors.passportNumber = 'رقم جواز السفر مطلوب';
        } else if (value.length < 6) {
          newErrors.passportNumber = 'رقم جواز السفر غير صحيح';
        } else {
          delete newErrors.passportNumber;
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'البريد الإلكتروني غير صحيح';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'phoneNumber':
        if (!value.trim()) {
          newErrors.phoneNumber = 'رقم الجوال مطلوب';
        } else if (!/^\d{8,}$/.test(value.replace(/\s/g, ''))) {
          newErrors.phoneNumber = 'رقم الجوال غير صحيح';
        } else {
          delete newErrors.phoneNumber;
        }
        break;
      
      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const requiredFields = [
      'firstName',
      'familyName',
      'dateOfBirth',
      'nationality',
      'city',
      'passportExpiry',
      'passportNumber',
      'email',
      'phoneNumber'
    ];

    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
      validateField(field, formData[field]);
    });

    setTouched(newTouched);
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      sessionStorage.setItem('holderInfo', JSON.stringify(formData));
      navigate('/visitors/quote');
    }
  };

  const handleBack = () => {
    navigate('/visitors');
  };

  return (
    <div className="holder-info rtl">
      <div className="holder-info__container">
        <div className="holder-info__header">
          <h1 className="holder-info__title">أدخل المعلومات الشخصية</h1>
          <p className="holder-info__subtitle">
            يمكنك إضافة المزيد من الزوار في الخطوة التالية
          </p>
        </div>

        <form className="holder-info__form" onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                الاسم الشخصي
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input ${touched.firstName && errors.firstName ? 'form-input--error' : ''}`}
                placeholder="الاسم الشخصي"
                dir="auto"
              />
              {touched.firstName && errors.firstName && (
                <span className="form-error">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="familyName" className="form-label">
                الاسم العائلي
              </label>
              <input
                type="text"
                id="familyName"
                name="familyName"
                value={formData.familyName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input ${touched.familyName && errors.familyName ? 'form-input--error' : ''}`}
                placeholder="الاسم العائلي"
                dir="auto"
              />
              {touched.familyName && errors.familyName && (
                <span className="form-error">{errors.familyName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth" className="form-label">
                تاريخ الميلاد
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input form-input--date ${touched.dateOfBirth && errors.dateOfBirth ? 'form-input--error' : ''}`}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              />
              {touched.dateOfBirth && errors.dateOfBirth && (
                <span className="form-error">{errors.dateOfBirth}</span>
              )}
            </div>

            <div className="form-group form-group--radio">
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">ذكر</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">أنثى</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nationality" className="form-label">
                الجنسية
              </label>
              <select
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-select ${touched.nationality && errors.nationality ? 'form-input--error' : ''}`}
              >
                <option value="">اختر الجنسية</option>
                {nationalities.map((nationality) => (
                  <option key={nationality} value={nationality}>
                    {nationality}
                  </option>
                ))}
              </select>
              {touched.nationality && errors.nationality && (
                <span className="form-error">{errors.nationality}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="city" className="form-label">
                بلد الإقامة
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-select ${touched.city && errors.city ? 'form-input--error' : ''}`}
              >
                <option value="">اختر المدينة</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {touched.city && errors.city && (
                <span className="form-error">{errors.city}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="passportExpiry" className="form-label">
                تاريخ انتهاء الجواز
              </label>
              <input
                type="date"
                id="passportExpiry"
                name="passportExpiry"
                value={formData.passportExpiry}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input form-input--date ${touched.passportExpiry && errors.passportExpiry ? 'form-input--error' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {touched.passportExpiry && errors.passportExpiry && (
                <span className="form-error">{errors.passportExpiry}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="passportNumber" className="form-label">
                رقم جواز السفر
              </label>
              <input
                type="text"
                id="passportNumber"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input numeric-input ${touched.passportNumber && errors.passportNumber ? 'form-input--error' : ''}`}
                placeholder="رقم جواز السفر"
                dir="ltr"
              />
              {touched.passportNumber && errors.passportNumber && (
                <span className="form-error">{errors.passportNumber}</span>
              )}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="form-section form-section--contact">
            <h2 className="section-title">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3332 14.1V16.6C18.3341 16.8321 18.2866 17.0618 18.1936 17.2744C18.1006 17.487 17.9643 17.678 17.7933 17.8349C17.6222 17.9918 17.4203 18.1112 17.2005 18.1856C16.9806 18.26 16.7477 18.2876 16.5165 18.2667C13.9522 17.988 11.489 17.1117 9.32486 15.7084C7.31139 14.4289 5.60431 12.7218 4.32486 10.7084C2.91651 8.53437 2.04007 6.05916 1.76653 3.48337C1.7457 3.25294 1.77316 3.02067 1.84719 2.80139C1.92122 2.58211 2.04011 2.38061 2.19636 2.2096C2.35261 2.03859 2.54299 1.90219 2.75493 1.80869C2.96687 1.7152 3.19583 1.66696 3.42736 1.66671H5.92736C6.32928 1.66282 6.71943 1.80594 7.02219 2.06965C7.32495 2.33336 7.52129 2.69958 7.57486 3.09837C7.67486 3.89671 7.86486 4.68171 8.14153 5.44171C8.2594 5.77004 8.27859 6.12663 8.19645 6.46595C8.11431 6.80527 7.9343 7.11133 7.67486 7.34171L6.60819 8.40837C7.77571 10.5028 9.49716 12.2242 11.5915 13.3917L12.6582 12.325C12.8886 12.0656 13.1946 11.8856 13.534 11.8034C13.8733 11.7213 14.2299 11.7405 14.5582 11.8584C15.3182 12.135 16.1032 12.325 16.9015 12.425C17.3049 12.4792 17.6744 12.6786 17.9386 12.9859C18.2029 13.2932 18.3433 13.6881 18.3332 14.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              بيانات التواصل
            </h2>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input ${touched.email && errors.email ? 'form-input--error' : ''}`}
                placeholder="البريد الإلكتروني"
                dir="ltr"
              />
              {touched.email && errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">
                رقم الجوال
              </label>
              <div className="phone-input-group">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  className="phone-code-select"
                >
                  {countryCodes.map(({ code, country, flag }) => (
                    <option key={code} value={code}>
                      {flag} {code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`form-input phone-input numeric-input ${touched.phoneNumber && errors.phoneNumber ? 'form-input--error' : ''}`}
                  placeholder="0000 0000"
                  dir="ltr"
                />
              </div>
              {touched.phoneNumber && errors.phoneNumber && (
                <span className="form-error">{errors.phoneNumber}</span>
              )}
            </div>
          </div>

          <button type="submit" className="holder-info__submit">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M8.92259 4.41074C9.24803 4.73618 9.24803 5.26382 8.92259 5.58926L5.34518 9.16667H16.6666C17.1269 9.16667 17.4999 9.53976 17.4999 10C17.4999 10.4602 17.1269 10.8333 16.6666 10.8333H5.34518L8.92259 14.4107C9.24803 14.7362 9.24803 15.2638 8.92259 15.5893C8.59715 15.9147 8.06951 15.9147 7.74407 15.5893L2.74407 10.5893C2.41864 10.2638 2.41864 9.73618 2.74407 9.41074L7.74407 4.41074C8.06951 4.08531 8.59715 4.08531 8.92259 4.41074Z" fill="currentColor"/>
            </svg>
            متابعة
          </button>

          <p className="holder-info__privacy">
            بمتابعتك فإنك توافق على 
            <a href="/privacy" className="privacy-link">سياسة الخصوصية</a>
          </p>

          <div className="holder-info__help">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.99984 18.3334C14.6022 18.3334 18.3332 14.6025 18.3332 10.0001C18.3332 5.39771 14.6022 1.66675 9.99984 1.66675C5.39746 1.66675 1.6665 5.39771 1.6665 10.0001C1.6665 14.6025 5.39746 18.3334 9.99984 18.3334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 13.3334V10.0001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 6.66675H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            هل تحتاج لمساعدة؟ اتصل بنا
          </div>
        </form>
      </div>
    </div>
  );
}

export default HolderInfo;
