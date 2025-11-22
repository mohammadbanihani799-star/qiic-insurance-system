/**
 * BTS Steps Component
 * ==================
 * مكون عرض الخطوات بتصميم احترافي مع دعم RTL كامل
 * 
 * Features:
 * - ✅ دعم RTL/LTR كامل
 * - ✅ Responsive Design (Mobile, Tablet, Desktop)
 * - ✅ صور ديناميكية مع Lazy Loading
 * - ✅ أيقونات قابلة للتخصيص
 * - ✅ Animations سلسة
 * - ✅ Accessibility Support
 * 
 * @example
 * <BtsSteps rtl={true} steps={customSteps} />
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import "../styles/components/bts-steps.css";

/**
 * Store Icons Component
 * أيقونات المتاجر (App Store, Google Play)
 */
const StoreIcons = ({ onStoreClick }) => {
  return (
    <div className="bts-steps__item-stores">
      {/* App Store Icon */}
      <button
        className="ds-base-button--medium ds-base-button--icon-only"
        onClick={() => onStoreClick?.("appstore")}
        aria-label="تنزيل من App Store"
        title="App Store"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Google Play Icon */}
      <button
        className="ds-base-button--medium ds-base-button--icon-only"
        onClick={() => onStoreClick?.("googleplay")}
        aria-label="تنزيل من Google Play"
        title="Google Play"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3.60864 2.31403C3.50251 2.53077 3.44946 2.7852 3.44946 3.07742V20.9226C3.44946 21.2148 3.50251 21.4692 3.60864 21.686L13.2013 12.0933L3.60864 2.31403Z"
            fill="currentColor"
          />
          <path
            d="M16.4118 9.88274L13.908 12.3866L16.4118 14.8904L20.6742 12.5656C21.4419 12.1281 21.4419 11.6449 20.6742 11.2074L16.4118 9.88274Z"
            fill="currentColor"
          />
          <path
            d="M13.2013 12.6799L3.60864 22.2726C3.82538 22.3787 4.07981 22.4318 4.37203 22.4318C4.71664 22.4318 5.08813 22.3522 5.48651 22.193L15.705 16.5975L13.2013 12.6799Z"
            fill="currentColor"
          />
          <path
            d="M13.2013 11.5067L15.705 7.58911L5.48651 1.99358C5.08813 1.83444 4.71664 1.75488 4.37203 1.75488C4.07981 1.75488 3.82538 1.80793 3.60864 1.91406L13.2013 11.5067Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
};

StoreIcons.propTypes = {
  onStoreClick: PropTypes.func,
};

/**
 * BTS Steps Main Component
 */
const BtsSteps = ({ 
  rtl = false, 
  steps: customSteps,
  title = "خطواتنا",
  onStoreClick,
  className = ""
}) => {
  const [imageLoadState, setImageLoadState] = useState({});

  // Default steps data
  const defaultSteps = [
    {
      id: 1,
      title: "الخطوة الأولى",
      subtitle: "شرح مفصل للخطوة الأولى مع وصف مختصر يوضح الهدف والفائدة المتوقعة.",
      img: "/assets/images/step1.png",
      alt: "الخطوة الأولى - صورة توضيحية",
      type: "step1",
    },
    {
      id: 2,
      title: "الخطوة الثانية",
      subtitle: "شرح مفصل للخطوة الثانية مع وصف مختصر يوضح الهدف والفائدة المتوقعة.",
      img: "/assets/images/step2.png",
      alt: "الخطوة الثانية - صورة توضيحية",
      type: "step2",
    },
    {
      id: 3,
      title: "الخطوة الثالثة",
      subtitle: "شرح مفصل للخطوة الثالثة مع وصف مختصر يوضح الهدف والفائدة المتوقعة.",
      img: "/assets/images/step3.png",
      alt: "الخطوة الثالثة - صورة توضيحية",
      type: "step3",
    },
  ];

  const steps = customSteps || defaultSteps;

  // Handle image load
  const handleImageLoad = (stepId) => {
    setImageLoadState((prev) => ({
      ...prev,
      [stepId]: "loaded",
    }));
  };

  // Handle image error
  const handleImageError = (stepId) => {
    setImageLoadState((prev) => ({
      ...prev,
      [stepId]: "error",
    }));
  };

  return (
    <section 
      className={`bts-steps ${rtl ? "rtl" : ""} ${className}`}
      dir={rtl ? "rtl" : "ltr"}
    >
      {/* Title */}
      <h2 className="bts-steps__title">{title}</h2>

      {/* Steps List */}
      <div className="bts-steps__list">
        {steps.map((step) => (
          <article
            key={step.id}
            className={`bts-steps__item bts-steps__item--${step.type} ${
              imageLoadState[step.id] === "loading" ? "bts-steps__item--loading" : ""
            }`}
          >
            {/* Head */}
            <div className="bts-steps__item-head">
              <h3 className="bts-steps__item-title">{step.title}</h3>
              <p className="bts-steps__item-subtitle">{step.subtitle}</p>
            </div>

            {/* Picture */}
            <img
              className="bts-steps__item-picture"
              src={step.img}
              alt={step.alt || step.title}
              loading="lazy"
              onLoad={() => handleImageLoad(step.id)}
              onError={() => handleImageError(step.id)}
            />

            {/* Store Icons */}
            <StoreIcons onStoreClick={onStoreClick} />
          </article>
        ))}
      </div>
    </section>
  );
};

BtsSteps.propTypes = {
  /** Enable RTL mode for Arabic/Hebrew */
  rtl: PropTypes.bool,
  
  /** Custom steps data */
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      img: PropTypes.string.isRequired,
      alt: PropTypes.string,
      type: PropTypes.oneOf(["step1", "step2", "step3"]).isRequired,
    })
  ),
  
  /** Section title */
  title: PropTypes.string,
  
  /** Callback when store icon is clicked */
  onStoreClick: PropTypes.func,
  
  /** Additional CSS class */
  className: PropTypes.string,
};

export default BtsSteps;
