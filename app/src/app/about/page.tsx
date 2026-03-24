import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import { Zap, Brain, Globe, Shield, Target, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { PLATFORM_COUNT_LABEL } from '@/lib/platformConstants';

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

const whyPoints = [
  {
    icon: Brain,
    title: 'Most businesses never market consistently',
    description: 'Life gets busy. Posting falls off. We built AmarktAI Marketing so consistency happens automatically — not when you remember.',
  },
  {
    icon: Globe,
    title: 'Every platform demands different content',
    description: 'A TikTok script is not a LinkedIn post. Our AI understands each platform\'s format, tone, and algorithm natively.',
  },
  {
    icon: Shield,
    title: 'You should stay in control without doing the work',
    description: 'An approval queue means nothing goes live without your say. You get the safety of oversight without the overhead of creation.',
  },
  {
    icon: Target,
    title: 'Marketing should compound over time',
    description: 'The AI learns from every post. Content improves, posting windows optimise, and your reach grows — automatically.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: BG, color: TEXT }}>
      <PublicNav activePath="/about" />

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ParticleBackground opacity={0.28} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,255,0.16) 0%, transparent 70%)` }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.12)} initial="hidden" animate="show">
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(37,99,255,0.12)', border: `1px solid rgba(37,99,255,0.3)`, color: '#93c5fd' }}>
              <Sparkles className="w-3.5 h-3.5" />
              About AmarktAI Marketing
            </motion.div>
            <motion.h1 variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ color: TEXT }}>
              We built AmarktAI Marketing so business owners
              <br />
              <span style={{ background: `linear-gradient(90deg, ${ACCENT}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                never have to think about social media again
              </span>
            </motion.h1>
            <motion.p variants={fadeUp}
              className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ color: SUB }}>
              Autonomous AI marketing for businesses of every size. You focus on what you do — we handle getting it in front of the world.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* What it is + who it's for */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={staggerContainer(0.1)}>
              <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-6" style={{ color: TEXT }}>
              What is AmarktAI Marketing?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-base leading-relaxed mb-5" style={{ color: SUB }}>
                AmarktAI Marketing is an AI-powered platform that runs your social media marketing on autopilot. You tell it about your business once — it learns your brand, products, tone of voice, and audience — then generates and publishes platform-native content every single day.
              </motion.p>
              <motion.p variants={fadeUp} className="text-base leading-relaxed mb-5" style={{ color: MUTED }}>
                It's built for founders, small teams, and growing businesses who know they need to market consistently but don't have the time, staff, or budget to do it properly.
              </motion.p>
              <motion.p variants={fadeUp} className="text-base leading-relaxed mb-8" style={{ color: MUTED }}>
                No agency. No in-house marketer. No hours of your week spent on captions. Just results.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Link to="/register">
                  <Button className="font-semibold" style={{ background: ACCENT, color: '#fff' }}>
                    Start Free — 7 Days
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                    Explore Features
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-3xl p-8"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <div className="space-y-6">
                {[
                  { label: 'Who it\'s for', value: 'Founders & small teams' },
                  { label: 'Platforms supported', value: `${PLATFORM_COUNT_LABEL} social channels` },
                  { label: 'Content generated', value: '3× daily, automatically' },
                  { label: 'Setup time', value: 'Under 5 minutes' },
                  { label: 'Ecosystem', value: 'AmarktAI' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3"
                    style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <span className="text-sm" style={{ color: MUTED }}>{item.label}</span>
                    <span className="font-semibold text-sm" style={{ color: TEXT }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Why autonomous marketing matters */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4" style={{ color: TEXT }}>Why autonomous marketing matters</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: MUTED }}>
              The problems we set out to solve are real, and they affect almost every business.
            </p>
          </motion.div>
          <motion.div variants={staggerContainer(0.08)} className="grid sm:grid-cols-2 gap-6">
            {whyPoints.map((v) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.title} variants={fadeUp}
                  className="rounded-2xl p-6 flex gap-4 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(37,99,255,0.12)', color: ACCENT }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-sm" style={{ color: TEXT }}>{v.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{v.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* Broader mission */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={staggerContainer(0.1)}
            className="rounded-3xl p-10 text-center"
            style={{
              background: `linear-gradient(135deg, rgba(37,99,255,0.12) 0%, rgba(34,211,238,0.06) 100%)`,
              border: `1px solid rgba(37,99,255,0.2)`,
            }}>
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ background: 'rgba(37,99,255,0.12)', border: `1px solid rgba(37,99,255,0.3)`, color: '#93c5fd' }}>
              <Zap className="w-3.5 h-3.5" />
              AmarktAI Marketing
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: TEXT }}>
              One product in a broader mission
            </motion.h2>
            <motion.p variants={fadeUp}
              className="text-base leading-relaxed mb-4 max-w-2xl mx-auto"
              style={{ color: SUB }}>
              AmarktAI Marketing is one product in a growing family of AI-powered business tools. Every product is built to the same standard: serious, reliable, and genuinely useful — not a toy, not a template.
            </motion.p>
            <motion.p variants={fadeUp}
              className="text-sm leading-relaxed mb-8 max-w-xl mx-auto"
              style={{ color: MUTED }}>
              We build tools that give independent businesses the capabilities of companies ten times their size. AmarktAI Marketing is how we do that for marketing.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button className="font-semibold" style={{ background: ACCENT, color: '#fff' }}>
                  Start Free
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                  Contact Us
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <a href="https://amarktai.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                  Visit amarktai.com
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      <PublicFooter />
    </div>
  );
}
