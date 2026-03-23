/**
 * AIDashboardMock — a polished code-rendered mock of the AI marketing dashboard.
 * Used as a visual showcase on the landing page.
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ACCENT = '#2563FF';
const CYAN = '#22D3EE';
const GREEN = '#10B981';
const AMBER = '#F59E0B';
const SURFACE = 'rgba(11,18,32,0.92)';
const SURFACE2 = 'rgba(7,12,22,0.95)';
const BORDER = 'rgba(37,99,255,0.15)';
const BORDER2 = 'rgba(255,255,255,0.06)';
const TEXT = '#F8FAFC';
const MUTED = 'rgba(148,163,184,0.7)';

const PLATFORMS = [
  { name: 'Instagram', color: '#E1306C', icon: '📸', posts: 4, status: 'live' },
  { name: 'LinkedIn',  color: '#0A66C2', icon: '💼', posts: 3, status: 'live' },
  { name: 'Twitter/X', color: '#1DA1F2', icon: '🐦', posts: 5, status: 'live' },
  { name: 'Facebook',  color: '#1877F2', icon: '👥', posts: 3, status: 'live' },
  { name: 'TikTok',    color: '#69C9D0', icon: '🎵', posts: 2, status: 'live' },
  { name: 'YouTube',   color: '#FF0000', icon: '▶️', posts: 1, status: 'live' },
];

const STATS = [
  { label: 'Posts Today',   value: '12',   delta: '+4',   color: ACCENT },
  { label: 'Total Reach',   value: '8.4K',  delta: '+22%', color: CYAN },
  { label: 'Engagement',    value: '3.7%',  delta: '+0.9%',color: GREEN },
  { label: 'AI Tasks Done', value: '47',    delta: 'today', color: AMBER },
];

const QUEUE_ITEMS = [
  { platform: '📸', text: 'New product spotlight for summer collection...', time: '9:00 AM',  color: '#E1306C', status: 'approved' },
  { platform: '💼', text: 'Industry insight: How AI is reshaping content...', time: '12:00 PM', color: '#0A66C2', status: 'pending' },
  { platform: '🐦', text: 'Quick tip for boosting engagement on socials...', time: '1:30 PM',  color: '#1DA1F2', status: 'approved' },
  { platform: '👥', text: 'Behind the scenes: Our team\'s creative process...', time: '6:00 PM', color: '#1877F2', status: 'generating' },
];

export default function AIDashboardMock({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Outer glow */}
      <div className="absolute -inset-4 rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(37,99,255,0.08) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background: SURFACE2, border: `1px solid ${BORDER}`, boxShadow: '0 0 0 1px rgba(37,99,255,0.08), 0 32px 64px rgba(0,0,0,0.5)' }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3"
          style={{ background: 'rgba(5,7,11,0.95)', borderBottom: `1px solid ${BORDER2}` }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-70" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs font-medium" style={{ color: MUTED }}>AmarktAI Marketing — Dashboard</span>
          </div>
          <div className="flex items-center gap-1">
            <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-xs" style={{ color: GREEN }}>Live</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="rounded-xl p-3"
                style={{ background: SURFACE, border: `1px solid ${BORDER2}` }}
              >
                <p className="text-xs mb-1" style={{ color: MUTED }}>{s.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-md"
                    style={{ background: `${s.color}18`, color: s.color }}>{s.delta}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Platform connections */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-xl p-3"
            style={{ background: SURFACE, border: `1px solid ${BORDER2}` }}
          >
            <p className="text-xs font-semibold mb-2.5" style={{ color: TEXT }}>Connected Platforms</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PLATFORMS.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                    style={{ background: `${p.color}1a`, border: `1px solid ${p.color}44` }}>
                    {p.icon}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-1 h-1 rounded-full" style={{ background: GREEN }} />
                    <span style={{ fontSize: 9, color: MUTED }}>{p.posts}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Content queue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl p-3"
            style={{ background: SURFACE, border: `1px solid ${BORDER2}` }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-semibold" style={{ color: TEXT }}>Today's Queue</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${ACCENT}1a`, color: ACCENT }}>12 posts</span>
            </div>
            <div className="space-y-2">
              {QUEUE_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                  transition={{ delay: 0.65 + i * 0.07 }}
                  className="flex items-center gap-2.5 py-1.5"
                  style={{ borderBottom: i < QUEUE_ITEMS.length - 1 ? `1px solid ${BORDER2}` : 'none' }}
                >
                  <span className="text-base shrink-0">{item.platform}</span>
                  <p className="flex-1 text-xs truncate" style={{ color: MUTED }}>{item.text}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>{item.time}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: item.status === 'approved' ? `${GREEN}1a`
                          : item.status === 'generating' ? `${CYAN}1a` : `${AMBER}1a`,
                        color: item.status === 'approved' ? GREEN
                          : item.status === 'generating' ? CYAN : AMBER,
                      }}>
                      {item.status === 'generating' ? (
                        <span className="flex items-center gap-1">
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >●</motion.span>
                          AI generating
                        </span>
                      ) : item.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mini bar chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.75 }}
            className="rounded-xl p-3"
            style={{ background: SURFACE, border: `1px solid ${BORDER2}` }}
          >
            <p className="text-xs font-semibold mb-3" style={{ color: TEXT }}>7-Day Reach</p>
            <div className="flex items-end gap-1.5 h-12">
              {[42, 58, 51, 73, 65, 88, 94].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  initial={{ scaleY: 0 }}
                  animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ delay: 0.8 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                  custom={h}
                  style={{
                    height: `${h}%`,
                    background: i === 6 ? `linear-gradient(180deg, ${CYAN}, ${ACCENT})` : `${ACCENT}30`,
                    borderRadius: '2px 2px 0 0',
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: i === 6 ? ACCENT : MUTED }}>{d}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
