import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import { ChevronRight, Rocket, CalendarDays } from 'lucide-react';
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

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ background: BG, color: TEXT }}>
      <PublicNav activePath="/contact" />

      {/* Hero */}
      <section className="relative pt-36 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ParticleBackground opacity={0.30} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,255,0.18) 0%, transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="show">
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-5" style={{ color: TEXT }}>
              Let's Get You Started
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg" style={{ color: SUB }}>
              Book a walkthrough or reach out — we'll respond within one business day.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Premium CTAs */}
      <Section className="py-12 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={staggerContainer(0.12)} className="grid sm:grid-cols-2 gap-6">

            {/* Book a Walkthrough */}
            <motion.div variants={fadeUp}
              className="rounded-2xl p-8 flex flex-col gap-6 transition-all duration-200"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
              whileHover={{ borderColor: `rgba(37,99,255,0.4)`, boxShadow: `0 0 32px rgba(37,99,255,0.10)` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, rgba(37,99,255,0.18) 0%, rgba(34,211,238,0.10) 100%)`, border: `1px solid rgba(37,99,255,0.3)` }}>
                <CalendarDays className="w-6 h-6" style={{ color: ACCENT }} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: TEXT }}>Book a Walkthrough</h2>
                <p className="text-sm leading-relaxed mb-2" style={{ color: MUTED }}>
                  Schedule a live walkthrough of the platform with our team. We'll show you exactly how AmarktAI Marketing works for your business.
                </p>
                <p className="text-xs" style={{ color: MUTED }}>30 minutes · No commitment</p>
              </div>
              <a href="https://cal.com/amarktai" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full font-semibold"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #1d4ed8)`, color: '#fff', boxShadow: '0 0 24px rgba(37,99,255,0.28)' }}>
                  Book a Walkthrough
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
            </motion.div>

            {/* Start Onboarding */}
            <motion.div variants={fadeUp}
              className="rounded-2xl p-8 flex flex-col gap-6 transition-all duration-200"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
              whileHover={{ borderColor: `rgba(34,211,238,0.35)`, boxShadow: `0 0 32px rgba(34,211,238,0.07)` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(34,211,238,0.10)`, border: `1px solid rgba(34,211,238,0.25)` }}>
                <Rocket className="w-6 h-6" style={{ color: CYAN }} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: TEXT }}>Start Onboarding</h2>
                <p className="text-sm leading-relaxed mb-2" style={{ color: MUTED }}>
                  Ready to get started? Create your account and connect your first business. Full platform access from day one, no credit card required.
                </p>
                <p className="text-xs" style={{ color: MUTED }}>7-day free trial · No credit card</p>
              </div>
              <Link to="/register">
                <Button size="lg" variant="outline" className="w-full font-semibold"
                  style={{ borderColor: `rgba(34,211,238,0.35)`, color: CYAN, background: 'transparent' }}>
                  Get Started Free
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.p variants={fadeUp} className="text-center text-sm mt-8" style={{ color: MUTED }}>
            We typically respond within one business day.
          </motion.p>
        </div>
      </Section>

      <PublicFooter />
    </div>
  );
}

