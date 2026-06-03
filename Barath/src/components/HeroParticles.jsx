import React, { useEffect, useRef } from 'react';
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

  // ── Step 1: measure each character at a large baseline size ───────────────
  const baseSize = 200;
  // Use a rounded font stack for smooth, rounded letter paths
  octx.font = `800 ${baseSize}px "Comfortaa", "Quicksand", "Nunito", "Arial Rounded MT Bold", sans-serif`;

  const charBaseWidths = chars.map(c => octx.measureText(c).width);
  const totalBaseWidth = charBaseWidths.reduce((a, b) => a + b, 0);

  // Add 45% of average char width as inter-letter gap to keep them distinct
  const avgBase = totalBaseWidth / chars.length;
  const spacingBase = avgBase * 0.45;
  const totalBaseWithSpacing = totalBaseWidth + spacingBase * (chars.length - 1);

  // ── Step 2: scale so spaced text fills 86% of canvas width ────────────────
  const scale = (w * 0.86) / totalBaseWithSpacing;
  const fontSize = Math.floor(baseSize * scale);

  octx.font = `800 ${fontSize}px "Comfortaa", "Quicksand", "Nunito", "Arial Rounded MT Bold", sans-serif`;
  octx.textAlign = 'left';
  octx.textBaseline = 'middle';

  // ── Step 3: stroke settings for clean contour outline ─────────────────────
  octx.strokeStyle = '#1b5cfc';
  octx.lineWidth = Math.max(3, fontSize * 0.02); // Thin stroke to sample a single line of dots
  octx.lineJoin = 'round';
  octx.lineCap = 'round';

  const charWidths = chars.map(c => octx.measureText(c).width);
  const spacing = spacingBase * scale;
  const totalWidth = charWidths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let curX = (w - totalWidth) / 2;

  for (let i = 0; i < chars.length; i++) {
    octx.strokeText(chars[i], curX, h * 0.72);
    curX += charWidths[i] + spacing;
  }

  // ── Step 4: sample finely along the stroke outline ────────────────────────
  const imageData = octx.getImageData(0, 0, w, h);
  const rawPositions = [];
  const sampleStep = 2; // fine step to capture smooth rounded paths
  for (let y = 0; y < h; y += sampleStep) {
    for (let x = 0; x < w; x += sampleStep) {
      const idx = (y * w + x) * 4;
      if (imageData.data[idx + 3] > 80) { // capture all stroke pixels
        rawPositions.push({ x, y });
      }
    }
  }

  // ── Step 5: limit/subsample to targetCount — even distribution
  const targetCount = 680;
  const stride = Math.max(1, Math.floor(rawPositions.length / targetCount));
  const positions = rawPositions
    .filter((_, i) => i % stride === 0)
    .slice(0, targetCount);

  // Shuffle so particles fan out from random directions when converging
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  return positions;
}



/** Linearly interpolate between two RGB colours */
function lerpColor(r1, g1, b1, r2, g2, b2, t) {
  return [
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t),
  ];
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animationId = 0;
    let particles = [];
    let width = 0;
    let height = 0;
    let startTime = performance.now();
    // Smooth 0→1 value that follows isHovered with easing
    let hoverProgress = 0;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const createParticles = () => {
      const textPositions = getTextDotPositions(width, height);
      // Ensure we have exactly enough particles to cover all target positions + 200 floating dots
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
          radius: randomBetween(0.7, 1.4),
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
      createParticles();
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const draw = (now) => {
      ctx.clearRect(0, 0, width, height);

      const elapsed = now - startTime;
      const hovered = hoverRef.current;
      const inSpeed = 0.065;
      const outSpeed = 0.038;

      // Smoothly track hover state (0 = idle, 1 = fully hovered)
      hoverProgress = lerp(hoverProgress, hovered ? 1 : 0, 0.045);

      // Idle particle colour: white (255,255,255) → black (0,0,0) on hover
      const [pr, pg, pb] = lerpColor(255, 255, 255, 0, 0, 0, hoverProgress);

      for (const p of particles) {
        // ── Fade-in on load ──
        if (p.opacity < p.targetOpacity) {
          const appearElapsed = elapsed - p.appearDelay;
          if (appearElapsed > 0) {
            const t = Math.min(appearElapsed / p.appearDuration, 1);
            p.opacity = p.targetOpacity * (1 - (1 - t) ** 3);
          }
        }

        // ── Position update ──
        if (!prefersReducedMotion) {
          if (hovered && p.hasTarget) {
            p.x = lerp(p.x, p.targetX, inSpeed);
            p.y = lerp(p.y, p.targetY, inSpeed);
            p.idleX += p.vx;
            p.idleY += p.vy;
          } else if (!hovered && p.hasTarget) {
            p.x = lerp(p.x, p.idleX, outSpeed);
            p.y = lerp(p.y, p.idleY, outSpeed);
            p.idleX += p.vx;
            p.idleY += p.vy;
            if (p.idleX < -4) p.idleX = width + 4;
            if (p.idleX > width + 4) p.idleX = -4;
            if (p.idleY < -4) p.idleY = height + 4;
            if (p.idleY > height + 4) p.idleY = -4;
          } else {
            p.x += p.vx;
            p.y += p.vy;
            p.idleX = p.x;
            p.idleY = p.y;
            if (p.x < -4) { p.x = width + 4; p.idleX = p.x; }
            if (p.x > width + 4) { p.x = -4; p.idleX = p.x; }
            if (p.y < -4) { p.y = height + 4; p.idleY = p.y; }
            if (p.y > height + 4) { p.y = -4; p.idleY = p.y; }
          }
        }

        if (p.opacity <= 0) continue;

        // ── Visual rendering ──
        const isTextDot = p.hasTarget && hoverProgress > 0.05;
        const distToTarget = isTextDot
          ? Math.hypot(p.x - p.targetX, p.y - p.targetY)
          : Infinity;
        const nearTarget = distToTarget < 6;

        if (isTextDot) {
          // DEVELOPER text dots: stays vivid blue
          const displayOpacity = Math.min(
            p.opacity * (nearTarget ? 2.5 : 1.5) * hoverProgress,
            0.98
          );
          const displayRadius = p.radius * (nearTarget ? 1.25 : 0.95);

          // No shadow blur for maximum crispness, just like the reference image
          ctx.shadowBlur = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, displayRadius, 0, Math.PI * 2);
          // Brand blue #1b5cfc — stays vivid on both dark and white backgrounds
          ctx.fillStyle = `rgba(27,92,252,${displayOpacity})`;
          ctx.fill();
        } else {
          // Regular floating dots — small & crisp black dots on white hover bg
          const floatRadius = p.radius * 0.85; // keep them deliberately small
          const floatOpacity = Math.min(p.opacity * (1 + hoverProgress * 2.5), 0.82);

          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, floatRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${pr},${pg},${pb},${floatOpacity})`;
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="msci-hero-particles" aria-hidden="true">
      <canvas ref={canvasRef} className="msci-hero-particles-canvas" />
    </div>
  );
}

export default HeroParticles;
