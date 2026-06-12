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
  const sampleStep = 2; // Sample every 2nd pixel for high performance and fast loadtimes

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

  const targetCount = 2000; // Reduced from 4500 to keep high density but minimize render cost
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
    let bgParticles = [];
    let textParticles = [];
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

      // Independent background particles arranged in a linear grid pattern
      const bgSpacing = 30; // Increased spacing slightly to optimize background dot counts
      const cols = Math.ceil(width / bgSpacing);
      const rows = Math.ceil(height / bgSpacing);
      bgParticles = [];
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * bgSpacing;
          const y = r * bgSpacing;
          bgParticles.push({
            x,
            y,
            anchorX: x,
            anchorY: y,
            radius: randomBetween(0.65, 0.95),
            opacity: 0,
            targetOpacity: randomBetween(0.4, 0.75),
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            speed: randomBetween(0.0006, 0.0016),
            amp: randomBetween(0.8, 1.5),
            appearDelay: randomBetween(0, 1000),
            appearDuration: randomBetween(600, 1200),
          });
        }
      }

      // Independent text outline particles
      textParticles = textPositions.map((pos) => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        return {
          x,
          y,
          idleX: x,
          idleY: y,
          targetX: pos.x,
          targetY: pos.y,
          radius: randomBetween(0.5, 1.1),
          vx: randomBetween(-0.12, 0.12),
          vy: randomBetween(-0.12, 0.12),
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

      // Ensure rounded custom fonts (Nunito / Varela Round) are used once loaded instead of system sans-serif fallback
      if (document.fonts) {
        document.fonts.ready.then(() => {
          createParticles();
        });
      }
    };

    const drawBuckets = (buckets, r, g, b, alphaMultiplier = 1) => {
      for (let i = 1; i <= 10; i++) {
        const bucket = buckets[i];
        if (bucket.length === 0) continue;

        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, (i / 10) * alphaMultiplier)})`;
        ctx.beginPath();
        for (let j = 0; j < bucket.length; j++) {
          const pt = bucket[j];
          ctx.moveTo(pt.x + pt.r, pt.y);
          ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        }
        ctx.fill();
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

      // Linear time-based hoverProgress accumulator (starts immediately)
      if (hovered) {
        hoverProgress = Math.min(1, hoverProgress + deltaTime / 180);
      } else {
        hoverProgress = Math.max(0, hoverProgress - deltaTime / 60); // dissolves back in 0.5 seconds
      }

      // Slowly float the whole word up and down in unison on the same place
      const wordYOffset = Math.sin(elapsed * 0.0006) * 8 * hoverProgress;

      // Background dots color: white on blue background (light theme), black on white background (dark theme)
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const pr = isDark ? 0 : 255;
      const pg = isDark ? 0 : 255;
      const pb = isDark ? 0 : 255;

      clearBuckets();

      // 1. Process and draw background floating particles
      for (let pi = 0; pi < bgParticles.length; pi++) {
        const p = bgParticles[pi];

        if (p.opacity < p.targetOpacity) {
          const appearElapsed = elapsed - p.appearDelay;
          if (appearElapsed > 0) {
            const t = Math.min(appearElapsed / p.appearDuration, 1);
            p.opacity = p.targetOpacity * (1 - (1 - t) ** 3);
          }
        }

        // Float slowly in place around its linear grid anchor position
        const floatTime = elapsed * p.speed;
        p.x = p.anchorX + Math.sin(floatTime + p.phaseX) * p.amp;
        p.y = p.anchorY + Math.cos(floatTime + p.phaseY) * p.amp;

        if (p.opacity <= 0) continue;

        // Shine wave animation from left to right (8s cycle)
        const wavePeriod = 8000;
        const waveCycle = (elapsed % wavePeriod) / wavePeriod;
        const waveCenterX = waveCycle * width * 1.6 - width * 0.3;
        const waveWidth = width * 0.3;
        
        const distToWave = Math.abs(p.anchorX - waveCenterX);
        let shineBoost = 0;
        if (distToWave < waveWidth) {
          const normDist = distToWave / waveWidth;
          shineBoost = Math.cos(normDist * Math.PI / 2) * 0.45;
        }

        const floatRadius = p.radius * (1 + shineBoost * 0.35);
        const baseOpacity = Math.min(p.opacity * (1.2 + hoverProgress * 1.8), 0.95);
        const floatOpacity = Math.min(baseOpacity + shineBoost, 0.98);
        const opacityIdx = Math.max(0, Math.min(10, Math.round(floatOpacity * 10)));
        floatBuckets[opacityIdx].push({ x: p.x, y: p.y, r: floatRadius });
      }

      // 2. Process and draw text outline particles (only when hovered or text is forming/dissolving)
      if (hoverProgress > 0.001 || hovered) {
        for (let pi = 0; pi < textParticles.length; pi++) {
          const p = textParticles[pi];

          const normalX = p.targetX / width;
          const staggerDelay = 0.35 * normalX;
          const individualProgress = Math.max(0, Math.min(1, (hoverProgress - staggerDelay) / (1 - staggerDelay)));

          if (!prefersReducedMotion) {
            if (hovered) {
              if (individualProgress > 0) {
                const currentInLerp = expDecay(inSpeed, deltaTime);
                p.x = frameLerp(p.x, p.targetX, currentInLerp);
                p.y = frameLerp(p.y, p.targetY + wordYOffset, currentInLerp);
              } else {
                p.x += p.vx * deltaTime;
                p.y += p.vy * deltaTime;
              }
              p.idleX += p.vx * deltaTime;
              p.idleY += p.vy * deltaTime;
            } else {
              const currentOutLerp = expDecay(outSpeed, deltaTime);
              p.x = frameLerp(p.x, p.idleX, currentOutLerp);
              p.y = frameLerp(p.y, p.idleY, currentOutLerp);
              p.idleX += p.vx * deltaTime;
              p.idleY += p.vy * deltaTime;
            }

            if (p.idleX < -4) p.idleX = width + 4;
            if (p.idleX > width + 4) p.idleX = -4;
            if (p.idleY < -4) p.idleY = height + 4;
            if (p.idleY > height + 4) p.idleY = -4;
          }

          if (individualProgress > 0.01) {
            const easedIndividual = 1 - (1 - individualProgress) ** 3;
            
            const dx = p.x - p.targetX;
            const dy = p.y - (p.targetY + wordYOffset);
            const distSq = dx * dx + dy * dy;
            const nearTarget = distSq < 36; // Fast distance check without Math.hypot (6 * 6 = 36)

            const displayRadius = p.radius * (0.85 + (nearTarget ? 0.4 : 0.1) * easedIndividual);

            const targetOpacity = 0.45;
            const endOpacity = Math.min(targetOpacity * (nearTarget ? 2.0 : 1.4), 0.98);
            const displayOpacity = endOpacity * easedIndividual;

            const opacityIdx = Math.max(0, Math.min(10, Math.round(displayOpacity * 10)));
            textBuckets[opacityIdx].push({ x: p.x, y: p.y, r: displayRadius });
          }
        }
      }

      // Text particles color: gold in dark theme, blue in light theme
      const tr = isDark ? 200 : 27;
      const tg = isDark ? 169 : 80;
      const tb = isDark ? 110 : 220;

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
