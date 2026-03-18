import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import {
  Zap, BarChart3, Shield, Clock, Globe,
  Check, ChevronRight, Star, Menu, X,
  Shuffle, Search, MessageSquarePlus, RefreshCw,
  TrendingUp, Users, FlaskConical, Sparkles,
  Brain, Layers, Target, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedBackground } from '@/components/AnimatedBackground';

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
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Data (same as landing page) ─────────────────────────────────────────────────────
const features = [
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

const powerTools = [
  { icon: Shuffle,          title: 'Content Remix Engine',       description: 'Remix any blog or URL into 12-platform snippets with trending hashtags.' },
  { icon: Search,           title: 'Competitor Shadow Analyzer',  description: 'Nightly competitor scraping. Spot content gaps and get AI counter-strategies.' },
  { icon: MessageSquarePlus,title: 'Feedback Alchemy',            description: 'Transform reviews into ad copy, response templates and A/B test ideas.' },
  { icon: RefreshCw,        title: 'Social Echo Amplifier',       description: 'Turn visitor queries into amplified social threads ranked by virality score.' },
  { icon: TrendingUp,       title: 'Viral Spark Igniter',         description: 'Daily viral opportunity report with hooks, challenges and optimal posting windows.' },
  { icon: FlaskConical,     title: 'Ad Alchemy Optimizer',        description: 'Generate 3 A/B ad copy variants, score against global benchmarks, pick the winner.' },
];

const howItWorks = [
  { step: '01', title: 'Add Your Business',      description: 'Add up to 20 businesses. The AI instantly scrapes your website for context and starts learning your brand voice.' },
  { step: '02', title: 'Connect Your Platforms', description: 'Connect social accounts with OAuth. AI audits each account, detects followers, and configures optimal posting schedules.' },
  { step: '03', title: 'Approve & Publish',      description: 'Review AI-generated content in one click. Rejected posts are instantly regenerated. Approved posts go live autonomously.' },
  { step: '04', title: 'Scale Your Growth',      description: 'UTM-tracked links, comment-to-lead capture, and AI-scored leads fill your pipeline daily on autopilot.' },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Founder, TaskFlow Pro',
    content: 'Amarktai Marketing transformed our social media presence. We went from 2 posts a week to 12 posts a day across all platforms. Traffic increased 340% in just 3 months.',
    avatar: 'SC',
  },
  {
    name: 'Marcus Johnson',
    role: 'CEO, CodeSnippet',
    content: 'The AI-generated content understands our product and creates engaging posts that resonate with developers. Best marketing investment we\'ve made.',
    avatar: 'MJ',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Director, SaaSify',
    content: 'I used to spend 20+ hours a week on social media. Now I spend 15 minutes each morning reviewing content. The ROI is extraordinary.',
    avatar: 'ER',
  },
];

const stats = [
  { value: '12', label: 'Platforms supported', suffix: '' },
  { value: '3×', label: 'Daily content batches', suffix: '' },
  { value: '20', label: 'Businesses per account', suffix: '' },
  { value: '100%', label: 'Autonomous operation', suffix: '' },
];

const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    period: '/mo',
    description: 'Perfect for indie founders getting started.',
    features: [
      '2 Web Apps',
      '5 Social Platforms',
      '3 posts per day',
      'AI content generation',
      'Basic analytics',
      'Email support',
    ],
    highlighted: false,
    cta: 'Start 7-Day Trial',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    period: '/mo',
    description: 'The full platform for growing teams.',
    features: [
      '10 Web Apps',
      'All 12 Platforms',
      '12 posts per day',
      'Advanced AI Engine',
      'A/B testing & optimization',
      'Lead capture & scoring',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Start 7-Day Trial',
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    period: '/mo',
    description: 'Unlimited scale for agencies and enterprises.',
    features: [
      'Unlimited Web Apps',
      'All 12 Platforms',
      '36 posts per day',
      'Premium AI with full stack',
      'Team collaboration (5 seats)',
      'White-label options',
      'Dedicated support',
    ],
    highlighted: false,
    cta: 'Start 7-Day Trial',
  },
];

export default function FeaturesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: TEXT }}>
      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT_CURVE }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(5,7,11,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${CYAN} 100%)` }}
              >
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold" style={{ color: TEXT }}>Amarktai</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'Features', to: '/features' },
                { label: 'Pricing', to: '/pricing' },
                { label: 'Contact Us', to: '/contact' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm font-medium transition-colors"
                  style={{ color: SUB }}
                  onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                  onMouseLeave={e => (e.currentTarget.style.color = SUB)}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-sm" style={{ color: SUB }}>
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="sm"
                  className="text-sm font-semibold"
                  style={{ background: ACCENT, color: '#fff' }}
                >
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: SUB }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
            style={{ background: SURFACE, borderTop: `1px solid ${BORDER}` }}
          >
            <div className="px-4 py-5 space-y-4">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'Features', to: '/features' },
                { label: 'Pricing', to: '/pricing' },
                { label: 'Contact Us', to: '/contact' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="block text-sm font-medium py-1"
                  style={{ color: SUB }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 flex flex-col gap-2 border-t" style={{ borderColor: BORDER }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full" style={{ color: SUB }}>Login</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full font-semibold" style={{ background: ACCENT, color: '#fff' }}>
                    Start Free
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* ── Page Content ──────────────────────────────────────────────────── */}
      <main className="pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative pt-20 pb-20">
          <AnimatedBackground dotCount={30} size={3} opacity={0.03} color={ACCENT} />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div variants={staggerContainer(0.12, 0.05)} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                style={{ background: 'rgba(37,99,255,0.12)', border: `1px solid rgba(37,99,255,0.3)`, color: '#93c5fd' }}
              >
                Amarktai Network — AI Marketing Platform
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold leading-[1.1] mb-6" style={{ color: TEXT }}>
                The Complete AI Marketing Platform
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: SUB }}>
                Everything you need to generate, schedule, optimize, and scale content across every platform — autonomously.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="px-8 font-semibold text-base"
                    style={{ background: ACCENT, color: '#fff' }}
                  >
                    Start Free
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 font-medium text-base"
                    style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}
                  >
                    Login
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={fadeIn} className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: MUTED }}>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                  7-day free trial
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                  Cancel anytime
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Trust Snapshot (concise) */}
        <Section className="py-12">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="mb-6">
              <h2 className="text-2xl font-bold" style={{ color: TEXT }}>
                Why Marketers Choose Amarktai
              </h2>
              <p className="text-base max-w-xl mx-auto mb-4" style={{ color: MUTED }}>
                Autonomous AI that delivers real results — more reach, more leads, more conversions.
              </p>
            </motion.div>
            <motion.div variants={staggerContainer(0.08)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <motion.div key={stat.label} variants={fadeUp} className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ background: `linear-gradient(90deg, ${ACCENT}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-sm" style={{ color: MUTED }}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* Core Features */}
        <Section className="py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: TEXT }}>
                Core Features
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
                Everything you need to generate, schedule, and scale content across every platform — without lifting a finger.
              </p>
            </motion.div>
            <motion.div variants={staggerContainer(0.07)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => (
                <motion.div key={f.title} variants={fadeUp} className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${f.color}1A`, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-semibold mb-2 text-sm" style={{ color: TEXT }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{f.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* How It Works */}
        <Section className="py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: TEXT }}>
                How It Works
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
                From setup to scale in four simple steps.
              </p>
            </motion.div>
            <motion.div variants={staggerContainer(0.1)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step) => (
                <motion.div key={step.step} variants={fadeUp} className="relative">
                  <div className="rounded-2xl p-8"
                    style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                  >
                    <div className="text-4xl font-black mb-6"
                      style={{ background: `linear-gradient(90deg, ${ACCENT}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                      {step.step}
                    </div>
                    <h3 className="font-semibold mb-3" style={{ color: TEXT }}>{step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* Intelligence Suite */}
        <Section className="py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: TEXT }}>
                Intelligence Suite
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
                Six AI engines working for you 24/7.
              </p>
            </motion.div>
            <motion.div variants={staggerContainer(0.07)} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {powerTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.title}
                    variants={fadeUp}
                    className="rounded-2xl p-6 flex gap-4 transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(37,99,255,0.12)', color: ACCENT }}
                    >
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

        {/* Testimonials */}
        <Section className="py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: TEXT }}>
                Trusted by Founders and Marketers
              </h2>
            </motion.div>
            <motion.div variants={staggerContainer(0.1)} className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  className="rounded-2xl p-6"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                >
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: SUB }}>"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${CYAN})`, color: '#fff' }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: TEXT }}>{t.name}</p>
                      <p className="text-xs" style={{ color: MUTED }}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* Pricing Teaser */}
        <Section className="py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: TEXT }}>
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg" style={{ color: MUTED }}>
                Start your 7-day free trial. No credit card required.
              </p>
            </motion.div>
            <motion.div variants={staggerContainer(0.08)} className="grid md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={scaleIn}
                  className="rounded-2xl p-6 flex flex-col"
                  style={{
                    background: plan.highlighted
                      ? `linear-gradient(135deg, rgba(37,99,255,0.18) 0%, rgba(34,211,238,0.10) 100%)`
                      : SURFACE,
                    border: plan.highlighted ? `1px solid rgba(37,99,255,0.4)` : `1px solid ${BORDER}`,
                    boxShadow: plan.highlighted ? `0 0 40px rgba(37,99,255,0.12)` : 'none',
                  }}
                >
                  {plan.highlighted && (
                    <div className="text-xs font-semibold px-3 py-1 rounded-full mb-4 self-start"
                      style={{ background: 'rgba(37,99,255,0.2)', color: '#93c5fd', border: '1px solid rgba(37,99,255,0.3)' }}
                    >
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-bold mb-1" style={{ color: TEXT }}>{plan.name}</h3>
                  <p className="text-sm mb-5" style={{ color: MUTED }}>{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black" style={{ color: TEXT }}>${plan.price}</span>
                    <span className="text-sm" style={{ color: MUTED }}>{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: SUB }}>
                        <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#10B981' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button
                      className="w-full font-semibold"
                      style={plan.highlighted
                        ? { background: ACCENT, color: '#fff' }
                        : { background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT }
                      }
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <motion.div variants={fadeIn} className="text-center mt-8 text-sm" style={{ color: MUTED }}>
              All plans include a 7-day free trial.{' '}
              <Link to="/pricing" style={{ color: ACCENT }} className="hover:underline">View full pricing details →</Link>
            </motion.div>
          </div>
        </Section>

        {/* CTA */}
        <Section className="py-24">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              variants={staggerContainer(0.1)}
              className="rounded-3xl p-12 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(37,99,255,0.15) 0%, rgba(34,211,238,0.08) 100%)`,
                border: `1px solid rgba(37,99,255,0.25)`,
              }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 80% 60% at 50% 100%, rgba(37,99,255,0.12) 0%, transparent 70%)` }}
              />
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4 relative" style={{ color: TEXT }}>
                Ready to automate your marketing?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg mb-8 relative" style={{ color: MUTED }}>
                Start your 7-day free trial and let AI run your social media while you focus on building.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="px-10 font-semibold text-base"
                    style={{ background: ACCENT, color: '#fff' }}
                  >
                    Start Free
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-10 font-medium text-base"
                    style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}
                  >
                    Login
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </Section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="px-4 sm:px-6 lg:px-8 py-16" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${CYAN} 100%)` }}
                >
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold" style={{ color: TEXT }}>Amarktai Marketing</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                Autonomous AI social media marketing. Part of Amarktai Network.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: TEXT }}>Product</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', to: '/pricing' },
                  { label: 'About Us', to: '/about' },
                ].map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={l.to} className="text-sm hover:underline" style={{ color: MUTED }}>{l.label}</Link>
                    ) : (
                      <a href={l.href} className="text-sm hover:underline" style={{ color: MUTED }}>{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: TEXT }}>Company</h4>
              <ul className="space-y-3">
                {[
                  { label: 'About Us', to: '/about' },
                  { label: 'Contact Us', to: '/contact' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm hover:underline" style={{ color: MUTED }}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: TEXT }}>Legal</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Privacy Policy', to: '/privacy' },
                  { label: 'Terms of Service', to: '/terms' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm hover:underline" style={{ color: MUTED }}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
            style={{ borderTop: `1px solid ${BORDER}`, color: MUTED }}
          >
            <p>© {new Date().getFullYear()} Amarktai Marketing. Part of Amarktai Network.</p>
            <a
              href="https://amarktai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: MUTED }}
            >
              amarktai.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}