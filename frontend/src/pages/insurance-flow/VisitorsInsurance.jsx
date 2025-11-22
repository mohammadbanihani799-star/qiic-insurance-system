import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/VisitorsInsurance.css';

function VisitorsInsurance() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('1');
  const [activeFaq, setActiveFaq] = useState(null);

  const benefits = [
    {
      icon: '💊',
      title: 'المساعدة الطبية الطارئة',
      description: 'يغطي تأمين الزوار نفقات المساعدة الطبية الطارئة (إذا تعرضت لحادث لا قدر الله)'
    },
    {
      icon: '🏥',
      title: 'التعويض على الحوادث داخل قطر',
      description: 'سيحصل الشخص المؤمن على تعويض في حال التعرض لحادث في قطر'
    },
    {
      icon: '🦠',
      title: 'كوفيد-19',
      description: 'سنقوم بتغطية تكلفة العلاج والحجر الصحي والإقامة في المستشفى والأدوية إذا أصبت بعدوى كوفيد-19'
    },
    {
      icon: '✈️',
      title: 'الإخلاء الطبي',
      description: 'تغطية الإخلاء في حالات الطوارئ إلى بلد الإقامة إذا كانت الحالة الصحية للمؤمن تتطلب ذلك'
    },
    {
      icon: '🚀',
      title: 'الإعفاء من الانتظار',
      description: 'ستحصل على تغطية كاملة لحظة شراء التأمين دون وجود فترة انتظار'
    }
  ];

  const whyQIC = [
    {
      image: '/assets/images/visitors/Since_1964_arabic.CC1PP6Lv.png',
      title: 'نؤمنكم منذ سنة 1964'
    },
    {
      image: '/assets/images/visitors/2m_users.BBOdo3gJ.png',
      title: 'عميل في دول مجلس التعاون'
    },
    {
      image: '/assets/images/visitors/Shield_star.P_xS71yO.png',
      title: 'أفضل تحول رقمي لشركة تأمين في قطر'
    },
    {
      image: '/assets/images/visitors/A_rating.DEXe7_ra.png',
      title: 'أعلى تصنيف لمعايير الاستدامة من MSCI'
    }
  ];

  const testimonials = [
    {
      name: 'محمد حسن',
      date: '21 مايو 2025',
      rating: 5,
      text: 'موقعهم الإلكتروني سهل الاستخدام ويساعدك تدير تأمينك.',
      avatar: '/assets/images/visitors/mohammad_rabiul.Dc0Xbaov.png'
    },
    {
      name: 'ماريا نونيس',
      date: '28 أبريل 2025',
      rating: 5,
      text: 'دفعت بسهولة عبر الإنترنت، وحصلت على وثيقة تأمين السفر للزائرين فوراً. أُنا أقدّر حقاً مستوى الخدمة السريعة والسهلة التي تقدمها قطر للتأمين.',
      avatar: '/assets/images/visitors/maria_nunes.CuKiMSBO.png'
    },
    {
      name: 'رايلاند تيري',
      date: '20 يوليو 2025',
      rating: 5,
      text: 'تأمين السفر من قطر للتأمين ممتاز جداً. حصلت عليه لوالديّ أثناء زيارتهما لقطر، ووفر لهما راحة البال طوال الرحلة. يستحق كل ريال دفعته!',
      avatar: '/assets/images/visitors/arnold-aguas.ClU0KOyL.png'
    },
    {
      name: 'عبد العزيز خالد',
      company: 'QTRCars',
      text: 'أود أن أشكر قطر للتأمين على الخدمة الاستثنائية التي قدموها. دائماً ما أكون معجباً باحترافية فريقكم وتفانيه في تلبية كل احتياجاتي التأمينية',
      avatar: '/assets/images/visitors/abdulaziz-khalid-buhusain.C25UYx19.png',
      companyLogo: '/assets/images/visitors/QTRCars.MP01BQzA.png'
    },
    {
      name: 'مهند إبراهيم بيطار',
      role: 'مؤسس @thisisqatar',
      text: 'شراء التأمين وإدارته أصبح أسهل بكثير من خلال تطبيق قطر للتأمين. يمكنني إتمام كل شيء بضغطة زر دون الحاجة لأي معاملات ورقية!',
      avatar: '/assets/images/visitors/mohannad-ibrahim-bitar.lz0T9RRy.png'
    },
    {
      name: 'نورة آمبر',
      date: '23 أبريل 2025',
      text: 'كنت محتارة بشأن كيفية شراء تأمين سفر لزيارة والدتي، لكن خدمة العملاء في قطر للتأمين شرحوا لي كل التفاصيل، وكانت عملية الشراء سهلة جداً.',
      avatar: '/assets/images/visitors/alexa_hopkins.BTV5MDv2.png'
    }
  ];

  const faqs = [
    {
      question: 'كم من الوقت يستغرق الحصول على وثيقة التأمين الصحي للزوار؟',
      answer: 'يستغرق الأمر حوالي دقيقتين فقط عبر موقعنا الإلكتروني'
    },
    {
      question: 'كم تكلفة تأمين الزائرين؟',
      answer: 'السعر الثابت المعتمد من الحكومة لتأمين الزائرين هو 50 ريال قطري لكل شهر'
    },
    {
      question: 'أين يمكنني الاطلاع على مزايا تأمين الزائرين؟',
      answer: 'يمكنك الاطلاع على مزايا تأمين الزائرين من خلال تحميل قائمة المزايا أعلاه'
    },
    {
      question: 'هل يغطي تأمين الزائرين حالتي الطبية المزمنة؟',
      answer: 'لا يغطي تأمين الزوار علاجات الحالات الطبية المزمنة ولكنه يغطي المساعدة الطارئة إذا ساءت حالتك فجأة'
    },
    {
      question: 'ما هي المستندات التي أحتاجها للحصول على تأمين زيارة قطر؟',
      answer: 'ستحتاج إلى تقديم بيانات جواز سفرك ورقم هاتفك المحمول وعنوان بريد إلكتروني حيث يمكننا إرسال نسخة من وثيقة التأمين الصحي الخاصة بك'
    },
    {
      question: 'هل تغطيني وثيقة التأمين الصحي الإلزامي في دول مجلس التعاون والدول الأخرى؟',
      answer: 'لا. وثيقة التأمين الخاصة بك صالحة فقط في قطر.'
    },
    {
      question: 'ما هي المستندات المطلوبة في حالة العلاج الطارئ داخل قطر؟',
      answer: 'ستحتاج إلى جواز سفرك ونسخة من وثيقة التأمين.'
    }
  ];

  const handlePurchase = () => {
    sessionStorage.setItem('visitorsData', JSON.stringify({ startDate, duration }));
    navigate('/visitors/quote');
  };

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

  return (
    <div className="visitors-page">
      {/* Hero Section */}
      <section className="visitors-hero">
        <div className="visitors-hero__content">
          <h1>التأمين الصحي الإلزامي للزائرين</h1>
          <p>احصل على تأمينك رقمياً. خدمات فورية وبدون معاملات ورقية</p>
        </div>
        <div className="visitors-hero__image">
          <img src="/assets/images/visitors/coffee-pot.DIQVQCyl.png" alt="التأمين الصحي للزائرين" />
        </div>
      </section>

      <div className="visitors-content">
        {/* Slider Section */}
        <section className="visitors-slider">
          <div className="container">
            <div className="slider-item active">
              <h4>حماية في حالات الطوارئ</h4>
              <p>يحميك تأمين الزائر في حالات الطوارئ الطبية أثناء سفرك مما يتيح لك راحة وأمانا أكثر طوال رحلتك</p>
            </div>
            <img src="/assets/images/visitors/slider-medcine.CkiVnbPB.png" alt="التأمين الصحي" className="slider-image" />
          </div>
        </section>

        {/* Benefits Section */}
        <section className="visitors-benefits">
          <div className="container">
            <h2>يشمل تأمين الزائرين</h2>
            <div className="benefits-grid">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-card">
                  <div className="benefit-icon">{benefit.icon}</div>
                  <h4>{benefit.title}</h4>
                  <p>{benefit.description}</p>
                </div>
              ))}
            </div>
            <div className="downloads">
              <a href="/pdf/visitors/policy-wording.pdf" target="_blank" className="download-btn">
                📄 نص الوثيقة
              </a>
              <a href="/pdf/visitors/visitors-tob.pdf" target="_blank" className="download-btn">
                📄 قائمة المزايا
              </a>
            </div>
          </div>
        </section>

        {/* Why QIC Section */}
        <section className="visitors-why">
          <div className="container">
            <h2>لماذا قطر للتأمين؟</h2>
            <div className="why-grid">
              {whyQIC.map((item, index) => (
                <div key={index} className="why-card">
                  <img src={item.image} alt={item.title} />
                  <p>{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="visitors-testimonials">
          <div className="container">
            <h2>نفتخر بثقة أكثر من 200,000 عميل في قطر</h2>
            <p className="rating-text">معدل رضا العملاء هو 4.7 بحسب 3,500 تقييم على غوغل</p>
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div key={index} className={`testimonial-card ${testimonial.companyLogo ? 'testimonial-card--featured' : ''}`}>
                  {testimonial.companyLogo && (
                    <div className="testimonial-company">
                      <img src={testimonial.companyLogo} alt="Company" />
                    </div>
                  )}
                  {testimonial.rating && (
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  )}
                  <p className="testimonial-text">{testimonial.text}</p>
                  <div className="testimonial-author">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                    <div>
                      <p className="author-name">{testimonial.name}</p>
                      {testimonial.date && <span className="author-date">{testimonial.date}</span>}
                      {testimonial.role && <span className="author-role">{testimonial.role}</span>}
                      {testimonial.company && <span className="author-company">{testimonial.company}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="visitors-faq">
          <div className="container">
            <h2>الأسئلة المتكررة</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className={`faq-item ${activeFaq === index ? 'active' : ''}`}>
                  <button 
                    className="faq-question"
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-icon">{activeFaq === index ? '−' : '+'}</span>
                  </button>
                  {activeFaq === index && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Purchase Form */}
      <div className="visitors-purchase-form">
        <div className="purchase-form__content">
          <h4>اختر تواريخ التأمين للمتابعة</h4>
          <div className="form-inputs">
            <div className="form-group">
              <label>بداية من</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>مدة التأمين</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="1">شهر واحد</option>
                <option value="2">شهران</option>
                <option value="3">3 أشهر</option>
                <option value="6">6 أشهر</option>
                <option value="12">سنة</option>
              </select>
            </div>
          </div>
          <p className="duration-text">
            من <span>{formatStartDate()}</span> حتى <span>{calculateEndDate()}</span>
          </p>
          <button 
            className="purchase-btn"
            onClick={handlePurchase}
            disabled={!startDate}
          >
            شراء التأمين
          </button>
        </div>
      </div>
    </div>
  );
}

export default VisitorsInsurance;
