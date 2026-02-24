import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Rocket, Zap, BarChart3, Shield, Clock, Globe, 
  Check, ChevronRight, Play, Star, Menu, X,
  Youtube, Instagram, Facebook, Twitter, Linkedin, Music,
  Shuffle, Search, MessageSquarePlus, RefreshCw, Eye,
  TrendingUp, Users, FlaskConical, Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { pricingPlans } from '@/lib/mockData';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI-Powered Content',
      description: 'HuggingFace Mistral generates platform-native posts, scripts and captions for all 6 channels — 3× daily.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '3× Daily Automation',
      description: 'Morning, midday and evening content batches generated and queued for approval automatically.',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: '12 Platforms, One Dashboard',
      description: 'Manage YouTube, TikTok, Instagram, Facebook, X, LinkedIn, Pinterest, Reddit, Bluesky, Threads, Telegram and Snapchat from one place.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Performance Analytics',
      description: 'Track views, engagement, and conversions with detailed analytics for each platform.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Full Control',
      description: 'Approve, edit, or reject any content before it goes live. You\'re always in control.',
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Self-Optimizing',
      description: 'AI learns from performance data to continuously improve your content strategy over time.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Lead Capture & Scoring',
      description: 'Auto-capture leads from social comments and UTM links. HF AI scores every lead 0-100 for prioritization.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'SEO Blog Generator',
      description: 'Generate long-form SEO blog posts with HuggingFace to drive organic Google traffic and leads — then remix them into social posts.',
    },
  ];

  const powerTools = [
    { icon: Shuffle, color: 'text-violet-600', bg: 'bg-violet-50', title: 'Content Remix Engine', description: 'Remix any blog or URL into 6-platform snippets with trending hashtags. Daily auto-batches.' },
    { icon: Search, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Competitor Shadow Analyzer', description: 'Nightly competitor scraping. Spot content gaps and get AI counter-strategies automatically.' },
    { icon: MessageSquarePlus, color: 'text-green-600', bg: 'bg-green-50', title: 'Feedback Alchemy', description: 'Transform reviews into ad copy, response templates and A/B test ideas.' },
    { icon: RefreshCw, color: 'text-orange-600', bg: 'bg-orange-50', title: 'Social Echo Amplifier', description: 'Turn visitor queries into amplified social threads ranked by virality score.' },
    { icon: Eye, color: 'text-pink-600', bg: 'bg-pink-50', title: 'SEO Mirage Creator', description: 'Generate SEO-optimised titles, alt texts and hashtags tuned to each platform algorithm.' },
    { icon: Shield, color: 'text-red-600', bg: 'bg-red-50', title: 'Churn Shield Defender', description: 'Predict audience churn daily. Auto-generate re-engagement posts and DM templates.' },
    { icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', title: 'Dynamic Harmony Pricer', description: 'Adjust social ad prices based on buzz, sentiment and competitor data.' },
    { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', title: 'Viral Spark Igniter', description: 'Daily viral opportunity report with hooks, challenges and optimal posting windows.' },
    { icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'Audience Mirage Mapper', description: 'Map psychographic segments and get per-segment campaign ideas and predicted CTR.' },
    { icon: FlaskConical, color: 'text-teal-600', bg: 'bg-teal-50', title: 'Ad Alchemy Optimizer', description: 'Generate 3 A/B ad copy variants, score against global benchmarks, pick the winner.' },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Connect Your Apps',
      description: 'Add your web apps, connect 12 social accounts and enter your HuggingFace API key in minutes.',
    },
    {
      step: '02',
      title: 'AI Generates Everything',
      description: 'Every morning, midday and evening our AI creates platform-optimised posts, SEO blog posts, and power tool reports.',
    },
    {
      step: '03',
      title: 'Approve & Publish',
      description: 'Review content with one click. Approved posts go live automatically across all connected platforms.',
    },
    {
      step: '04',
      title: 'Leads Flow In',
      description: 'UTM-tracked links, comment-to-lead capture, and AI-scored leads fill your pipeline daily on autopilot.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Founder, TaskFlow Pro',
      content: 'Amarktai Marketing transformed our social media presence. We went from 2 posts a week to 12 posts a day across all platforms. Our traffic increased 340% in just 3 months.',
      avatar: 'SC',
    },
    {
      name: 'Marcus Johnson',
      role: 'CEO, CodeSnippet',
      description: 'The AI-generated content is surprisingly good. It understands our product and creates engaging posts that resonate with developers. Best marketing investment we\'ve made.',
      avatar: 'MJ',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Director, SaaSify',
      content: 'I used to spend 20+ hours a week on social media. Now I spend 15 minutes each morning reviewing content. The ROI is incredible.',
      avatar: 'ER',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Amarktai
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="block text-gray-600 hover:text-gray-900">How It Works</a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900">Pricing</a>
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">Sign In</Button>
              </Link>
              <Link to="/register" className="block">
                <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                Part of Amarktai Network
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Autonomous AI{' '}
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Social Media Marketing
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Promote your web apps across 12 platforms daily with zero manual effort. 
                AI generates content, captures leads, and writes SEO blog posts — you approve with one click.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                    Start Free Trial
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-1" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-1" />
                  14-day free trial
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-white rounded-2xl shadow-2xl border overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-4 text-sm text-gray-500">Amarktai Dashboard</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Today's Content</p>
                      <p className="text-2xl font-bold">12 posts ready</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">All Platforms</Badge>
                  </div>
                  <div className="space-y-3">
                    {['YouTube Short', 'TikTok Video', 'Instagram Reel'].map((item, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Play className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item}</p>
                          <p className="text-sm text-gray-500">AI Generated • 30s</p>
                        </div>
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600">
                    Approve All & Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Logos */}
      <section className="py-12 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 mb-8">Works with all 12 major platforms</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {[
              { icon: Youtube, label: 'YouTube' },
              { icon: Music, label: 'TikTok' },
              { icon: Instagram, label: 'Instagram' },
              { icon: Facebook, label: 'Facebook' },
              { icon: Twitter, label: 'X / Twitter' },
              { icon: Linkedin, label: 'LinkedIn' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center space-x-2 text-gray-400">
                <Icon className="w-7 h-7" />
                <span className="font-semibold text-sm">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-4">
            + Pinterest · Reddit · Bluesky · Threads · Telegram · Snapchat
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Scale Your Marketing
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered exclusively by HuggingFace — the only API key you need.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:from-violet-200 group-hover:to-indigo-200 transition-colors">
                    <div className="text-violet-600">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Power Tools Section */}
      <section id="tools" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-600 text-white mb-4">10 AI Power Tools</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Autonomous Marketing Add-Ons
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Each tool runs daily on autopilot via HuggingFace. Together they create a self-improving
              marketing system that works while you sleep.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {powerTools.map((tool, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-colors border border-gray-700 hover:border-violet-500">
                <div className={`w-10 h-10 ${tool.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <tool.icon className={`w-5 h-5 ${tool.color}`} />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{tool.title}</h3>
                <p className="text-xs text-gray-400">{tool.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                <Wrench className="w-4 h-4 mr-2" />
                Unlock All 10 Power Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to autonomous social media marketing
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-violet-100 mb-4">{step.step}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 transform translate-x-1/2">
                    <ChevronRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.highlighted ? 'border-violet-500 shadow-xl scale-105' : ''}`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button 
                      className={`w-full ${plan.highlighted 
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700' 
                        : ''}`}
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by Founders</h2>
            <p className="text-xl text-gray-600">See what our customers are saying</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">{testimonial.content}</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Automate Your Social Media?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of founders who are scaling their marketing with AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                Start Free Trial
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Amarktai</span>
              </div>
              <p className="text-gray-400">
                Autonomous AI social media marketing for web app founders.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Amarktai Marketing. Part of Amarktai Network.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
