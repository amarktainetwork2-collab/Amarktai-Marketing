import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import { Zap, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';
import ParticleBackground from '@/components/ui/ParticleBackground';

const BG = '#05070B';
const SURFACE = '#0B1220';
const BORDER = 'rgba(255,255,255,0.08)';
const ACCENT = '#2563FF';
const CYAN = '#22D3EE';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';
const SUB = '#CBD5E1';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT_CURVE } },
};
const staggerContainer = (stagger = 0.1, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

type BadgeVariant = 'live' | 'coming-soon' | 'api-key';

interface Feature {
  emoji: string;
  title: string;
  description: string;
  badge: BadgeVariant;
}

const features: Feature[] = [
  {
    emoji: '🧠',
    title: 'Business Intelligence',
    description: 'AI scrapes your website and learns your brand, products, services, tone of voice, and target audience automatically. Updated whenever your business changes.',
    badge: 'live',
  },
  {
    emoji: '✍️',
    title: 'AI Content Generation',
    description: 'Platform-native posts, captions, scripts, and threads generated 3× daily for all 12 social channels. Each piece is tailored for that platform\'s audience and format.',
    badge: 'live',
  },
  {
    emoji: '🖼️',
    title: 'Media Ingestion',
    description: 'Upload your brand assets, product images, and videos. The AI incorporates your media into generated content automatically.',
    badge: 'live',
  },
  {
    emoji: '🔗',
    title: 'Social Page Management',
    description: 'Connect all 12 platforms via OAuth. Manage every account, bio, and linked page from a single dashboard.',
    badge: 'live',
  },
  {
    emoji: '🚀',
    title: 'Autonomous Posting',
    description: 'Approved content is published automatically at the optimal time for each platform. Morning, midday, and evening batches keep your presence consistent.',
    badge: 'live',
  },
  {
    emoji: '📅',
    title: 'Scheduler',
    description: 'View and manage your full content calendar. Reschedule, edit, or queue additional posts manually at any time.',
    badge: 'live',
  },
  {
    emoji: '🎯',
    title: 'Lead Generation',
    description: 'AI captures leads from social comments, link clicks, and UTM-tracked campaigns. Every lead is scored 0–100 for priority and added to your pipeline.',
    badge: 'coming-soon',
  },
  {
    emoji: '💬',
    title: 'Engagement Handling',
    description: 'AI monitors comments and messages across all platforms, drafts contextual replies, and flags high-priority interactions for your review.',
    badge: 'coming-soon',
  },
  {
    emoji: '📊',
    title: 'Analytics & Optimisation',
    description: 'Deep per-platform analytics tracking views, engagement, click-through rates, and conversions. Requires connecting each platform\'s API key for full data access.',
    badge: 'api-key',
  },
  {
    emoji: '🔄',
    title: 'Self-Learning',
    description: 'The AI analyses performance data from every post and continuously refines your content strategy — improving tone, timing, format, and topic selection over time.',
    badge: 'coming-soon',
  },
];

const badgeConfig: Record<BadgeVariant, { label: string; bg: string; color: string; border: string }> = {
  'live': { label: 'Live', bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.3)' },
  'coming-soon': { label: 'Coming Soon', bg: 'rgba(251,191,36,0.10)', color: '#FBBF24', border: 'rgba(251,191,36,0.25)' },
  'api-key': { label: 'Requires API Key', bg: 'rgba(109,93,246,0.12)', color: '#A78BFA', border: 'rgba(109,93,246,0.3)' },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: TEXT }}>
      <PublicNav activePath="/features" />

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ParticleBackground opacity={0.3} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,255,0.18) 0%, transparent 70%)` }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.12, 0.05)} initial="hidden" animate="show">
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(37,99,255,0.12)', border: `1px solid rgba(37,99,255,0.3)`, color: '#93c5fd' }}>
              <Sparkles className="w-3.5 h-3.5" />
              Platform Capabilities
            </motion.div>
            <motion.h1 variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6"
              style={{ color: TEXT }}>
              Everything Your Marketing Needs,
              <br />
              <span style={{ background: `linear-gradient(90deg, ${ACCENT}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Handled Automatically
              </span>
            </motion.h1>
            <motion.p variants={fadeUp}
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: SUB }}>
              A complete AI marketing platform that creates, schedules, and publishes content across 12 channels — fully autonomous.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="px-8 font-semibold text-base" style={{ background: ACCENT, color: '#fff' }}>
                  Start Free — 7 Days
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="px-8 font-medium text-base"
                  style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                  View Pricing
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Badge legend */}
      <Section className="pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {(Object.entries(badgeConfig) as [BadgeVariant, typeof badgeConfig[BadgeVariant]][]).map(([, cfg]) => (
              <span key={cfg.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {cfg.label}
              </span>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Features list */}
      <Section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={staggerContainer(0.06)} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const badge = badgeConfig[f.badge];
              return (
                <motion.div key={f.title} variants={fadeUp}
                  className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" role="img" aria-label={f.title}>{f.emoji}</span>
                      <h3 className="font-semibold text-sm" style={{ color: TEXT }}>{f.title}</h3>
                    </div>
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{f.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.1)}
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(37,99,255,0.15) 0%, rgba(34,211,238,0.08) 100%)`,
              border: `1px solid rgba(37,99,255,0.25)`,
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse 80% 60% at 50% 100%, rgba(37,99,255,0.12) 0%, transparent 70%)` }} />
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 relative"
              style={{ background: 'rgba(37,99,255,0.12)', border: `1px solid rgba(37,99,255,0.3)`, color: '#93c5fd' }}>
              <Zap className="w-3.5 h-3.5" />
              7-Day Free Trial — No Card Required
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4 relative" style={{ color: TEXT }}>
              Ready to see it in action?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg mb-8 relative" style={{ color: MUTED }}>
              Start your 7-day free trial — full platform access from day one.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Link to="/register">
                <Button size="lg" className="px-10 font-semibold text-base" style={{ background: ACCENT, color: '#fff' }}>
                  Start Free — 7 Days
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="px-10 font-medium text-base"
                  style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                  View Pricing
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
