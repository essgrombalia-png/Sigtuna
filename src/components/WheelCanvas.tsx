import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { WheelItem } from '../types';
import { Play } from 'lucide-react';

interface WheelCanvasProps {
  items: WheelItem[];
  onSpinEnd: (selectedItem: WheelItem) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  soundEnabled: boolean;
  onPlayTickSound: () => void;
}

export const WheelCanvas: React.FC<WheelCanvasProps> = ({
  items,
  onSpinEnd,
  isSpinning,
  setIsSpinning,
  soundEnabled,
  onPlayTickSound,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentRotationRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastSegmentIndexRef = useRef<number>(-1);

  const [size, setSize] = useState<number>(340);

  // Responsive canvas sizing tailored for mobile, iPad, and desktop resolutions
  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // Determine maximum sensible width per device category
      let widthCeiling = 380;
      if (vw < 360) {
        widthCeiling = 260;
      } else if (vw < 420) {
        widthCeiling = 290;
      } else if (vw < 640) {
        widthCeiling = 320;
      } else if (vw < 1024) {
        // iPad portrait & landscape / tablet
        widthCeiling = 370;
      } else {
        // Desktop / large monitor
        widthCeiling = 410;
      }

      // Available vertical space check (accounts for header, stats hub, result card, and button)
      let heightCeiling = 410;
      if (vh < 640) {
        heightCeiling = 250;
      } else if (vh < 740) {
        heightCeiling = 280;
      } else if (vh < 860) {
        heightCeiling = 340;
      } else {
        heightCeiling = 410;
      }

      const optimal = Math.max(250, Math.min(widthCeiling, heightCeiling));
      setSize(optimal);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw the high resolution canvas wheel
  const drawWheel = useCallback(
    (rotationAngle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const displaySize = size;
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      ctx.scale(dpr, dpr);

      const centerX = displaySize / 2;
      const centerY = displaySize / 2;
      const radius = displaySize / 2 - 14;
      const numItems = items.length;
      if (numItems === 0) return;

      const sliceAngle = (2 * Math.PI) / numItems;

      ctx.clearRect(0, 0, displaySize, displaySize);

      // Outer Glow & Shadow Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 7, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f172a12';
      ctx.fill();
      ctx.restore();

      // Dynamic font size and length limit based on wheel diameter and item count
      const baseFontSize = Math.max(9, Math.min(13, Math.round(size / 28)));
      const actualFontSize = numItems > 10 ? Math.max(8.5, baseFontSize - 1.5) : baseFontSize;
      const maxLabelLength = size < 300 ? 18 : (size < 360 ? 22 : 26);

      // Draw Segments
      items.forEach((item, index) => {
        const startAngle = rotationAngle + index * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        // Fill segment color
        ctx.fillStyle = item.color;
        ctx.fill();

        // Subtle slice border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Draw Text along radial slice
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);

        ctx.textAlign = 'right';
        ctx.fillStyle = item.textColor || '#ffffff';
        ctx.font = `800 ${actualFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;

        // Segment label: use wheelLabel if available, otherwise text
        let label = item.wheelLabel || item.text;
        if (label.length > maxLabelLength) {
          label = label.substring(0, maxLabelLength - 2) + '…';
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4;
        ctx.fillText(label, radius - (size < 300 ? 18 : 24), actualFontSize * 0.35);

        ctx.restore();
      });

      // Outer Frame Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(5, Math.min(8, Math.round(size * 0.02)));
      ctx.stroke();
      ctx.restore();

      // Outer Dark Accent Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 3, 0, 2 * Math.PI);
      ctx.strokeStyle = '#0f172a18';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Scaled Center Knob / Hub
      const outerKnobRadius = Math.max(26, Math.min(40, Math.round(size * 0.105)));
      const innerKnobRadius = outerKnobRadius - 6;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerKnobRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, innerKnobRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Center text
      ctx.fillStyle = '#ffffff';
      const knobFontSize = Math.max(8, Math.min(11, Math.round(outerKnobRadius * 0.28)));
      ctx.font = `900 ${knobFontSize}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SNURRA', centerX, centerY);

      ctx.restore();
    },
    [items, size]
  );

  // Redraw when size or items change
  useEffect(() => {
    drawWheel(currentRotationRef.current);
  }, [drawWheel, items, size]);

  // Handle spin rotation physics animation
  const spinWheel = useCallback(() => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);

    const numItems = items.length;
    const sliceAngle = (2 * Math.PI) / numItems;

    // Randomize target rotations (between 4 and 7 full rotations)
    const extraRotations = 4 + Math.random() * 3;
    const targetAddAngle = extraRotations * 2 * Math.PI;

    const startAngle = currentRotationRef.current;
    const endAngle = startAngle + targetAddAngle;

    const duration = 4800; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth custom easing curve (easeOutCubic / quartic)
      const easeOut = 1 - Math.pow(1 - progress, 4);

      const currentAngle = startAngle + (endAngle - startAngle) * easeOut;
      currentRotationRef.current = currentAngle;

      drawWheel(currentAngle);

      // Calculate which segment is currently passing under pointer at top (270 degrees = 1.5 * PI)
      const normalizedAngle = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      // Pointer is at 12 o'clock (270 deg / -90 deg -> -Math.PI/2 or 1.5*Math.PI)
      const pointerAngle = (1.5 * Math.PI - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
      const currentSegmentIndex = Math.floor(pointerAngle / sliceAngle) % numItems;

      if (currentSegmentIndex !== lastSegmentIndexRef.current) {
        lastSegmentIndexRef.current = currentSegmentIndex;
        if (soundEnabled) {
          onPlayTickSound();
        }
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished
        setIsSpinning(false);
        const winningItem = items[currentSegmentIndex];
        onSpinEnd(winningItem);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isSpinning, items, drawWheel, setIsSpinning, soundEnabled, onPlayTickSound, onSpinEnd]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center pt-3 sm:pt-4 w-full">
      
      {/* Subtle welcome ambient pulse glow around the wheel: Sigtuna Blue & Gold */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{
          opacity: isSpinning ? 0.2 : [0.35, 0.75, 0.35],
          scale: isSpinning ? 1 : [0.97, 1.03, 0.97],
        }}
        transition={{
          opacity: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
          delay: 0.3,
        }}
        className="absolute inset-2 -z-10 rounded-full bg-gradient-to-tr from-[#004c98]/25 via-[#ffd744]/20 to-blue-400/25 blur-xl pointer-events-none"
      />

      {/* Top Pointer Indicator with safe clearance so it doesn't overlap result card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 sm:top-0.5 z-20 transform -translate-x-1/2 left-1/2 filter drop-shadow-md transition-transform duration-100 pointer-events-none"
      >
        <svg width="34" height="38" viewBox="0 0 38 42" fill="none">
          <path
            d="M19 42L2.54552 10.5C-0.34731 4.71363 3.84738 0 10.3341 0H27.6659C34.1526 0 38.3473 4.71363 35.4545 10.5L19 42Z"
            fill="#d97706"
          />
          <path
            d="M19 36L6.5 11C4.5 7 7 3 12 3H26C31 3 33.5 7 31.5 11L19 36Z"
            fill="#fbbf24"
          />
        </svg>
      </motion.div>

      {/* Canvas Container with welcome fade-in and subtle inviting pulsating idle effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{
          opacity: 1,
          scale: isSpinning ? 1 : [1, 1.015, 1],
        }}
        transition={{
          opacity: { duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
          scale: isSpinning
            ? { duration: 0.25 }
            : { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
        }}
        onClick={spinWheel}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            spinWheel();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Snurra morgonhjulet"
        aria-disabled={isSpinning}
        className={`relative cursor-pointer rounded-full p-2 transition-transform duration-300 ${
          isSpinning ? 'scale-[1.01]' : 'hover:scale-[1.02] active:scale-98'
        } focus:outline-none focus:ring-4 focus:ring-amber-500/50`}
      >
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="rounded-full shadow-2xl dark:shadow-emerald-900/20 block"
        />
      </motion.div>

      {/* Spin Button underneath with iOS Liquid Glass styling - touch friendly */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={spinWheel}
        disabled={isSpinning}
        className={`mt-2.5 sm:mt-3.5 w-full sm:w-auto min-h-[46px] sm:min-h-[50px] px-6 sm:px-9 py-2.5 sm:py-3 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 touch-manipulation transition-all duration-200 ${
          isSpinning
            ? 'bg-slate-300/80 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed shadow-none border border-slate-300 dark:border-slate-700'
            : 'ios-glass-btn-primary tracking-wide text-white group cursor-pointer shadow-lg active:scale-98'
        }`}
      >
        <span className="p-1 rounded-full bg-white/20 dark:bg-white/15 flex items-center justify-center shadow-2xs">
          <Play className={`w-3.5 h-3.5 fill-current icon-realistic ${isSpinning ? 'animate-spin' : 'group-hover:translate-x-0.5 transition-transform'}`} />
        </span>
        <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
          {isSpinning ? 'Hjulet snurrar…' : 'Ge mig dagens budskap'}
        </span>
      </motion.button>

    </div>
  );
};
