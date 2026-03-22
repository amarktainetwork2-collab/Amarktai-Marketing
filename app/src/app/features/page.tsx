import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import {
  Zap, BarChart3, Shield, Clock, Globe,
  ChevronRight, Shuffle, Search, MessageSquarePlus,
  RefreshCw, TrendingUp, FlaskConical, Sparkles,
  Brain, Layers, Target, Users, ArrowRight,
} from 'lucide-react';
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
const GLASS = 'rgba(15,23,42,0.72)';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT_CURVE } },
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

const coreFeatures = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'AI-Powered Content',
    description: 'AI Engine generates platform-native posts, scripts and captions for all 12 channels — 3× daily.',
    color: ACCENT,
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: '3× Daily Automation',
    description: 'Morning, midday and evening content batches generated and queued for approval automatically.',
    color: CYAN,
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: '12 Platforms, One Dashboard',
    description: 'Manage YouTube, TikTok, Instagram, Facebook, X, LinkedIn, Pinterest, Reddit, Bluesky, Threads, Telegram and Snapchat.',
    color: '#6D5DF6',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Deep Analytics',
    description: 'Track views, engagement, and conversions with per-platform analytics. AI learns your best posting windows.',
    color: ACCENT,
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Full Control',
    description: 'Approve, edit, or reject any content before it goes live. Rejected posts are instantly regenerated.',
    color: CYAN,
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: 'Self-Optimizing',
    description: 'AI learns from performance data and continuously improves your content strategy over time.',
    color: '#6D5DF6',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Lead Capture & Scoring',
    description: 'Auto-capture leads from social comments and UTM links. AI scores every lead 0–100 for prioritization.',
    color: ACCENT,
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: 'SEO Blog Generator',
    description: 'Generate long-form SEO blog posts to drive organic traffic, then remix them into social posts.',
    color: CYAN,
  },
];

const howItWorks = [
  { step: '01', title: 'Add Your Business', description: 'Add up to 20 businesses. The AI instantly scrapes your website for context and starts learning your brand voice.' },
  { step: '02', title: 'Connect Your Platforms', description: 'Connect social accounts with OAuth. AI audits each account, detects followers, and configures optimal posting schedules.' },
  { step: '03', title: 'Approve & Publish', description: 'Review AI-generated content in one click. Rejected posts are instantly regenerated. Approved posts go live autonomously.' },
  { step: '04', title: 'Scale Your Growth', description: 'UTM-tracked links, comment-to-lead capture, and AI-scored leads fill your pipeline daily on autopilot.' },
];

const powerTools = [
  { icon: Shuffle, title: 'Content Remix Engine', description: 'Remix any blog or URL into 12-platform snippets with trending hashtags.' },
  { icon: Search, title: 'Competitor Shadow Analyzer', description: 'Nightly competitor scraping. Spot content gaps and get AI counter-strategies.' },
  { icon: MessageSquarePlus, title: 'Feedback Alchemy', description: 'Transform reviews into ad copy, response templates and A/B test ideas.' },
  { icon: RefreshCw, title: 'Social Echo Amplifier', description: 'Turn visitor queries into amplified social threads ranked by virality score.' },
  { icon: TrendingUp, title: 'Viral Spark Igniter', description: 'Daily viral opportunity report with hooks, challenges and optimal posting windows.' },
  { icon: FlaskConical, title: 'Ad Alchemy Optimizer', description: 'Generate 3 A/B ad copy variants, score against global benchmarks, pick the winner.' },
];

const platforms = [
  'YouTube', 'TikTok', 'Instagram', 'Facebook',
  'X / Twitter', 'LinkedIn', 'Pinterest', 'Reddit',
  'Bluesky', 'Threads', 'Telegram', 'Snapchat',
];

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
              Everything you need to
              <br />
              <span style={{ background: `linear-gradient(90deg, ${ACCENT}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                dominate every platform
              </span>
            </motion.h1>
            <motion.p variants={fadeUp}
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: SUB }}>
              One AI-powered platform that creates, schedules, optimises, and scales your marketing across 12 channels — fully autonomous.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="px-8 font-semibold text-base" style={{ background: ACCENT, color: '#fff' }}>
                  Start Free Trial
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

      {/* Core Features */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
              style={{ background: 'rgba(37,99,255,0.10)', border: `1px solid rgba(37,99,255,0.25)`, color: '#93c5fd' }}>
              Core Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: TEXT }}>
              Built for autonomous marketing
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
              Everything you need to generate, schedule, and scale content across every platform — without lifting a finger.
            </p>
          </motion.div>
          <motion.div variants={staggerContainer(0.07)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreFeatures.map((f) => (
              <motion.div key={f.title} variants={fadeUp}
                className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}1A`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: TEXT }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Platform list */}
      <Section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT }}>
              Every Platform. One Intelligence.
            </h2>
            <p className="text-base" style={{ color: MUTED }}>
              Native content for all 12 major platforms — each optimised for its own algorithm.
            </p>
          </motion.div>
          <motion.div variants={staggerContainer(0.04)} className="flex flex-wrap justify-center gap-3">
            {platforms.map((p) => (
              <motion.div key={p} variants={scaleIn}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: GLASS, border: `1px solid ${BORDER}`, color: SUB, backdropFilter: 'blur(12px)' }}>
                {p}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* How It Works */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
              style={{ background: 'rgba(34,211,238,0.10)', border: `1px solid rgba(34,211,238,0.25)`, color: CYAN }}>
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: TEXT }}>
              From setup to scale in four steps
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
              Get up and running in minutes. The AI does the rest.
            </p>
          </motion.div>
          <motion.div variants={staggerContainer(0.1)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step) => (
              <motion.div key={step.step} variants={fadeUp}>
                <div className="rounded-2xl p-6 h-full"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div className="text-3xl font-black mb-4"
                    style={{ background: `linear-gradient(90deg, ${ACCENT}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {step.step}
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: TEXT }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Intelligence Suite */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
              style={{ background: 'rgba(109,93,246,0.12)', border: `1px solid rgba(109,93,246,0.3)`, color: '#a78bfa' }}>
              <Layers className="w-3.5 h-3.5" />
              Intelligence Suite
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: TEXT }}>
              Six AI engines working for you
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
              Beyond content generation — a full marketing intelligence layer that operates 24/7.
            </p>
          </motion.div>
          <motion.div variants={staggerContainer(0.07)} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {powerTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div key={tool.title} variants={fadeUp}
                  className="rounded-2xl p-5 flex gap-4 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(37,99,255,0.12)', color: ACCENT }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm" style={{ color: TEXT }}>{tool.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{tool.description}</p>
                  </div>
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
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4 relative" style={{ color: TEXT }}>
              Ready to see it in action?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg mb-8 relative" style={{ color: MUTED }}>
              Start your 7-day free trial — no credit card required. Full platform access from day one.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Link to="/register">
                <Button size="lg" className="px-10 font-semibold text-base" style={{ background: ACCENT, color: '#fff' }}>
                  Start Free
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
