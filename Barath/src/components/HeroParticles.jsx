import React, { useEffect, useRef } from 'react';
import { getFrameDelta, expDecay, lerp as frameLerp } from '../utils/frame';
import './HeroParticles.css';

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/** Sample pixel positions from "DEVELOPER" rendered on an offscreen canvas */
function getTextDotPositions(w, h) {
  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const octx = offscreen.getContext('2d');

  const TEXT = 'DEVELOPER';
  const chars = TEXT.split('');

  const baseSize = 200;
  octx.font = `800 ${baseSize}px "Nunito", "Varela Round", sans-serif`;

  const charBaseWidths = chars.map(c => octx.measureText(c).width);
  const totalBaseWidth = charBaseWidths.reduce((a, b) => a + b, 0);

  const avgBase = totalBaseWidth / chars.length;
  const spacingBase = avgBase * 0.12;
  const totalBaseWithSpacing = totalBaseWidth + spacingBase * (chars.length - 1);

  const scale = (w * 0.98) / totalBaseWithSpacing;
  const fontSize = Math.floor(baseSize * scale);

  octx.font = `800 ${fontSize}px "Nunito", "Varela Round", sans-serif`;
  octx.textAlign = 'left';
  octx.textBaseline = 'middle';

  const charWidths = chars.map(c => octx.measureText(c).width);
  const spacing = spacingBase * scale;
  const totalWidth = charWidths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let curX = (w - totalWidth) / 2;

  // 1. First pass: Draw filled text with low opacity (inside area of the letters)
  octx.fillStyle = 'rgba(27, 92, 252, 0.15)';
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== 'L') {
      octx.fillText(chars[i], curX, h * 0.72);
    }
    curX += charWidths[i] + spacing;
  }

  // Reset curX for the outline stroke pass
  curX = (w - totalWidth) / 2;

  // 2. Second pass: Draw stroke text with solid opacity (crisp outline of the letters)
  octx.strokeStyle = 'rgba(27, 92, 252, 1.0)';
  octx.lineWidth = Math.max(3, fontSize * 0.012); // clean, thin outline definition
  octx.lineJoin = 'round';
  octx.lineCap = 'round';
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== 'L') {
      octx.strokeText(chars[i], curX, h * 0.72);
    }
    curX += charWidths[i] + spacing;
  }

  const imageData = octx.getImageData(0, 0, w, h);
  const rawPositions = [];
  const sampleStep = 1; // Sample every pixel for ultra-fine precision

  for (let y = 0; y < h; y += sampleStep) {
    for (let x = 0; x < w; x += sampleStep) {
      const idx = (y * w + x) * 4;
      const alpha = imageData.data[idx + 3];

      if (alpha > 180) {
        // Outline pixel: keep with 95% probability
        if (Math.random() < 0.95) {
          rawPositions.push({ x, y });
        }
      } else if (alpha > 15) {
        // Inside/fill pixel: keep with 8% probability (sparse interior)
        if (Math.random() < 0.08) {
          rawPositions.push({ x, y });
        }
      }
    }
  }

  // Shuffle the entire rawPositions array to prevent any periodic diagonal/horizontal patterns
  for (let i = rawPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rawPositions[i], rawPositions[j]] = [rawPositions[j], rawPositions[i]];
  }

  const targetCount = 4500;
  const positions = rawPositions.slice(0, targetCount);

  return positions;
}

function HeroParticles({ isHovered = false }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const hoverRef = useRef(false);

  useEffect(() => {
    hoverRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
      willReadFrequently: false,
    });
    if (!ctx) return undefined;

    let animationId = 0;
    let particles = [];
    let width = 0;
    let height = 0;
    let startTime = performance.now();
    let lastTime = performance.now();
    let hoverProgress = 0;
    let isVisible = true;
    let isInView = true;

    const textBuckets = Array.from({ length: 11 }, () => []);
    const floatBuckets = Array.from({ length: 11 }, () => []);
    const textFillStyles = Array.from({ length: 11 }, (_, i) =>
      `rgba(27,80,220,${Math.min(1, (i / 10) * 1.4)})`
    );

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const clearBuckets = () => {
      for (let i = 0; i < 11; i++) {
        textBuckets[i].length = 0;
        floatBuckets[i].length = 0;
      }
    };

    const createParticles = () => {
      if (!width || !height) return;
      const textPositions = getTextDotPositions(width, height);
      const count = textPositions.length + 200;

      particles = Array.from({ length: count }, (_, i) => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const textPos = textPositions[i];

        return {
          x,
          y,
          idleX: x,
          idleY: y,
          targetX: textPos ? textPos.x : x,
          targetY: textPos ? textPos.y : y,
          hasTarget: !!textPos,
          radius: randomBetween(0.5, 1.1),
          opacity: 0,
          targetOpacity: randomBetween(0.12, 0.55),
          vx: randomBetween(-0.12, 0.12),
          vy: randomBetween(-0.12, 0.12),
          appearDelay: randomBetween(0, 2200),
          appearDuration: randomBetween(900, 2400),
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      startTime = performance.now();
      lastTime = performance.now();
      createParticles();
    };

    const drawBuckets = (buckets, r, g, b, alphaMultiplier = 1) => {
      for (let i = 1; i <= 10; i++) {
        const bucket = buckets[i];
        if (bucket.length === 0) continue;

        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, (i / 10) * alphaMultiplier)})`;

        for (let j = 0; j < bucket.length; j++) {
          const pt = bucket[j];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const draw = (now) => {
      animationId = requestAnimationFrame(draw);

      if (!isVisible || !isInView) {
        lastTime = now;
        return;
      }

      const deltaTime = getFrameDelta(now, lastTime);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      const elapsed = now - startTime;
      const hovered = hoverRef.current;
      const inSpeed = 0.28;
      const outSpeed = 0.16;

      // Linear time-based hoverProgress accumulator (exactly 1.5 seconds/180 frames to fully assemble)
      if (hovered) {
        hoverProgress = Math.min(1, hoverProgress + deltaTime / 180);
      } else {
        hoverProgress = Math.max(0, hoverProgress - deltaTime / 60); // dissolves back in 0.5 seconds
      }

      const pr = Math.round(frameLerp(255, 0, hoverProgress));
      const pg = Math.round(frameLerp(255, 0, hoverProgress));
      const pb = Math.round(frameLerp(255, 0, hoverProgress));

      clearBuckets();

      for (let pi = 0; pi < particles.length; pi++) {
        const p = particles[pi];

        if (p.opacity < p.targetOpacity) {
          const appearElapsed = elapsed - p.appearDelay;
          if (appearElapsed > 0) {
            const t = Math.min(appearElapsed / p.appearDuration, 1);
            p.opacity = p.targetOpacity * (1 - (1 - t) ** 3);
          }
        }

        const normalX = p.hasTarget ? p.targetX / width : 0.5;
        const staggerDelay = p.hasTarget ? 0.35 * normalX : 0;
        const individualProgress = Math.max(0, Math.min(1, (hoverProgress - staggerDelay) / (1 - staggerDelay)));

        if (!prefersReducedMotion) {
          if (hovered && p.hasTarget) {
            if (individualProgress > 0) {
              const easedIndividual = 1 - (1 - individualProgress) ** 3;
              
              // Zoom in/expand from behind Spider-Man: start scaled down at 0.05x and expand to 1.0x
              const currentScale = 0.05 + 0.95 * easedIndividual;
              const dynamicTargetX = width / 2 + (p.targetX - width / 2) * currentScale;
              const dynamicTargetY = height * 0.72 + (p.targetY - height * 0.72) * currentScale;

              const currentInLerp = expDecay(inSpeed, deltaTime);
              p.x = frameLerp(p.x, dynamicTargetX, currentInLerp);
              p.y = frameLerp(p.y, dynamicTargetY, currentInLerp);
            } else {
              p.x += p.vx * deltaTime;
              p.y += p.vy * deltaTime;
            }
            p.idleX += p.vx * deltaTime;
            p.idleY += p.vy * deltaTime;
          } else if (!hovered && p.hasTarget) {
            const currentOutLerp = expDecay(outSpeed, deltaTime);
            p.x = frameLerp(p.x, p.idleX, currentOutLerp);
            p.y = frameLerp(p.y, p.idleY, currentOutLerp);
            p.idleX += p.vx * deltaTime;
            p.idleY += p.vy * deltaTime;
            if (p.idleX < -4) p.idleX = width + 4;
            if (p.idleX > width + 4) p.idleX = -4;
            if (p.idleY < -4) p.idleY = height + 4;
            if (p.idleY > height + 4) p.idleY = -4;
          } else {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.idleX = p.x;
            p.idleY = p.y;
            if (p.x < -4) { p.x = width + 4; p.idleX = p.x; }
            if (p.x > width + 4) { p.x = -4; p.idleX = p.x; }
            if (p.y < -4) { p.y = height + 4; p.idleY = p.y; }
            if (p.y > height + 4) { p.y = -4; p.idleY = p.y; }
          }
        }

        if (p.opacity <= 0) continue;

        const isTextDot = p.hasTarget && individualProgress > 0.01;
        if (isTextDot) {
          const easedIndividual = 1 - (1 - individualProgress) ** 3;
          
          const dx = p.x - p.targetX;
          const dy = p.y - p.targetY;
          const distToTarget = Math.hypot(dx, dy);
          const nearTarget = distToTarget < 6;

          const startRadius = p.radius * 0.85;
          const endRadius = p.radius * (nearTarget ? 1.25 : 0.95);
          const displayRadius = startRadius + (endRadius - startRadius) * easedIndividual;

          const startOpacity = p.opacity;
          const endOpacity = Math.min(p.opacity * (nearTarget ? 2.5 : 1.5), 0.98);
          const displayOpacity = startOpacity + (endOpacity - startOpacity) * easedIndividual;

          const opacityIdx = Math.max(0, Math.min(10, Math.round(displayOpacity * 10)));
          textBuckets[opacityIdx].push({ x: p.x, y: p.y, r: displayRadius });
        } else {
          const floatRadius = p.radius * 0.85;
          const floatOpacity = Math.min(p.opacity * (1 + hoverProgress * 2.5), 0.82);
          const opacityIdx = Math.max(0, Math.min(10, Math.round(floatOpacity * 10)));
          floatBuckets[opacityIdx].push({ x: p.x, y: p.y, r: floatRadius });
        }
      }

      // Calculate text dot color for this frame
      const tr = Math.round(pr + (27 - pr) * hoverProgress);
      const tg = Math.round(pg + (80 - pg) * hoverProgress);
      const tb = Math.round(pb + (220 - pb) * hoverProgress);

      drawBuckets(textBuckets, tr, tg, tb, 1.4);
      drawBuckets(floatBuckets, pr, pg, pb, 1.0);
    };

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible) lastTime = performance.now();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        if (isInView) lastTime = performance.now();
      },
      { root: null, threshold: 0 }
    );
    intersectionObserver.observe(container);

    document.addEventListener('visibilitychange', onVisibilityChange);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="msci-hero-particles" aria-hidden="true">
      <canvas ref={canvasRef} className="msci-hero-particles-canvas" />
    </div>
  );
}

export default HeroParticles;
