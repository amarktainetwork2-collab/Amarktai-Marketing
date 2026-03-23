/**
 * AIWorkflowVisual — horizontal flow diagram showing the autonomous marketing pipeline.
 * website → intelligence → content → schedule → publish → optimize
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ACCENT = '#2563FF';
const CYAN = '#22D3EE';
const SURFACE = 'rgba(11,18,32,0.85)';
const BORDER = 'rgba(37,99,255,0.22)';

interface Step {
  icon: string;
  label: string;
  sub: string;
  color: string;
  glow: string;
}

const STEPS: Step[] = [
  { icon: '🌐', label: 'Website Scan',    sub: 'Brand + product\nknowledge extracted',  color: ACCENT,    glow: 'rgba(37,99,255,0.22)' },
  { icon: '🧠', label: 'AI Analysis',     sub: 'Voice, audience +\nstrategy built',      color: CYAN,      glow: 'rgba(34,211,238,0.20)' },
  { icon: '✍️', label: 'Content Built',   sub: '12 channels,\nplatform-native posts',    color: '#6366f1', glow: 'rgba(99,102,241,0.22)' },
  { icon: '📅', label: 'Auto Scheduled',  sub: 'Optimal slots\nacross time zones',        color: '#10B981', glow: 'rgba(16,185,129,0.20)' },
  { icon: '🚀', label: 'Published',       sub: 'Morning, midday\n+ evening batches',      color: '#F59E0B', glow: 'rgba(245,158,11,0.20)' },
  { icon: '📈', label: 'Optimised',       sub: 'AI learns from\nevery result',            color: '#EC4899', glow: 'rgba(236,72,153,0.20)' },
];

export default function AIWorkflowVisual({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-64 h-32 rounded-full blur-3xl opacity-15"
          style={{ background: ACCENT }} />
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-48 h-28 rounded-full blur-3xl opacity-12"
          style={{ background: CYAN }} />
      </div>

      <div className="relative overflow-x-auto pb-4 -mx-2 px-2">
        {/* Desktop: horizontal row */}
        <div className="hidden sm:flex items-center gap-0 min-w-max mx-auto justify-center">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center">
              {/* Step card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                className="flex flex-col items-center text-center"
                style={{ width: 110 }}
              >
                {/* Icon bubble */}
                <div className="relative mb-3">
                  <div className="absolute inset-0 rounded-2xl blur-md opacity-60"
                    style={{ background: step.glow }} />
                  <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{
                      background: SURFACE,
                      border: `1.5px solid ${step.color}55`,
                      boxShadow: `0 0 0 4px ${step.glow}`,
                    }}>
                    {step.icon}
                  </div>
                  {/* Step number */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ background: step.color, color: '#fff' }}>
                    {i + 1}
                  </div>
                </div>
                <p className="text-xs font-semibold mb-1" style={{ color: step.color }}>{step.label}</p>
                <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'rgba(203,213,225,0.6)' }}>{step.sub}</p>
              </motion.div>

              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <motion.div
                  className="flex items-center mx-1"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={inView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.1, ease: 'easeOut' }}
                  style={{ transformOrigin: 'left' }}
                >
                  <div style={{ width: 28, height: 1.5, background: `linear-gradient(90deg, ${STEPS[i].color}70, ${STEPS[i+1].color}70)`, borderRadius: 1 }} />
                  <div style={{
                    width: 0, height: 0,
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                    borderLeft: `6px solid ${STEPS[i+1].color}80`,
                    marginLeft: -1,
                  }} />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: 2×3 grid */}
        <div className="sm:hidden grid grid-cols-3 gap-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.45, delay: 0.08 * i }}
              className="flex flex-col items-center text-center p-3 rounded-2xl"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <div className="text-xl mb-1.5">{step.icon}</div>
              <p className="text-xs font-semibold leading-tight" style={{ color: step.color }}>{step.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom live indicator */}
      <motion.div
        className="mt-6 flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.9 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: '#10B981' }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <span className="text-xs font-medium" style={{ color: 'rgba(203,213,225,0.65)' }}>
          Runs automatically — zero manual input required after setup
        </span>
      </motion.div>
    </div>
  );
}
