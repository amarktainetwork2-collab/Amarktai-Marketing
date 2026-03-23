import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import { Check, ChevronRight, ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';
import ParticleBackground from '@/components/ui/ParticleBackground';

const BG = '#05070B';
const SURFACE = '#0B1220';
const BORDER = 'rgba(255,255,255,0.08)';
const ACCENT = '#2563FF';
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

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 49,
    annualPrice: 39,
    description: 'For solo founders and small businesses getting started with AI marketing.',
    features: [
      '1 business',
      '3 social platforms',
      'Core AI content generation',
      'Approval queue',
      'Basic analytics',
      'Email support',
    ],
    highlighted: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 149,
    annualPrice: 119,
    description: 'For growing teams who need full automation across more businesses and channels.',
    features: [
      '5 businesses',
      '8 social platforms',
      'Full AI automation + scheduling',
      'Advanced analytics dashboard',
      'Lead capture & scoring',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    monthlyPrice: 399,
    annualPrice: 319,
    description: 'For agencies and operators managing multiple brands at scale.',
    features: [
      '20 businesses',
      'All 12 platforms',
      'White-label ready',
      'Full AI intelligence suite',
      'API access',
      'Dedicated support',
    ],
    highlighted: false,
  },
];

interface FAQ {
  q: string;
  a: string;
}

const faqs: FAQ[] = [
  { q: 'How does the 7-day free trial work?', a: 'You get full access to your chosen plan for 7 days — no credit card required. After the trial, you can subscribe or your account will be paused. Your data is retained for 30 days.' },
  { q: 'What\'s the difference between monthly and annual billing?', a: 'Annual billing saves you 20% compared to monthly. You\'re billed once per year. You can still cancel at any time and access remains active until the end of your paid period.' },
  { q: 'Can I change plans at any time?', a: 'Yes. You can upgrade or downgrade at any time from your account settings. Upgrades take effect immediately; downgrades apply at the next billing cycle.' },
  { q: 'What platforms are supported?', a: 'YouTube, TikTok, Instagram, Facebook, X/Twitter, LinkedIn, Pinterest, Reddit, Bluesky, Threads, Telegram, and Snapchat — all 12 major platforms.' },
  { q: 'Is content reviewed before it goes live?', a: 'Yes. All AI-generated content is placed in an approval queue. Nothing is published without your approval. You can approve, edit, or reject any post — rejected posts are regenerated instantly.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel at any time from your account settings with no penalty. You keep access until the end of your current billing period.' },
];

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
      <button
        className="w-full flex items-center justify-between p-6 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-sm pr-4" style={{ color: TEXT }}>{faq.q}</span>
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform duration-200"
          style={{ color: MUTED, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div className="px-6 pb-6">
          <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{faq.a}</p>
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: BG, color: TEXT }}>
      <PublicNav activePath="/pricing" />

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ParticleBackground opacity={0.25} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,255,0.15) 0%, transparent 70%)` }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="show">
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(37,99,255,0.12)', border: `1px solid rgba(37,99,255,0.3)`, color: '#93c5fd' }}>
              <Zap className="w-3.5 h-3.5" />
              Simple Pricing
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-5" style={{ color: TEXT }}>
              Simple, Transparent Pricing
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg mb-8" style={{ color: SUB }}>
              All plans include a 7-day free trial. No credit card required.
            </motion.p>

            {/* Billing toggle */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3 p-1 rounded-xl"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <button
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: !annual ? ACCENT : 'transparent',
                  color: !annual ? '#fff' : MUTED,
                }}
                onClick={() => setAnnual(false)}
              >
                Monthly
              </button>
              <button
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                style={{
                  background: annual ? ACCENT : 'transparent',
                  color: annual ? '#fff' : MUTED,
                }}
                onClick={() => setAnnual(true)}
              >
                Annual
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: annual ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.15)', color: annual ? '#fff' : '#10B981' }}>
                  Save 20%
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <Section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={staggerContainer(0.08)} className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const price = annual ? plan.annualPrice : plan.monthlyPrice;
              return (
                <motion.div key={plan.id} variants={scaleIn}
                  className="rounded-2xl p-7 flex flex-col"
                  style={{
                    background: plan.highlighted
                      ? `linear-gradient(135deg, rgba(37,99,255,0.18) 0%, rgba(34,211,238,0.10) 100%)`
                      : SURFACE,
                    border: plan.highlighted ? `1px solid rgba(37,99,255,0.4)` : `1px solid ${BORDER}`,
                    boxShadow: plan.highlighted ? `0 0 40px rgba(37,99,255,0.12)` : 'none',
                  }}>
                  {plan.highlighted && (
                    <div className="text-xs font-semibold px-3 py-1 rounded-full mb-4 self-start"
                      style={{ background: 'rgba(37,99,255,0.2)', color: '#93c5fd', border: '1px solid rgba(37,99,255,0.3)' }}>
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-1" style={{ color: TEXT }}>{plan.name}</h3>
                  <p className="text-sm mb-6" style={{ color: MUTED }}>{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-black" style={{ color: TEXT }}>${price}</span>
                    <span className="text-sm" style={{ color: MUTED }}>/mo</span>
                  </div>
                  {annual && (
                    <p className="text-xs mb-6" style={{ color: MUTED }}>
                      Billed annually — ${price * 12}/yr
                    </p>
                  )}
                  {!annual && <div className="mb-6" />}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: SUB }}>
                        <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#10B981' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button className="w-full font-semibold"
                      style={plan.highlighted
                        ? { background: ACCENT, color: '#fff' }
                        : { background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT }}>
                      Get Started
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
          <motion.div variants={fadeUp} className="text-center mt-8 text-sm" style={{ color: MUTED }}>
            Need a custom plan for a large organisation?{' '}
            <Link to="/contact" style={{ color: ACCENT }} className="hover:underline">Contact us →</Link>
          </motion.div>
        </div>
      </Section>

      {/* Trial callout */}
      <Section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6"
            style={{
              background: `linear-gradient(135deg, rgba(37,99,255,0.12) 0%, rgba(34,211,238,0.06) 100%)`,
              border: `1px solid rgba(37,99,255,0.2)`,
            }}>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2" style={{ color: TEXT }}>
                7-day free trial on every plan
              </h3>
              <p className="text-sm" style={{ color: MUTED }}>
                Full access. No credit card. No commitment. Cancel or subscribe after the trial ends.
              </p>
            </div>
            <Link to="/register" className="shrink-0">
              <Button className="font-semibold px-6" style={{ background: ACCENT, color: '#fff' }}>
                Start Free Trial
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: TEXT }}>Frequently asked questions</h2>
            <p className="text-sm" style={{ color: MUTED }}>Everything you need to know before getting started.</p>
          </motion.div>
          <motion.div variants={staggerContainer(0.07)} className="space-y-3">
            {faqs.map((faq) => (
              <motion.div key={faq.q} variants={fadeUp}>
                <FAQItem faq={faq} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <PublicFooter />
    </div>
  );
}
