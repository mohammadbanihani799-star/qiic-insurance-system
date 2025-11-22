/**
 * Benefits Component - مكون المزايا
 * Responsive benefits grid with horizontal scroll
 * 
 * @component
 * @example
 * import Benefits from '@components/Benefits';
 * <Benefits />
 */

import React from 'react';
import styles from '../styles/modules/Benefits.module.css';

const Benefits = () => {
  const benefits = [
    {
      title: "تغطية شاملة",
      description: "حماية كاملة لمركبتك ضد جميع المخاطر والأضرار المحتملة على مدار العام",
      variant: "primary",
      image: "/assets/images/benefit-coverage.svg"
    },
    {
      title: "دعم فني 24/7",
      description: "فريق خدمة العملاء متاح على مدار الساعة لمساعدتك في أي وقت",
      variant: "secondary",
      image: "/assets/images/benefit-support.svg"
    },
    {
      title: "تسوية سريعة",
      description: "معالجة المطالبات في أقل من 48 ساعة مع الحد الأدنى من الإجراءات",
      variant: "tertiary",
      image: "/assets/images/benefit-fast.svg"
    },
    {
      title: "شبكة واسعة",
      description: "أكثر من 150 ورشة معتمدة في جميع أنحاء قطر لخدمتك",
      variant: null,
      image: "/assets/images/benefit-network.svg"
    },
  ];

  return (
    <section className={styles.benefitContainer}>
      <h2 className={styles.titleStart}>
        لماذا تختار قطر للتأمين؟
      </h2>
      
      <div className={styles.benefitGrid}>
        {benefits.map((benefit, index) => (
          <div 
            key={index}
            className={`
              ${styles.benefitItem} 
              ${styles.benefitItemHoverable}
              ${benefit.variant ? styles[`benefitItem${benefit.variant.charAt(0).toUpperCase() + benefit.variant.slice(1)}`] : ''}
            `.trim()}
          >
            {benefit.image && (
              <img 
                src={benefit.image} 
                alt="" 
                className={styles.benefitImage}
                aria-hidden="true"
                loading="lazy"
              />
            )}
            
            <h3 className={styles.benefitTitle}>{benefit.title}</h3>
            <p className={styles.benefitDescription}>{benefit.description}</p>
          </div>
        ))}
      </div>
      
      <div className={styles.benefitScrollIndicator} aria-hidden="true" />
    </section>
  );
};

export default Benefits;
