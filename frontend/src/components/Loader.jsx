/**
 * Loader Component - مكون التحميل
 * Standalone loading spinner
 * 
 * @component
 * @example
 * <Loader />
 * <Loader size="large" light />
 */

import React from 'react';
import styles from '../styles/modules/Buttons.module.css';

const Loader = ({ 
  size = 'default',
  light = false,
  className = '' 
}) => {
  const classNames = [
    styles.loader,
    size === 'small' && styles.loaderSmall,
    size === 'large' && styles.loaderLarge,
    light && styles.loaderLight,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classNames}
      role="status"
      aria-label="جاري التحميل"
    >
      <span className="sr-only">جاري التحميل...</span>
    </div>
  );
};

export default Loader;
