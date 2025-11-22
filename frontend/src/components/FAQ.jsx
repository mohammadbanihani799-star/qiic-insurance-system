/**
 * FAQ Component - مكون الأسئلة الشائعة
 * Collapsible FAQ section with smooth animations
 * 
 * @component
 * @example
 * import FAQ from '@components/FAQ';
 * <FAQ />
 */

import React, { useState } from 'react';
import styles from '../styles/modules/FAQ.module.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      question: "ما هي أنواع التأمين المتاحة؟",
      answer: "نوفر تأمين المركبات الشامل، تأمين ضد الغير، وتأمين إضافي يشمل الحوادث الشخصية والمساعدة على الطريق.",
      link: "https://qiic.com.qa/products/motor-insurance"
    },
    {
      question: "كيف يمكنني الحصول على عرض سعر؟",
      answer: "يمكنك الحصول على عرض سعر فوري من خلال إدخال بيانات مركبتك في نموذج الطلب، وستتلقى السعر خلال دقائق.",
      link: null
    },
    {
      question: "ما هي مدة معالجة المطالبات؟",
      answer: "نعالج معظم المطالبات خلال 24-48 ساعة من تقديمها مع جميع المستندات المطلوبة.",
      link: "https://qiic.com.qa/claims"
    },
    {
      question: "هل يمكنني تجديد وثيقتي عبر الإنترنت؟",
      answer: "نعم، يمكنك تجديد وثيقتك التأمينية بسهولة من خلال موقعنا الإلكتروني أو تطبيق الهاتف المحمول.",
      link: null
    },
    {
      question: "ما هي الورش المعتمدة لديكم؟",
      answer: "لدينا شبكة واسعة من أكثر من 150 ورشة معتمدة في جميع أنحاء قطر. يمكنك الاطلاع على القائمة الكاملة في موقعنا.",
      link: "https://qiic.com.qa/network/garages"
    },
    {
      question: "كيف أتواصل مع خدمة العملاء؟",
      answer: "يمكنك التواصل معنا عبر الهاتف 4496 9700، أو عبر الواتساب، أو من خلال البريد الإلكتروني، أو زيارة فروعنا. نحن متاحون 24/7.",
      link: "https://qiic.com.qa/contact-us"
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faq} aria-labelledby="faq-title">
      <h2 id="faq-title" className={styles.faqTitle}>
        الأسئلة الشائعة
      </h2>
      
      <div className={styles.faqWrapper} role="list">
        {faqData.map((item, index) => (
          <div 
            key={index} 
            className={styles.faqItem}
            role="listitem"
          >
            <button
              className={styles.faqItemTitle}
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
              type="button"
            >
              <div 
                className={`${styles.vertical} ${openIndex === index ? styles.minus : ''}`}
                aria-hidden="true"
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span>{item.question}</span>
            </button>
            
            {openIndex === index && (
              <div 
                id={`faq-answer-${index}`}
                className={`${styles.faqItemDescription} ${styles.enter}`}
                role="region"
              >
                {item.answer}
                {item.link && (
                  <>
                    {' '}
                    <a 
                      href={item.link} 
                      className={`${styles.faqLink} ${styles.faqLinkExternal}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      اقرأ المزيد
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
