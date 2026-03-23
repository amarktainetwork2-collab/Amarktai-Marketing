import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, Calendar, TrendingUp, BarChart2, Users, GitBranch,
  FileText, Repeat, Share2, CheckSquare, MessageCircle, Layers,
  ArrowRight, Eye
} from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';
import ParticleBackground from '@/components/ui/ParticleBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const FEATURE_GROUPS = [
  {
    label: 'Content Intelligence',
    color: 'blue',
    features: [
      { icon: Zap, title: 'AI Content Studio', desc: 'Generate posts, threads, scripts, and captions from a single prompt. Multi-format, on-brand, every time.' },
      { icon: FileText, title: 'Blog Generator', desc: 'Publish long-form content at scale. SEO-optimized articles generated from your topics and audience data.' },
      { icon: Repeat, title: 'Content Repurposer', desc: 'Turn one piece of content into 10. Convert blog posts to tweets, LinkedIn articles to reels, and more.' },
      { icon: Layers, title: 'Template Engine', desc: 'Build reusable content templates for campaigns, product launches, and recurring content series.' },
    ],
  },
  {
    label: 'Distribution & Scheduling',
    color: 'cyan',
    features: [
      { icon: Calendar, title: 'Smart Scheduler', desc: 'AI analyzes your audience behavior and posts at the exact moment engagement is highest.' },
      { icon: Share2, title: 'Multi-Platform Posting', desc: 'Publish to 15+ platforms simultaneously with format-specific optimization for each channel.' },
      { icon: Zap, title: 'Autonomous Publishing', desc: 'Set rules, define goals, and let the AI manage the entire publishing pipeline hands-free.' },
      { icon: CheckSquare, title: 'Approval Queue', desc: 'Review and approve AI-generated content before it goes live. Full control with minimal effort.' },
    ],
  },
  {
    label: 'Intelligence & Analytics',
    color: 'purple',
    features: [
      { icon: TrendingUp, title: 'Viral Predictor', desc: 'Score content before posting. The AI predicts engagement based on historical patterns and trends.' },
      { icon: BarChart2, title: 'Performance Predictor', desc: 'Forecast campaign ROI and content performance before you invest budget.' },
      { icon: Eye, title: 'Competitor Intelligence', desc: 'Monitor rival accounts, track their top content, and surface opportunities to outperform them.' },
      { icon: GitBranch, title: 'A/B Testing', desc: 'Run controlled content experiments. AI automatically promotes the variant that performs best.' },
    ],
  },
  {
    label: 'Engagement & Leads',
    color: 'emerald',
    features: [
      { icon: MessageCircle, title: 'Engagement Engine', desc: 'Auto-reply to comments, manage DMs, and keep your audience engaged around the clock.' },
      { icon: MessageCircle, title: 'Comment Auto-Reply', desc: 'AI responds intelligently to comments in your brand voice — scaling human-like engagement.' },
      { icon: Users, title: 'Lead Capture', desc: 'Convert social followers into qualified leads with automated CTA flows and form capture.' },
      { icon: Users, title: 'Lead Management', desc: 'Track, score, and nurture leads generated from your social content through a built-in CRM.' },
    ],
  },
];

const colorMap: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-400/10',
  cyan: 'text-cyan-400 bg-cyan-400/10',
  purple: 'text-purple-400 bg-purple-400/10',
  emerald: 'text-emerald-400 bg-emerald-400/10',
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#06070A] text-[#F0F2F8]">
      <PublicNav />

      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 text-center overflow-hidden">
        <ParticleBackground variant="stars" opacity={0.35} className="z-0" />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.p variants={fadeUp} className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-4">
            Platform Features
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white max-w-3xl mx-auto mb-6">
            Everything you need to dominate your market
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[#9AA3B8] text-xl max-w-2xl mx-auto mb-10">
            Amarkt<span className="text-blue-500">AI</span> bundles the entire marketing stack into one autonomous platform — from creation to conversion.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all"
            >
              Start using all features free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Groups */}
      {FEATURE_GROUPS.map((group, gi) => (
        <section
          key={group.label}
          className={`py-20 px-4 sm:px-6 ${gi % 2 === 1 ? 'bg-[#0D0F14]' : ''}`}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="mb-12"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.p variants={fadeUp} className={`text-sm font-semibold uppercase tracking-widest mb-3 ${colorMap[group.color].split(' ')[0]}`}>
                {group.label}
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {group.features.map((f) => {
                const Icon = f.icon;
                const colors = colorMap[group.color];
                return (
                  <motion.div
                    key={f.title}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    className="bg-[#0D0F14] border border-[#1E2130] rounded-2xl p-6 hover:border-[#252A3A] transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                    <p className="text-[#9AA3B8] text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      ))}

      {/* Platform integration note */}
      <section className="py-20 px-4 sm:px-6 bg-[#0D0F14]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-4">
              15+ Platforms. One Dashboard.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#9AA3B8] text-lg mb-10">
              YouTube, TikTok, Instagram, LinkedIn, Twitter/X, Facebook, Pinterest, Reddit, Bluesky, Telegram, Snapchat, Discord, and more.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all"
              >
                Connect your platforms
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
