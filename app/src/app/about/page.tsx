import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import { Zap, Brain, Globe, Shield, Target, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const values = [
  { icon: Brain,  title: 'Intelligence First',  description: 'Every feature is designed around AI-driven decision making. We do not add tools for the sake of it — only what drives real marketing outcomes.' },
  { icon: Target, title: 'Outcome-Oriented',    description: 'We measure success by what you achieve — more reach, more leads, more conversions. Not by feature count.' },
  { icon: Shield, title: 'Reliable & Transparent', description: 'No hidden limits, no surprise billing, no black-box automation. You always see what the AI is doing and why.' },
  { icon: Globe,  title: 'Built for Scale',     description: 'Whether you run one brand or twenty, the platform is designed to scale with you without adding operational overhead.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: BG, color: TEXT }}>

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(5,7,11,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${CYAN} 100%)` }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold" style={{ color: TEXT }}>Amarktai</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[['/', 'Home'], ['/about', 'About Us'], ['/pricing', 'Pricing'], ['/contact', 'Contact Us']].map(([to, label]) => (
              <Link key={to} to={to} className="text-sm font-medium transition-colors" style={{ color: SUB }}>{label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" className="text-sm" style={{ color: SUB }}>Login</Button></Link>
            <Link to="/register">
              <Button size="sm" className="text-sm font-semibold" style={{ background: ACCENT, color: '#fff' }}>Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,255,0.15) 0%, transparent 70%)` }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.12)} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(37,99,255,0.12)', border: `1px solid rgba(37,99,255,0.3)`, color: '#93c5fd' }}>
              About Amarktai Network
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold leading-tight mb-6" style={{ color: TEXT }}>
              We build intelligence for
              <br />
              <span style={{ background: `linear-gradient(90deg, ${ACCENT}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                modern marketing
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: SUB }}>
              Amarktai Marketing is part of the Amarktai Network — a suite of AI-powered SaaS products built to give
              businesses a serious, autonomous edge in their markets.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={staggerContainer(0.1)}>
              <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-6" style={{ color: TEXT }}>
                Our mission
              </motion.h2>
              <motion.p variants={fadeUp} className="text-base leading-relaxed mb-6" style={{ color: SUB }}>
                Marketing should not require a full team, an agency retainer, or 20 hours a week of manual work.
                We built Amarktai Marketing to give any business — indie founders, small teams, and growing companies
                alike — the same autonomous marketing capability that only large enterprises could previously afford.
              </motion.p>
              <motion.p variants={fadeUp} className="text-base leading-relaxed" style={{ color: MUTED }}>
                Our AI engine generates platform-native content, schedules it at the optimal time, captures leads,
                scores them, and continuously improves based on real performance data. You stay in control while
                the system runs itself.
              </motion.p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="rounded-3xl p-8"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <div className="space-y-6">
                {[
                  { label: 'Businesses powered', value: '20+' },
                  { label: 'Platforms supported', value: '12' },
                  { label: 'Content automation', value: '3× daily' },
                  { label: 'Part of', value: 'Amarktai Network' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <span className="text-sm" style={{ color: MUTED }}>{item.label}</span>
                    <span className="font-semibold" style={{ color: TEXT }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: TEXT }}>What we stand for</h2>
          </motion.div>
          <motion.div variants={staggerContainer(0.08)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.title} variants={fadeUp} className="rounded-2xl p-6"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(37,99,255,0.12)', color: ACCENT }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm" style={{ color: TEXT }}>{v.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{v.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* Amarktai Network context */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={staggerContainer(0.1)}
            className="rounded-3xl p-10 text-center"
            style={{
              background: `linear-gradient(135deg, rgba(37,99,255,0.12) 0%, rgba(34,211,238,0.06) 100%)`,
              border: `1px solid rgba(37,99,255,0.2)`,
            }}
          >
            <motion.h2 variants={fadeUp} className="text-2xl font-bold mb-4" style={{ color: TEXT }}>
              Part of Amarktai Network
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base leading-relaxed mb-8 max-w-2xl mx-auto" style={{ color: SUB }}>
              Amarktai Marketing is one product in a growing family of AI-powered business tools under the Amarktai Network.
              Every product in the network is built to the same standard: serious, reliable, and genuinely useful.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button className="font-semibold" style={{ background: ACCENT, color: '#fff' }}>
                  Start Free
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <a href="https://amarktai.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                  Visit Amarktai.com
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-10" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: MUTED }}>
          <p>© {new Date().getFullYear()} Amarktai Marketing. Part of Amarktai Network.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:underline" style={{ color: MUTED }}>Privacy</Link>
            <Link to="/terms" className="hover:underline" style={{ color: MUTED }}>Terms</Link>
            <Link to="/contact" className="hover:underline" style={{ color: MUTED }}>Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
