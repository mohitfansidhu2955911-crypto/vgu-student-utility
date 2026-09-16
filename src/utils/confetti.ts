import confetti from 'canvas-confetti';

export const triggerCelebration = () => {
  // Dual cannon burst
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#0f2b5c', '#f59e0b', '#3b82f6', '#10b981']
  });
  fire(0.2, {
    spread: 60,
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#ffd700', '#f59e0b', '#2563eb']
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

export const triggerGentleBurst = () => {
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#3b82f6', '#f59e0b'],
    zIndex: 9999
  });
};
