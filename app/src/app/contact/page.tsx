import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import { Zap, Mail, MessageSquare, Building2, ChevronRight, Check, Sparkles } from 'lucide-react';
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

const contactTypes = [
  { icon: MessageSquare, title: 'General Support', description: 'Questions about features, your account, or how the platform works.', tag: 'general' },
  { icon: Mail, title: 'Billing & Plans', description: 'Questions about your subscription, invoices, or upgrading your plan.', tag: 'billing' },
  { icon: Building2, title: 'Business Enquiries', description: 'Custom plans, partnerships, white-label options, or enterprise pricing.', tag: 'business' },
];

export default function ContactPage() {
  const [category, setCategory] = useState('general');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen" style={{ background: BG, color: TEXT }}>
      <PublicNav activePath="/contact" />

      {/* Hero */}
      <section className="relative pt-36 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ParticleBackground opacity={0.25} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,255,0.15) 0%, transparent 70%)` }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="show">
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(37,99,255,0.12)', border: `1px solid rgba(37,99,255,0.3)`, color: '#93c5fd' }}>
              <Sparkles className="w-3.5 h-3.5" />
              Get in Touch
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-5" style={{ color: TEXT }}>
              We're here to help
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg" style={{ color: SUB }}>
              Whether you have a question, a billing issue, or a business enquiry — we respond fast.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Amarktai Network trust banner */}
      <Section className="pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp}
            className="rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              background: `linear-gradient(135deg, rgba(37,99,255,0.10) 0%, rgba(34,211,238,0.06) 100%)`,
              border: `1px solid rgba(37,99,255,0.18)`,
            }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${CYAN} 100%)` }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: TEXT }}>Part of the Amarktai Network</p>
                <p className="text-xs" style={{ color: MUTED }}>Amarktai Marketing is a product of the Amarktai Network — a family of AI-powered business tools.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                <Check className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                Trusted platform
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                <Check className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                Fast response
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Contact category tiles */}
      <Section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={staggerContainer(0.08)} className="grid sm:grid-cols-3 gap-4 mb-10">
            {contactTypes.map((ct) => {
              const Icon = ct.icon;
              const active = category === ct.tag;
              return (
                <motion.button key={ct.tag} variants={fadeUp}
                  onClick={() => setCategory(ct.tag)}
                  className="rounded-2xl p-5 text-left transition-all duration-200"
                  style={{
                    background: active ? `rgba(37,99,255,0.15)` : SURFACE,
                    border: active ? `1px solid rgba(37,99,255,0.4)` : `1px solid ${BORDER}`,
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: active ? 'rgba(37,99,255,0.2)' : 'rgba(37,99,255,0.10)', color: ACCENT }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: TEXT }}>{ct.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{ct.description}</p>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* Form */}
      <Section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-10 text-center"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                <ChevronRight className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold mb-3" style={{ color: TEXT }}>Message sent</h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: MUTED }}>
                Thank you for reaching out. We typically respond within 1 business day.
              </p>
              <Link to="/">
                <Button variant="outline" style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.form variants={staggerContainer(0.07)} initial="hidden" animate="show"
              onSubmit={handleSubmit} className="rounded-2xl p-8"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <motion.h2 variants={fadeUp} className="text-xl font-bold mb-6" style={{ color: TEXT }}>
                Send a message
              </motion.h2>
              <motion.div variants={fadeUp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: SUB }}>Your name</label>
                  <input type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                    style={{ background: '#060b14', border: `1px solid ${BORDER}`, color: TEXT }}
                    placeholder="Jane Smith" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: SUB }}>Email address</label>
                  <input type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                    style={{ background: '#060b14', border: `1px solid ${BORDER}`, color: TEXT }}
                    placeholder="jane@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: SUB }}>
                    Message
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(37,99,255,0.12)', color: '#93c5fd' }}>
                      {contactTypes.find((c) => c.tag === category)?.title}
                    </span>
                  </label>
                  <textarea required rows={5} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none"
                    style={{ background: '#060b14', border: `1px solid ${BORDER}`, color: TEXT }}
                    placeholder="How can we help?" />
                </div>
                <Button type="submit" className="w-full font-semibold" style={{ background: ACCENT, color: '#fff' }}>
                  Send Message
                </Button>
              </motion.div>
            </motion.form>
          )}
        </div>
      </Section>

      <PublicFooter />
    </div>
  );
}
