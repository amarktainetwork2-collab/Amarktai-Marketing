import { useRef, useEffect } from 'react';
import { motion, useTransform } from 'framer-motion';

interface AnimatedBackgroundProps {
  className?: string;
  dotCount?: number;
  size?: number;
  opacity?: number;
  color?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className = '',
  dotCount = 20,
  size = 4,
  opacity = 0.05,
  color = '#ffffff',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const dots: { el: HTMLDivElement; x: number; y: number; vx: number; vy: number }[] = [];

    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.style.position = 'absolute';
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = color;
      dot.style.opacity = `${opacity}`;
      dot.style.pointerEvents = 'none';
      ref.current.appendChild(dot);

      // Random position
      const x = Math.random() * ref.current.clientWidth;
      const y = Math.random() * ref.current.clientHeight;
      // Random velocity
      const vx = (Math.random() - 0.5) * 0.5;
      const vy = (Math.random() - 0.5) * 0.5;

      dots.push({ el: dot, x, y, vx, vy });
    }

    const animate = () => {
      const width = ref.current.clientWidth;
      const height = ref.current.clientHeight;

      for (const dot of dots) {
        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Bounce off edges
        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;

        // Keep within bounds
        dot.x = Math.max(0, Math.min(width, dot.x));
        dot.y = Math.max(0, Math.min(height, dot.y));

        dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px)`;
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Clean up dots
      ref.current.innerHTML = '';
    };
  }, [dotCount, size, opacity, color]);

  return (
    <motion.div
      ref={ref}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    />
  );
};