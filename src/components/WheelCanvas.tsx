import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { WheelItem } from '../types';
import { Play, Heart } from 'lucide-react';

interface WheelCanvasProps {
  items: WheelItem[];
  onSpinEnd: (selectedItem: WheelItem) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  soundEnabled: boolean;
  onPlayTickSound: () => void;
  spinCount?: number;
  spinDuration?: number; // Duration in seconds
}

// Helper to create rich premium metallic/glossy linear gradients for slices
const createSliceGradient = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  baseColor: string
): CanvasGradient => {
  const midAngle = startAngle + (endAngle - startAngle) / 2;
  const outerX = centerX + Math.cos(midAngle) * radius;
  const outerY = centerY + Math.sin(midAngle) * radius;

  const grad = ctx.createLinearGradient(centerX, centerY, outerX, outerY);
  const hex = (baseColor || '').toLowerCase();

  // Yellow / Gold Gala hues (Radiant Metallic Gold)
  if (
    hex.includes('ffd744') ||
    hex.includes('fbbf24') ||
    hex.includes('f59e0b') ||
    hex.includes('ffcc00') ||
    hex.includes('amber') ||
    hex.includes('gold') ||
    hex.includes('yellow')
  ) {
    grad.addColorStop(0.0, '#FFFDF0'); // Champagne center highlight
    grad.addColorStop(0.2, '#FFE57F'); // Radiant golden sheen
    grad.addColorStop(0.6, '#F59E0B'); // Deep rich amber gold
    grad.addColorStop(0.88, '#D97706'); // Warm burnished gold
    grad.addColorStop(1.0, '#853205'); // Beveled outer rim
    return grad;
  }

  // Pure / Pearl White hues (Pearlescent Platinum)
  if (
    hex.includes('ffffff') ||
    hex.includes('fff') ||
    hex.includes('f8fafc') ||
    hex.includes('f1f5f9')
  ) {
    grad.addColorStop(0.0, '#FFFFFF'); // Diamond white center
    grad.addColorStop(0.3, '#FFFFFF');
    grad.addColorStop(0.65, '#F1F5F9'); // Pearl luster
    grad.addColorStop(0.88, '#E2E8F0'); // Platinum sheen
    grad.addColorStop(1.0, '#B0BAC7'); // Polished silver rim
    return grad;
  }

  // Royal / Sigtuna Blue hues (Sapphire Royal Sheen)
  if (
    hex.includes('004c98') ||
    hex.includes('003366') ||
    hex.includes('1d4ed8') ||
    hex.includes('2563eb')
  ) {
    grad.addColorStop(0.0, '#60A5FA'); // Sapphire center glint
    grad.addColorStop(0.22, '#2563EB'); // Vivid royal cobalt
    grad.addColorStop(0.6, '#004C98'); // Sigtuna primary royal
    grad.addColorStop(0.88, '#002B5C'); // Midnight navy depth
    grad.addColorStop(1.0, '#001633'); // Beveled deep border
    return grad;
  }

  // Sky / Azure Blue hues (Electric Azure Sapphire)
  if (
    hex.includes('0284c7') ||
    hex.includes('0891b2') ||
    hex.includes('06b6d4') ||
    hex.includes('38bdf8')
  ) {
    grad.addColorStop(0.0, '#E0F2FE'); // Ice blue center glint
    grad.addColorStop(0.25, '#38BDF8'); // Radiant azure
    grad.addColorStop(0.65, '#0284C7'); // Deep sky blue
    grad.addColorStop(0.9, '#0369A1'); // Oceanic depth
    grad.addColorStop(1.0, '#083344'); // Deep bezel edge
    return grad;
  }

  // Fallback / Other custom colors
  grad.addColorStop(0.0, '#FFFFFF');
  grad.addColorStop(0.25, baseColor);
  grad.addColorStop(0.85, baseColor);
  grad.addColorStop(1.0, '#00000055');
  return grad;
};

export const WheelCanvas: React.FC<WheelCanvasProps> = ({
  items,
  onSpinEnd,
  isSpinning,
  setIsSpinning,
  soundEnabled,
  onPlayTickSound,
  spinCount,
  spinDuration = 4.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentRotationRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastSegmentIndexRef = useRef<number>(-1);

  const [size, setSize] = useState<number>(340);
  const [isWinningBounce, setIsWinningBounce] = useState<boolean>(false);

  // Auto-reset bounce state safely if needed
  useEffect(() => {
    if (isWinningBounce) {
      const timer = setTimeout(() => {
        setIsWinningBounce(false);
      }, 950);
      return () => clearTimeout(timer);
    }
  }, [isWinningBounce]);

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

      // Draw Segments with Multi-Stop Gala Shaders
      items.forEach((item, index) => {
        const startAngle = rotationAngle + index * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        // Fill segment with lustrous radial/linear gala gradient
        const sliceGradient = createSliceGradient(
          ctx,
          centerX,
          centerY,
          radius,
          startAngle,
          endAngle,
          item.color
        );
        ctx.fillStyle = sliceGradient;
        ctx.fill();

        // Polished spoke divider with soft metallic golden highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
        ctx.lineWidth = 0.6;
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

        // Check if text is dark (e.g. on yellow or white slices)
        const isDarkText = Boolean(
          item.textColor &&
          item.textColor.toLowerCase() !== '#ffffff' &&
          item.textColor.toLowerCase() !== '#fff' &&
          item.textColor.toLowerCase() !== 'white'
        );

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
        
        if (isDarkText) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 76, 152, 0.22)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.restore();

        // Text Outline / Deep Shadow for perfect readability
        ctx.save();
        ctx.lineJoin = 'round';
        
        if (isDarkText) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = Math.max(1.4, Math.min(2.4, itemFontSize * 0.18));
          ctx.fillStyle = item.textColor || '#002d5e';
          ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.lineWidth = Math.max(1.8, Math.min(2.8, itemFontSize * 0.22));
          ctx.fillStyle = item.textColor || '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1;
        }

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

      // --- Convex Glass Dome / Gala Sheen Reflection Arc ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 1, 0, 2 * Math.PI);
      ctx.clip();

      // Top Glass Sheen Curved Gradient
      const domeSheenGrad = ctx.createLinearGradient(
        centerX,
        centerY - radius,
        centerX,
        centerY + radius * 0.4
      );
      domeSheenGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.38)');
      domeSheenGrad.addColorStop(0.18, 'rgba(255, 255, 255, 0.18)');
      domeSheenGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0.03)');
      domeSheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
      domeSheenGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.12)'); // soft bottom vignette

      ctx.fillStyle = domeSheenGrad;
      ctx.fill();

      // Top-Left Gala Spotlight Glare
      const galaSpotlight = ctx.createRadialGradient(
        centerX - radius * 0.42,
        centerY - radius * 0.42,
        0,
        centerX - radius * 0.42,
        centerY - radius * 0.42,
        radius * 0.75
      );
      galaSpotlight.addColorStop(0.0, 'rgba(255, 255, 255, 0.25)');
      galaSpotlight.addColorStop(0.4, 'rgba(255, 255, 255, 0.06)');
      galaSpotlight.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = galaSpotlight;
      ctx.fill();
      ctx.restore();

      // --- Outer Gold & Platinum Gala Bezel ---
      ctx.save();
      const goldBezelGrad = ctx.createLinearGradient(
        centerX - radius,
        centerY - radius,
        centerX + radius,
        centerY + radius
      );
      goldBezelGrad.addColorStop(0.0, '#D4AF37'); // Metallic Gold
      goldBezelGrad.addColorStop(0.22, '#FFF6BD'); // Specular Gold Highlight
      goldBezelGrad.addColorStop(0.48, '#AA7C11'); // Deep Antique Gold
      goldBezelGrad.addColorStop(0.72, '#FFE58F'); // Radiant Bright Gold
      goldBezelGrad.addColorStop(1.0, '#784D08'); // Deep Edge Gold

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = goldBezelGrad;
      ctx.lineWidth = Math.max(6, Math.min(9, Math.round(size * 0.024)));
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.stroke();

      // Platinum Inner Accent Ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 2, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // Outer Dark Accent Base
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 7, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // --- Jeweled Gold Studs / Rivets around Rim ---
      const pinRadius = Math.max(2.2, Math.min(3.6, size * 0.009));
      for (let i = 0; i < numItems; i++) {
        const pinAngle = rotationAngle + i * sliceAngle;
        const pinX = centerX + Math.cos(pinAngle) * (radius + 2);
        const pinY = centerY + Math.sin(pinAngle) * (radius + 2);

        ctx.save();
        ctx.beginPath();
        ctx.arc(pinX, pinY, pinRadius, 0, 2 * Math.PI);
        const pinGrad = ctx.createRadialGradient(
          pinX - pinRadius * 0.35,
          pinY - pinRadius * 0.35,
          0,
          pinX,
          pinY,
          pinRadius
        );
        pinGrad.addColorStop(0.0, '#FFFFFF');
        pinGrad.addColorStop(0.35, '#FFE57F');
        pinGrad.addColorStop(0.8, '#D97706');
        pinGrad.addColorStop(1.0, '#78350F');
        ctx.fillStyle = pinGrad;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 3;
        ctx.fill();
        ctx.restore();
      }

      // --- Luxury Medallion Center Knob ---
      ctx.save();

      // Layer 1: Outer Gold Rim with Relief Shadow
      const knobGoldGrad = ctx.createLinearGradient(
        centerX - outerKnobRadius,
        centerY - outerKnobRadius,
        centerX + outerKnobRadius,
        centerY + outerKnobRadius
      );
      knobGoldGrad.addColorStop(0.0, '#FFF5BA');
      knobGoldGrad.addColorStop(0.28, '#D4AF37');
      knobGoldGrad.addColorStop(0.7, '#8C6214');
      knobGoldGrad.addColorStop(1.0, '#FFDF73');

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerKnobRadius + 2, 0, 2 * Math.PI);
      ctx.fillStyle = knobGoldGrad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fill();

      // Layer 2: Deep Midnight Sapphire Medallion Core
      const knobSapphireGrad = ctx.createRadialGradient(
        centerX - innerKnobRadius * 0.25,
        centerY - innerKnobRadius * 0.25,
        0,
        centerX,
        centerY,
        innerKnobRadius
      );
      knobSapphireGrad.addColorStop(0.0, '#1E3A8A');
      knobSapphireGrad.addColorStop(0.55, '#0B132B');
      knobSapphireGrad.addColorStop(1.0, '#020617');

      ctx.beginPath();
      ctx.arc(centerX, centerY, innerKnobRadius, 0, 2 * Math.PI);
      ctx.fillStyle = knobSapphireGrad;
      ctx.fill();

      // Layer 3: Delicate Inner Gold Filigree Ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerKnobRadius - 2.5, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.65)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Layer 4: Golden "SNURRA" typography
      const knobFontSize = Math.max(8.5, Math.min(11.5, Math.round(outerKnobRadius * 0.30)));
      ctx.font = `900 ${knobFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textGoldGrad = ctx.createLinearGradient(
        centerX,
        centerY - knobFontSize / 2,
        centerX,
        centerY + knobFontSize / 2
      );
      textGoldGrad.addColorStop(0.0, '#FFFBEB');
      textGoldGrad.addColorStop(0.5, '#FDE047');
      textGoldGrad.addColorStop(1.0, '#CA8A04');

      ctx.fillStyle = textGoldGrad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;
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

    setIsWinningBounce(false);
    setIsSpinning(true);

    const numItems = items.length;
    const sliceAngle = (2 * Math.PI) / numItems;

    // Dynamically calculate duration and extra rotations based on spinDuration setting
    const duration = Math.max(1500, Math.round((spinDuration || 4.5) * 1000)); // ms
    const baseRotations = Math.max(2.5, (spinDuration || 4.5) * 1.15);
    const extraRotations = baseRotations + Math.random() * 2.2;
    const targetAddAngle = extraRotations * 2 * Math.PI;

    const startAngle = currentRotationRef.current;
    const endAngle = startAngle + targetAddAngle;

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
        // Spin finished - trigger exciting CSS win bounce animation on the fortune wheel
        setIsSpinning(false);
        setIsWinningBounce(true);
        const winningItem = items[currentSegmentIndex];
        onSpinEnd(winningItem);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isSpinning, items, drawWheel, setIsSpinning, soundEnabled, onPlayTickSound, onSpinEnd, spinDuration]);

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

      {/* Heart Spin Counter Badge - Styled to match the reference design */}
      {typeof spinCount === 'number' && (
        <motion.div
          key={spinCount}
          initial={{ opacity: 0, scale: 0.85, y: -4 }}
          animate={{ opacity: 1, scale: [0.92, 1.06, 1], y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-1 sm:mb-1.5 select-none flex items-center justify-center pointer-events-none z-30 relative"
        >
          {/* Soft diffuse coral-rose aura/glow */}
          <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#f04456]/40 blur-xl pointer-events-none -z-10" />

          {/* Floating mini hearts around the circle (matching screenshot) */}
          {/* Mini heart left */}
          <motion.div
            animate={{ y: [0, -3, 0], opacity: [0.7, 0.95, 0.7] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-9 sm:-left-10 top-5 text-[#fca5a5] pointer-events-none"
          >
            <Heart className="w-3.5 h-3.5 fill-[#fca5a5] stroke-none drop-shadow-xs" />
          </motion.div>

          {/* Mini heart top center-right */}
          <motion.div
            animate={{ y: [0, -2, 0], opacity: [0.6, 0.85, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="absolute -top-3 left-3 text-[#fca5a5] pointer-events-none"
          >
            <Heart className="w-2 h-2 fill-[#fca5a5] stroke-none drop-shadow-xs" />
          </motion.div>

          {/* Mini heart upper-right */}
          <motion.div
            animate={{ y: [0, -3, 0], opacity: [0.75, 0.95, 0.75] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="absolute -right-8 sm:-right-9 top-1 text-[#fca5a5] pointer-events-none"
          >
            <Heart className="w-3 h-3 fill-[#fca5a5] stroke-none drop-shadow-xs" />
          </motion.div>

          {/* Mini heart lower-right */}
          <motion.div
            animate={{ y: [0, -2, 0], opacity: [0.5, 0.75, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -right-10 sm:-right-12 bottom-2 text-[#fca5a5] pointer-events-none"
          >
            <Heart className="w-1.5 h-1.5 fill-[#fca5a5] stroke-none drop-shadow-xs" />
          </motion.div>

          {/* Central Coral-Red Circular Heart Badge */}
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#f04456] flex flex-col items-center justify-center shadow-[0_6px_24px_rgba(240,68,86,0.5)] border border-white/25 relative"
            title={`Antal snurr idag: ${spinCount}`}
            aria-label={`Antal snurr idag: ${spinCount}`}
          >
            {/* White Heart Icon */}
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />

            {/* Counter number directly inside the heart badge */}
            <span className="text-white text-sm sm:text-base font-black font-sans tracking-tight leading-none mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] tabular-nums">
              {spinCount}
            </span>
          </div>
        </motion.div>
      )}

      {/* Wheel and Pointer Wrapper */}
      <div className="relative flex items-center justify-center pt-3 sm:pt-3.5">
        {/* Top Pointer Indicator with Gala Gold Facets */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{
            opacity: 1,
            y: 0,
            rotate: isWinningBounce ? [0, -6, 5, -2, 0] : 0,
          }}
          transition={{
            opacity: { duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] },
            rotate: { duration: 0.65, ease: 'easeOut' },
          }}
          className="absolute top-0 z-20 transform -translate-x-1/2 left-1/2 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] pointer-events-none"
        >
          <svg width="36" height="42" viewBox="0 0 38 44" fill="none">
            <defs>
              <linearGradient id="pointerGoldBase" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF4B8" />
                <stop offset="40%" stopColor="#D4AF37" />
                <stop offset="80%" stopColor="#8C6214" />
                <stop offset="100%" stopColor="#4A3105" />
              </linearGradient>
              <linearGradient id="pointerGoldInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFDF0" />
                <stop offset="35%" stopColor="#FDE047" />
                <stop offset="75%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            {/* Outer Bevel Shadow Shield */}
            <path
              d="M19 44L2.2 11.5C-0.7 5.7 3.5 0 10.3 0H27.7C34.5 0 38.7 5.7 35.8 11.5L19 44Z"
              fill="url(#pointerGoldBase)"
            />
            {/* Inner Gleaming Gold Blade */}
            <path
              d="M19 38L6.2 11C4.3 7 6.8 3 11.6 3H26.4C31.2 3 33.7 7 31.8 11L19 38Z"
              fill="url(#pointerGoldInner)"
            />
            {/* Center Facet Ridge Line */}
            <path
              d="M19 4L19 37"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Center Sapphire Glint Stud */}
            <circle cx="19" cy="12" r="3.2" fill="#004C98" stroke="#FFE57F" strokeWidth="1.2" />
          </svg>
        </motion.div>

        {/* Canvas Container with subtle entrance rotation, scale and fade-in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, rotate: -40 }}
          animate={{
            opacity: 1,
            scale: isSpinning || isWinningBounce ? 1 : [1, 1.015, 1],
            rotate: 0,
          }}
          transition={{
            opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            rotate: { duration: 1.15, ease: [0.16, 1, 0.3, 1] },
            scale: isSpinning || isWinningBounce
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
          {/* Wheel canvas with CSS bounce animation applied on win */}
          <div
            className={`rounded-full ${isWinningBounce ? 'animate-wheel-bounce' : ''}`}
            onAnimationEnd={() => setIsWinningBounce(false)}
          >
            <canvas
              ref={canvasRef}
              style={{ width: size, height: size }}
              className="rounded-full shadow-2xl dark:shadow-emerald-900/20 block"
            />
          </div>
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
          <Heart className={`w-3.5 h-3.5 fill-current icon-realistic ${isSpinning ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
        </span>
        <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
          {isSpinning ? 'Hjulet snurrar…' : 'Ge mig dagens budskap'}
        </span>
      </motion.button>

    </div>
  );
};
