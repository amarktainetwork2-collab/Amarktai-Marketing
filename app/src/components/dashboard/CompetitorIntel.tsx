import { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Eye, 
  Heart,
  MessageCircle,
  Share2,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Search,
  Filter,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/motion';

interface Competitor {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  engagement: number;
  postsPerWeek: number;
  growth: number;
  topContent: string[];
  strengths: string[];
  weaknesses: string[];
}

interface TrendingTopic {
  topic: string;
  volume: number;
  growth: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  related: string[];
}

const mockCompetitors: Competitor[] = [
  {
    id: 'comp-1',
    name: 'TechVision Pro',
    handle: '@techvision',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
    followers: 245000,
    engagement: 4.8,
    postsPerWeek: 14,
    growth: 12.5,
    topContent: ['Product Reviews', 'Tech Tips', 'Industry News'],
    strengths: ['High video quality', 'Consistent posting', 'Strong CTAs'],
    weaknesses: ['Limited engagement', 'Slow response time']
  },
  {
    id: 'comp-2',
    name: 'Digital Daily',
    handle: '@digitaldaily',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
    followers: 189000,
    engagement: 6.2,
    postsPerWeek: 21,
    growth: 8.3,
    topContent: ['Tutorials', 'Behind the Scenes', 'User Stories'],
    strengths: ['Great storytelling', 'High engagement', 'Community building'],
    weaknesses: ['Inconsistent branding', 'Long videos']
  },
  {
    id: 'comp-3',
    name: 'Innovate Hub',
    handle: '@innovatehub',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    followers: 320000,
    engagement: 3.9,
    postsPerWeek: 10,
    growth: -2.1,
    topContent: ['Interviews', 'Case Studies', 'Webinars'],
    strengths: ['Authority content', 'Expert guests'],
    weaknesses: ['Low post frequency', 'Declining engagement']
  }
];

const mockTrends: TrendingTopic[] = [
  { topic: '#AITools', volume: 2450000, growth: 145, sentiment: 'positive', related: ['#ChatGPT', '#AIAutomation', '#MachineLearning'] },
  { topic: '#RemoteWork', volume: 1890000, growth: 23, sentiment: 'neutral', related: ['#WorkFromHome', '#DigitalNomad', '#Productivity'] },
  { topic: '#Sustainability', volume: 3200000, growth: 67, sentiment: 'positive', related: ['#EcoFriendly', '#GreenTech', '#ClimateAction'] },
  { topic: '#Metaverse', volume: 980000, growth: -15, sentiment: 'negative', related: ['#VR', '#VirtualReality', '#Web3'] }
];



export function CompetitorIntel() {
  const [competitors] = useState<Competitor[]>(mockCompetitors);
  const [trends] = useState<TrendingTopic[]>(mockTrends);
  const [searchQuery, setSearchQuery] = useState('');

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-500/20';
      case 'negative': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Target, label: 'Competitors Tracked', value: '12', color: 'text-red-400', bg: 'bg-red-500/20' },
          { icon: TrendingUp, label: 'Avg Growth Rate', value: '+8.4%', color: 'text-green-400', bg: 'bg-green-500/20' },
          { icon: Eye, label: 'Content Analyzed', value: '2.4K', color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { icon: Zap, label: 'Opportunities', value: '7', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs defaultValue="competitors" className="w-full">
        <TabsList className="bg-slate-800/50 mb-4">
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="trends">Trending Topics</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="competitors" className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search competitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700"
              />
            </div>
            <Button variant="outline" className="border-slate-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Competitor Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {competitors.map((comp, idx) => (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 h-full">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={comp.avatar} 
                          alt={comp.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-slate-200">{comp.name}</h4>
                          <p className="text-sm text-slate-400">{comp.handle}</p>
                        </div>
                      </div>
                      <Badge className={comp.growth > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {comp.growth > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {Math.abs(comp.growth)}%
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <Users className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                        <p className="text-sm font-medium text-slate-200">{(comp.followers / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-slate-400">Followers</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <Heart className="w-4 h-4 mx-auto mb-1 text-pink-400" />
                        <p className="text-sm font-medium text-slate-200">{comp.engagement}%</p>
                        <p className="text-xs text-slate-400">Engagement</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <BarChart3 className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                        <p className="text-sm font-medium text-slate-200">{comp.postsPerWeek}</p>
                        <p className="text-xs text-slate-400">Posts/Week</p>
                      </div>
                    </div>

                    {/* Top Content */}
                    <div className="mb-4">
                      <p className="text-xs text-slate-400 mb-2">Top Content Types</p>
                      <div className="flex flex-wrap gap-1">
                        {comp.topContent.map((type, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-slate-700/50 rounded text-slate-300">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-green-400 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Strengths
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {comp.strengths.map((s, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-green-500/10 rounded text-green-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-red-400 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Weaknesses
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {comp.weaknesses.map((w, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-red-500/10 rounded text-red-300">
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.map((trend, idx) => (
              <motion.div
                key={trend.topic}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-slate-200 text-lg">{trend.topic}</h4>
                        <p className="text-sm text-slate-400">{(trend.volume / 1000000).toFixed(1)}M mentions</p>
                      </div>
                      <Badge className={getSentimentColor(trend.sentiment)}>
                        {trend.sentiment}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className={`w-4 h-4 ${trend.growth > 0 ? 'text-green-400' : 'text-red-400'}`} />
                      <span className={`font-medium ${trend.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.growth > 0 ? '+' : ''}{trend.growth}% this week
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {trend.related.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-slate-700/50 rounded-full text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="opportunities">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Sparkles className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-200 mb-1">Content Gap Identified</h4>
                    <p className="text-sm text-slate-400 mb-3">
                      Your competitors are not covering AI automation topics extensively. This is a high-opportunity area with growing search volume.
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-green-500/20 text-green-400">High Impact</Badge>
                      <Badge className="bg-blue-500/20 text-blue-400">Low Competition</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-200 mb-1">Optimal Posting Time</h4>
                    <p className="text-sm text-slate-400 mb-3">
                      Competitors post mostly at 9 AM. Consider posting at 6-7 PM when engagement is 34% higher but competition is lower.
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-500/20 text-blue-400">Timing</Badge>
                      <Badge className="bg-purple-500/20 text-purple-400">Strategy</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-200 mb-1">Engagement Opportunity</h4>
                    <p className="text-sm text-slate-400 mb-3">
                      Top competitors respond to comments within 2 hours. Your average is 6 hours. Faster response could increase loyalty.
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-purple-500/20 text-purple-400">Engagement</Badge>
                      <Badge className="bg-orange-500/20 text-orange-400">Quick Win</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border-orange-500/30">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <Share2 className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-200 mb-1">Cross-Platform Strategy</h4>
                    <p className="text-sm text-slate-400 mb-3">
                      Competitors with 3+ platforms see 2.3x higher reach. Consider expanding to LinkedIn for B2B content.
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-orange-500/20 text-orange-400">Expansion</Badge>
                      <Badge className="bg-green-500/20 text-green-400">High ROI</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
