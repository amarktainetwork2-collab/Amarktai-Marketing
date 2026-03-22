import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import {
  Zap, BarChart3, Shield, Clock,
  Check, ChevronRight, Sparkles,
  Brain, Globe, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';
import ParticleBackground from '@/components/ui/ParticleBackground';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT_CURVE } },
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};
const staggerContainer = (stagger = 0.1, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_OUT_CURVE } },
};

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

const BG = '#05070B';
const SURFACE = '#0B1220';
const GLASS = 'rgba(15,23,42,0.72)';
const BORDER = 'rgba(255,255,255,0.08)';
const ACCENT = '#2563FF';
const CYAN = '#22D3EE';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';
const SUB = '#CBD5E1';

const trustPoints = [
  {
    icon: <Brain className="w-5 h-5" />,
    title: 'AI-Powered, Always On',
    description: 'Generates 3 content batches daily across all 12 platforms. Zero manual effort required.',
    color: ACCENT,
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: '12 Platforms, One Control Room',
    description: 'YouTube, TikTok, Instagram, LinkedIn and more — native content for every algorithm.',
    color: CYAN,
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'You Stay in Control',
    description: 'Full approval queue before anything goes live. Edit, approve or reject in one click.',
    color: '#6D5DF6',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Self-Optimizing Intelligence',
    description: 'Analytics, lead capture, A/B testing and competitor intel — all running autonomously.',
    color: ACCENT,
  },
];

const platforms = [
  'YouTube', 'TikTok', 'Instagram', 'Facebook',
  'X / Twitter', 'LinkedIn', 'Pinterest', 'Reddit',
  'Bluesky', 'Threads', 'Telegram', 'Snapchat',
];

const highlights = [
  { icon: Clock, label: '3× Daily Content', sub: 'Auto-generated batches' },
  { icon: BarChart3, label: 'Live Analytics', sub: 'Per-platform insights' },
  { icon: Shield, label: 'Approval Queue', sub: 'Full editorial control' },
  { icon: Brain, label: 'AI Lead Scoring', sub: '0–100 priority scores' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: TEXT }}>
      <PublicNav activePath="/" />

      {/* Hero */}
      <section className="relative pt-36 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ParticleBackground opacity={0.32} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 90% 65% at 50% -10%, rgba(37,99,255,0.22) 0%, transparent 68%)` }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{ backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.12, 0.05)} initial="hidden" animate="show">
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(37,99,255,0.12)', border: `1px solid rgba(37,99,255,0.3)`, color: '#93c5fd' }}>
              <Sparkles className="w-3.5 h-3.5" />
              Amarktai Network — AI Marketing Platform
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
              style={{ color: TEXT }}>
              Autonomous AI Marketing
              <br />
              <span style={{
                background: `linear-gradient(90deg, ${ACCENT} 0%, ${CYAN} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                That Scales Itself
              </span>
            </motion.h1>

            <motion.p variants={fadeUp}
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: SUB }}>
              Create, schedule, optimise, and scale content across 12 platforms — entirely on autopilot.
              Your AI marketing team, running 24/7 from day one.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link to="/register">
                <Button size="lg" className="px-9 font-semibold text-base h-12"
                  style={{ background: ACCENT, color: '#fff', boxShadow: `0 0 24px rgba(37,99,255,0.35)` }}>
                  Start Free — 7 Days
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="px-9 font-medium text-base h-12"
                  style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                  Explore Features
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: MUTED }}>
              {['7-day free trial', 'No credit card required', 'Cancel anytime'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust / Value Snapshot */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT }}>
              Why teams choose Amarktai Marketing
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: MUTED }}>
              Built for founders, marketers, and growing teams who need results without the overhead.
            </p>
          </motion.div>
          <motion.div variants={staggerContainer(0.08)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustPoints.map((t) => (
              <motion.div key={t.title} variants={fadeUp}
                className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${t.color}1A`, color: t.color }}>
                  {t.icon}
                </div>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: TEXT }}>{t.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{t.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Product Highlight */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
              style={{ background: 'rgba(34,211,238,0.10)', border: `1px solid rgba(34,211,238,0.25)`, color: CYAN }}>
              Platform Overview
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: TEXT }}>
              Every Platform. One Intelligence.
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: MUTED }}>
              Post natively to 12 platforms simultaneously. Each piece of content is generated and optimised for that platform's audience and algorithm.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer(0.04)} className="flex flex-wrap justify-center gap-3 mb-14">
            {platforms.map((p) => (
              <motion.div key={p} variants={scaleIn}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: GLASS, border: `1px solid ${BORDER}`, color: SUB, backdropFilter: 'blur(12px)' }}>
                {p}
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={staggerContainer(0.07)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <motion.div key={h.label} variants={fadeUp}
                  className="rounded-2xl p-5 flex flex-col items-center text-center"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(37,99,255,0.12)', color: ACCENT }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-sm mb-1" style={{ color: TEXT }}>{h.label}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{h.sub}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div variants={fadeUp} className="text-center mt-10">
            <Link to="/features">
              <Button variant="outline" className="font-medium"
                style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                See all features
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.1)}
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(37,99,255,0.16) 0%, rgba(34,211,238,0.09) 100%)`,
              border: `1px solid rgba(37,99,255,0.28)`,
              boxShadow: `0 0 60px rgba(37,99,255,0.09)`,
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse 80% 60% at 50% 110%, rgba(37,99,255,0.14) 0%, transparent 70%)` }} />
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 relative"
              style={{ background: 'rgba(37,99,255,0.12)', border: `1px solid rgba(37,99,255,0.3)`, color: '#93c5fd' }}>
              <Zap className="w-3.5 h-3.5" />
              7-Day Free Trial — No Card Required
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4 relative" style={{ color: TEXT }}>
              Ready to automate your marketing?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg mb-8 relative max-w-lg mx-auto" style={{ color: MUTED }}>
              Join businesses already using Amarktai Marketing to generate, schedule, and scale their content across every platform — while they focus on building.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Link to="/register">
                <Button size="lg" className="px-10 font-semibold text-base"
                  style={{ background: ACCENT, color: '#fff', boxShadow: `0 0 20px rgba(37,99,255,0.3)` }}>
                  Start Free
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="px-10 font-medium text-base"
                  style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                  Contact Us
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      <PublicFooter />
    </div>
  );
}
