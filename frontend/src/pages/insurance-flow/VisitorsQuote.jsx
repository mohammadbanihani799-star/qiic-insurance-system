import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/VisitorsQuote.css';

function VisitorsQuote() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('1');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Load data from sessionStorage
    const savedData = sessionStorage.getItem('visitorsData');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.startDate) setStartDate(data.startDate);
      if (data.duration) setDuration(data.duration);
    }
  }, []);

  const calculateEndDate = () => {
    if (!startDate) return 'حدد التاريخ';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + parseInt(duration));
    return end.toLocaleDateString('ar-QA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatStartDate = () => {
    if (!startDate) return 'حدد التاريخ';
    const date = new Date(startDate);
    return date.toLocaleDateString('ar-QA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculatePrice = () => {
    return parseInt(duration) * 50;
  };

  const handleDateSelect = (day) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const formattedDate = date.toISOString().split('T')[0];
    setStartDate(formattedDate);
    setShowCalendar(false);
  };

  const handlePurchase = () => {
    sessionStorage.setItem('visitorsData', JSON.stringify({ startDate, duration }));
    navigate('/visitors/holder-info');
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];
    const today = new Date();
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    // Fill empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Fill days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const isSelected = startDate === date.toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => !isPast && handleDateSelect(day)}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="calendar-popup">
        <div className="calendar-header">
          <button onClick={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="calendar-month">
            <span>{monthNames[selectedMonth]}</span>
            <span>{selectedYear}</span>
          </div>
          <button onClick={() => {
            if (selectedMonth === 11) {
              setSelectedMonth(0);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="calendar-weekday">{day.slice(0, 3)}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="visitors-quote rtl">
      <div className="quote-container">
        <div className="quote-card">
          <h1 className="quote-title">اختر تواريخ التأمين<br/>للمتابعة</h1>

          {/* Start Date */}
          <div className="form-group">
            <label className="form-label">بداية من</label>
            <div className="date-input-wrapper" onClick={() => setShowCalendar(!showCalendar)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="14" height="14" rx="2" stroke="#1C1C1C" strokeWidth="1.5"/>
                <path d="M3 8H17" stroke="#1C1C1C" strokeWidth="1.5"/>
                <path d="M7 2V4" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M13 2V4" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={formatStartDate()}
                readOnly
                className="date-input"
                placeholder="21 نوفمبر 2025"
              />
            </div>
            {showCalendar && renderCalendar()}
          </div>

          {/* Duration */}
          <div className="form-group">
            <label className="form-label">مدة التأمين</label>
            <div className="select-wrapper">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="duration-select"
              >
                <option value="1">شهر واحد</option>
                <option value="2">شهران</option>
                <option value="3">3 أشهر</option>
                <option value="6">6 أشهر</option>
                <option value="12">سنة</option>
              </select>
            </div>
          </div>

          {/* Date Range Display */}
          <div className="date-range">
            من <span className="date-highlight">{formatStartDate()}</span> حتى <span className="date-highlight">{calculateEndDate()}</span>
          </div>

          {/* Purchase Button */}
          <button
            className="purchase-button"
            onClick={handlePurchase}
            disabled={!startDate}
          >
            شراء التأمين
          </button>

          {/* Corporate Link */}
          <div className="corporate-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18.3334C14.6024 18.3334 18.3334 14.6025 18.3334 10.0001C18.3334 5.39771 14.6024 1.66675 10 1.66675C5.39765 1.66675 1.66669 5.39771 1.66669 10.0001C1.66669 14.6025 5.39765 18.3334 10 18.3334Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 13.3334V10.0001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 6.66675H10.0084" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            هل تحتاج إلى تأمين للشركات أو المجموعات؟
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisitorsQuote;
