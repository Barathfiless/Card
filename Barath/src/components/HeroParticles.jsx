import React, { useEffect, useRef } from 'react';
import './HeroParticles.css';

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function HeroParticles() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

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

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const createParticles = () => {
      const area = width * height;
      const count = Math.min(Math.max(Math.floor(area / 2200), 140), 420);

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: randomBetween(0.7, 1.6),
        opacity: 0,
        targetOpacity: randomBetween(0.12, 0.55),
        vx: randomBetween(-0.12, 0.12),
        vy: randomBetween(-0.12, 0.12),
        appearDelay: randomBetween(0, 2200),
        appearDuration: randomBetween(900, 2400),
      }));
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

    const draw = (now) => {
      ctx.clearRect(0, 0, width, height);

      const elapsed = now - startTime;

      for (const p of particles) {
        const appearElapsed = elapsed - p.appearDelay;
        if (appearElapsed > 0) {
          const t = Math.min(appearElapsed / p.appearDuration, 1);
          const eased = 1 - (1 - t) ** 3;
          p.opacity = p.targetOpacity * eased;
        }

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -4) p.x = width + 4;
          if (p.x > width + 4) p.x = -4;
          if (p.y < -4) p.y = height + 4;
          if (p.y > height + 4) p.y = -4;
        }

        if (p.opacity <= 0) continue;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      }

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
