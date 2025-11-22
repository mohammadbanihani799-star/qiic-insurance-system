/**
 * BTS Steps Demo Page
 * ==================
 * صفحة تجريبية لعرض مكون BtsSteps
 */

import React, { useState } from "react";
import BtsSteps from "../components/BtsSteps";
import "../styles/components/bts-steps.css";

const BtsStepsDemo = () => {
  const [rtl, setRtl] = useState(true);
  const [customTitle, setCustomTitle] = useState("خطواتنا");

  // مثال 1: خطوات التسجيل
  const onboardingSteps = [
    {
      id: "register",
      title: "إنشاء حساب جديد",
      subtitle: "سجل حسابك في خطوات بسيطة وآمنة. كل ما تحتاجه هو بريد إلكتروني ورقم هاتف.",
      img: "/assets/images/steps/register.jpg",
      alt: "خطوة التسجيل - إنشاء حساب",
      type: "step1",
    },
    {
      id: "verify",
      title: "تأكيد البيانات",
      subtitle: "تحقق من هويتك عبر رمز التأكيد المرسل إلى بريدك الإلكتروني أو هاتفك.",
      img: "/assets/images/steps/verify.jpg",
      alt: "خطوة التحقق - تأكيد الهوية",
      type: "step2",
    },
    {
      id: "start",
      title: "ابدأ الاستخدام",
      subtitle: "مبروك! حسابك جاهز الآن. استمتع بجميع الميزات والخدمات المتاحة.",
      img: "/assets/images/steps/start.jpg",
      alt: "خطوة البداية - استخدام الخدمة",
      type: "step3",
    },
  ];

  // مثال 2: خطوات التأمين
  const insuranceSteps = [
    {
      id: 1,
      title: "أدخل بيانات المركبة",
      subtitle: "أدخل رقم اللوحة ونوع المركبة للحصول على عرض سعر فوري.",
      img: "/assets/images/steps/vehicle.jpg",
      type: "step1",
    },
    {
      id: 2,
      title: "اختر باقة التأمين",
      subtitle: "قارن بين الباقات المتاحة واختر الأنسب لك من حيث التغطية والسعر.",
      img: "/assets/images/steps/insurance.jpg",
      type: "step2",
    },
    {
      id: 3,
      title: "أكمل الدفع",
      subtitle: "ادفع بأمان وستحصل على وثيقة التأمين فوراً عبر البريد الإلكتروني.",
      img: "/assets/images/steps/payment.jpg",
      type: "step3",
    },
  ];

  // مثال 3: خطوات مخصصة من المستخدم
  const [currentSteps, setCurrentSteps] = useState(onboardingSteps);

  const handleStoreClick = (store) => {
    const urls = {
      appstore: "https://apps.apple.com/qiic-app",
      googleplay: "https://play.google.com/store/apps/details?id=com.qiic",
    };

    if (urls[store]) {
      window.open(urls[store], "_blank");
    }
  };

  return (
    <div className="page-inbound">
      {/* Header */}
      <header className="page-inbound__header">
        <div className="containerMini">
          <h1 className="heading-2">BTS Steps Component - Demo</h1>
          <p className="paragraph-medium text-muted">
            تجربة مكون الخطوات بتصميمات وبيانات مختلفة
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-inbound__content" style={{ background: "#f7f7fc" }}>
        {/* Controls */}
        <div className="containerMini mb-8">
          <div className="flow-vertical bg-light" style={{ padding: "24px", borderRadius: "12px" }}>
            <h3 className="heading-6 mb-4">خيارات التحكم</h3>

            {/* RTL Toggle */}
            <div className="d-flex align-center mb-4">
              <label className="ds-base-toggle">
                <input
                  type="checkbox"
                  className="ds-base-toggle__input"
                  checked={rtl}
                  onChange={(e) => setRtl(e.target.checked)}
                />
                <span className="ds-base-toggle__switch"></span>
                <span className="ds-base-toggle__label">تفعيل RTL</span>
              </label>
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <label className="text-medium mb-2" style={{ display: "block" }}>
                عنوان القسم:
              </label>
              <input
                type="text"
                className="ds-base-input__field"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e5e3ff",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Steps Selection */}
            <div className="mb-4">
              <label className="text-medium mb-2" style={{ display: "block" }}>
                اختر مجموعة الخطوات:
              </label>
              <div className="flow-vertical" style={{ gap: "8px" }}>
                <label className="ds-base-radio-button">
                  <input
                    type="radio"
                    name="steps"
                    className="ds-base-radio-button__input"
                    checked={currentSteps === onboardingSteps}
                    onChange={() => setCurrentSteps(onboardingSteps)}
                  />
                  <span className="ds-base-radio-button__indicator"></span>
                  <span className="ds-base-radio-button__label">خطوات التسجيل</span>
                </label>

                <label className="ds-base-radio-button">
                  <input
                    type="radio"
                    name="steps"
                    className="ds-base-radio-button__input"
                    checked={currentSteps === insuranceSteps}
                    onChange={() => setCurrentSteps(insuranceSteps)}
                  />
                  <span className="ds-base-radio-button__indicator"></span>
                  <span className="ds-base-radio-button__label">خطوات التأمين</span>
                </label>
              </div>
            </div>

            {/* Info Alert */}
            <div className="ds-base-alert ds-base-alert--info">
              <div className="ds-base-alert__content">
                <div className="ds-base-alert__message">
                  💡 جرب تغيير الخيارات أعلاه لرؤية التأثير على المكون
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BtsSteps Component - Main Demo */}
        <BtsSteps
          rtl={rtl}
          steps={currentSteps}
          title={customTitle}
          onStoreClick={handleStoreClick}
        />

        {/* Code Example */}
        <div className="containerMini mt-8">
          <div className="flow-vertical bg-light" style={{ padding: "24px", borderRadius: "12px" }}>
            <h3 className="heading-6 mb-4">كود المثال</h3>
            <pre
              style={{
                background: "#2e2c3a",
                color: "#f5f5ff",
                padding: "20px",
                borderRadius: "8px",
                overflow: "auto",
                fontSize: "13px",
                lineHeight: "1.6",
              }}
            >
              {`<BtsSteps
  rtl={${rtl}}
  title="${customTitle}"
  steps={${currentSteps === onboardingSteps ? "onboardingSteps" : "insuranceSteps"}}
  onStoreClick={(store) => {
    console.log(\`Clicked: \${store}\`);
    window.open(urls[store], "_blank");
  }}
/>`}
            </pre>
          </div>
        </div>

        {/* Features List */}
        <div className="containerMini mt-8 mb-8">
          <div className="flow-vertical bg-light" style={{ padding: "24px", borderRadius: "12px" }}>
            <h3 className="heading-6 mb-5">✨ المميزات</h3>
            <div className="flow-grid">
              <div className="d-flex align-start" style={{ gap: "12px" }}>
                <span className="ds-base-badge ds-base-badge--success">✓</span>
                <div>
                  <h4 className="text-medium font-semibold mb-1">RTL Support</h4>
                  <p className="text-small text-muted">دعم كامل للغة العربية</p>
                </div>
              </div>

              <div className="d-flex align-start" style={{ gap: "12px" }}>
                <span className="ds-base-badge ds-base-badge--success">✓</span>
                <div>
                  <h4 className="text-medium font-semibold mb-1">Responsive</h4>
                  <p className="text-small text-muted">متجاوب مع جميع الأجهزة</p>
                </div>
              </div>

              <div className="d-flex align-start" style={{ gap: "12px" }}>
                <span className="ds-base-badge ds-base-badge--success">✓</span>
                <div>
                  <h4 className="text-medium font-semibold mb-1">Animations</h4>
                  <p className="text-small text-muted">انتقالات سلسة وجذابة</p>
                </div>
              </div>

              <div className="d-flex align-start" style={{ gap: "12px" }}>
                <span className="ds-base-badge ds-base-badge--success">✓</span>
                <div>
                  <h4 className="text-medium font-semibold mb-1">Lazy Loading</h4>
                  <p className="text-small text-muted">تحميل ذكي للصور</p>
                </div>
              </div>

              <div className="d-flex align-start" style={{ gap: "12px" }}>
                <span className="ds-base-badge ds-base-badge--success">✓</span>
                <div>
                  <h4 className="text-medium font-semibold mb-1">Accessible</h4>
                  <p className="text-small text-muted">دعم إمكانية الوصول</p>
                </div>
              </div>

              <div className="d-flex align-start" style={{ gap: "12px" }}>
                <span className="ds-base-badge ds-base-badge--success">✓</span>
                <div>
                  <h4 className="text-medium font-semibold mb-1">Customizable</h4>
                  <p className="text-small text-muted">قابل للتخصيص بالكامل</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="page-inbound__footer">
        <div className="containerMini">
          <div className="d-flex justify-between align-center">
            <p className="text-small text-muted">
              © 2025 QIIC Insurance System
            </p>
            <div className="d-flex" style={{ gap: "12px" }}>
              <span className="ds-base-badge ds-base-badge--neutral">v1.0.0</span>
              <span className="ds-base-badge ds-base-badge--primary">React</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BtsStepsDemo;
