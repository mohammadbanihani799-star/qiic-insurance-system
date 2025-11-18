import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // بيانات تسجيل الدخول - من متغيرات البيئة
  const ADMIN_CREDENTIALS = {
    username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
    password: import.meta.env.VITE_ADMIN_PASSWORD || 'QIC@2025' // ⚠️ اضبط في .env.local
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // التحقق من بيانات الدخول
    setTimeout(() => {
      if (
        formData.username === ADMIN_CREDENTIALS.username &&
        formData.password === ADMIN_CREDENTIALS.password
      ) {
        // حفظ حالة تسجيل الدخول
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('adminLoginTime', new Date().getTime().toString());
        navigate('/admin');
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="admin-login">
      <div className="admin-login__container">
        <div className="admin-login__header">
          <img 
            src="data:image/svg+xml,%3csvg%20width='96'%20height='32'%20viewBox='0%200%2096%2032'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M54.6403%2020.0999H41.6213V19.6628C41.6214%2019.6052%2041.6411%2019.5497%2041.6766%2019.5072C41.7121%2019.4646%2041.7608%2019.438%2041.8133%2019.4326L44.6201%2018.8832V2.45967L41.8133%201.91178C41.7607%201.906%2041.7119%201.87911%2041.6765%201.83631C41.641%201.79351%2041.6214%201.73785%2041.6213%201.6801V1.24295H54.643V1.6801C54.643%201.73785%2054.6233%201.79351%2054.5878%201.83631C54.5523%201.87911%2054.5036%201.906%2054.451%201.91178L51.6443%202.45967V18.8774L54.451%2019.4267C54.5034%2019.4322%2054.5522%2019.4588%2054.5877%2019.5013C54.6232%2019.5439%2054.6429%2019.5994%2054.643%2019.657L54.6403%2020.0999ZM95.947%2014.3122C94.5468%2015.1733%2087.4787%2019.6642%2076.9448%2019.6642C67.2795%2019.6642%2064.9342%2013.9479%2064.9342%2010.6722C64.9342%207.39649%2067.2235%201.67864%2076.9448%201.67864C85.1881%201.67864%2087.1361%202.63162%2087.1361%202.63162C87.1771%202.64256%2087.22%202.63717%2087.2573%202.61643C87.2946%202.59568%2087.3245%202.56096%2087.3406%202.51852C87.3568%202.47609%2087.358%202.42876%2087.345%202.38509C87.3319%202.34142%2087.3052%202.3043%2087.2691%202.28044C87.2691%202.28044%2083.0971%200.00291492%2076.9386%200.00291492C62.9235%200.00291492%2057.8951%206.05156%2057.8951%2010.6722C57.8951%2015.2928%2062.9203%2021.34%2076.9386%2021.34C83.9508%2021.34%2091.6333%2018.1604%2095.9881%2014.3893C95.9943%2014.3821%2095.9986%2014.3727%2095.9999%2014.3626C96.0005%2014.3526%2095.9986%2014.3425%2095.9943%2014.3338C95.9893%2014.3251%2095.9825%2014.3183%2095.9738%2014.3145C95.9651%2014.3105%2095.9557%2014.3097%2095.947%2014.3122ZM59.5232%2027.6524C49.3548%2031.9437%2042.8653%2027.9292%2036.7265%2024.0751C32.993%2021.7436%2028.6729%2020.8256%2026.4021%2020.6711C34.8878%2018.9751%2038.1105%2014.3675%2038.1105%2010.6693C38.1105%206.04863%2033.081%200%2019.0432%200C13.0564%200.0743148%208.73493%202.27316%208.73493%202.27316C8.6957%202.29593%208.66579%202.33408%208.65118%202.37996C8.63663%202.42582%208.6385%202.47603%208.65634%202.52047C8.67425%202.56492%208.70689%202.60033%208.74768%202.61959C8.78847%202.63886%208.83441%202.64055%208.87626%202.62433C8.87626%202.62433%2011.0617%201.69612%2019.0406%201.67281C28.7836%201.67281%2031.0716%207.39064%2031.0716%2010.6663C31.0716%2013.942%2028.7836%2019.6584%2019.0379%2019.6584C9.31628%2019.6584%207.02689%2013.942%207.02689%2010.6663H0C0%2015.2024%204.84681%2021.1127%2018.2806%2021.3283C22.5807%2021.3283%2028.9849%2023.9832%2033.301%2026.5493C38.3932%2029.5772%2048.4921%2036.4769%2059.5552%2027.715C59.5588%2027.7088%2059.5608%2027.7017%2059.561%2027.6943C59.5611%2027.6869%2059.5595%2027.6797%2059.5562%2027.6733C59.5529%2027.6668%2059.5482%2027.6615%2059.5423%2027.6579C59.5365%2027.6542%2059.5299%2027.6523%2059.5232%2027.6524Z'%20fill='%236568f4'/%3e%3c/svg%3e" 
            alt="QIC Logo" 
            className="admin-login__logo"
          />
          <h1 className="admin-login__title">لوحة التحكم</h1>
          <p className="admin-login__subtitle">تسجيل الدخول للمديرين</p>
        </div>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="admin-login__form-group">
            <label className="admin-login__label">اسم المستخدم</label>
            <input
              type="text"
              className="admin-login__input"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="أدخل اسم المستخدم"
              required
              autoComplete="username"
            />
          </div>

          <div className="admin-login__form-group">
            <label className="admin-login__label">كلمة المرور</label>
            <input
              type="password"
              className="admin-login__input"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="أدخل كلمة المرور"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="admin-login__error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="admin-login__button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                جاري التحقق...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                تسجيل الدخول
              </>
            )}
          </button>
        </form>

        <div className="admin-login__footer">
          <p>© 2025 Qatar Insurance Company. جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
