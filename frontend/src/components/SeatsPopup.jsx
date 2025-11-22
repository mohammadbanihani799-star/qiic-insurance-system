import React from 'react';
import '../styles/components/SeatsPopup.css';

const SeatsPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-wrapper" style={{ zIndex: 1001 }}>
      <div className="popup rtl">
        <div className="popup__close">
          <button 
            className="button-icon popup__close-icon" 
            onClick={onClose}
            aria-label="إغلاق"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711Z" 
                fill="#778A99" 
                fillOpacity="0.8"
              />
            </svg>
          </button>
        </div>

        <div className="istimara-popup">
          <h3>المقاعد</h3>
          <p>يمكن العثور على عدد المقاعد على الوجه الخلفي من الاستمارة (بطاقة تسجيل السيارة)</p>
          <div className="istimara">
            <img 
              src="/assets/images/seats.ou6C64C2.png" 
              alt="موقع عدد المقاعد في الاستمارة" 
            />
          </div>
        </div>

        <button 
          className="btn btn--secondary btn--medium" 
          type="button"
          onClick={onClose}
        >
          إغلاق
        </button>
      </div>
      <div className="popup__bg" onClick={onClose}></div>
    </div>
  );
};

export default SeatsPopup;
