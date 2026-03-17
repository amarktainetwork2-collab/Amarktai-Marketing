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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Views',
      value: analytics?.totalViews.toLocaleString() || '0',
      change: '+28%',
      icon: Eye,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      title: 'Engagement',
      value: analytics?.totalEngagement.toLocaleString() || '0',
      change: '+15%',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'Avg. CTR',
      value: `${analytics?.avgCtr || 0}%`,
      change: '+5%',
      icon: MousePointer,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-16" />
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
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Good morning! 👋</h2>
            <p className="text-violet-100">
              You have {pendingContent.length} posts waiting for approval today.
            </p>
          </div>
          <Link to="/dashboard/approval" className="mt-4 md:mt-0">
            <Button variant="secondary" className="bg-white text-violet-600 hover:bg-gray-100">
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Approval */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-violet-600" />
              Pending Approval
            </CardTitle>
            <Link to="/dashboard/approval">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingContent.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">All caught up! No pending content.</p>
                <p className="text-sm text-gray-400 mt-1">
                  New content will be generated tonight at 2:00 AM.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingContent.slice(0, 3).map((content) => (
                  <div 
                    key={content.id} 
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {content.mediaUrls[0] ? (
                        <img 
                          src={content.mediaUrls[0]} 
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {content.platform}
                        </Badge>
                        <span className="text-sm text-gray-500 capitalize">
                          {content.type}
                        </span>
                      </div>
                      <p className="font-medium mt-1 truncate">{content.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {content.caption}
                      </p>
                    </div>
                  </div>
                ))}
                {pendingContent.length > 3 && (
                  <p className="text-center text-sm text-gray-500">
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
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/dashboard/webapps/new">
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  Add New Web App
                </Button>
              </Link>
              <Link to="/dashboard/platforms">
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Connect Platforms
                </Button>
              </Link>
              <Link to="/dashboard/content">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Content Library
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm">AI Generation</span>
                </div>
                <Badge variant="outline" className="text-green-600">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm">Platform APIs</span>
                </div>
                <Badge variant="outline" className="text-green-600">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-violet-500 mr-2" />
                  <span className="text-sm">Next Generation</span>
                </div>
                <span className="text-sm text-gray-500">2:00 AM</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Monthly Usage</span>
                  <span className="font-medium">340 / 360 posts</span>
                </div>
                <Progress value={94} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {analytics && Object.entries(analytics.platformBreakdown).map(([platform, stats]) => (
              <div key={platform} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 capitalize">{platform}</p>
                <p className="text-xl font-bold">{stats.views.toLocaleString()}</p>
                <p className="text-xs text-gray-400">views</p>
                <div className="mt-2 flex items-center text-sm">
                  <Heart className="w-3 h-3 mr-1 text-pink-500" />
                  <span>{stats.engagement.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
