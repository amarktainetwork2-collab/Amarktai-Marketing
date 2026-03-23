/**
 * AIHeroVisual — premium code-rendered AI orchestration scene.
 * Used in the landing page hero section as the right-side visual.
 */
import { motion } from 'framer-motion';

const ACCENT = '#2563FF';
const CYAN = '#22D3EE';
const INDIGO = '#6366f1';
const SURFACE = 'rgba(11,18,32,0.9)';
const BORDER = 'rgba(37,99,255,0.18)';
const BORDER_BRIGHT = 'rgba(37,99,255,0.4)';

// Central AI brain hub + satellite cards visual
const orbitNodes = [
  { id: 'website',   label: 'Website Intel',     icon: '🌐', angle: -75, r: 130, color: CYAN },
  { id: 'content',   label: 'Content Engine',    icon: '✍️', angle: -15, r: 140, color: ACCENT },
  { id: 'schedule',  label: 'Smart Scheduler',   icon: '📅', angle: 45,  r: 130, color: INDIGO },
  { id: 'publish',   label: 'Auto Publish',      icon: '🚀', angle: 105, r: 140, color: '#10B981' },
  { id: 'analytics', label: 'Analytics',         icon: '📊', angle: 160, r: 130, color: '#F59E0B' },
  { id: 'leads',     label: 'Lead Capture',      icon: '🎯', angle: 220, r: 140, color: '#EC4899' },
];

function deg(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: Math.cos(rad), y: Math.sin(rad) };
}

const CX = 180;
const CY = 180;

// Animated line from center to a node
function OrbitLine({ angle, r }: { angle: number; r: number }) {
  const { x, y } = deg(angle);
  const x2 = CX + x * r;
  const y2 = CY + y * r;
  return (
    <motion.line
      x1={CX} y1={CY} x2={x2} y2={y2}
      stroke={`rgba(37,99,255,0.22)`}
      strokeWidth="1"
      strokeDasharray="4 4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    />
  );
}

export default function AIHeroVisual({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center min-h-[480px] lg:min-h-[560px] ${className}`}>
      {/* Ambient glow layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 rounded-3xl"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(37,99,255,0.10) 0%, transparent 70%)' }} />
        <div className="absolute left-1/4 top-1/4 w-48 h-48 rounded-full blur-3xl opacity-20"
          style={{ background: ACCENT }} />
        <div className="absolute right-1/4 bottom-1/4 w-32 h-32 rounded-full blur-3xl opacity-15"
          style={{ background: CYAN }} />
      </div>

      {/* SVG scene */}
      <svg
        viewBox="0 0 360 360"
        className="relative z-10 w-full max-w-sm sm:max-w-md"
        style={{ filter: 'drop-shadow(0 0 40px rgba(37,99,255,0.18))' }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CYAN} stopOpacity="0.15" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor={CYAN} stopOpacity="0.6" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Orbit ring */}
        <motion.circle
          cx={CX} cy={CY} r={118}
          fill="none"
          stroke="rgba(37,99,255,0.12)"
          strokeWidth="1"
          strokeDasharray="6 6"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.circle
          cx={CX} cy={CY} r={145}
          fill="none"
          stroke="rgba(34,211,238,0.07)"
          strokeWidth="1"
          strokeDasharray="3 9"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />

        {/* Lines from center to nodes */}
        {orbitNodes.map((n) => (
          <OrbitLine key={n.id} angle={n.angle} r={n.r} />
        ))}

        {/* Hub glow */}
        <motion.circle
          cx={CX} cy={CY} r={56}
          fill="url(#hubGrad)"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />

        {/* Animated pulse ring */}
        <motion.circle
          cx={CX} cy={CY} r={56}
          fill="none"
          stroke={`rgba(37,99,255,0.25)`}
          strokeWidth="1.5"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.circle
          cx={CX} cy={CY} r={56}
          fill="none"
          stroke={`rgba(34,211,238,0.18)`}
          strokeWidth="1"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 2.5, delay: 0.8, repeat: Infinity, ease: 'easeOut' }}
        />

        {/* Hub ring */}
        <motion.circle
          cx={CX} cy={CY} r={48}
          fill="rgba(11,18,32,0.95)"
          stroke={`rgba(37,99,255,0.5)`}
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          filter="url(#glow)"
        />

        {/* Central AI text */}
        <motion.text
          x={CX} y={CY - 8}
          textAnchor="middle"
          fill="url(#coreGrad)"
          fontSize="13"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          AI
        </motion.text>
        <motion.text
          x={CX} y={CY + 8}
          textAnchor="middle"
          fill="rgba(255,255,255,0.55)"
          fontSize="6.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1.2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          MARKETING
        </motion.text>
        <motion.text
          x={CX} y={CY + 19}
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="5.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          ENGINE
        </motion.text>

        {/* Satellite nodes */}
        {orbitNodes.map((node, i) => {
          const { x, y } = deg(node.angle);
          const nx = CX + x * node.r;
          const ny = CY + y * node.r;
          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
            >
              {/* Node glow */}
              <circle cx={nx} cy={ny} r={22}
                fill={`${node.color}14`}
              />
              {/* Node circle */}
              <circle cx={nx} cy={ny} r={18}
                fill="rgba(11,18,32,0.95)"
                stroke={`${node.color}55`}
                strokeWidth="1.2"
              />
              {/* Emoji icon */}
              <text x={nx} y={ny + 5} textAnchor="middle" fontSize="11">{node.icon}</text>
              {/* Pulse dot on orbit */}
              <motion.circle
                cx={CX + Math.cos(((node.angle - 6) * Math.PI) / 180) * node.r}
                cy={CY + Math.sin(((node.angle - 6) * Math.PI) / 180) * node.r}
                r="2.5"
                fill={node.color}
                opacity="0.7"
                animate={{
                  cx: [
                    CX + Math.cos(((node.angle - 8) * Math.PI) / 180) * node.r,
                    CX + Math.cos(((node.angle + 8) * Math.PI) / 180) * node.r,
                    CX + Math.cos(((node.angle - 8) * Math.PI) / 180) * node.r,
                  ],
                  cy: [
                    CY + Math.sin(((node.angle - 8) * Math.PI) / 180) * node.r,
                    CY + Math.sin(((node.angle + 8) * Math.PI) / 180) * node.r,
                    CY + Math.sin(((node.angle - 8) * Math.PI) / 180) * node.r,
                  ],
                }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              />
            </motion.g>
          );
        })}
      </svg>

      {/* Floating stat badges */}
      <motion.div
        className="absolute top-4 right-2 sm:right-0"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div className="rounded-xl px-3 py-2 text-xs font-semibold backdrop-blur-md"
          style={{ background: SURFACE, border: `1px solid ${BORDER_BRIGHT}`, color: CYAN }}>
          <span className="opacity-60 font-normal text-white mr-1">Posts/day</span>
          36+
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-0 sm:-left-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <div className="rounded-xl px-3 py-2 text-xs font-semibold backdrop-blur-md"
          style={{ background: SURFACE, border: `1px solid ${BORDER_BRIGHT}`, color: '#10B981' }}>
          <span className="opacity-60 font-normal text-white mr-1">Channels</span>
          12 platforms
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-2 sm:right-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <div className="rounded-xl px-3 py-2 text-xs font-semibold backdrop-blur-md"
          style={{ background: SURFACE, border: `1px solid ${BORDER_BRIGHT}`, color: '#F59E0B' }}>
          <span className="opacity-60 font-normal text-white mr-1">Automation</span>
          100%
        </div>
      </motion.div>
    </div>
  );
}

// Also export the inline CSS vars used for parent container
export { SURFACE, BORDER };
