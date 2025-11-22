# 🚀 CSS Modules Implementation Guide - دليل تطبيق CSS Modules

## 📁 File Structure - هيكل الملفات

```
c:/developer/QIIC/
├── modules/
│   ├── variables.module.css      ✅ Created - المتغيرات العامة
│   ├── animations.module.css     ✅ Created - الرسوم المتحركة
│   ├── FAQ.module.css            ✅ Created - الأسئلة الشائعة
│   ├── Benefits.module.css       ✅ Created - المزايا
│   ├── Offers.module.css         ✅ Created - العروض
│   ├── Feedback.module.css       ✅ Created - التقييمات
│   ├── Buttons.module.css        ✅ Created - الأزرار
│   └── UIUtils.module.css        ✅ Created - أدوات الواجهة
```

---

## ⚙️ Step 1: Configure Vite for CSS Modules

### Edit `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './modules'),
    },
  },
  
  css: {
    modules: {
      // Generate scoped class names
      generateScopedName: '[name]__[local]__[hash:base64:5]',
      
      // Enable CSS Modules
      localsConvention: 'camelCase', // Convert class-names to camelCase
    },
  },
})
```

---

## 📦 Step 2: Move Modules to Frontend Folder

```bash
# Windows CMD
move c:\developer\QIIC\modules c:\developer\QIIC\frontend\modules
```

---

## 🎯 Step 3: Component Implementation Examples

### 🔹 1. FAQ Component Example

**File:** `frontend/src/components/FAQ.jsx`

```jsx
import React, { useState } from 'react';
import styles from '../../modules/FAQ.module.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      question: "ما هي التغطية التأمينية المتاحة؟",
      answer: "نوفر تغطيات شاملة تشمل التأمين ضد الغير، الشامل، والإضافات الاختيارية.",
      link: "https://qiic.com.qa/coverages"
    },
    {
      question: "كيف أحصل على عرض سعر؟",
      answer: "يمكنك الحصول على عرض سعر فوري من خلال نموذج الطلب في الموقع.",
      link: null
    },
    // Add more FAQs...
  ];

  return (
    <section className={styles.faq}>
      <h2 className={styles.faq__title}>الأسئلة الشائعة</h2>
      
      <div className={styles.faq__wrapper}>
        {faqData.map((item, index) => (
          <div 
            key={index} 
            className={styles.faq__item}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <div className={styles.faq__item__title}>
              <div className={`${styles.vertical} ${openIndex === index ? styles.minus : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span>{item.question}</span>
            </div>
            
            {openIndex === index && (
              <div className={`${styles.faq__item__description} ${styles.enter}`}>
                {item.answer}
                {item.link && (
                  <a 
                    href={item.link} 
                    className={`${styles.faq__link} ${styles.faq__link__external}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    اقرأ المزيد
                  </a>
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
```

---

### 🔹 2. Benefits Component Example

**File:** `frontend/src/components/Benefits.jsx`

```jsx
import React from 'react';
import styles from '../../modules/Benefits.module.css';

const Benefits = () => {
  const benefits = [
    {
      title: "تغطية شاملة",
      description: "حماية كاملة لمركبتك ضد جميع المخاطر",
      variant: "primary",
      image: "/assets/images/benefit-1.svg"
    },
    {
      title: "دعم فني 24/7",
      description: "فريق خدمة العملاء متاح على مدار الساعة",
      variant: "secondary",
      image: "/assets/images/benefit-2.svg"
    },
    {
      title: "تسوية سريعة",
      description: "معالجة المطالبات في أقل من 48 ساعة",
      variant: "tertiary",
      image: "/assets/images/benefit-3.svg"
    },
    {
      title: "شبكة واسعة",
      description: "أكثر من 150 ورشة معتمدة في قطر",
      variant: null,
      image: "/assets/images/benefit-4.svg"
    },
  ];

  return (
    <section className={styles.benefit__container}>
      <h2 className={styles['title--start']}>
        لماذا تختار قطر للتأمين؟
      </h2>
      
      <div className={styles.benefit__grid}>
        {benefits.map((benefit, index) => (
          <div 
            key={index}
            className={`
              ${styles.benefit__item} 
              ${styles['benefit__item--hoverable']}
              ${benefit.variant ? styles[`benefit__item--${benefit.variant}`] : ''}
            `}
          >
            {benefit.image && (
              <img 
                src={benefit.image} 
                alt="" 
                className={styles.benefit__image}
                aria-hidden="true"
              />
            )}
            
            <h3 className={styles.benefit__title}>{benefit.title}</h3>
            <p className={styles.benefit__description}>{benefit.description}</p>
          </div>
        ))}
      </div>
      
      <div className={styles.benefit__scroll_indicator} />
    </section>
  );
};

export default Benefits;
```

---

### 🔹 3. Buttons Component Example

**File:** `frontend/src/components/Button.jsx`

```jsx
import React from 'react';
import styles from '../../modules/Buttons.module.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  loading = false,
  disabled = false,
  onClick,
  icon,
  fullWidth = false,
  ...props 
}) => {
  const classNames = [
    styles.btn,
    styles[`btn--${variant}`],
    size !== 'default' && styles[`btn--${size}`],
    loading && styles['btn--loading'],
    fullWidth && styles['btn--full'],
    icon && !children && styles['btn--icon-only'],
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className={styles.btn__loader} />}
      
      {icon && <span className={styles.btn__icon}>{icon}</span>}
      
      <span className={styles.btn__text}>{children}</span>
    </button>
  );
};

export default Button;

// Usage Examples:
// <Button variant="primary">احصل على عرض</Button>
// <Button variant="secondary" size="large">تواصل معنا</Button>
// <Button variant="success" loading>جاري الإرسال...</Button>
// <Button variant="ghost" icon={<PhoneIcon />}>اتصل بنا</Button>
```

---

### 🔹 4. Feedback Component Example

**File:** `frontend/src/components/Feedback.jsx`

```jsx
import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from '../../modules/Feedback.module.css';

const Feedback = () => {
  const swiperRef = useRef(null);

  const feedbacks = [
    {
      name: "أحمد محمد",
      role: "عميل منذ 2020",
      rating: 5,
      text: "خدمة ممتازة وسرعة في معالجة المطالبات. أنصح بشدة!",
      avatar: "/assets/images/avatar-1.jpg",
      date: "2024-01-15",
      verified: true
    },
    // Add more feedbacks...
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg 
        key={index}
        className={`${styles.star} ${index >= rating ? styles['star--empty'] : ''}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
      </svg>
    ));
  };

  return (
    <section className={styles.feedback__section}>
      <h2 className={styles.feedback__title}>آراء عملائنا</h2>
      
      <div className={styles.swiper__container}>
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next',
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination',
          }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1088: { slidesPerView: 3 },
          }}
        >
          {feedbacks.map((feedback, index) => (
            <SwiperSlide key={index}>
              <div className={styles.feedback__card}>
                <div className={styles.user__info}>
                  <img 
                    src={feedback.avatar} 
                    alt={feedback.name}
                    className={styles.user__avatar}
                  />
                  <div className={styles.user__details}>
                    <div className={styles.user__name}>
                      {feedback.name}
                      {feedback.verified && (
                        <span className={styles.verified__badge}>
                          <svg className={styles.verified__icon}>
                            <path d="M9 12l-2-2-1.5 1.5L9 15l7-7-1.5-1.5z"/>
                          </svg>
                          موثق
                        </span>
                      )}
                    </div>
                    <div className={styles.user__role}>{feedback.role}</div>
                  </div>
                </div>
                
                <div className={styles.rating__stars}>
                  {renderStars(feedback.rating)}
                </div>
                
                <p className={styles.feedback__text}>{feedback.text}</p>
                
                <span className={styles.feedback__date}>
                  {new Date(feedback.date).toLocaleDateString('ar-QA')}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        <button className={`${styles.swiper__button} ${styles['swiper__button--prev']} swiper-button-prev`}>
          ←
        </button>
        <button className={`${styles.swiper__button} ${styles['swiper__button--next']} swiper-button-next`}>
          →
        </button>
        
        <div className={`${styles.swiper__pagination} swiper-pagination`} />
      </div>
    </section>
  );
};

export default Feedback;
```

---

## 🎨 Step 4: Import Global Variables in Main App

**File:** `frontend/src/App.jsx` or `frontend/src/main.jsx`

```jsx
import React from 'react';
// Import global variables (apply to :root)
import '../modules/variables.module.css';
import '../modules/animations.module.css';

function App() {
  return (
    <div className="app">
      {/* Your components */}
    </div>
  );
}

export default App;
```

---

## 📋 Step 5: Implementation Checklist

### ✅ Before Implementation:

- [ ] Backup existing CSS files
- [ ] Move `modules/` folder to `frontend/modules/`
- [ ] Update `vite.config.js` with CSS Modules configuration
- [ ] Install Swiper if using Feedback component: `npm install swiper`

### ✅ During Implementation:

- [ ] Import CSS modules in each component file
- [ ] Replace `className="class-name"` with `className={styles.className}`
- [ ] Convert hyphenated classes to camelCase: `btn-primary` → `btnPrimary`
- [ ] Test each component individually
- [ ] Verify RTL support for Arabic content

### ✅ After Implementation:

- [ ] Test all responsive breakpoints (1439px, 1087px, 767px, 480px, 389px)
- [ ] Verify dark mode support
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Run production build: `npm run build`
- [ ] Check bundle size and optimize if needed

---

## 🔧 Step 6: Advanced Usage Patterns

### Combining Multiple Classes:

```jsx
// Method 1: Template literals
<div className={`${styles.btn} ${styles['btn--primary']} ${styles['btn--large']}`}>

// Method 2: Array join
<div className={[styles.btn, styles.btnPrimary, styles.btnLarge].join(' ')}>

// Method 3: Using classnames library
import classNames from 'classnames';
<div className={classNames(styles.btn, styles.btnPrimary, styles.btnLarge)}>
```

### Conditional Classes:

```jsx
<div className={`
  ${styles.benefit__item}
  ${isActive ? styles['benefit__item--active'] : ''}
  ${variant ? styles[`benefit__item--${variant}`] : ''}
`}>
```

---

## 📊 Step 7: Performance Optimization

### CSS Purging for Production:

Install PurgeCSS:
```bash
npm install -D @fullhuman/postcss-purgecss
```

Update `postcss.config.js`:
```javascript
import purgecss from '@fullhuman/postcss-purgecss';

export default {
  plugins: [
    purgecss({
      content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
      safelist: [/^swiper-/], // Preserve Swiper classes
    }),
  ],
};
```

---

## 🌐 Step 8: RTL Support Verification

### Test RTL Layout:

Add to `index.html`:
```html
<html dir="rtl" lang="ar">
```

Verify:
- Text alignment (right to left)
- Margin/padding reversals
- Icon rotations in FAQ
- Swiper navigation button positions

---

## 📞 Next Steps

1. **Choose Component Priority**: Start with FAQ → Benefits → Buttons → Feedback → Offers → UIUtils
2. **Create Components One by One**: Don't implement all at once
3. **Test Each Component**: Verify functionality before moving to next
4. **Integrate into Existing Pages**: Replace old CSS with new modules gradually
5. **Monitor Bundle Size**: Use `npm run build` and check `dist/assets/` folder

---

## 🎯 Quick Start Command

```bash
# Navigate to frontend
cd c:\developer\QIIC\frontend

# Install dependencies (if not already)
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## ✨ Benefits of This Implementation

✅ **Scoped Styles**: No class name conflicts  
✅ **Tree Shaking**: Only used CSS is bundled  
✅ **Type Safety**: Can use TypeScript for class names  
✅ **Maintainability**: Clear component-to-style mapping  
✅ **Performance**: Optimized bundle size  
✅ **RTL Support**: Full Arabic language support  
✅ **Accessibility**: ARIA-compliant and keyboard-friendly  
✅ **Responsive**: Mobile-first design  
✅ **Dark Mode**: Automatic dark mode support  

---

**🚀 Ready to implement! Start with FAQ component and expand from there.**
