import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import { ChevronRight, Check, Sparkles, MessageSquare, Clock, Shield } from 'lucide-react';
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

interface FormState { name: string; email: string; subject: string; message: string; }

const contactReasons = [
  { icon: MessageSquare, title: 'General Enquiry',         sub: 'Questions about the platform or our approach' },
  { icon: Shield,        title: 'Technical Support',       sub: 'Help with your account, integrations, or setup' },
  { icon: Clock,         title: 'Billing & Subscriptions', sub: 'Plan changes, invoices, and payment queries' },
  { icon: Sparkles,      title: 'Partnership & Business',  sub: 'Agency partnerships, reseller, and custom deals' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: 'general', message: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

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
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.3)', color: '#93c5fd' }}>
              <Sparkles className="w-3.5 h-3.5" />
              We're here to help
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-5" style={{ color: TEXT }}>
              Get in Touch
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg" style={{ color: SUB }}>
              Questions, feedback, billing, or partnerships — we respond within 1 business day.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Reason tiles */}
      <Section className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={staggerContainer(0.07)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {contactReasons.map((r) => {
              const Icon = r.icon;
              return (
                <motion.div key={r.title} variants={fadeUp}
                  className="rounded-2xl p-5 flex flex-col gap-3"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(37,99,255,0.12)', color: ACCENT }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: TEXT }}>{r.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{r.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* Form */}
      <Section className="py-6 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-10 text-center"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                <Check className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold mb-3" style={{ color: TEXT }}>Message sent</h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: MUTED }}>
                Thank you for reaching out. We'll get back to{'  '}
                <strong style={{ color: TEXT }}>{form.email}</strong> within 1 business day.
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
                Send us a message
              </motion.h2>
              <motion.div variants={fadeUp} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: SUB }}>Your name</label>
                    <input type="text" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                      style={{ background: '#060b14', border: `1px solid ${BORDER}`, color: TEXT }}
                      placeholder="Jane Smith"
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(37,99,255,0.5)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: SUB }}>Email address</label>
                    <input type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                      style={{ background: '#060b14', border: `1px solid ${BORDER}`, color: TEXT }}
                      placeholder="jane@company.com"
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(37,99,255,0.5)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: SUB }}>Subject</label>
                  <select value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none appearance-none"
                    style={{ background: '#060b14', border: `1px solid ${BORDER}`, color: TEXT }}>
                    <option value="general">General Enquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing &amp; Subscriptions</option>
                    <option value="partnership">Partnership &amp; Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: SUB }}>Message</label>
                  <textarea required rows={5} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                    style={{ background: '#060b14', border: `1px solid ${BORDER}`, color: TEXT }}
                    placeholder="Tell us how we can help…"
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(37,99,255,0.5)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)} />
                </div>
                <Button type="submit" className="w-full font-semibold"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #1d4ed8)`, color: '#fff' }}>
                  Send Message
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
                <p className="text-xs text-center" style={{ color: MUTED }}>
                  We typically respond within 1 business day.
                </p>
              </motion.div>
            </motion.form>
          )}
        </div>
      </Section>

      <PublicFooter />
    </div>
  );
}
