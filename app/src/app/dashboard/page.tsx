import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Eye,
  Heart,
  MousePointer,
  ArrowRight,
  Clock,
  CheckCircle,
  Globe,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Content, AnalyticsSummary } from '@/types';
import { contentApi, analyticsApi } from '@/lib/api';

const cardStyle = {
  background: 'rgba(17,24,39,0.72)',
  border: '1px solid rgba(255,255,255,0.10)',
};

export default function DashboardPage() {
  const [pendingContent, setPendingContent] = useState<Content[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pending, stats] = await Promise.all([
          contentApi.getPending(),
          analyticsApi.getSummary(),
        ]);
        setPendingContent(pending);
        setAnalytics(stats);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsCards = [
    {
      title: 'Total Posts',
      value: analytics?.totalPosts || 0,
      change: '+12%',
      icon: TrendingUp,
      iconColor: '#2563FF',
      iconBg: 'rgba(37,99,255,0.12)',
    },
    {
      title: 'Total Views',
      value: analytics?.totalViews.toLocaleString() || '0',
      change: '+28%',
      icon: Eye,
      iconColor: '#22D3EE',
      iconBg: 'rgba(34,211,238,0.12)',
    },
    {
      title: 'Engagement',
      value: analytics?.totalEngagement.toLocaleString() || '0',
      change: '+15%',
      icon: Heart,
      iconColor: '#10B981',
      iconBg: 'rgba(16,185,129,0.12)',
    },
    {
      title: 'Avg. CTR',
      value: `${analytics?.avgCtr || 0}%`,
      change: '+5%',
      icon: MousePointer,
      iconColor: '#F59E0B',
      iconBg: 'rgba(245,158,11,0.12)',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse" style={cardStyle}>
              <CardContent className="p-6">
                <div className="h-4 rounded w-24 mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="h-8 rounded w-16" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(37,99,255,0.2) 0%, rgba(34,211,238,0.1) 100%)',
          border: '1px solid rgba(37,99,255,0.25)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Good morning! 👋</h2>
            <p className="text-slate-300">
              You have {pendingContent.length} posts waiting for approval today.
            </p>
          </div>
          <Link to="/dashboard/approval" className="mt-4 md:mt-0">
            <Button
              variant="outline"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#CBD5E1', background: 'rgba(255,255,255,0.05)' }}
            >
              Review Content
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card style={cardStyle}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1 text-slate-100">{stat.value}</p>
                    <p className="text-xs mt-1" style={{ color: '#10B981' }}>{stat.change} from last month</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: stat.iconBg }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.iconColor }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Approval */}
        <Card className="lg:col-span-2" style={cardStyle}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-slate-100">
              <CheckCircle className="w-5 h-5 mr-2" style={{ color: '#2563FF' }} />
              Pending Approval
            </CardTitle>
            <Link to="/dashboard/approval">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingContent.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#10B981' }} />
                <p className="text-slate-400">All caught up! No pending content.</p>
                <p className="text-sm text-slate-500 mt-1">
                  New content will be generated tonight at 2:00 AM.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingContent.slice(0, 3).map((content) => (
                  <div
                    key={content.id}
                    className="flex items-start space-x-4 p-4 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <div
                      className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      {content.mediaUrls[0] ? (
                        <img
                          src={content.mediaUrls[0]}
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#94A3B8' }}>
                          {content.platform}
                        </Badge>
                        <span className="text-sm text-slate-500 capitalize">
                          {content.type}
                        </span>
                      </div>
                      <p className="font-medium mt-1 truncate text-slate-200">{content.title}</p>
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {content.caption}
                      </p>
                    </div>
                  </div>
                ))}
                {pendingContent.length > 3 && (
                  <p className="text-center text-sm text-slate-500">
                    +{pendingContent.length - 3} more items
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card style={cardStyle}>
            <CardHeader>
              <CardTitle className="text-slate-100">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/dashboard/webapps/new">
                <Button variant="outline" className="w-full justify-start" style={{ borderColor: 'rgba(255,255,255,0.10)', color: '#94A3B8', background: 'transparent' }}>
                  <Globe className="w-4 h-4 mr-2" />
                  Add New Web App
                </Button>
              </Link>
              <Link to="/dashboard/platforms">
                <Button variant="outline" className="w-full justify-start" style={{ borderColor: 'rgba(255,255,255,0.10)', color: '#94A3B8', background: 'transparent' }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Connect Platforms
                </Button>
              </Link>
              <Link to="/dashboard/content">
                <Button variant="outline" className="w-full justify-start" style={{ borderColor: 'rgba(255,255,255,0.10)', color: '#94A3B8', background: 'transparent' }}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Content Library
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card style={cardStyle}>
            <CardHeader>
              <CardTitle className="text-slate-100">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" style={{ color: '#10B981' }} />
                  <span className="text-sm text-slate-300">Automation Engine</span>
                </div>
                <Badge variant="outline" style={{ borderColor: 'rgba(16,185,129,0.4)', color: '#10B981' }}>Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" style={{ color: '#10B981' }} />
                  <span className="text-sm text-slate-300">Platform APIs</span>
                </div>
                <Badge variant="outline" style={{ borderColor: 'rgba(16,185,129,0.4)', color: '#10B981' }}>Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" style={{ color: '#2563FF' }} />
                  <span className="text-sm text-slate-300">Next Generation</span>
                </div>
                <span className="text-sm text-slate-400">2:00 AM</span>
              </div>
              <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Monthly Usage</span>
                  <span className="font-medium text-slate-200">340 / 360 posts</span>
                </div>
                <Progress value={94} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Performance */}
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle className="text-slate-100">Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {analytics && Object.entries(analytics.platformBreakdown).map(([platform, stats]) => (
              <div key={platform} className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-sm text-slate-400 capitalize">{platform}</p>
                <p className="text-xl font-bold text-slate-100">{stats.views.toLocaleString()}</p>
                <p className="text-xs text-slate-500">views</p>
                <div className="mt-2 flex items-center text-sm">
                  <Heart className="w-3 h-3 mr-1" style={{ color: '#10B981' }} />
                  <span className="text-slate-300">{stats.engagement.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
