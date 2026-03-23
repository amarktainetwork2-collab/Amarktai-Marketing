import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import {
  Zap, ChevronRight, Sparkles, ArrowRight,
  Brain, Globe, Shield, BarChart3, Clock, Users,
  Cpu, Image, MessageSquare, TrendingUp, RefreshCw, Calendar,
  Target, Activity, BookOpen, Layers, Share2, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNav from '@/components/layout/PublicNav';
import PublicFooter from '@/components/layout/PublicFooter';
import ParticleBackground from '@/components/ui/ParticleBackground';
import AIWorkflowVisual from '@/components/ui/AIWorkflowVisual';

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
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.93 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE_OUT_CURVE } },
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

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

interface FeatureGroup {
  category: string;
  tagline: string;
  icon: React.ElementType;
  color: string;
  features: Feature[];
}

const featureGroups: FeatureGroup[] = [
  {
    category: 'Intelligence',
    tagline: 'AI that knows your business',
    icon: Brain,
    color: ACCENT,
    features: [
      {
        icon: Globe,
        title: 'Automatic Website Intelligence',
        description: 'Paste your URL and the AI crawls your site, extracting your brand voice, products, pricing, services, and target audience. No manual briefs. No briefing documents.',
        color: ACCENT,
      },
      {
        icon: Brain,
        title: 'Brand Voice & Tone Learning',
        description: 'The AI learns how your brand speaks, what topics you own, and how your audience engages — then applies that consistently across every piece of generated content.',
        color: CYAN,
      },
      {
        icon: Cpu,
        title: 'Product & Service Mapping',
        description: 'Every product feature, pricing tier, and service offering is automatically extracted and fed into content generation — so the AI always promotes what matters most.',
        color: '#6366f1',
      },
    ],
  },
  {
    category: 'Content Creation',
    tagline: 'Platform-native content at scale',
    icon: Sparkles,
    color: CYAN,
    features: [
      {
        icon: Sparkles,
        title: 'AI Content Generation',
        description: 'Three content batches per day — morning, midday, and evening. Each post is written natively for its platform: captions for Instagram, threads for X, scripts for TikTok, articles for LinkedIn.',
        color: ACCENT,
      },
      {
        icon: Image,
        title: 'Media & Asset Management',
        description: 'Upload your brand images, product photos, and videos. The AI incorporates them into generated content automatically, selecting the most relevant asset per post.',
        color: CYAN,
      },
      {
        icon: BookOpen,
        title: 'Blog Post Generator',
        description: 'Long-form blog content generated from your brand knowledge — SEO-structured, voice-accurate, and ready to publish to your website or CMS.',
        color: '#6366f1',
      },
      {
        icon: RefreshCw,
        title: 'Content Repurposing',
        description: 'Automatically transform existing content into new formats — turn a blog post into 6 social posts, a product page into an Instagram carousel, or a review into a Twitter thread.',
        color: ACCENT,
      },
    ],
  },
  {
    category: 'Publishing & Scheduling',
    tagline: 'Automated distribution across 12 channels',
    icon: Share2,
    color: '#10B981',
    features: [
      {
        icon: Calendar,
        title: 'Smart Scheduling',
        description: 'AI calculates the optimal posting time for each platform and audience. Posts are automatically scheduled in morning, midday, and evening batches tailored for maximum reach.',
        color: '#10B981',
      },
      {
        icon: Share2,
        title: '12-Platform Distribution',
        description: 'YouTube, TikTok, Instagram, Facebook, X, LinkedIn, Pinterest, Reddit, Bluesky, Threads, Telegram, and Snapchat — all connected and managed from a single dashboard.',
        color: ACCENT,
      },
      {
        icon: Shield,
        title: 'Approval Queue',
        description: 'Every post passes through your editorial queue before publishing. Approve in one click, edit inline, or reject and regenerate. You stay in control at all times.',
        color: '#6366f1',
      },
      {
        icon: Clock,
        title: 'Content Calendar',
        description: 'Full calendar view of everything scheduled across all platforms. Drag, drop, reschedule, or manually add posts at any time — with complete visibility over your publishing pipeline.',
        color: CYAN,
      },
    ],
  },
  {
    category: 'Analytics & Optimisation',
    tagline: 'Data-driven intelligence that improves over time',
    icon: BarChart3,
    color: '#F59E0B',
    features: [
      {
        icon: BarChart3,
        title: 'Performance Analytics',
        description: 'Per-platform analytics covering views, engagement, click-through rates, shares, and conversions. Updated in real time so you always know what\'s performing.',
        color: '#F59E0B',
      },
      {
        icon: TrendingUp,
        title: 'AI Optimisation Engine',
        description: 'The AI continuously analyses your top-performing content and automatically shifts your strategy — adjusting tone, format, timing, and topics to maximise results.',
        color: ACCENT,
      },
      {
        icon: Activity,
        title: 'Competitor Intelligence',
        description: 'Monitor what\'s trending in your niche and see what competitor content is gaining traction. Use those insights to stay ahead and capitalise on moments as they happen.',
        color: CYAN,
      },
    ],
  },
  {
    category: 'Growth & Leads',
    tagline: 'Turn social presence into business results',
    icon: Target,
    color: '#EC4899',
    features: [
      {
        icon: Users,
        title: 'Lead Capture & Scoring',
        description: 'AI captures leads from social comments, link clicks, and UTM-tracked campaigns. Each lead is scored 0–100 for priority and automatically added to your pipeline.',
        color: '#EC4899',
      },
      {
        icon: MessageSquare,
        title: 'Engagement Handling',
        description: 'AI monitors comments and messages across all connected platforms, drafts contextual replies that match your brand voice, and flags high-priority interactions for your review.',
        color: ACCENT,
      },
      {
        icon: Target,
        title: 'Campaign Management',
        description: 'Create themed campaigns for product launches, promotions, and seasonal moments. The AI generates a complete content series, schedules it, and tracks performance across all channels.',
        color: CYAN,
      },
    ],
  },
  {
    category: 'Platform & Access',
    tagline: 'Built for teams, agencies, and multi-brand operators',
    icon: Layers,
    color: '#6366f1',
    features: [
      {
        icon: Layers,
        title: 'Multi-Business Management',
        description: 'Manage up to 20 separate businesses from a single account. Each business has its own knowledge base, content strategy, social connections, and analytics — fully isolated.',
        color: '#6366f1',
      },
      {
        icon: Lock,
        title: 'Secure App-Owned Auth',
        description: 'Full JWT-based authentication with no third-party dependency. Register, login, manage sessions, and protect your dashboard — all owned and controlled by the platform.',
        color: ACCENT,
      },
      {
        icon: Globe,
        title: 'API-Ready Architecture',
        description: 'Every feature accessible via API. Add your own LLM keys, connect external platforms, plug in custom integrations, and control cost and routing from your settings.',
        color: CYAN,
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: TEXT }}>
      <PublicNav activePath="/features" />

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ParticleBackground opacity={0.35} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,255,0.20) 0%, transparent 70%)' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={staggerContainer(0.12, 0.05)} initial="hidden" animate="show">
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.3)', color: '#93c5fd' }}>
              <Sparkles className="w-3.5 h-3.5" />
              Platform Capabilities
            </motion.div>
            <motion.h1 variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6"
              style={{ color: TEXT }}>
              Built for autonomous marketing.
              <br />
              <span style={{ background: `linear-gradient(90deg, ${ACCENT}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Designed to run itself.
              </span>
            </motion.h1>
            <motion.p variants={fadeUp}
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: SUB }}>
              A complete AI marketing platform that creates, schedules, and publishes content across 12 channels — fully autonomously.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="px-8 font-semibold text-base"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #1d4ed8)`, color: '#fff', boxShadow: '0 0 24px rgba(37,99,255,0.32)' }}>
                  Start Free — 7 Days
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="px-8 font-medium text-base"
                  style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                  View Pricing
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Workflow visual */}
      <Section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp}
            className="rounded-2xl p-8"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <p className="text-xs font-semibold text-center mb-6" style={{ color: MUTED }}>THE AUTONOMOUS PIPELINE</p>
            <AIWorkflowVisual />
          </motion.div>
        </div>
      </Section>

      {/* Feature groups */}
      {featureGroups.map((group, gi) => {
        const GroupIcon = group.icon;
        return (
          <Section key={group.category} className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {/* Group header */}
              <motion.div variants={staggerContainer(0.08)} className="mb-10">
                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${group.color}18`, border: `1px solid ${group.color}35` }}>
                    <GroupIcon className="w-4 h-4" style={{ color: group.color }} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: group.color }}>
                    {group.category}
                  </span>
                </motion.div>
                <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: TEXT }}>
                  {group.tagline}
                </motion.h2>
              </motion.div>

              {/* Feature cards for this group */}
              <motion.div
                variants={staggerContainer(0.07)}
                className={`grid gap-5 ${
                  group.features.length === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' :
                  group.features.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' :
                  'sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {group.features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.title}
                      variants={scaleIn}
                      className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200"
                      style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                      whileHover={{
                        borderColor: `${f.color}40`,
                        boxShadow: `0 0 24px ${f.color}14`,
                        y: -2,
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${f.color}18`, color: f.color }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-2" style={{ color: TEXT }}>{f.title}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{f.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Divider between groups (not last) */}
              {gi < featureGroups.length - 1 && (
                <div className="mt-16 border-b" style={{ borderColor: BORDER }} />
              )}
            </div>
          </Section>
        );
      })}

      {/* CTA */}
      <Section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={staggerContainer(0.1)}
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,255,0.15) 0%, rgba(34,211,238,0.08) 100%)',
              border: '1px solid rgba(37,99,255,0.25)',
              boxShadow: '0 0 60px rgba(37,99,255,0.10)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(37,99,255,0.12) 0%, transparent 70%)' }} />
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 relative"
              style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.3)', color: '#93c5fd' }}>
              <Zap className="w-3.5 h-3.5" />
              7-Day Free Trial — No Card Required
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4 relative" style={{ color: TEXT }}>
              Ready to see it in action?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg mb-8 relative" style={{ color: MUTED }}>
              Start your 7-day free trial — full platform access from day one. No credit card needed.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Link to="/register">
                <Button size="lg" className="px-10 font-semibold text-base"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #1d4ed8)`, color: '#fff', boxShadow: '0 0 24px rgba(37,99,255,0.32)' }}>
                  Start Free — 7 Days
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="px-10 font-medium text-base"
                  style={{ borderColor: BORDER, color: SUB, background: 'transparent' }}>
                  View Pricing
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
