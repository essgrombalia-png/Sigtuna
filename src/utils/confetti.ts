import confetti from 'canvas-confetti';

// Heart shapes for celebration
let heartVectorShape: confetti.Shape | undefined;
let heartEmojiShape: confetti.Shape | undefined;

try {
  if (typeof confetti.shapeFromPath === 'function') {
    heartVectorShape = confetti.shapeFromPath({
      path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 76,-75 38,0 57,18 75,56z',
    });
  }
} catch (e) {
  console.warn('Could not initialize heart shapeFromPath:', e);
}

try {
  if (typeof confetti.shapeFromText === 'function') {
    heartEmojiShape = confetti.shapeFromText({ text: '❤️', scalar: 1.1 });
  }
} catch (e) {
  console.warn('Could not initialize heart shapeFromText:', e);
}

const activeHeartShapes: confetti.Shape[] = [
  ...(heartVectorShape ? [heartVectorShape] : []),
  ...(heartEmojiShape ? [heartEmojiShape] : []),
];

// Fallback to circle/square if shapes are empty
const finalShapes = activeHeartShapes.length > 0 ? activeHeartShapes : undefined;

// Warm, joyful heart color palette: coral-red, rosy pinks, gold, and white
const HEART_COLORS = [
  '#f04456', // Reference coral red
  '#ff477e', // Rose neon
  '#ff5c8a', // Candy pink
  '#ff7096', // Blossom pink
  '#ff85a1', // Light pink
  '#e11d48', // Ruby red
  '#ffd744', // Sigtuna warm gold
  '#ffffff', // Crisp white highlight
];

/**
 * Trigger an uplifting, multi-stage heart celebration effect
 * with small fluttering hearts when the wheel lands or user clicks "Fira".
 */
export function triggerHeartConfetti() {
  try {
    const defaults: confetti.Options = {
      origin: { y: 0.65 },
      zIndex: 99999,
      disableForReducedMotion: false,
      colors: HEART_COLORS,
      ...(finalShapes ? { shapes: finalShapes } : {}),
    };

    // Stage 1: Central upward burst of small hearts
    confetti({
      ...defaults,
      particleCount: 50,
      spread: 60,
      startVelocity: 45,
      scalar: 1.0,
      drift: 0,
      ticks: 200,
    });

    // Stage 2: Wider spray of tiny fluttering hearts
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 45,
        spread: 100,
        startVelocity: 35,
        scalar: 0.85,
        decay: 0.92,
        ticks: 250,
      });
    }, 120);

    // Stage 3: Gentle float of larger love hearts
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 30,
        spread: 80,
        startVelocity: 25,
        scalar: 1.25,
        decay: 0.93,
        ticks: 280,
      });
    }, 220);

    // Stage 4: Side cannons shooting hearts towards the center
    setTimeout(() => {
      // Left cannon
      confetti({
        ...defaults,
        particleCount: 35,
        angle: 60,
        spread: 65,
        origin: { x: 0.08, y: 0.68 },
        scalar: 0.95,
        startVelocity: 42,
      });

      // Right cannon
      confetti({
        ...defaults,
        particleCount: 35,
        angle: 120,
        spread: 65,
        origin: { x: 0.92, y: 0.68 },
        scalar: 0.95,
        startVelocity: 42,
      });
    }, 320);

  } catch (err) {
    console.warn('Heart confetti animation error:', err);
  }
}

// Keep alias for existing callers
export const triggerMorningConfetti = triggerHeartConfetti;

