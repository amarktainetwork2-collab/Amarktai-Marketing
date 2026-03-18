import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import { Zap, Check, ArrowRight } from 'lucide-react';
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
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_OUT_CURVE } },
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

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    description: 'For solo founders getting started with AI marketing.',
    features: [
      '2 Web Apps',
      '5 Social Platforms',
      '3 posts per day',
      'AI content generation',
      'Basic analytics dashboard',
      'Email support',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    description: 'The complete platform for growing teams.',
    features: [
      '10 Web Apps',
      'All 12 Platforms',
      '12 posts per day',
      'Advanced AI Engine',
      'A/B testing & optimization',
      'Lead capture & AI scoring',
      'SEO blog generator',
      'Content remix engine',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    description: 'Unlimited scale for agencies and enterprises.',
    features: [
      'Unlimited Web Apps',
      'All 12 Platforms',
      '36 posts per day',
      'Full AI intelligence suite',
      'Team collaboration (5 seats)',
      'White-label options',
      'Competitor intel tools',
      'Custom workflows',
      'Dedicated support',
    ],
    highlighted: false,
  },
];

const faqs = [
  {
    q: 'How does the 7-day free trial work?',
    a: 'You start with full access to the plan you choose. No credit card is required. After 7 days, you can subscribe or your account will be paused.',
  },
  {
    q: 'Can I change plans after signing up?',
    a: 'Yes. You can upgrade or downgrade at any time from your account settings. Changes apply at the next billing cycle.',
  },
  {
    q: 'What happens when I reach my post limit?',
    a: 'Content generation pauses until the next day. You will not be charged extra. Upgrading your plan removes the limit.',
  },
  {
    q: 'Do I need to connect social accounts immediately?',
    a: 'No. You can explore the platform before connecting any accounts. Connection is required before posts can be published.',
  },
  {
    q: 'Is my content reviewed before posting?',
    a: 'Yes. All AI-generated content sits in an approval queue. You review and approve, reject, or edit before anything goes live.',
  },
  {
    q: 'What platforms are supported?',
    a: 'YouTube, TikTok, Instagram, Facebook, X/Twitter, LinkedIn, Pinterest, Reddit, Bluesky, Threads, Telegram, and Snapchat.',
  },
];

export default function PricingPage() {
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
              <Link key={to} to={to} className="text-sm font-medium" style={{ color: SUB }}>{label}</Link>
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
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,255,0.15) 0%, transparent 70%)` }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(37,99,255,0.12)', border: `1px solid rgba(37,99,255,0.3)`, color: '#93c5fd' }}>
              Simple Pricing
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-5" style={{ color: TEXT }}>
              Start free. Scale without limits.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg" style={{ color: SUB }}>
              All plans include a 7-day free trial. No credit card required.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <Section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={staggerContainer(0.08)} className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                variants={scaleIn}
                className="rounded-2xl p-7 flex flex-col"
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
                    style={{ background: 'rgba(37,99,255,0.2)', color: '#93c5fd', border: '1px solid rgba(37,99,255,0.3)' }}>
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1" style={{ color: TEXT }}>{plan.name}</h3>
                <p className="text-sm mb-6" style={{ color: MUTED }}>{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="text-5xl font-black" style={{ color: TEXT }}>${plan.price}</span>
                  <span className="text-sm" style={{ color: MUTED }}>/mo</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
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
                    Start 7-Day Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="text-center mt-8 text-sm" style={{ color: MUTED }}>
            Need a custom plan for a large organisation?{' '}
            <Link to="/contact" style={{ color: ACCENT }} className="hover:underline">Contact us →</Link>
          </motion.div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: TEXT }}>Frequently asked questions</h2>
          </motion.div>
          <motion.div variants={staggerContainer(0.07)} className="space-y-4">
            {faqs.map((faq) => (
              <motion.div
                key={faq.q}
                variants={fadeUp}
                className="rounded-2xl p-6"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
              >
                <h3 className="font-semibold mb-2" style={{ color: TEXT }}>{faq.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{faq.a}</p>
              </motion.div>
            ))}
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
