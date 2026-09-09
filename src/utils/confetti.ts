import confetti from 'canvas-confetti';

/**
 * Trigger an uplifting, multi-stage confetti celebration effect
 * to reinforce positive morning energy when the wheel lands.
 */
export function triggerMorningConfetti() {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.65 },
      zIndex: 99999,
      disableForReducedMotion: false,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Multi-tier burst
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
    });

    fire(0.2, {
      spread: 60,
      colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#ffffff'],
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.9,
      colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#ec4899', '#f43f5e', '#a855f7'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#fbbf24', '#f59e0b', '#10b981'],
    });

    // Side cannons after brief delay
    setTimeout(() => {
      // Left cannon
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0.05, y: 0.7 },
        zIndex: 99999,
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
      });
      // Right cannon
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 0.95, y: 0.7 },
        zIndex: 99999,
        colors: ['#ec4899', '#8b5cf6', '#3b82f6'],
      });
    }, 250);

  } catch (err) {
    console.warn('Confetti animation error:', err);
  }
}
