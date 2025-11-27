/**
 * Sound utility for providing audio feedback
 * Creates satisfying, celebratory completion sounds
 */

let audioContext: AudioContext | null = null;
let audioInitialized = false;

function getAudioContext(): AudioContext | null {
  // Browser requires user interaction before creating AudioContext
  if (typeof window === 'undefined') return null;
  
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended (required after user interaction)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {
        // Silently fail if resume fails
      });
    }
    
    return audioContext;
  } catch (error) {
    return null;
  }
}

// Initialize audio context on first user interaction
if (typeof window !== 'undefined') {
  const initAudio = () => {
    if (!audioInitialized) {
      const ctx = getAudioContext();
      if (ctx) {
        // Ensure context is running
        ctx.resume().catch(() => {
          // Silently fail
        });
        audioInitialized = true;
      }
    }
  };
  
  // Listen for any user interaction to initialize audio
  document.addEventListener('click', initAudio, { once: true, passive: true });
  document.addEventListener('touchstart', initAudio, { once: true, passive: true });
  document.addEventListener('keydown', initAudio, { once: true, passive: true });
}

/**
 * Plays a satisfying, celebratory completion sound
 * Features a rising arpeggio with a pleasant chord resolution
 */
export function playCompletionSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return; // Audio not available
    
    const now = ctx.currentTime;
    
    // Create a master gain node for overall volume control
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.4, now); // Overall volume
    
    // Rising arpeggio notes (major scale ascending)
    // C4, E4, G4, C5 - creates a pleasant major chord arpeggio
    const notes = [
      { freq: 261.63, time: 0.00 },   // C4
      { freq: 329.63, time: 0.05 },   // E4
      { freq: 392.00, time: 0.10 },   // G4
      { freq: 523.25, time: 0.15 },   // C5
    ];
    
    // Play the rising arpeggio
    notes.forEach((note, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.frequency.setValueAtTime(note.freq, now + note.time);
      osc.type = 'sine';
      
      // Each note gets slightly louder and has a nice envelope
      const noteGain = 0.15 + (index * 0.05); // Increasing volume
      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(noteGain, now + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + 0.15);
      
      osc.start(now + note.time);
      osc.stop(now + note.time + 0.15);
    });
    
    // Add a satisfying "ding" at the end (higher note with longer sustain)
    const finalOsc = ctx.createOscillator();
    const finalGain = ctx.createGain();
    
    finalOsc.connect(finalGain);
    finalGain.connect(masterGain);
    
    // Higher octave for the final note
    finalOsc.frequency.setValueAtTime(659.25, now + 0.20); // E5
    finalOsc.type = 'sine';
    
    finalGain.gain.setValueAtTime(0, now + 0.20);
    finalGain.gain.linearRampToValueAtTime(0.25, now + 0.22);
    finalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);
    
    finalOsc.start(now + 0.20);
    finalOsc.stop(now + 0.40);
    
    // Add a subtle harmonic layer for richness (octave above)
    const harmonicOsc = ctx.createOscillator();
    const harmonicGain = ctx.createGain();
    
    harmonicOsc.connect(harmonicGain);
    harmonicGain.connect(masterGain);
    
    harmonicOsc.frequency.setValueAtTime(1318.51, now + 0.20); // E6 (octave above)
    harmonicOsc.type = 'sine';
    
    harmonicGain.gain.setValueAtTime(0, now + 0.20);
    harmonicGain.gain.linearRampToValueAtTime(0.1, now + 0.22);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    harmonicOsc.start(now + 0.20);
    harmonicOsc.stop(now + 0.35);
    
  } catch (error) {
    // Silently fail if audio context is not available
    console.debug('Could not play completion sound:', error);
  }
}

/**
 * Plays a subtle "uncomplete" sound when unchecking
 */
export function playUncompleteSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return; // Audio not available
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Descending note for "undoing"
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  } catch (error) {
    console.debug('Could not play uncomplete sound:', error);
  }
}
