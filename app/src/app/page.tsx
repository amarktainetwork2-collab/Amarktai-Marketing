import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import {
  Zap, BarChart3, Shield, Clock,
  Check, ChevronRight, Sparkles,
  Brain, Globe, ArrowRight, Users,
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

const howItWorksSteps = [
  { step: '01', title: 'Tell us about your business', description: 'Enter your website URL or fill in your business details manually. Takes less than 2 minutes.' },
  { step: '02', title: 'AI learns your brand', description: 'Our AI reads your site, learns your products, services, tone of voice, and target audience automatically.' },
  { step: '03', title: 'Content is generated and scheduled', description: 'Platform-native posts, captions, and scripts are created and scheduled across all your social channels.' },
  { step: '04', title: 'You review, approve, and grow', description: 'Every post goes into your approval queue. Approve in one click, edit inline, or reject and regenerate.' },
];

const featureCards = [
  { icon: Brain, title: 'AI Content Generation', description: 'Platform-native posts generated 3× daily for every social channel — no prompts needed.', color: ACCENT },
  { icon: Globe, title: '12 Platforms', description: 'YouTube, TikTok, Instagram, Facebook, X, LinkedIn, Pinterest, Reddit, Bluesky, Threads, Telegram, Snapchat.', color: CYAN },
  { icon: Shield, title: 'Approval Queue', description: 'Full editorial control — approve, edit, or reject before anything goes live.', color: '#6D5DF6' },
  { icon: BarChart3, title: 'Live Analytics', description: 'Per-platform performance tracking. AI learns what works and improves over time.', color: ACCENT },
  { icon: Clock, title: 'Autonomous Scheduling', description: 'Posts go live at the optimal time for each platform — morning, midday, and evening.', color: CYAN },
  { icon: Users, title: 'Lead Capture', description: 'AI captures leads from social comments and links, scores them 0–100, and adds them to your pipeline.', color: '#6D5DF6' },
];

const platforms = [
  { name: 'YouTube', color: '#FF0000' },
  { name: 'TikTok', color: '#FF2D55' },
  { name: 'Instagram', color: '#E1306C' },
  { name: 'Facebook', color: '#1877F2' },
  { name: 'X / Twitter', color: '#F8FAFC' },
  { name: 'LinkedIn', color: '#0A66C2' },
  { name: 'Pinterest', color: '#E60023' },
  { name: 'Reddit', color: '#FF4500' },
  { name: 'Bluesky', color: '#0085FF' },
  { name: 'Threads', color: '#F8FAFC' },
  { name: 'Telegram', color: '#229ED9' },
  { name: 'Snapchat', color: '#FFFC00' },
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
              <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: '#22D3EE' }}></span>
              AmarktAI Network — AI Marketing Platform
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
              style={{ color: TEXT }}>
              Your Business,
              <br />
              <span style={{
                background: `linear-gradient(90deg, ${ACCENT} 0%, ${CYAN} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Marketed by AI
              </span>
            </motion.h1>

            <motion.p variants={fadeUp}
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: SUB }}>
              AmarktAI Marketing understands your business, creates content, and posts across all your social platforms — automatically, every single day.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link to="/register">
                <Button size="lg" className="px-9 font-semibold text-base h-12"
                  style={{ background: ACCENT, color: '#fff', boxShadow: `0 0 24px rgba(37,99,255,0.35)` }}>
                  Start Free — 7 Days
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-9 font-medium text-base h-12"
                style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                See How It Works
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </motion.div>

            <motion.div variants={fadeIn} className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: MUTED }}>
              {['7-day free trial', 'No credit card', 'Cancel anytime'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats row */}
      <div className="flex flex-wrap justify-center gap-4 mt-12 mb-4 px-4">
        {[
          { stat: '12', label: 'Platforms Supported' },
          { stat: '3×', label: 'Daily Content' },
          { stat: '7-Day', label: 'Free Trial' },
        ].map((item) => (
          <div key={item.stat} className="flex flex-col items-center px-8 py-4 rounded-2xl border" style={{ background: 'rgba(15,23,42,0.7)', borderColor: 'rgba(37,99,255,0.25)' }}>
            <span className="text-3xl font-black" style={{ color: '#2563FF' }}>{item.stat}</span>
            <span className="text-xs mt-1 font-medium" style={{ color: '#94A3B8' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Product preview */}
      <div className="mt-10 mx-auto max-w-2xl rounded-2xl border overflow-hidden px-4" style={{ background: 'rgba(15,23,42,0.85)', borderColor: 'rgba(37,99,255,0.2)' }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}>
          <span className="w-3 h-3 rounded-full bg-red-500 opacity-70"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-70"></span>
          <span className="w-3 h-3 rounded-full bg-green-500 opacity-70"></span>
          <span className="text-xs ml-2 font-mono" style={{ color: '#475569' }}>AmarktAI — Content Studio</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)' }}>
            <span className="animate-spin text-lg">⚙️</span>
            <span className="text-sm font-medium" style={{ color: '#93C5FD' }}>AI generating content for Instagram… <span className="text-xs" style={{ color: '#475569' }}>3 posts</span></span>
          </div>
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg,#E1306C,#833AB4)' }}>📸</span>
              <div>
                <div className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>Instagram Post</div>
                <div className="text-xs" style={{ color: '#475569' }}>Generated just now</div>
              </div>
            </div>
            <div className="h-24 rounded-lg flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg,rgba(225,48,108,0.2),rgba(131,58,180,0.2))', border: '1px dashed rgba(255,255,255,0.1)' }}>🖼️</div>
            <p className="text-xs leading-relaxed" style={{ color: '#CBD5E1' }}>✨ Transform your business with AI-powered marketing that works 24/7. Stop wasting hours on content — let AmarktAI handle it while you focus on growth. 🚀 #AIMarketing #BusinessGrowth</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 rounded-lg py-2 text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.3)' }}>✓ Approve</button>
            <button className="flex-1 rounded-lg py-2 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }}>✏️ Edit</button>
            <button className="flex-1 rounded-lg py-2 text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>✗ Reject</button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <Section>
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
                style={{ background: 'rgba(34,211,238,0.10)', border: `1px solid rgba(34,211,238,0.25)`, color: CYAN }}>
                How It Works
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: TEXT }}>
                From zero to fully automated in minutes
              </h2>
              <p className="text-base max-w-xl mx-auto" style={{ color: MUTED }}>
                No technical setup. No content strategy required. Just tell us about your business and the AI handles the rest.
              </p>
            </motion.div>
            <motion.div variants={staggerContainer(0.1)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorksSteps.map((step) => (
                <motion.div key={step.step} variants={fadeUp}
                  className="rounded-2xl p-6"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full text-lg font-black mb-4 mx-auto" style={{ background: 'rgba(37,99,255,0.15)', border: '1px solid rgba(37,99,255,0.4)', color: '#2563FF', boxShadow: '0 0 20px rgba(37,99,255,0.3)' }}>
                    {step.step}
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: TEXT }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>
      </section>

      {/* Feature Cards */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
              style={{ background: 'rgba(37,99,255,0.10)', border: `1px solid rgba(37,99,255,0.25)`, color: '#93c5fd' }}>
              Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: TEXT }}>
              Everything you need, nothing you don't
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: MUTED }}>
              Built for founders and small teams who need enterprise-grade marketing without the overhead.
            </p>
          </motion.div>
          <motion.div variants={staggerContainer(0.07)} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureCards.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} variants={fadeUp}
                  className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${f.color}1A`, color: f.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm" style={{ color: TEXT }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{f.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* Platforms */}
      <Section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div variants={fadeUp} className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT }}>
              Every Platform. One Intelligence.
            </h2>
            <p className="text-base" style={{ color: MUTED }}>Post natively to 12 platforms simultaneously.</p>
          </motion.div>
          <motion.div variants={staggerContainer(0.04)} className="flex flex-wrap justify-center gap-3">
            {platforms.map((p) => (
              <motion.div key={p.name} variants={scaleIn}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border"
                style={{ background: 'rgba(15,23,42,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#CBD5E1', backdropFilter: 'blur(12px)' }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }}></span>
                {p.name}
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="mt-8">
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
              Join businesses already using AmarktAI Marketing to generate, schedule, and scale their content across every platform — while they focus on building.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Link to="/register">
                <Button size="lg" className="px-10 font-semibold text-base"
                  style={{ background: ACCENT, color: '#fff', boxShadow: `0 0 20px rgba(37,99,255,0.3)` }}>
                  Start Free — 7 Days
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
