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

  // Measure at baseline size to get the width scaling ratio
  const baseSize = 200;
  octx.font = `800 ${baseSize}px Nunito, "Arial Black", sans-serif`;
  const baseWidth = octx.measureText(TEXT).width;

  // Scale so text fills ~96% of canvas width edge-to-edge
  const fontSize = Math.floor(baseSize * (w * 0.96) / baseWidth);

  octx.font = `800 ${fontSize}px Nunito, "Arial Black", sans-serif`;
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';

  // ── Use STROKE (outline) not fill — so dots trace letter edges like ref image
  octx.strokeStyle = '#1b5cfc';
  octx.lineWidth = Math.max(10, fontSize * 0.06); // ~6% of font height
  octx.lineJoin = 'round';
  octx.lineCap = 'round';
  octx.strokeText(TEXT, w / 2, h * 0.72);

  const imageData = octx.getImageData(0, 0, w, h);

  // ── Sample finely along the stroke pixels ─────────────────────────────────
  const rawPositions = [];
  const sampleStep = 3; // fine scan to capture the thin stroke band
  for (let y = 0; y < h; y += sampleStep) {
    for (let x = 0; x < w; x += sampleStep) {
      const idx = (y * w + x) * 4;
      if (imageData.data[idx + 3] > 120) {
        rawPositions.push({ x, y });
      }
    }
  }

  // ── Subsample to targetCount — ensures even distribution across all letters
  const targetCount = 580;
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
      const area = width * height;
      const count = Math.min(Math.max(Math.floor(area / 2200), 160), 680);
      const textPositions = getTextDotPositions(width, height);

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
          radius: randomBetween(0.7, 1.6),
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
          // DEVELOPER text dots: light blue → white as hoverProgress increases
          // (white on white bg would vanish, so keep them light blue always)
          const displayOpacity = Math.min(
            p.opacity * (nearTarget ? 3.5 : 2.2) * hoverProgress,
            0.98
          );
          const displayRadius = p.radius * (nearTarget ? 2.8 : 2.0);

          if (nearTarget) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(27,92,252,0.7)';
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, displayRadius, 0, Math.PI * 2);
          // Brand blue #1b5cfc — stays vivid on both dark and white backgrounds
          ctx.fillStyle = `rgba(27,92,252,${displayOpacity})`;
          ctx.fill();
        } else {
          // Regular floating dots — interpolate from white to dark navy
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${pr},${pg},${pb},${p.opacity})`;
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
