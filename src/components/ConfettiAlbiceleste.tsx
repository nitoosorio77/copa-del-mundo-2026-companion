import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  w: number;
  h: number;
}

const COLORS = ["#74ACDF", "#FFFFFF", "#74ACDF", "#FFFFFF", "#A8D4F5", "#D0E8F7"];

function makeParticle(canvasWidth: number): Particle {
  return {
    x: Math.random() * canvasWidth,
    y: -10 - Math.random() * 120,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 1.5,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w: Math.random() * 9 + 4,
    h: Math.random() * 4 + 2,
  };
}

export function ConfettiAlbiceleste() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Active through June 19 — stops on June 20
    const deadline = new Date(2026, 5, 20); // month is 0-indexed
    if (new Date() >= deadline) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const BURST_INTERVAL = 550;  // ms between bursts
    const BURST_COUNT = 45;
    const ACTIVE_DURATION = 5500; // ms of active bursting
    const FADE_DURATION = 2500;   // ms to fade out after active phase

    for (let i = 0; i < 160; i++) particles.push(makeParticle(canvas.width));

    const startTime = Date.now();
    let lastBurst = startTime;
    let rafId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Keep spawning during active phase
      if (elapsed < ACTIVE_DURATION && Date.now() - lastBurst > BURST_INTERVAL) {
        for (let i = 0; i < BURST_COUNT; i++) particles.push(makeParticle(canvas.width));
        lastBurst = Date.now();
      }

      const globalAlpha = elapsed > ACTIVE_DURATION
        ? Math.max(0, 1 - (elapsed - ACTIVE_DURATION) / FADE_DURATION)
        : 1;

      let alive = false;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height + 20) {
          particles.splice(i, 1);
          continue;
        }

        alive = true;
        ctx.save();
        ctx.globalAlpha = globalAlpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (alive && globalAlpha > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40 pointer-events-none"
    />
  );
}
