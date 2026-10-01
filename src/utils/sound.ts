// Web Audio API soothing chime for live notifications
export function playGentleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Gentle singing bowl / bell harmonic
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, ctx.currentTime); // Solfeggio 528Hz (transformation & peace)
    osc.frequency.exponentialRampToValueAtTime(396, ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.3);
  } catch {
    // Ignore audio context errors in quiet mode / iframe restrictions
  }
}

/**
 * Tactile Haptic Vibration Feedback
 * Uses the Web Vibration API (navigator.vibrate) if supported on device.
 * Gracefully combines or falls back to an ultra-crisp, low-frequency
 * simulated acoustic tactile pulse (65Hz mechanical click) via Web Audio API
 * for desktop browsers, iOS Safari, or devices without physical vibration motors.
 */
export function triggerHapticFeedback(intensity: 'light' | 'medium' | 'selection' = 'selection') {
  // 1. Hardware Vibration API (Android Chrome, supported mobile browsers)
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (intensity === 'light') {
        navigator.vibrate(10);
      } else if (intensity === 'medium') {
        navigator.vibrate(24);
      } else {
        // Crisp dual-tap haptic pulse for unmistakable tactile response
        navigator.vibrate([14, 25, 8]);
      }
    } catch {
      // In sandboxed iframes or restricted environments, vibrate may be ignored
    }
  }

  // 2. Simulated tactile micro-click using Web Audio API
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Low-frequency tactile impulse that creates a physical "thump/click" feel
    const duration = intensity === 'medium' ? 0.045 : 0.028;
    const startFreq = intensity === 'medium' ? 100 : 85;
    const endFreq = 30;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

    // Subtle volume so it feels like a physical tap rather than a chime
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration + 0.005);
  } catch {
    // Ignore environments where AudioContext cannot be instantiated
  }
}

/**
 * Resonant Singing Bowl / Temple Bell Harmonic Chime
 */
export function playSingingBowlChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Fundamental note (D4 ~ 293.66Hz) and singing bowl harmonic (A4 ~ 440Hz & F#5)
    const fundamental = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const gainF = ctx.createGain();
    const gainH = ctx.createGain();

    fundamental.type = 'sine';
    fundamental.frequency.setValueAtTime(432, ctx.currentTime); // 432Hz meditative tuning
    fundamental.frequency.exponentialRampToValueAtTime(216, ctx.currentTime + 2.0);

    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(864, ctx.currentTime); // 1st octave overtone
    harmonic.frequency.exponentialRampToValueAtTime(432, ctx.currentTime + 1.6);

    gainF.gain.setValueAtTime(0.09, ctx.currentTime);
    gainF.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);

    gainH.gain.setValueAtTime(0.04, ctx.currentTime);
    gainH.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

    fundamental.connect(gainF);
    harmonic.connect(gainH);
    gainF.connect(ctx.destination);
    gainH.connect(ctx.destination);

    fundamental.start();
    harmonic.start();
    fundamental.stop(ctx.currentTime + 2.3);
    harmonic.stop(ctx.currentTime + 2.0);
  } catch {}
}

