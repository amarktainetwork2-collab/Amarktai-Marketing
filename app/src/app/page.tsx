import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Calendar, TrendingUp, Users, BarChart2, GitBranch, CheckCircle, Star } from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';
import { PLATFORM_COUNT_PLUS, PLATFORM_COUNT_LABEL } from '@/lib/platformConstants';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const PLATFORMS = [
  'YouTube', 'TikTok', 'Instagram', 'LinkedIn', 'Twitter/X',
  'Facebook', 'Pinterest', 'Reddit', 'Bluesky', 'Telegram', 'Snapchat', 'Discord',
];

const FEATURES = [
  {
    icon: Zap,
    title: 'AI Content Studio',
    desc: 'Generate on-brand posts, threads, and scripts across every format with a single prompt.',
    color: 'text-blue-400',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduler',
    desc: 'AI-powered timing optimization that publishes when your audience is most engaged.',
    color: 'text-cyan-400',
  },
  {
    icon: TrendingUp,
    title: 'Viral Predictor',
    desc: 'Score your content before posting and refine based on predicted engagement signals.',
    color: 'text-emerald-400',
  },
  {
    icon: BarChart2,
    title: 'Competitor Intelligence',
    desc: 'Track rivals, benchmark performance, and surface gaps you can capitalize on.',
    color: 'text-purple-400',
  },
  {
    icon: Users,
    title: 'Engagement Engine',
    desc: 'Auto-reply to comments, manage DMs, and nurture leads — on autopilot.',
    color: 'text-orange-400',
  },
  {
    icon: GitBranch,
    title: 'A/B Testing',
    desc: 'Run content experiments and let data automatically promote the winning variant.',
    color: 'text-pink-400',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Connect your platforms',
    desc: 'Link your social accounts in minutes with secure OAuth — no API keys to manage.',
  },
  {
    num: '02',
    title: 'Set your strategy',
    desc: 'Define your brand voice, content goals, audience segments, and posting schedule.',
  },
  {
    num: '03',
    title: 'AI handles everything',
    desc: 'AmarktAI generates, approves, schedules, posts, and optimizes — continuously.',
  },
];

const STATS = [
  { value: PLATFORM_COUNT_PLUS, label: 'Platforms Supported' },
  { value: '10+', label: 'AI Power Tools' },
  { value: '24/7', label: 'Autonomous Operation' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#06070A] text-[#F0F2F8]">
      <PublicNav />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-grid">
        {/* Glow orb */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-1.5 text-blue-400 text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              Powered by Amarkt<span className="text-blue-300">AI</span> Network
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              Your Marketing.<br />
              <span style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Fully Autonomous.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#9AA3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
              Amarkt<span className="text-blue-500">AI</span> generates, schedules, and publishes high-converting content
              across every platform — powered by AI that never stops.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/25"
              >
                Start Free — No Card Required
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/features"
                className="inline-flex items-center gap-2 text-[#9AA3B8] hover:text-white border border-[#252A3A] hover:border-[#374151] font-medium px-8 py-4 rounded-xl text-base transition-all duration-200"
              >
                See How It Works
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Floating metric badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { label: '12.4x engagement lift', icon: TrendingUp },
                { label: 'Zero manual effort', icon: CheckCircle },
                { label: `${PLATFORM_COUNT_LABEL} platforms`, icon: Star },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 bg-[#0D0F14] border border-[#252A3A] rounded-full px-4 py-2 text-sm text-[#9AA3B8]"
                >
                  <badge.icon className="w-3.5 h-3.5 text-blue-400" />
                  {badge.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="border-y border-[#1E2130] bg-[#0D0F14] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#5A6478] text-xs font-semibold uppercase tracking-widest mb-6">What we stand for</p>
          <blockquote className="text-xl sm:text-2xl font-semibold text-white leading-relaxed mb-6">
            "The brands that win in the next decade won't be the ones with the biggest teams — they'll be the ones with the smartest automation."
          </blockquote>
          <p className="text-[#5A6478] text-sm">
            Amarkt<span className="text-blue-500">AI</span> Marketing — built to give every business unfair AI leverage.
          </p>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.p variants={fadeUp} className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-4">
              Distribution
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
              One platform. Every channel.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#9AA3B8] text-lg mb-12 max-w-2xl mx-auto">
              Publish simultaneously across every major social platform with a single workflow.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              {PLATFORMS.map((p) => (
                <span
                  key={p}
                  className="px-4 py-2 bg-[#0D0F14] border border-[#252A3A] rounded-full text-[#9AA3B8] text-sm font-medium hover:border-blue-600/40 hover:text-white transition-all"
                >
                  {p}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 bg-[#0D0F14]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.p variants={fadeUp} className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-4">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white">
              Three steps to full autonomy
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {STEPS.map((step) => (
              <motion.div key={step.num} variants={fadeUp} className="relative">
                <div className="text-6xl font-black text-[#1E2130] mb-4">{step.num}</div>
                <h3 className="text-white font-semibold text-xl mb-3">{step.title}</h3>
                <p className="text-[#9AA3B8] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Proof */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.p variants={fadeUp} className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-4">
              Capabilities
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white">
              Everything you need to dominate
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="bg-[#0D0F14] border border-[#1E2130] rounded-2xl p-6 hover:border-[#252A3A] transition-all cursor-default"
                >
                  <div className={`w-10 h-10 rounded-xl bg-[#141720] flex items-center justify-center mb-5 ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                  <p className="text-[#9AA3B8] text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Dashboard Showcase */}
      <section className="py-24 px-4 sm:px-6 bg-[#0D0F14]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
              The command center for your entire marketing operation
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#9AA3B8] text-lg">
              One unified dashboard. Full visibility. Total control.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-[#252A3A] overflow-hidden shadow-2xl"
            style={{ boxShadow: '0 0 80px rgba(37, 99, 235, 0.08)' }}
          >
            {/* Browser chrome */}
            <div className="bg-[#141720] px-4 py-3 flex items-center gap-2 border-b border-[#252A3A]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 bg-[#06070A] rounded px-3 py-1 text-[#5A6478] text-xs font-mono">
                app.amarktai.com/dashboard
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="bg-[#06070A] p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Posts Published', value: '284', change: '+12%' },
                  { label: 'Engagement Rate', value: '8.4%', change: '+2.1%' },
                  { label: 'Leads Captured', value: '1,204', change: '+34%' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#0D0F14] border border-[#1E2130] rounded-xl p-4">
                    <p className="text-[#5A6478] text-xs mb-1">{stat.label}</p>
                    <p className="text-white font-bold text-xl">{stat.value}</p>
                    <p className="text-emerald-400 text-xs mt-1">{stat.change} this week</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#0D0F14] border border-[#1E2130] rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white font-medium text-sm">Upcoming Content Queue</p>
                  <span className="text-blue-400 text-xs font-medium">12 items</span>
                </div>
                <div className="space-y-2">
                  {[
                    { platform: 'LinkedIn', type: 'Thought Leadership', status: 'Scheduled', time: '2h' },
                    { platform: 'Twitter/X', type: 'Thread — Product Update', status: 'Pending Review', time: '4h' },
                    { platform: 'Instagram', type: 'Carousel — Tips & Tricks', status: 'Generating', time: '6h' },
                  ].map((item) => (
                    <div key={item.platform + item.time} className="flex items-center justify-between py-2 border-b border-[#1E2130] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">{item.platform}</p>
                          <p className="text-[#5A6478] text-xs">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.status === 'Scheduled' ? 'bg-emerald-400/10 text-emerald-400' :
                          item.status === 'Pending Review' ? 'bg-yellow-400/10 text-yellow-400' :
                          'bg-blue-400/10 text-blue-400'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-[#5A6478] text-xs">in {item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {STATS.map((s) => (
              <motion.div key={s.value} variants={fadeUp}>
                <div
                  className="text-5xl sm:text-6xl font-black mb-2"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {s.value}
                </div>
                <p className="text-[#9AA3B8] font-medium">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 bg-[#0D0F14] border-t border-[#1E2130]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to automate your marketing?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#9AA3B8] text-lg mb-10">
              Start your free trial. No credit card. No lock-in.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/25"
              >
                Start for Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
