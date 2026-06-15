import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export default function CelestialBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create stars
    function createStars() {
      stars = [];
      const count = Math.floor((canvas!.width * canvas!.height) / 3000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.7 + 0.3,
          speed: Math.random() * 0.3 + 0.1,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    }
    createStars();

    let time = 0;
    function animate() {
      if (!ctx || !canvas) return;
      time++;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(26, 21, 37, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;

        // Slow upward drift
        star.y -= star.speed * 0.05;
        if (star.y < -10) {
          star.y = canvas.height + 10;
          star.x = Math.random() * canvas.width;
        }

        const opacity = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        // Gradient glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
        gradient.addColorStop(0, `rgba(240, 230, 246, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(196, 155, 187, ${opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(196, 155, 187, 0)');

        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw a few larger "special" stars every few frames
      if (time % 120 === 0 && stars.length > 0) {
        const luckyStar = stars[Math.floor(Math.random() * stars.length)];
        luckyStar.opacity = Math.min(1, luckyStar.opacity + 0.5);
        setTimeout(() => { luckyStar.opacity = Math.max(0.3, luckyStar.opacity - 0.5); }, 2000);
      }

      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
