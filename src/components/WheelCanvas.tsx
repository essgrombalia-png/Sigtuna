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
  spinCount?: number;
}

export const WheelCanvas: React.FC<WheelCanvasProps> = ({
  items,
  onSpinEnd,
  isSpinning,
  setIsSpinning,
  soundEnabled,
  onPlayTickSound,
  spinCount,
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
      let widthCeiling = 540;
      if (vw < 360) {
        widthCeiling = 300;
      } else if (vw < 420) {
        widthCeiling = 350;
      } else if (vw < 640) {
        widthCeiling = 400;
      } else if (vw < 1024) {
        // iPad portrait & landscape / tablet
        widthCeiling = 470;
      } else {
        // Desktop / large monitor
        widthCeiling = 530;
      }

      // Available vertical space check (accounts for header, title, and button)
      let heightCeiling = 540;
      if (vh < 640) {
        heightCeiling = 330;
      } else if (vh < 740) {
        heightCeiling = 410;
      } else if (vh < 860) {
        heightCeiling = 470;
      } else {
        heightCeiling = 530;
      }

      const optimal = Math.max(290, Math.min(widthCeiling, heightCeiling));
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
      const actualFontSize = numItems > 10 ? Math.max(8.5, baseFontSize - 1.2) : baseFontSize;

      // Scaled Center Knob / Hub
      const outerKnobRadius = Math.max(26, Math.min(40, Math.round(size * 0.105)));
      const innerKnobRadius = outerKnobRadius - 6;
      const availableRadial = radius - outerKnobRadius - (size < 300 ? 14 : 20);

      // Helper function to format & balance wheel segment text
      const formatSegmentText = (
        rawText: string
      ): { lines: string[]; fontSize: number } => {
        const clean = rawText.trim();

        // 1. Check if it fits comfortably on 1 line
        ctx.font = `800 ${actualFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        const singleWidth = ctx.measureText(clean).width;

        if (singleWidth <= availableRadial * 0.88 && clean.length <= 15) {
          return { lines: [clean], fontSize: actualFontSize };
        }

        // 2. Multi-word phrase: split into 2 balanced lines
        const words = clean.split(/\s+/);
        if (words.length <= 1) {
          let fSize = actualFontSize;
          while (fSize > 7.5 && ctx.measureText(clean).width > availableRadial * 0.95) {
            fSize -= 0.5;
            ctx.font = `800 ${fSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
          }
          return { lines: [clean], fontSize: fSize };
        }

        // Find optimal split point
        let bestSplit = 1;
        let minDiff = Infinity;
        for (let i = 1; i < words.length; i++) {
          const l1 = words.slice(0, i).join(' ');
          const l2 = words.slice(i).join(' ');
          const diff = Math.abs(l1.length - l2.length);
          if (diff < minDiff) {
            minDiff = diff;
            bestSplit = i;
          }
        }

        const line1 = words.slice(0, bestSplit).join(' ');
        const line2 = words.slice(bestSplit).join(' ');

        let fSize = Math.max(7.5, actualFontSize - 0.8);
        ctx.font = `800 ${fSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;

        while (
          fSize > 7 &&
          (ctx.measureText(line1).width > availableRadial * 0.92 ||
            ctx.measureText(line2).width > availableRadial * 0.92)
        ) {
          fSize -= 0.4;
          ctx.font = `800 ${fSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        }

        return { lines: [line1, line2], fontSize: fSize };
      };

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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Draw Text along radial slice
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const label = item.wheelLabel || item.text;
        const { lines, fontSize: itemFontSize } = formatSegmentText(label);

        ctx.font = `800 ${itemFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;

        const textRightEdge = radius - (size < 300 ? 12 : 18);
        const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));

        // Subtle translucent background plate/pill behind text for maximum legibility on any color
        const padX = Math.max(7, Math.min(11, size * 0.024));
        const lineHeight = itemFontSize * 1.25;
        const totalTextHeight = lines.length === 1 ? itemFontSize * 1.15 : lineHeight * 1.85;
        const platePadY = Math.max(3.5, Math.min(6, size * 0.014));
        const plateH = totalTextHeight + platePadY * 2;
        const plateW = maxLineWidth + padX * 2;
        const plateX = textRightEdge - maxLineWidth - padX;
        const plateY = -plateH / 2;
        const pillRadius = Math.min(plateH / 2, 7);

        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(plateX, plateY, plateW, plateH, pillRadius);
        } else {
          ctx.rect(plateX, plateY, plateW, plateH);
        }
        ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();

        // Text Outline / Deep Shadow for perfect readability
        ctx.save();
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = Math.max(1.8, Math.min(2.8, itemFontSize * 0.22));

        ctx.fillStyle = item.textColor || '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;

        if (lines.length === 1) {
          ctx.strokeText(lines[0], textRightEdge, 0);
          ctx.fillText(lines[0], textRightEdge, 0);
        } else {
          const y1 = -lineHeight * 0.48;
          const y2 = lineHeight * 0.52;

          ctx.strokeText(lines[0], textRightEdge, y1);
          ctx.fillText(lines[0], textRightEdge, y1);

          ctx.strokeText(lines[1], textRightEdge, y2);
          ctx.fillText(lines[1], textRightEdge, y2);
        }
        ctx.restore();

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

      // Outer Rim Decorative Studs/Pins
      const pinRadius = Math.max(2, Math.min(3.2, size * 0.008));
      for (let i = 0; i < numItems; i++) {
        const pinAngle = rotationAngle + i * sliceAngle;
        const pinX = centerX + Math.cos(pinAngle) * (radius - 1);
        const pinY = centerY + Math.sin(pinAngle) * (radius - 1);

        ctx.save();
        ctx.beginPath();
        ctx.arc(pinX, pinY, pinRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 2;
        ctx.fill();
        ctx.restore();
      }

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
    <div className="relative flex flex-col items-center justify-center w-full">
      
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

      {/* Premium Spin Counter - Placed directly above the pointer/wheel */}
      {typeof spinCount === 'number' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-0.5 sm:mb-1 select-none flex items-center justify-center pointer-events-none z-30"
        >
          <span
            className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight tabular-nums bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 dark:from-yellow-200 dark:via-amber-400 dark:to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)] dark:drop-shadow-[0_2px_14px_rgba(251,191,36,0.4)] leading-none transition-all duration-300"
            title={`Antal snurr idag: ${spinCount}`}
            aria-label={`Antal snurr idag: ${spinCount}`}
          >
            {spinCount}
          </span>
        </motion.div>
      )}

      {/* Wheel and Pointer Wrapper */}
      <div className="relative flex items-center justify-center pt-3 sm:pt-3.5">
        {/* Top Pointer Indicator with safe clearance */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 z-20 transform -translate-x-1/2 left-1/2 filter drop-shadow-md transition-transform duration-100 pointer-events-none"
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

        {/* Canvas Container with subtle entrance rotation, scale and fade-in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, rotate: -40 }}
          animate={{
            opacity: 1,
            scale: isSpinning ? 1 : [1, 1.015, 1],
            rotate: 0,
          }}
          transition={{
            opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            rotate: { duration: 1.15, ease: [0.16, 1, 0.3, 1] },
            scale: isSpinning
              ? { duration: 0.25 }
              : { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
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
          aria-label="Snurra hjulet"
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
      </div>

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
