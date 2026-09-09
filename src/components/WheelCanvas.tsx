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

  const [size, setSize] = useState<number>(380);

  // Responsive canvas sizing that considers both width and height to fit screen
  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Compute available height after header, hero, quote, result card, and button
      const availableHeight = Math.max(250, windowHeight - 330);
      const availableWidth = Math.min(windowWidth - 36, 460);
      const computed = Math.min(availableWidth, availableHeight);

      // Keep within comfortable bounds
      setSize(Math.max(260, Math.min(computed, 430)));
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

      const dpr = window.devicePixelRatio || 1;
      const displaySize = size;
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      ctx.scale(dpr, dpr);

      const centerX = displaySize / 2;
      const centerY = displaySize / 2;
      const radius = displaySize / 2 - 16;
      const numItems = items.length;
      if (numItems === 0) return;

      const sliceAngle = (2 * Math.PI) / numItems;

      ctx.clearRect(0, 0, displaySize, displaySize);

      // Outer Glow & Shadow Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f172a15';
      ctx.fill();
      ctx.restore();

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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Text along radial slice
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);

        ctx.textAlign = 'right';
        ctx.fillStyle = item.textColor || '#ffffff';
        const fontSize = size >= 500 ? (numItems > 10 ? '13px' : '15px') : (numItems > 10 ? '11px' : '13px');
        ctx.font = `800 ${fontSize} 'Plus Jakarta Sans', system-ui, sans-serif`;

        // Segment label: use wheelLabel if available, otherwise text
        let label = item.wheelLabel || item.text;
        if (label.length > 25) {
          label = label.substring(0, 23) + '…';
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4;
        ctx.fillText(label, radius - 26, 5);

        ctx.restore();
      });

      // Outer Frame Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();

      // Outer Dark Accent Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = '#0f172a22';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Center Knob / Hub
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 42, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 34, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Center text / icon
      ctx.fillStyle = '#ffffff';
      ctx.font = "900 11px 'Plus Jakarta Sans', sans-serif";
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
    <div className="relative flex flex-col items-center justify-center">
      
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

      {/* Top Pointer Indicator with welcome fade-in */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 z-20 -mt-3 transform -translate-x-1/2 left-1/2 filter drop-shadow-md transition-transform duration-100"
      >
        <svg width="38" height="42" viewBox="0 0 38 42" fill="none">
          <path
            d="M19 42L2.54552 10.5C-0.34731 4.71363 3.84738 0 10.3341 0H27.6659C34.1526 0 38.3473 4.71363 35.4545 10.5L19 42Z"
            fill="#f59e0b"
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
          className="rounded-full shadow-2xl dark:shadow-emerald-900/20"
        />
      </motion.div>

      {/* Spin Button underneath with iOS Liquid Glass styling */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={spinWheel}
        disabled={isSpinning}
        className={`mt-3 sm:mt-4 w-full sm:w-auto px-7 sm:px-9 py-3 sm:py-3.5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 ${
          isSpinning
            ? 'bg-slate-300/80 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed shadow-none border border-slate-300 dark:border-slate-700'
            : 'ios-glass-btn-primary tracking-wide text-white group cursor-pointer'
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
