import { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  Zap,
  BarChart3,
  Users,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  Bell,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariantsSlow, itemVariantsX } from '@/lib/motion';
import { insightsApi } from '@/lib/api';
import { usePolling } from '@/lib/usePolling';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'tip' | 'achievement';
  title: string;
  description: string;
  action?: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  read: boolean;
}

export function AIInsightsFeed() {
  const { data: rawInsights, loading, error, refresh } = usePolling(
    () => insightsApi.getAll(),
    30_000,
  );
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'unread' | 'opportunity' | 'warning'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const insights: Insight[] = (rawInsights ?? []).map(i => ({
    ...i as Insight,
    read: (i as Insight).read || readIds.has(i.id),
  }));

  const unreadCount = insights.filter(i => !i.read).length;

  const filteredInsights = insights.filter(insight => {
    if (filter === 'unread') return !insight.read;
    if (filter === 'opportunity') return insight.type === 'opportunity';
    if (filter === 'warning') return insight.type === 'warning';
    return true;
  });

  const markAsRead = (id: string) => {
    setReadIds(prev => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    setReadIds(new Set(insights.map(i => i.id)));
  };

  const refreshInsights = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return { icon: Target, color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'warning': return { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 'trend': return { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'tip': return { icon: Lightbulb, color: 'text-purple-400', bg: 'bg-purple-500/20' };
      case 'achievement': return { icon: CheckCircle2, color: 'text-pink-400', bg: 'bg-pink-500/20' };
      default: return { icon: Sparkles, color: 'text-slate-400', bg: 'bg-slate-500/20' };
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-slate-400 mb-3">{error}</p>
          <Button onClick={refreshInsights} variant="outline" className="border-slate-600 text-slate-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div 
        variants={containerVariantsSlow}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Sparkles, label: 'Total Insights', value: insights.length.toString(), color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { icon: Bell, label: 'Unread', value: unreadCount.toString(), color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { icon: Target, label: 'Opportunities', value: insights.filter(i => i.type === 'opportunity').length.toString(), color: 'text-green-400', bg: 'bg-green-500/20' },
          { icon: AlertTriangle, label: 'Warnings', value: insights.filter(i => i.type === 'warning').length.toString(), color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariantsX}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Insights Feed
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500/20 text-red-400 ml-2">
                      {unreadCount} new
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshInsights}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mt-4">
                {[
                  { key: 'all', label: 'All', count: insights.length },
                  { key: 'unread', label: 'Unread', count: unreadCount },
                  { key: 'opportunity', label: 'Opportunities', count: insights.filter(i => i.type === 'opportunity').length },
                  { key: 'warning', label: 'Warnings', count: insights.filter(i => i.type === 'warning').length },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as typeof filter)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      filter === f.key
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {f.label}
                    <span className="ml-1.5 text-xs opacity-60">({f.count})</span>
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredInsights.map((insight, index) => {
                  const { icon: Icon, color, bg } = getInsightIcon(insight.type);
                  return (
                    <motion.div
                      key={insight.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => markAsRead(insight.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        !insight.read
                          ? 'bg-slate-800/70 border border-purple-500/30'
                          : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-medium ${!insight.read ? 'text-slate-200' : 'text-slate-400'}`}>
                                  {insight.title}
                                </h4>
                                {!insight.read && (
                                  <span className="w-2 h-2 bg-purple-500 rounded-full" />
                                )}
                              </div>
                              <p className="text-sm text-slate-400 mb-2">{insight.description}</p>
                              {insight.action && (
                                <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                                  {insight.action}
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <Badge className={getImpactBadge(insight.impact)}>
                                {insight.impact}
                              </Badge>
                              <p className="text-xs text-slate-500 mt-1">{insight.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredInsights.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-slate-400">All caught up! No insights to show.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg">This Week's Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Engagement Increase</p>
                    <p className="text-xl font-bold text-green-400">+24%</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">New Followers</p>
                    <p className="text-xl font-bold text-blue-400">+1,247</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Comments</p>
                    <p className="text-xl font-bold text-purple-400">+89</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Top Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Clock, text: 'Post at 6 PM for 34% more engagement', color: 'text-blue-400' },
                { icon: BarChart3, text: 'Use 5-8 hashtags for optimal reach', color: 'text-green-400' },
                { icon: Users, text: 'Reply to comments within 1 hour', color: 'text-yellow-400' },
                { icon: Target, text: 'Create more video content (+3x engagement)', color: 'text-purple-400' },
              ].map((rec, i) => (
                <div key={i} className="flex items-start gap-3">
                  <rec.icon className={`w-4 h-4 mt-0.5 ${rec.color}`} />
                  <p className="text-sm text-slate-300">{rec.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Goal */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Posts Published</span>
                <span className="text-sm font-medium text-slate-200">18 / 25</span>
              </div>
              <Progress value={72} className="h-2 mb-4" />
              <p className="text-xs text-slate-500">
                You're 72% towards your weekly goal. Keep it up!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
