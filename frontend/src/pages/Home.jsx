import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// FAQ Item Component
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq__item">
      <h4 
        className={`faq__item-title ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="circle" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#0C0C0C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path className="horizontal" d="M8 12H16" stroke="#0C0C0C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path className="vertical" d="M12 8V16" stroke="#2D2D36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {question}
      </h4>
      <div className={`faq__item-description ${isOpen ? 'show' : ''}`} style={{ display: isOpen ? 'block' : 'none' }}>
        <p>{answer}</p>
      </div>
    </div>
  );
};

const Home = () => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comprehensive');
  const [activeFaq, setActiveFaq] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [coverageTab, setCoverageTab] = useState('comprehensive');
  const navigate = useNavigate();

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Phone number formatting
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 8) return phone;
    
    if (digits.length > 4) {
      return digits.substring(0, 4) + ' ' + digits.substring(4);
    }
    return digits;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Remove +974 prefix and spaces
    const cleanValue = value.replace(/^\+974\s*/, '').replace(/\s/g, '');
    setPhone(formatPhone(cleanValue));
  };

  const validatePhone = (value) => {
    const digits = value.replace(/\s/g, '');
    if (digits.length !== 8) return false;
    if (!/^[3567]/.test(digits)) return false;
    return true;
  };

  const getPhoneValidationState = () => {
    if (!phone) return null;
    const digits = phone.replace(/\s/g, '');
    if (digits.length === 0) return null;
    return validatePhone(phone) ? 'valid' : 'invalid';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePhone(phone)) {
      alert('يجب إدخال رقم هاتف صحيح (8 أرقام يبدأ بـ 3، 5، 6، أو 7)');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedPhone = '+974' + phone.replace(/\s/g, '');
      sessionStorage.setItem('phone', normalizedPhone);
      
      // Navigate to car details page
      navigate('/car-details');
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ، الرجاء المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar navbar--transparent rtl">
        <div className="container container--full">
          <div className="navbar__wrapper">
            <div className="navbar__left-side">
              {/* Burger Menu */}
              <div className="menu-toggle navbar__burger" onClick={toggleMobileMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" className={`menu-svg ${!isMobileMenuOpen ? 'active' : 'inactive'}`}>
                  <path d="M3.5 5.83464C3.5 5.1903 4.02233 4.66797 4.66667 4.66797H23.3333C23.9777 4.66797 24.5 5.1903 24.5 5.83464C24.5 6.47897 23.9777 7.0013 23.3333 7.0013H4.66667C4.02233 7.0013 3.5 6.47897 3.5 5.83464ZM3.5 14.0013C3.5 13.357 4.02233 12.8346 4.66667 12.8346H23.3333C23.9777 12.8346 24.5 13.357 24.5 14.0013C24.5 14.6456 23.9777 15.168 23.3333 15.168H4.66667C4.02233 15.168 3.5 14.6456 3.5 14.0013ZM3.5 22.168C3.5 21.5236 4.02233 21.0013 4.66667 21.0013H23.3333C23.9777 21.0013 24.5 21.5236 24.5 22.168C24.5 22.8123 23.9777 23.3346 23.3333 23.3346H4.66667C4.02233 23.3346 3.5 22.8123 3.5 22.168Z" fill="#2E2C3A" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" className={`close-icon menu-svg ${isMobileMenuOpen ? 'active' : 'inactive'}`}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M6.17765 6.17374C6.63326 5.71813 7.37195 5.71813 7.82756 6.17374L14.0026 12.3488L20.1776 6.17374C20.6333 5.71813 21.372 5.71813 21.8276 6.17374C22.2832 6.62935 22.2832 7.36804 21.8276 7.82366L15.6525 13.9987L21.8276 20.1737C22.2832 20.6294 22.2832 21.368 21.8276 21.8237C21.372 22.2793 20.6333 22.2793 20.1776 21.8237L14.0026 15.6486L7.82756 21.8237C7.37195 22.2793 6.63326 22.2793 6.17765 21.8237C5.72203 21.368 5.72203 20.6294 6.17765 20.1737L12.3527 13.9987L6.17765 7.82366C5.72203 7.36804 5.72203 6.62935 6.17765 6.17374Z" fill="#2E2C3A" />
                </svg>
              </div>

              {/* Logo */}
              <a href="/" className="navbar__logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="76" height="24" viewBox="0 0 76 24" fill="none">
                  <path d="M75.8493 11.3453C73.4872 12.4618 68.2943 14.2546 62.5137 14.2546C56.7446 14.2546 51.8724 11.6538 51.8724 8.07666C51.8724 4.20534 55.6816 1.23448 62.0371 1.23448C64.1924 1.23448 67.2734 1.402 70.9399 2.9375L71.0865 2.64558C71.1016 2.60926 71.1035 2.56868 71.0918 2.53108C71.0801 2.49348 71.0556 2.46132 71.0227 2.44034C67.8527 0.448988 63.6188 0.0236816 61.0981 0.0236816C51.2408 0.0236816 46.2105 4.15953 46.2105 8.08025C46.2105 12.001 50.1472 16.0443 61.2678 16.0443C67.2176 16.0443 73.2112 13.7179 75.9259 11.793C75.9588 11.7707 75.9828 11.7373 75.9936 11.6987C76.0044 11.6601 76.0013 11.6189 75.9848 11.5824L75.8493 11.3453Z" fill="#231844" />
                  <path d="M43.955 14.7883C43.9551 14.7453 43.9393 14.7038 43.9108 14.672C43.8823 14.6402 43.8431 14.6203 43.8009 14.6163L41.542 14.2062V1.95274L43.8009 1.54405C43.8432 1.5398 43.8824 1.51974 43.9109 1.48778C43.9394 1.45581 43.9551 1.41423 43.955 1.37114V1.04464H33.4803V1.37114C33.4804 1.41424 33.4963 1.45577 33.5248 1.48771C33.5534 1.51964 33.5926 1.53971 33.6349 1.54405L35.8938 1.95274V14.2107L33.6349 14.6208C33.5927 14.6248 33.5535 14.6446 33.525 14.6764C33.4966 14.7084 33.4808 14.7498 33.4807 14.7928V15.1188H43.9528L43.955 14.7883Z" fill="#231844" />
                  <path d="M47.385 21.039L47.2964 20.8697C39.4797 23.9824 34.371 20.898 29.5431 18.0856C26.5401 16.3458 23.0644 15.6604 21.2378 15.545C27.9703 14.2965 30.6548 11.6229 30.6548 8.19265C30.6548 3.18374 23.9848 0 15.816 0C13.2563 0 9.20487 0.449109 5.83421 2.40498C5.79911 2.4256 5.77285 2.45874 5.76056 2.49794C5.74827 2.53714 5.75084 2.57958 5.76777 2.61696L5.93741 2.89541C9.88963 1.2337 13.8698 1.27861 15.2092 1.27861C21.2932 1.27861 24.9898 4.33256 24.9898 8.07723C24.9898 10.864 22.8106 14.7892 15.3141 14.7892C8.51834 14.7892 6.23771 11.5673 5.75803 9.11692L0 8.07813C0 11.4635 3.89774 15.8747 14.7051 16.0359C18.1639 16.0359 23.3156 18.0174 26.7877 19.9324C30.7979 22.1451 38.6674 27.1262 47.3487 21.198C47.3736 21.1811 47.3912 21.1553 47.398 21.1258C47.4047 21.0962 47.4001 21.0652 47.385 21.039Z" fill="#231844" />
                </svg>
              </a>

              {/* Award/Cup Section */}
              <div className="navbar__cup">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '20px' }}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M1 6C1 8.51504 2.85693 10.5964 5.27455 10.9478C6.02844 13.5555 8.25789 15.5369 11 15.9291V17H10.7647C8.13323 17 6 19.1332 6 21.7647C6 22.4469 6.55306 23 7.23529 23H16.7647C17.4469 23 18 22.4469 18 21.7647C18 19.1332 15.8668 17 13.2353 17H13V15.9291C15.7421 15.5369 17.9716 13.5555 18.7254 10.9478C21.1431 10.5964 23 8.51504 23 6V5.5C23 4.11929 21.8807 3 20.5 3H18.8293C18.4175 1.83481 17.3062 1 16 1H8C6.69378 1 5.58254 1.83481 5.17071 3H3.5C2.11929 3 1 4.11929 1 5.5V6ZM3.5 5H5V8.82929C3.83481 8.41746 3 7.30622 3 6V5.5C3 5.22386 3.22386 5 3.5 5ZM12 14C9.23858 14 7 11.7614 7 9V4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4V9C17 11.7614 14.7614 14 12 14ZM19 8.82929C20.1652 8.41746 21 7.30622 21 6V5.5C21 5.22386 20.7761 5 20.5 5H19V8.82929ZM15.561 21C15.7272 21 15.847 20.8403 15.7822 20.6873C15.3622 19.6957 14.38 19 13.2353 19H10.7647C9.62002 19 8.63782 19.6957 8.21781 20.6873C8.15297 20.8403 8.27279 21 8.43903 21H15.561Z" fill="#9393BA" />
                </svg>
                <p>شركة تأمين العام في قطر 2025</p>
              </div>

              {/* Desktop Menu */}
              <ul className="navbar__menu navbar__menu--desktop">
                <li className="navbar__menu-item">
                  <a href="/car-insurance" className="navbar-item navbar-item_secondary navbar__menu-item_hover">
                    السيارة
                  </a>
                </li>
                <li className="navbar__menu-item">
                  <a href="/visitors" className="navbar-item navbar-item_secondary navbar__menu-item_hover">
                    الزائرون
                  </a>
                </li>
                <li className="navbar__menu-item">
                  <a href="/travel-insurance" className="navbar-item navbar-item_secondary navbar__menu-item_hover">
                    السفر
                  </a>
                </li>
                <li className="navbar__menu-dropdown">
                  <div className="navbar-item navbar-item_secondary navbar__menu-btn">
                    مزيد من الفئات
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="menu-arrow-icon">
                      <path fillRule="evenodd" clipRule="evenodd" d="M3.52858 5.52876C3.78892 5.26841 4.21103 5.26841 4.47138 5.52876L7.99998 9.05735L11.5286 5.52876C11.7889 5.26841 12.211 5.26841 12.4714 5.52876C12.7317 5.78911 12.7317 6.21122 12.4714 6.47157L8.47138 10.4716C8.21103 10.7319 7.78892 10.7319 7.52858 10.4716L3.52858 6.47157C3.26823 6.21122 3.26823 5.78911 3.52858 5.52876Z" fill="#2E2C3A" />
                    </svg>
                  </div>
                </li>
              </ul>

              {/* City Services Menu */}
              <ul className="navbar__menu navbar__menu--desktop navbar__menu--city-service">
                <li className="navbar__menu-dropdown">
                  <div className="navbar-item navbar-item_secondary navbar__menu-btn">
                    خدمات المدينة
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="menu-arrow-icon">
                      <path fillRule="evenodd" clipRule="evenodd" d="M3.52858 5.52876C3.78892 5.26841 4.21103 5.26841 4.47138 5.52876L7.99998 9.05735L11.5286 5.52876C11.7889 5.26841 12.211 5.26841 12.4714 5.52876C12.7317 5.78911 12.7317 6.21122 12.4714 6.47157L8.47138 10.4716C8.21103 10.7319 7.78892 10.7319 7.52858 10.4716L3.52858 6.47157C3.26823 6.21122 3.26823 5.78911 3.52858 5.52876Z" fill="#2E2C3A" />
                    </svg>
                  </div>
                </li>
              </ul>
            </div>

            <div className="navbar__right-side">
              {/* Renew Button */}
              <div className="navbar__btn navbar__btn_renew">
                <button className="ds-base-button ds-base-button--small ds-base-button--primary text-small-medium nav-renew-btn">
                  <div className="ds-base-button__content">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '20px' }}>
                      <path fillRule="evenodd" clipRule="evenodd" d="M1 12C1 6.47715 5.47715 2 11 2C13.7624 2 16.2648 3.12139 18.0735 4.93138C18.7132 5.57146 19.3981 6.36248 20 7.09444V4C20 3.44772 20.4477 3 21 3C21.5523 3 22 3.44772 22 4V10C22 10.5523 21.5523 11 21 11H15C14.4477 11 14 10.5523 14 10C14 9.44772 14.4477 9 15 9H18.9692C18.277 8.13128 17.4165 7.10335 16.6588 6.34511C15.2098 4.89514 13.2104 4 11 4C6.58172 4 3 7.58172 3 12C3 16.4183 6.58172 20 11 20C14.6457 20 17.7243 17.5605 18.6874 14.2228C18.8406 13.6921 19.3948 13.3861 19.9255 13.5392C20.4561 13.6923 20.7622 14.2466 20.609 14.7773C19.4055 18.9481 15.5605 22 11 22C5.47715 22 1 17.5228 1 12Z" fill="#FFFFFF" />
                    </svg>
                    <span className="ds-base-button__content-inner">تجديد التأمين</span>
                  </div>
                </button>
              </div>

              {/* Language Toggle */}
              <div className="navbar__lang navbar__btn navbar__btn_lang">
                <button className="ds-base-button ds-base-button--small ds-base-button--outline ds-base-button--icon-only text-small-medium">
                  <div className="ds-base-button__content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
                      <g clipPath="url(#clip0_122_599)">
                        <path d="M2.88331 0.805189C3.65622 0.204054 4.7218 -0.0698448 6.02101 0.0151495L6.28468 0.0366338L6.38526 0.0522588C6.88177 0.153518 7.2317 0.616267 7.18019 1.13136C7.12846 1.646 6.6943 2.03053 6.188 2.03175L6.08546 2.02687L5.70265 2.00148C4.86139 1.97649 4.3748 2.17896 4.11183 2.38331C3.82059 2.60984 3.68506 2.92856 3.68507 3.28175C3.68523 3.65232 3.83738 4.01999 4.0796 4.26222C4.30118 4.48353 4.60688 4.61443 5.02101 4.54542C5.11303 4.53015 5.20407 4.52805 5.29249 4.53761C6.27535 4.26555 7.39215 4.08944 8.63917 4.03273L8.74171 4.0337C9.24764 4.0621 9.66058 4.46969 9.68409 4.98683C9.70861 5.53797 9.28116 6.00548 8.72999 6.03077L8.24562 6.05909C3.35353 6.41951 1.98005 8.7101 1.99952 9.99952C2.01036 10.7058 2.38182 11.3287 3.05616 11.6675C3.73763 12.0096 4.86494 12.1207 6.4214 11.4536C6.92891 11.2364 7.51641 11.4716 7.7339 11.979C7.95072 12.4864 7.71567 13.074 7.20851 13.2915C5.26573 14.1241 3.50055 14.129 2.15773 13.4546C0.808366 12.7765 0.0224693 11.4706 0.000498669 10.0298C-0.0243257 8.38619 0.877899 6.80159 2.66066 5.6714C2.03093 5.03918 1.68523 4.15875 1.68507 3.28175C1.68505 2.38506 2.04984 1.45363 2.88331 0.805189ZM11.5816 13.0318H14.7886L13.1851 9.4673L11.5816 13.0318Z" fill="#2E2C3A" />
                      </g>
                      <defs>
                        <clipPath id="clip0_122_599">
                          <rect width="19" height="18" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="offer__wrapper">
        <div className="offer">
          <div className="offer__content">
            <div className="offer-car__coins-btn">
              <p>احصل على كوينز مع تأمينك</p>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '24px' }}>
                <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12.5225 6.58691C12.3866 6.0438 11.6143 6.04378 11.4785 6.58691C10.8764 8.99537 8.99631 10.8763 6.58789 11.4785C6.04474 11.6143 6.04474 12.3857 6.58789 12.5215C8.9963 13.1237 10.8764 15.0046 11.4785 17.4131C11.6143 17.9562 12.3867 17.9562 12.5225 17.4131C13.1246 15.0045 15.0055 13.1236 17.4141 12.5215C17.9566 12.3854 17.9566 11.6146 17.4141 11.4785C15.0055 10.8764 13.1246 8.99547 12.5225 6.58691Z" fill="#FFF" />
              </svg>
            </div>
            <h1>تأمين السيارة في دقيقتين</h1>
          </div>

          <div className="offer__image">
            <picture>
              <source srcSet="/assets/images/car-with-coins.webp" type="image/webp" />
              <img src="/assets/images/car-with-coins.webp" className="offer__image-car" alt="تأمين السيارة" fetchpriority="high" />
            </picture>
          </div>

          <div className="offer__form">
            <p className="offer__form-title">أدخل رقم جوالك لتبدأ</p>
            <form className="offer__form-content" onSubmit={handleSubmit}>
              <div className="ds-base-phone-input offer-car__phone">
                <div className="ds-base-input">
                  <div className={`ds-base-input__wrapper ${getPhoneValidationState() ? `ds-base-input__wrapper--${getPhoneValidationState()}` : ''}`}>
                    <div className="ds-base-input__content-before">
                      <div className="ds-country-select ds-country-select--disabled ds-base-phone-input__country-select">
                        <span className="ds-country-select__flag">
                          <div className="ds-country-flag">
                            <div className="ds-country-flag__border"></div>
                            <img className="ds-country-flag__icon" src="https://qic.online/web-cdn/qic-connect/assets/images/flags/Country=qa.svg" alt="Qatar" />
                          </div>
                        </span>
                      </div>
                    </div>
                    <div className="ds-base-input__inner">
                      <div className="ds-base-input__inner-value">
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          className="ds-base-input__field text-medium"
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder=" "
                          value={phone ? `+974 ${phone}` : '+974 '}
                          onChange={handlePhoneChange}
                          maxLength="14"
                          required
                        />
                      </div>
                    </div>
                    {getPhoneValidationState() === 'valid' && (
                      <div className="ds-base-input__content-after">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ds-base-input__check-icon" style={{ minWidth: '24px' }}>
                          <path fillRule="evenodd" clipRule="evenodd" d="M18.2071 7.29289C18.5976 7.68342 18.5976 8.31658 18.2071 8.70711L11.2071 15.7071C10.8166 16.0976 10.1834 16.0976 9.79289 15.7071L5.79289 11.7071C5.40237 11.3166 5.40237 10.6834 5.79289 10.2929C6.18342 9.90237 6.81658 9.90237 7.20711 10.2929L10.5 13.5858L16.7929 7.29289C17.1834 6.90237 17.8166 6.90237 18.2071 7.29289Z" fill="#639719"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  {getPhoneValidationState() === 'invalid' && phone.replace(/\s/g, '').length >= 3 && (
                    <span className="ds-base-input__error">
                      يجب إدخال رقم هاتف صحيح (8 أرقام يبدأ بـ 3، 5، 6، أو 7)
                    </span>
                  )}
                </div>
              </div>
              <button 
                type="submit" 
                className="ds-base-button ds-base-button--medium ds-base-button--primary text-medium button-qc__black"
                disabled={isLoading}
              >
                <div className="ds-base-button__content">
                  {isLoading && <div className="loading-spinner"></div>}
                  <span className="ds-base-button__content-inner">عرض السعر الخاص بك</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '24px' }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.7071 5.29289C11.0976 5.68342 11.0976 6.31658 10.7071 6.70711L6.41421 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H6.41421L10.7071 17.2929C11.0976 17.6834 11.0976 18.3166 10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929L9.29289 5.29289C9.68342 4.90237 10.3166 4.90237 10.7071 5.29289Z" fill="#FFFFFF" />
                  </svg>
                </div>
              </button>
            </form>
            <p className="privpolicy">
              بمتابعتك فإنك توافق على <a href="/pdf/QIC_Data_Privacy_Notice.pdf" target="_blank">سياسة الخصوصية</a>
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefit section-offset">
        <div className="container">
          <h2>لماذا قطر للتأمين؟</h2>
          <div className="benefit__wrapper">
            <div className="benefit__item">
              <img src="https://portal.static.qic.online/1253d3bf/_qatarnuxt/Since_1964_arabic.CC1PP6Lv.png" alt="منذ 1964" loading="lazy" />
              <div className="benefit__item-bottom">
                <p>نؤمنكم منذ سنة 1964</p>
                <span></span>
              </div>
            </div>
            <div className="benefit__item">
              <img src="https://portal.static.qic.online/1253d3bf/_qatarnuxt/2m_users.BBOdo3gJ.png" alt="2 مليون عميل" loading="lazy" />
              <div className="benefit__item-bottom">
                <p>عميل في دول مجلس التعاون</p>
                <span></span>
              </div>
            </div>
            <div className="benefit__item">
              <img src="https://portal.static.qic.online/1253d3bf/_qatarnuxt/Shield_star.P_xS71yO.png" alt="أفضل تحول رقمي" loading="lazy" />
              <div className="benefit__item-bottom">
                <p>أفضل تحول رقمي لشركة تأمين في قطر</p>
                <span></span>
              </div>
            </div>
            <div className="benefit__item">
              <img src="https://portal.static.qic.online/1253d3bf/_qatarnuxt/A_rating.DEXe7_ra.png" alt="تصنيف A" loading="lazy" />
              <div className="benefit__item-bottom">
                <p>أعلى تصنيف لمعايير الاستدامة من MSCI</p>
                <span></span>
              </div>
            </div>
          </div>
          <a href="/about" target="_blank">
            <button className="button button--medium button--outline">
              المزيد
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M13.2929 5.29289C13.6834 4.90237 14.3166 4.90237 14.7071 5.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L14.7071 18.7071C14.3166 19.0976 13.6834 19.0976 13.2929 18.7071C12.9024 18.3166 12.9024 17.6834 13.2929 17.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L13.2929 6.70711C12.9024 6.31658 12.9024 5.68342 13.2929 5.29289Z" fill="#2D2D36" />
              </svg>
            </button>
          </a>
        </div>
      </section>

      {/* Coverage Section */}
      <section className="covered section-offset">
        <div className="container">
          <h3 className="title title--h3">ما الذي تتم تغطيته؟</h3>
          <div className="covered__tabs">
            <div 
              className={`covered__tabs-item ${activeTab === 'comprehensive' ? 'covered__tabs-item--active' : ''}`}
              onClick={() => setActiveTab('comprehensive')}
            >
              التأمين الشامل
            </div>
            <div 
              className={`covered__tabs-item ${activeTab === 'third-party' ? 'covered__tabs-item--active' : ''}`}
              onClick={() => setActiveTab('third-party')}
            >
              التأمين ضد الغير
            </div>
          </div>

          {activeTab === 'comprehensive' && (
            <div className="covered__content">
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>التأمين ضد الغير</h5>
                  <p>تكاليف المسؤولية عن الأضرار التي تلحقها بمركبة الطرف الثالث</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>المسؤولية تجاه الركاب</h5>
                  <p>تغطية الإصابات الجسدية للسائق والركاب في حال وقوع حادث</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>الضرر الذاتي</h5>
                  <p>الخسارة والأضرار التي تلحق بسيارتك</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>خدمة المساعدة على الطريق 24/7 <span>تغطيات إضافية</span></h5>
                  <p>خدمات الطوارئ على مدار الساعة طوال أيام الأسبوع</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>تأمين الحوادث الشخصية <span>تغطيات إضافية</span></h5>
                  <p>دفع مبلغ للسائق والركاب في حالة الوفاة أو العجز نتيجة حادث</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>إصلاح الوكالة <span>تغطيات إضافية</span></h5>
                  <p>سيتم إجراء إصلاحات السيارة في ورشة وكيل العلامة</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>سيارة بديلة <span>تغطيات إضافية</span></h5>
                  <p>توفير سيارة بديلة عند وقوع حادث وتقديم السيارة للإصلاح</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>التخريب والعواصف والفيضانات <span>تغطيات إضافية</span></h5>
                  <p>تغطية الأضرار التي تلحق بسيارتك نتيجة الكوارث الطبيعية وأعمال الشغب</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>الضرر المجهول <span>تغطيات إضافية</span></h5>
                  <p>تغطية الأضرار التي تلحق بسيارتك بسبب طرف ثالث غير معروف</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>تغطية الطرق الوعرة 360 <span>تغطيات إضافية</span></h5>
                  <p>تغطية سياراتك ضد الحوادث التي تقع في الصحراء والكثبان الرملية</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>التأمين الشامل بدول مجلس التعاون <span>تغطيات إضافية</span></h5>
                  <p>تفعيل التأمين الشامل ليغطي الكويت، عمان، والإمارات العربية المتحدة</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>عدم احتساب استهلاك قطع الغيار <span>تغطيات إضافية</span></h5>
                  <p>إصلاح سيارتك باستخدام قطع غيار جديدة دون احتساب كلفة إضافية</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'third-party' && (
            <div className="covered__content">
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>التأمين ضد الغير</h5>
                  <p>تكاليف المسؤولية عن الأضرار التي تلحقها بمركبة الطرف الثالث</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>المسؤولية تجاه الركاب</h5>
                  <p>تغطية الإصابات الجسدية للسائق والركاب في حال وقوع حادث</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>الضرر الذاتي</h5>
                  <p>الخسارة والأضرار التي تلحق بسيارتك</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>خدمة المساعدة على الطريق 24/7 <span>تغطيات إضافية</span></h5>
                  <p>خدمات الطوارئ على مدار الساعة طوال أيام الأسبوع</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>تأمين الحوادث الشخصية <span>تغطيات إضافية</span></h5>
                  <p>دفع مبلغ للسائق والركاب في حالة الوفاة أو العجز نتيجة حادث</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>إصلاح الوكالة <span>تغطيات إضافية</span></h5>
                  <p>سيتم إجراء إصلاحات السيارة في ورشة وكيل العلامة</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>سيارة بديلة <span>تغطيات إضافية</span></h5>
                  <p>توفير سيارة بديلة عند وقوع حادث وتقديم السيارة للإصلاح</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>التخريب والعواصف والفيضانات <span>تغطيات إضافية</span></h5>
                  <p>تغطية الأضرار التي تلحق بسيارتك نتيجة الكوارث الطبيعية وأعمال الشغب</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>الضرر المجهول <span>تغطيات إضافية</span></h5>
                  <p>تغطية الأضرار التي تلحق بسيارتك بسبب طرف ثالث غير معروف</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>تغطية الطرق الوعرة 360 <span>تغطيات إضافية</span></h5>
                  <p>تغطية سياراتك ضد الحوادث التي تقع في الصحراء والكثبان الرملية</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>التأمين الشامل بدول مجلس التعاون <span>تغطيات إضافية</span></h5>
                  <p>تفعيل التأمين الشامل ليغطي الكويت، عمان، والإمارات العربية المتحدة</p>
                </div>
              </div>
              <div className="covered__content-item covered__content-item--rtl">
                <div className="covered__content-text">
                  <h5>عدم احتساب استهلاك قطع الغيار <span>تغطيات إضافية</span></h5>
                  <p>إصلاح سيارتك باستخدام قطع غيار جديدة دون احتساب كلفة إضافية</p>
                </div>
              </div>
            </div>
          )}

          <button className="dc-link-button">
            <span>قارن أنواع التأمين</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.6893 5.93934C16.2751 5.35355 17.2249 5.35355 17.8107 5.93934L26.8107 14.9393C27.3964 15.5251 27.3964 16.4749 26.8107 17.0607L17.8107 26.0607C17.2249 26.6464 16.2751 26.6464 15.6893 26.0607C15.1036 25.4749 15.1036 24.5251 15.6893 23.9393L22.1287 17.5H6.25C5.42157 17.5 4.75 16.8284 4.75 16C4.75 15.1716 5.42157 14.5 6.25 14.5H22.1287L15.6893 8.06066C15.1036 7.47487 15.1036 6.52513 15.6893 5.93934Z" fill="#2D2D36"/>
            </svg>
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq section-offset">
        <div className="container">
          <h3 className="faq__title">الأسئلة المتكررة</h3>
          <div className="faq__wrapper">
            <FAQItem 
              question="ما هو الأفضل بالنسبة لي، التأمين ضد الغير أم تأمين السيارة الشامل في قطر؟"
              answer="لا يمكن تحديد الخيار الأنسب لك بشكل قاطع، فالأمر يعتمد على احتياجاتك الخاصة من التأمين. يوفر تأمين شامل للسيارات أقصى درجات الحماية، حيث يغطي مسؤوليتك تجاه الغير بالإضافة إلى الأضرار التي قد تلحق بسيارتك نفسها. أما التأمين ضد الغير فهو خيار أساسي وأقل تكلفة، ويقتصر على تغطية الأضرار والخسائر التي تتسبب بها للآخرين فقط."
            />
            <FAQItem 
              question="لدي سيارة جديدة وباهظة الثمن. هل الحصول على تأمين شامل أفضل من التأمين تجاه الغير فقط؟"
              answer="نعم، يُنصح بشدة بالحصول على التأمين الشامل لأصحاب السيارات الجديدة والسائقين الذين يمتلكون سيارات باهظة الثمن، والسائقين الجدد، والأشخاص الذين يقودون سياراتهم في أماكن مزدحمة وعلى الطرق الرئيسية، كما أنه خيار مناسب لجميع السائقين بشكل عام، في المقابل، يعتبر التأمين ضد الغير أقل تكلفة، لكنه لا يغطي أي أضرار قد تلحق بسيارتك."
            />
            <FAQItem 
              question="هل يمكنني طلب عرض سعر الآن ومتابعة شراء تأمين السيارة في وقت لاحق؟"
              answer="أجل. يمكنك الحصول على عرض الأسعار رقمياً ومن ثم استكمال الشراء لاحقاً، إما عبر موقعنا الإلكتروني (مع ضرورة إدخال رقم جوالك للمتابعة) أو من خلال زيارة أي من فروعنا في قطر."
            />
            <FAQItem 
              question="كيف أشتري تأمين السيارة عبر الإنترنت في قطر؟"
              answer="في حال قمت بالشراء عبر الإنترنت من خلال موقعنا الإلكتروني، فيمكنك الدفع باستخدام Apple Pay أو بطاقة الائتمان أو بطاقة السحب الآلي. يمكنك أيضا الحصول على عرض أسعار لتأمين السيارة عبر الإنترنت وإنهاء الشراء في أحد فروعنا."
            />
            <FAQItem 
              question="كيف يتم احتساب قسط التأمين الخاص بي؟"
              answer="يتم احتساب قسط التأمين بناء على مجموعة متنوعة من العوامل، منها على سبيل المثال لا الحصر: موديل سيارتك، وقيمتها. علماً بأن الحد الأدنى لسعر التأمين ضد الغير في قطر هو 400 ر.ق."
            />
            <FAQItem 
              question="هل يمكنني دفع تأمين السيارة بالتقسيط؟"
              answer="نعم، نحن نوفر تغطية شاملة بتكلفة مناسبة، ونمنحك خيار دفع المبلغ كاملًا دفعة واحدة أو تقسيطه على 12 قسطاً شهرياً متساوياً. يفضّل الكثيرون خيار الأقساط الشهرية لأنه أكثر ملاءمة ويخفف من العبء المالي مقارنة بالدفع مرة واحدة."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer__content">
            <div className="footer__logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="76" height="24" viewBox="0 0 76 24" fill="none">
                <path d="M75.8493 11.3453C73.4872 12.4618 68.2943 14.2546 62.5137 14.2546C56.7446 14.2546 51.8724 11.6538 51.8724 8.07666C51.8724 4.20534 55.6816 1.23448 62.0371 1.23448C64.1924 1.23448 67.2734 1.402 70.9399 2.9375L71.0865 2.64558C71.1016 2.60926 71.1035 2.56868 71.0918 2.53108C71.0801 2.49348 71.0556 2.46132 71.0227 2.44034C67.8527 0.448988 63.6188 0.0236816 61.0981 0.0236816C51.2408 0.0236816 46.2105 4.15953 46.2105 8.08025C46.2105 12.001 50.1472 16.0443 61.2678 16.0443C67.2176 16.0443 73.2112 13.7179 75.9259 11.793C75.9588 11.7707 75.9828 11.7373 75.9936 11.6987C76.0044 11.6601 76.0013 11.6189 75.9848 11.5824L75.8493 11.3453Z" fill="white" />
                <path d="M43.955 14.7883C43.9551 14.7453 43.9393 14.7038 43.9108 14.672C43.8823 14.6402 43.8431 14.6203 43.8009 14.6163L41.542 14.2062V1.95274L43.8009 1.54405C43.8432 1.5398 43.8824 1.51974 43.9109 1.48778C43.9394 1.45581 43.9551 1.41423 43.955 1.37114V1.04464H33.4803V1.37114C33.4804 1.41424 33.4963 1.45577 33.5248 1.48771C33.5534 1.51964 33.5926 1.53971 33.6349 1.54405L35.8938 1.95274V14.2107L33.6349 14.6208C33.5927 14.6248 33.5535 14.6446 33.525 14.6764C33.4966 14.7084 33.4808 14.7498 33.4807 14.7928V15.1188H43.9528L43.955 14.7883Z" fill="white" />
                <path d="M47.385 21.039L47.2964 20.8697C39.4797 23.9824 34.371 20.898 29.5431 18.0856C26.5401 16.3458 23.0644 15.6604 21.2378 15.545C27.9703 14.2965 30.6548 11.6229 30.6548 8.19265C30.6548 3.18374 23.9848 0 15.816 0C13.2563 0 9.20487 0.449109 5.83421 2.40498C5.79911 2.4256 5.77285 2.45874 5.76056 2.49794C5.74827 2.53714 5.75084 2.57958 5.76777 2.61696L5.93741 2.89541C9.88963 1.2337 13.8698 1.27861 15.2092 1.27861C21.2932 1.27861 24.9898 4.33256 24.9898 8.07723C24.9898 10.864 22.8106 14.7892 15.3141 14.7892C8.51834 14.7892 6.23771 11.5673 5.75803 9.11692L0 8.07813C0 11.4635 3.89774 15.8747 14.7051 16.0359C18.1639 16.0359 23.3156 18.0174 26.7877 19.9324C30.7979 22.1451 38.6674 27.1262 47.3487 21.198C47.3736 21.1811 47.3912 21.1553 47.398 21.1258C47.4047 21.0962 47.4001 21.0652 47.385 21.039Z" fill="white" />
              </svg>
            </div>
            <p className="footer__text">تأمينك رقميا في دقيقتين - خدمة سريعة وآمنة ومضمونة</p>
            <p className="footer__copyright">© {new Date().getFullYear()} قطر للتأمين - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
