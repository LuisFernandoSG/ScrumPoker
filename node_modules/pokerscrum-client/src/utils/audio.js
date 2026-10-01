/**
 * Generador de efectos de sonido utilizando la Web Audio API nativa
 * No requiere descargar archivos de audio externos.
 */

let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleSound() {
  soundEnabled = !soundEnabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('pokerscrum_sound', soundEnabled ? '1' : '0');
  }
  return soundEnabled;
}

export function isSoundEnabled() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pokerscrum_sound');
    if (saved !== null) {
      soundEnabled = saved === '1';
    }
  }
  return soundEnabled;
}

/**
 * Sonido sutil al seleccionar una carta
 */
export function playCardSelectSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

/**
 * Sonido al revelar los votos
 */
export function playRevealSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.06);

    gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.06 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + index * 0.06);
    osc.stop(ctx.currentTime + index * 0.06 + 0.25);
  });
}

/**
 * Sonido para nueva votación
 */
export function playResetSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}
