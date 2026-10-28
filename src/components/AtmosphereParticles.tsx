import React, { useEffect, useRef } from 'react';

interface AtmosphereParticlesProps {
  enabled?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  baseOpacity: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
}

export const AtmosphereParticles: React.FC<AtmosphereParticlesProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create 45 ambient dust motes
    const particleColors = [
      'rgba(198, 161, 91,', // Antique gold
      'rgba(241, 230, 207,', // Warm parchment
      'rgba(121, 92, 55,',   // Muted bronze
      'rgba(255, 241, 208,'  // Golden glow
    ];

    const particles: Particle[] = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -Math.random() * 0.45 - 0.1, // gently rising
      baseOpacity: Math.random() * 0.35 + 0.15,
      opacity: 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulsePhase: Math.random() * Math.PI * 2,
      color: particleColors[Math.floor(Math.random() * particleColors.length)]
    }));

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX * (delta * 60);
        p.y += p.speedY * (delta * 60);
        p.pulsePhase += p.pulseSpeed;
        p.opacity = p.baseOpacity * (0.6 + 0.4 * Math.sin(p.pulsePhase));

        // Wrap edges smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Draw soft glowing mote
        ctx.beginPath();
        const rad = p.size;
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.opacity})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(198, 161, 91, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
