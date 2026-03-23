import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import {
  Zap, BarChart3, Shield, Clock,
  Check, ChevronRight, Sparkles,
  Brain, Globe, ArrowRight, Users,
  CheckCircle2, Loader2, Circle, Bot, Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';
import ParticleBackground from '@/components/ui/ParticleBackground';
import AIHeroVisual from '@/components/ui/AIHeroVisual';
import AIWorkflowVisual from '@/components/ui/AIWorkflowVisual';
import AIDashboardMock from '@/components/ui/AIDashboardMock';

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
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

interface WorkflowStep { id: string; label: string; detail: string; }
const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'discover', label: 'Website discovered',        detail: 'yourbusiness.com \u2192 12 pages indexed' },
  { id: 'index',   label: 'Pages indexed',              detail: 'Home, About, Pricing, Blog + 8 more' },
  { id: 'brand',   label: 'Brand voice extracted',      detail: 'Tone: professional, friendly \u00b7 Niche: SaaS' },
  { id: 'products',label: 'Products & services mapped', detail: '3 plans detected \u00b7 5 features catalogued' },
  { id: 'channels',label: 'Channels connected',         detail: 'Instagram \u00b7 LinkedIn \u00b7 X \u00b7 Facebook' },
  { id: 'content', label: 'Content generated',          detail: '12 posts ready across 4 platforms' },
  { id: 'schedule',label: 'Schedule prepared',          detail: 'Optimal slots: 9 AM, 1 PM, 6 PM' },
  { id: 'running', label: 'Automations running',        detail: 'First posts queued \u00b7 Analytics live' },
];
type WorkflowStage = 'done' | 'active' | 'pending';

function LiveWorkflowPanel() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [completedUntil, setCompletedUntil] = useState<number>(-1);

  useEffect(() => {
    if (!inView) return;
    let step = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const advance = () => {
      setActiveStep(step);
      const t1 = setTimeout(() => {
        setCompletedUntil(step);
        step += 1;
        if (step < WORKFLOW_STEPS.length) { const t2 = setTimeout(advance, 380); timers.push(t2); }
        else { setActiveStep(-1); }
      }, 850);
      timers.push(t1);
    };
    const init = setTimeout(advance, 300);
    timers.push(init);
    return () => { timers.forEach(clearTimeout); };
  }, [inView]);

  const getStatus = (i: number): WorkflowStage => {
    if (i <= completedUntil) return 'done';
    if (i === activeStep) return 'active';
    return 'pending';
  };

  return (
    <div ref={ref} className="mt-16 rounded-2xl overflow-hidden"
      style={{ background: '#070D1A', border: '1px solid rgba(37,99,255,0.28)', boxShadow: '0 0 60px rgba(37,99,255,0.10)' }}>
      <div className="flex items-center gap-2 px-5 py-3"
        style={{ background: 'rgba(37,99,255,0.10)', borderBottom: '1px solid rgba(37,99,255,0.18)' }}>
        <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
        <span className="ml-3 text-xs font-mono" style={{ color: '#4F7DFF' }}>AmarktAI · Autonomous Setup Monitor</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: '#22D3EE' }}>
          <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22D3EE', display: 'inline-block' }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          LIVE
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {[WORKFLOW_STEPS.slice(0, 4), WORKFLOW_STEPS.slice(4)].map((col, ci) => (
          <div key={ci} className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {col.map((step, ri) => {
              const i = ci * 4 + ri;
              const status = getStatus(i);
              return (
                <div key={step.id} className="flex items-start gap-3 px-5 py-3.5 transition-all duration-300"
                  style={{ background: status === 'active' ? 'rgba(37,99,255,0.09)' : 'transparent' }}>
                  <div className="flex-shrink-0 mt-0.5">
                    {status === 'done'    && <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />}
                    {status === 'active'  && <Loader2 className="w-4 h-4 animate-spin" style={{ color: ACCENT }} />}
                    {status === 'pending' && <Circle className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.18)' }} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug"
                      style={{ color: status === 'pending' ? 'rgba(248,250,252,0.32)' : TEXT }}>{step.label}</p>
                    <p className="text-xs mt-0.5"
                      style={{ color: status === 'done' ? '#4ADE80' : status === 'active' ? '#93c5fd' : 'rgba(148,163,184,0.35)' }}>
                      {status === 'pending' ? '\u2014 awaiting' : step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xs" style={{ color: MUTED }}>
          {completedUntil >= WORKFLOW_STEPS.length - 1
            ? '\u2713 System fully configured \u2014 all automations active'
            : 'Configuring your autonomous marketing system\u2026'}
        </span>
        <Link to="/register">
          <button className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: 'rgba(37,99,255,0.2)', color: '#93c5fd', border: '1px solid rgba(37,99,255,0.35)' }}>
            Start Free \u2192
          </button>
        </Link>
      </div>
    </div>
  );
}

const featureCards = [
  { icon: Brain,    title: 'AI Content Generation', description: 'Platform-native posts, captions, scripts, and threads generated 3\u00d7 daily for every channel \u2014 no prompts needed.', color: ACCENT },
  { icon: Globe,    title: '12 Social Platforms',   description: 'YouTube, TikTok, Instagram, Facebook, X, LinkedIn, Pinterest, Reddit, Bluesky, Threads, Telegram, and Snapchat.', color: CYAN },
  { icon: Shield,   title: 'Approval Queue',        description: 'Every post passes through your editorial queue. Approve in one tap, edit inline, or reject and regenerate instantly.', color: '#6366f1' },
  { icon: BarChart3,title: 'Performance Analytics', description: 'Per-platform views, engagement, CTR, and conversion tracking. The AI reads results and optimises your strategy continuously.', color: ACCENT },
  { icon: Clock,    title: 'Autonomous Scheduling', description: 'AI calculates the optimal slot for each platform and audience. Morning, midday, and evening batches run automatically.', color: CYAN },
  { icon: Users,    title: 'Lead Capture',          description: 'AI captures leads from social engagement and link clicks, scores them 0\u2013100 for priority, and builds your pipeline.', color: '#6366f1' },
];

const platforms = [
  { name: 'YouTube', color: '#FF0000' }, { name: 'TikTok', color: '#FF2D55' },
  { name: 'Instagram', color: '#E1306C' }, { name: 'Facebook', color: '#1877F2' },
  { name: 'X / Twitter', color: '#F8FAFC' }, { name: 'LinkedIn', color: '#0A66C2' },
  { name: 'Pinterest', color: '#E60023' }, { name: 'Reddit', color: '#FF4500' },
  { name: 'Bluesky', color: '#0085FF' }, { name: 'Threads', color: '#F8FAFC' },
  { name: 'Telegram', color: '#229ED9' }, { name: 'Snapchat', color: '#FFFC00' },
];

const trustStats = [
  { stat: '12', label: 'Platforms Supported' },
  { stat: '3\u00d7', label: 'Daily Content Batches' },
  { stat: '100%', label: 'Automated Publishing' },
  { stat: '7-Day', label: 'Free Trial' },
];

const howSteps = [
  { icon: Globe,   step: '01', title: 'Add your business',           body: 'Paste your website URL or fill in a quick brief. The AI immediately begins learning your brand, products, and voice.' },
  { icon: Brain,   step: '02', title: 'AI builds your strategy',     body: 'Our intelligence engine extracts your brand identity, maps your products, and builds a bespoke content strategy.' },
  { icon: Bot,     step: '03', title: 'Content is created & queued', body: 'Platform-native posts are generated and scheduled across all connected channels \u2014 automatically, three times a day.' },
  { icon: Rocket,  step: '04', title: 'Review, approve & grow',      body: 'Posts land in your approval queue. One click to publish. Every approval trains the AI to improve future content.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: TEXT }}>
      <PublicNav activePath="/" />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
        <ParticleBackground opacity={0.55} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(37,99,255,0.22) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at bottom left, rgba(34,211,238,0.06) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={staggerContainer(0.12, 0.05)} initial="hidden" animate="show">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-7"
                style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.32)', color: '#93c5fd' }}>
                <Sparkles className="w-3.5 h-3.5" />
                Autonomous AI Marketing Platform
              </motion.div>
              <motion.h1 variants={fadeUp}
                className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-black leading-[1.04] tracking-tight mb-7">
                <span style={{ color: TEXT }}>Your marketing.</span>
                <br />
                <span style={{ background: `linear-gradient(90deg, ${ACCENT} 10%, ${CYAN} 90%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Fully automated.
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg sm:text-xl leading-relaxed mb-9 max-w-lg" style={{ color: SUB }}>
                AmarktAI Marketing learns your brand, generates platform-native content, and publishes
                across 12 social channels \u2014 every day, without lifting a finger.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto px-9 font-bold text-base"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, #1d4ed8)`, color: '#fff', boxShadow: `0 0 28px rgba(37,99,255,0.35)` }}>
                    Start Free \u2014 7 Days
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-9 font-medium text-base"
                    style={{ borderColor: 'rgba(255,255,255,0.15)', color: SUB, background: 'rgba(255,255,255,0.04)' }}>
                    See All Features
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
                {['12 platforms', 'No credit card required', 'Free 7-day trial'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-sm" style={{ color: MUTED }}>
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#10B981' }} />
                    {t}
                  </div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div variants={fadeIn} initial="hidden" animate="show" transition={{ delay: 0.3 }} className="hidden lg:block">
              <AIHeroVisual />
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div variants={staggerContainer(0.08, 0.5)} initial="hidden" animate="show"
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trustStats.map((s) => (
              <motion.div key={s.stat} variants={scaleIn}
                className="flex flex-col items-center py-5 rounded-2xl"
                style={{ background: 'rgba(11,18,32,0.7)', border: '1px solid rgba(37,99,255,0.18)', backdropFilter: 'blur(12px)' }}>
                <span className="text-3xl font-black" style={{ color: ACCENT }}>{s.stat}</span>
                <span className="text-xs mt-1 font-medium" style={{ color: MUTED }}>{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8">
        <Section>
          <div className="max-w-6xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
                style={{ background: 'rgba(34,211,238,0.10)', border: '1px solid rgba(34,211,238,0.25)', color: CYAN }}>
                How It Works
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5" style={{ color: TEXT }}>
                From website to fully automated
                <br /><span style={{ color: CYAN }}>in minutes</span>
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: MUTED }}>
                No technical setup. No content briefs. No agency retainer.
                Connect your business and the AI handles the rest.
              </p>
            </motion.div>
            <motion.div variants={staggerContainer(0.1)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
              {howSteps.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.step} variants={fadeUp} className="relative rounded-2xl p-7"
                    style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.3)', boxShadow: '0 0 18px rgba(37,99,255,0.2)' }}>
                      <Icon className="w-5 h-5" style={{ color: ACCENT }} />
                    </div>
                    <div className="absolute top-5 right-5 text-xs font-black" style={{ color: 'rgba(37,99,255,0.35)' }}>{s.step}</div>
                    <h3 className="font-bold mb-2 text-base" style={{ color: TEXT }}>{s.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{s.body}</p>
                  </motion.div>
                );
              })}
            </motion.div>
            <motion.div variants={fadeIn} className="rounded-2xl p-8"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <p className="text-xs font-semibold text-center mb-6" style={{ color: MUTED }}>THE AUTONOMOUS PIPELINE</p>
              <AIWorkflowVisual />
            </motion.div>
            <LiveWorkflowPanel />
          </div>
        </Section>
      </section>

      {/* ── Dashboard Showcase ── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(37,99,255,0.05) 0%, transparent 70%)' }}>
        <Section>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <motion.div variants={staggerContainer(0.1)}>
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
                  style={{ background: 'rgba(37,99,255,0.10)', border: '1px solid rgba(37,99,255,0.25)', color: '#93c5fd' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Command Center
                </motion.div>
                <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-5 leading-tight" style={{ color: TEXT }}>
                  One dashboard.<br />
                  <span style={{ color: ACCENT }}>Every channel.</span><br />
                  Total control.
                </motion.h2>
                <motion.p variants={fadeUp} className="text-base leading-relaxed mb-7" style={{ color: MUTED }}>
                  See exactly what's being posted, where, and when — across all 12 platforms.
                  Manage campaigns for up to 20 businesses from a single intelligent workspace.
                </motion.p>
                <motion.ul variants={staggerContainer(0.08)} className="space-y-3 mb-8">
                  {[
                    'Live content queue — every scheduled post at a glance',
                    'Per-platform performance analytics in real time',
                    'AI-generated insights and optimisation suggestions',
                    'Up to 20 businesses, all managed from one account',
                  ].map((item) => (
                    <motion.li key={item} variants={fadeUp} className="flex items-start gap-3 text-sm" style={{ color: SUB }}>
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#10B981' }} />
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div variants={fadeUp}>
                  <Link to="/register">
                    <Button size="lg" className="font-semibold"
                      style={{ background: ACCENT, color: '#fff', boxShadow: '0 0 20px rgba(37,99,255,0.28)' }}>
                      Try It Free
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div variants={fadeIn}>
                <AIDashboardMock />
              </motion.div>
            </div>
          </div>
        </Section>
      </section>

      {/* ── Feature Cards ── */}
      <Section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
              style={{ background: 'rgba(37,99,255,0.10)', border: '1px solid rgba(37,99,255,0.25)', color: '#93c5fd' }}>
              Platform Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: TEXT }}>
              Everything you need.<br /><span style={{ color: ACCENT }}>Nothing you don't.</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: MUTED }}>
              Built for founders and lean teams who need enterprise-grade marketing without the overhead.
            </p>
          </motion.div>
          <motion.div variants={staggerContainer(0.07)} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureCards.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} variants={fadeUp}
                  className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                  whileHover={{ boxShadow: `0 0 0 1px ${f.color}30, 0 12px 32px rgba(0,0,0,0.3)` }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${f.color}1A`, color: f.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold mb-2.5 text-sm" style={{ color: TEXT }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{f.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
          <motion.div variants={fadeUp} className="text-center mt-10">
            <Link to="/features">
              <Button variant="outline" className="font-medium"
                style={{ borderColor: 'rgba(255,255,255,0.12)', color: SUB, background: 'transparent' }}>
                View full feature list
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ── Platforms ── */}
      <Section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div variants={fadeUp} className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT }}>Every Platform. One Intelligence.</h2>
            <p className="text-base" style={{ color: MUTED }}>
              Post natively to all 12 platforms simultaneously — each post crafted for that platform's audience and format.
            </p>
          </motion.div>
          <motion.div variants={staggerContainer(0.04)} className="flex flex-wrap justify-center gap-2.5">
            {platforms.map((p) => (
              <motion.div key={p.name} variants={scaleIn}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.09)', color: '#CBD5E1', backdropFilter: 'blur(12px)' }}
                whileHover={{ borderColor: `${p.color}60`, color: TEXT }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                {p.name}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section className="py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.1)}
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,255,0.18) 0%, rgba(34,211,238,0.09) 100%)', border: '1px solid rgba(37,99,255,0.30)', boxShadow: '0 0 80px rgba(37,99,255,0.12)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(37,99,255,0.16) 0%, transparent 70%)' }} />
            <ParticleBackground opacity={0.2} />
            <div className="relative">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
                style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.3)', color: '#93c5fd' }}>
                <Zap className="w-3.5 h-3.5" />
                7-Day Free Trial — No Card Required
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5" style={{ color: TEXT }}>
                Ready to automate<br />your marketing?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg mb-9 max-w-md mx-auto" style={{ color: MUTED }}>
                Join businesses already using AmarktAI Marketing to generate, schedule, and publish content — automatically, every single day.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="px-10 font-bold text-base"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, #1d4ed8)`, color: '#fff', boxShadow: '0 0 28px rgba(37,99,255,0.38)' }}>
                    Start Free — 7 Days
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="px-10 font-medium text-base"
                    style={{ borderColor: 'rgba(255,255,255,0.15)', color: SUB, background: 'transparent' }}>
                    Talk to Us
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>

      <PublicFooter />
    </div>
  );
}
