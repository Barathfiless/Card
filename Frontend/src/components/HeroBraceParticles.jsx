import React, { useCallback, useEffect, useRef, useState } from 'react';
import './HeroBraceParticles.css';

const MAX_BRACE_POINTS = 280;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function sampleBraceShape(char, step = 4) {
  const canvas = document.createElement('canvas');
  const width = 140;
  const height = 360;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#000';
  ctx.font = `700 ${Math.floor(height * 0.88)}px "Courier New", Courier, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, width / 2, height / 2);

  const { data } = ctx.getImageData(0, 0, width, height);
  const points = [];

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 90) {
        points.push({ nx: x / width, ny: y / height });
      }
    }
  }

  if (points.length <= MAX_BRACE_POINTS) return points;

  const stride = Math.ceil(points.length / MAX_BRACE_POINTS);
  return points.filter((_, index) => index % stride === 0);
}

function createBraceParticle(point, layout, progress, index) {
  const targetX = layout.x + (point.nx - 0.5) * layout.scale;
  const targetY = layout.y + (point.ny - 0.5) * layout.scale;
  const seed = index * 12.9898;
  const jitter = (1 - progress) * 36;

  return {
    x: targetX + Math.sin(seed) * jitter,
    y: targetY + Math.cos(seed * 1.3) * jitter,
    tx: targetX,
    ty: targetY,
    size: randomBetween(1.4, 2.4),
    opacity: progress * randomBetween(0.5, 0.95),
    driftX: randomBetween(-0.22, 0.22),
    driftY: randomBetween(-0.22, 0.22),
  };
}

function HeroBraceParticles() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const leftShapeRef = useRef(sampleBraceShape('{'));
  const rightShapeRef = useRef(sampleBraceShape('}'));

  const [leftHover, setLeftHover] = useState(false);
  const [rightHover, setRightHover] = useState(false);

  const hoverRef = useRef({ left: false, right: false });
  const progressRef = useRef({ left: 0, right: 0 });

  const setLeftHoverState = useCallback((active) => {
    hoverRef.current.left = active;
    setLeftHover(active);
  }, []);

  const setRightHoverState = useCallback((active) => {
    hoverRef.current.right = active;
    setRightHover(active);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animationId = 0;
    let width = 0;
    let height = 0;
    let leftParticles = [];
    let rightParticles = [];

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const getLayout = (side) => {
      const scale = height * 0.75;

      if (side === 'left') {
        return { x: width * 0.11, y: height * 0.5, scale };
      }

      return { x: width * 0.89, y: height * 0.5, scale };
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

      leftParticles = [];
      rightParticles = [];
      progressRef.current = { left: 0, right: 0 };
    };

    const syncBrace = (side, shape, particles, progress) => {
      const layout = getLayout(side);
      const ease = prefersReducedMotion ? 1 : 0.1;

      if (particles.length !== shape.length) {
        return shape.map((point, index) =>
          createBraceParticle(point, layout, progress, index)
        );
      }

      return particles.map((particle, index) => {
        const tx = layout.x + (shape[index].nx - 0.5) * layout.scale;
        const ty = layout.y + (shape[index].ny - 0.5) * layout.scale;
        const targetOpacity = progress * 0.88;

        return {
          ...particle,
          tx,
          ty,
          x: particle.x + (tx - particle.x) * ease,
          y: particle.y + (ty - particle.y) * ease,
          opacity: particle.opacity + (targetOpacity - particle.opacity) * ease,
        };
      });
    };

    const drawBrace = (particles) => {
      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.x += p.driftX;
          p.y += p.driftY;

          if (Math.abs(p.x - p.tx) > 5) p.driftX *= -1;
          if (Math.abs(p.y - p.ty) > 5) p.driftY *= -1;
        }

        ctx.fillStyle = `rgba(120, 190, 255, ${p.opacity})`;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      const fadeSpeed = prefersReducedMotion ? 1 : 0.05;

      if (hoverRef.current.left) {
        progressRef.current.left = Math.min(1, progressRef.current.left + fadeSpeed);
      } else {
        progressRef.current.left = Math.max(0, progressRef.current.left - fadeSpeed);
      }

      if (hoverRef.current.right) {
        progressRef.current.right = Math.min(1, progressRef.current.right + fadeSpeed);
      } else {
        progressRef.current.right = Math.max(0, progressRef.current.right - fadeSpeed);
      }

      if (progressRef.current.left > 0.02) {
        leftParticles = syncBrace(
          'left',
          leftShapeRef.current,
          leftParticles,
          progressRef.current.left
        );
        drawBrace(leftParticles);
      } else {
        leftParticles = [];
      }

      if (progressRef.current.right > 0.02) {
        rightParticles = syncBrace(
          'right',
          rightShapeRef.current,
          rightParticles,
          progressRef.current.right
        );
        drawBrace(rightParticles);
      } else {
        rightParticles = [];
      }

      animationId = requestAnimationFrame(tick);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);

  const handleMouseMove = (event) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const ratio = (event.clientX - rect.left) / rect.width;

    setLeftHoverState(ratio < 0.42);
    setRightHoverState(ratio > 0.58);
  };

  const handleMouseLeave = () => {
    setLeftHoverState(false);
    setRightHoverState(false);
  };

  return (
    <div
      ref={containerRef}
      className="msci-hero-brace-layer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="msci-hero-brace-canvas" />
      <div
        className={`msci-hero-brace-zone msci-hero-brace-zone--left ${leftHover ? 'is-active' : ''}`}
      />
      <div
        className={`msci-hero-brace-zone msci-hero-brace-zone--right ${rightHover ? 'is-active' : ''}`}
      />
    </div>
  );
}

export default HeroBraceParticles;
