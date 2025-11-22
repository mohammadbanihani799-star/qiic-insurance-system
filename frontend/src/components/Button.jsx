/**
 * Button Component - مكون الزر
 * Reusable button with multiple variants and states
 * 
 * @component
 * @example
 * <Button variant="primary" size="large">احصل على عرض</Button>
 * <Button variant="secondary" loading>جاري التحميل...</Button>
 * <Button variant="success" icon={<CheckIcon />}>تأكيد</Button>
 */

import React from 'react';
import styles from '../styles/modules/Buttons.module.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  loading = false,
  disabled = false,
  onClick,
  icon,
  fullWidth = false,
  pulse = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  // Build class names dynamically
  const classNames = [
    styles.btn,
    styles[`btn${variant.charAt(0).toUpperCase()}${variant.slice(1)}`],
    size !== 'default' && styles[`btn${size.charAt(0).toUpperCase()}${size.slice(1)}`],
    loading && styles.btnLoading,
    fullWidth && styles.btnFull,
    pulse && styles.btnPulse,
    icon && !children && styles.btnIconOnly,
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span 
          className={styles.btnLoader} 
          role="status" 
          aria-label="جاري التحميل"
        />
      )}
      
      {icon && <span className={styles.btnIcon}>{icon}</span>}
      
      {children && <span className={styles.btnText}>{children}</span>}
    </button>
  );
};

export default Button;

/**
 * Usage Examples:
 * 
 * // Primary button
 * <Button variant="primary">احصل على عرض</Button>
 * 
 * // Secondary large button
 * <Button variant="secondary" size="large">تواصل معنا</Button>
 * 
 * // Loading state
 * <Button variant="success" loading>جاري الإرسال...</Button>
 * 
 * // Button with icon
 * <Button variant="ghost" icon={<PhoneIcon />}>اتصل بنا</Button>
 * 
 * // Full width button
 * <Button variant="primary" fullWidth>متابعة</Button>
 * 
 * // Disabled button
 * <Button variant="tertiary" disabled>غير متاح</Button>
 * 
 * // Gradient button with pulse
 * <Button variant="gradient" pulse>عرض خاص</Button>
 */
