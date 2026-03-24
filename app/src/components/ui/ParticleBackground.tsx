import { useEffect, useRef } from 'react';

interface Props {
  className?: string;
  opacity?: number;
  /** 'network' = connected nodes (default), 'stars' = floating dots only */
  variant?: 'network' | 'stars';
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  colorIdx: number;
  /** depth layer 0–1, used for parallax-style size scaling */
  depth: number;
  pulse: number;
  pulseSpeed: number;
}

const NODE_COLORS = [
  'rgba(37,99,255,',   // blue
  'rgba(34,211,238,',  // cyan
  'rgba(99,102,241,',  // indigo
];

export default function ParticleBackground({
  className = '',
  opacity = 0.45,
  variant = 'network',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let nodes: Node[] = [];
    let frame = 0;

    const isMobile = () => window.innerWidth < 768;
    const nodeCount = () => (isMobile() ? 25 : 60);
    const MAX_DIST = 140;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initNodes();
    }

    function initNodes() {
      if (!canvas) return;
      nodes = Array.from({ length: nodeCount() }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          vx: (Math.random() - 0.5) * (0.18 + depth * 0.22),
          vy: (Math.random() - 0.5) * (0.18 + depth * 0.22),
          r: 0.6 + depth * 2.0,
          colorIdx: Math.floor(Math.random() * NODE_COLORS.length),
          depth,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.012 + Math.random() * 0.018,
        };
      });
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connections
      if (variant === 'network') {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAX_DIST) {
              const fadeDepth = (nodes[i].depth + nodes[j].depth) * 0.5;
              const alpha = (1 - dist / MAX_DIST) * 0.22 * opacity * (0.4 + fadeDepth * 0.6);
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = `rgba(37,99,255,${alpha})`;
              ctx.lineWidth = 0.5 + fadeDepth * 0.4;
              ctx.stroke();
            }
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        const pulseFactor = 1 + 0.22 * Math.sin(n.pulse);
        const r = n.r * pulseFactor;
        const nodeOpacity = (0.45 + n.depth * 0.55) * opacity;

        // Soft glow for larger/brighter nodes
        if (n.depth > 0.6) {
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3.5);
          grd.addColorStop(0, `${NODE_COLORS[n.colorIdx]}${nodeOpacity * 0.35})`);
          grd.addColorStop(1, `${NODE_COLORS[n.colorIdx]}0)`);
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `${NODE_COLORS[n.colorIdx]}${nodeOpacity})`;
        ctx.fill();
      }
    }

    function tick() {
      if (!canvas) return;
      frame++;
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;
        // Wrap around edges softly
        if (n.x < -10) n.x = canvas.width + 10;
        else if (n.x > canvas.width + 10) n.x = -10;
        if (n.y < -10) n.y = canvas.height + 10;
        else if (n.y > canvas.height + 10) n.y = -10;
      }
      // Slight drift correction every 200 frames to keep nodes spread
      if (frame % 200 === 0) {
        for (const n of nodes) {
          if (Math.abs(n.vx) < 0.04) n.vx += (Math.random() - 0.5) * 0.12;
          if (Math.abs(n.vy) < 0.04) n.vy += (Math.random() - 0.5) * 0.12;
        }
      }
      draw();
      animId = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);

    if (!prefersReduced) {
      animId = requestAnimationFrame(tick);
    } else {
      draw();
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [opacity, variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ display: 'block' }}
    />
  );
}
