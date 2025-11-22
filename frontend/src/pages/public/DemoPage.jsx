/**
 * Demo Page - صفحة تجريبية للمكونات الجديدة
 * Demonstrates all CSS Modules components
 */

import React, { useState } from 'react';
import FAQ from '../../components/FAQ';
import Benefits from '../../components/Benefits';
import Button from '../../components/Button';
import Loader from '../../components/Loader';

// Import global CSS variables
import '../../styles/modules/variables.module.css';
import '../../styles/modules/animations.module.css';

const DemoPage = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary, #f5f5f9)' }}>
      {/* Header */}
      <header style={{ 
        padding: '40px 24px', 
        textAlign: 'center',
        backgroundColor: 'var(--color-bg-primary, #ffffff)',
        marginBottom: '48px'
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '700',
          color: 'var(--color-primary, #5927ff)',
          marginBottom: '16px'
        }}>
          🎨 CSS Modules Demo
        </h1>
        <p style={{ 
          fontSize: '18px',
          color: 'var(--color-text-secondary, #57575e)'
        }}>
          عرض توضيحي للمكونات الجديدة
        </p>
      </header>

      {/* Buttons Section */}
      <section style={{ 
        padding: '40px 24px',
        maxWidth: '1200px',
        margin: '0 auto 48px'
      }}>
        <h2 style={{ 
          fontSize: '32px', 
          fontWeight: '700',
          marginBottom: '24px',
          textAlign: 'center',
          color: 'var(--color-text-primary, #2e2c3a)'
        }}>
          الأزرار
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <Button variant="primary">زر أساسي</Button>
          <Button variant="secondary">زر ثانوي</Button>
          <Button variant="tertiary">زر ثلاثي</Button>
          <Button variant="success">زر نجاح</Button>
          <Button variant="error">زر خطأ</Button>
          <Button variant="warning">زر تحذير</Button>
          <Button variant="ghost">زر شفاف</Button>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <Button variant="primary" size="small">صغير</Button>
          <Button variant="primary">عادي</Button>
          <Button variant="primary" size="large">كبير</Button>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Button variant="primary" loading={loading} onClick={handleClick}>
            {loading ? 'جاري التحميل...' : 'اضغط للتحميل'}
          </Button>
          <Button variant="secondary" disabled>معطل</Button>
          <Button variant="gradient" pulse>عرض خاص</Button>
        </div>

        <div style={{ 
          marginTop: '32px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '16px' }}>لودر مستقل:</h3>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'center' }}>
            <Loader size="small" />
            <Loader />
            <Loader size="large" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <Benefits />

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <footer style={{ 
        padding: '40px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg-primary, #ffffff)',
        marginTop: '48px'
      }}>
        <p style={{ 
          color: 'var(--color-text-secondary, #57575e)',
          fontSize: '14px'
        }}>
          © 2024 قطر للتأمين - جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
};

export default DemoPage;
