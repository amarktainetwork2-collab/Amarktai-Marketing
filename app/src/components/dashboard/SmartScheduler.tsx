import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  Users, 
  Zap,
  Sun,
  Moon,
  Target,
  CheckCircle2,
  Clock4,
  Globe,
  Sparkles,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/motion';
import { schedulerApi } from '@/lib/api';

interface TimeSlot {
  hour: number;
  score: number;
  audienceCount: number;
  engagement: number;
}

interface ScheduledPost {
  id: string;
  title: string;
  platform: string;
  scheduledTime: string;
  predictedEngagement: number;
  optimalScore: number;
  status: 'scheduled' | 'optimizing' | 'ready';
}

export function SmartScheduler() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [heatmapRes, postsRes] = await Promise.all([
        schedulerApi.getHeatmap(),
        schedulerApi.getScheduledPosts(),
      ]);

      const slots: TimeSlot[] = heatmapRes.time_slots.map(s => ({
        hour: s.hour,
        score: Math.round(s.score),
        audienceCount: s.audience_count,
        engagement: s.engagement,
      }));
      setTimeSlots(slots);

      const bestSlot = heatmapRes.best_slots[0];
      if (bestSlot) setSelectedSlot(bestSlot.hour);

      const posts: ScheduledPost[] = postsRes.map(p => ({
        id: p.id,
        title: p.title,
        platform: p.platform,
        scheduledTime: p.scheduled_time ?? 'Optimizing...',
        predictedEngagement: p.predicted_engagement,
        optimalScore: p.optimal_score,
        status: p.status as ScheduledPost['status'],
      }));
      setScheduledPosts(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scheduler data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll every 60 seconds for live scheduler feel
    const id = setInterval(() => fetchData(), 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const getHeatmapColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-t from-green-500 to-green-400';
    if (score >= 60) return 'bg-gradient-to-t from-yellow-500 to-yellow-400';
    if (score >= 40) return 'bg-gradient-to-t from-orange-500 to-orange-400';
    return 'bg-gradient-to-t from-slate-600 to-slate-500';
  };

  const getTimeLabel = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const bestSlots = timeSlots.filter(s => s.score >= 80).sort((a, b) => b.score - a.score).slice(0, 3);

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
          <Button onClick={fetchData} variant="outline" className="border-slate-600 text-slate-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
        <CardContent className="p-12 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No Scheduler Data</h3>
          <p className="text-slate-400">Connect a platform and start posting to see scheduling insights.</p>
        </CardContent>
      </Card>
    );
  }

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
          { icon: Clock, label: 'Optimal Time', value: bestSlots[0] ? getTimeLabel(bestSlots[0].hour) : '—', color: 'text-green-400', bg: 'bg-green-500/20' },
          { icon: Users, label: 'Peak Audience', value: bestSlots[0] ? `${(bestSlots[0].audienceCount / 1000).toFixed(1)}K` : '—', color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { icon: TrendingUp, label: 'Predicted Engagement', value: bestSlots[0] ? `+${bestSlots[0].engagement.toFixed(0)}%` : '—', color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { icon: Target, label: 'Optimization Score', value: bestSlots[0] ? `${bestSlots[0].score}%` : '—', color: 'text-orange-400', bg: 'bg-orange-500/20' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Calendar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Audience Activity Heatmap
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Auto-Optimize</span>
                    <Switch 
                      checked={autoOptimize} 
                      onCheckedChange={setAutoOptimize}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Time Period Labels */}
              <div className="flex justify-between mb-4 px-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Moon className="w-4 h-4" />
                  <span>Night</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Sun className="w-4 h-4" />
                  <span>Morning</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <span>Afternoon</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Moon className="w-4 h-4 text-purple-400" />
                  <span>Evening</span>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="grid grid-cols-12 gap-1 mb-4">
                {timeSlots.map((slot) => (
                  <motion.button
                    key={slot.hour}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSlot(slot.hour)}
                    className={`relative h-16 rounded-lg transition-all ${
                      selectedSlot === slot.hour 
                        ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' 
                        : ''
                    }`}
                  >
                    <div 
                      className={`absolute inset-0 rounded-lg ${getHeatmapColor(slot.score)}`}
                      style={{ opacity: slot.score / 100 }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-medium text-slate-200">{slot.hour}</span>
                      <span className="text-[10px] text-slate-300">{slot.score}%</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Low Activity</span>
                <div className="flex gap-1">
                  <div className="w-8 h-3 rounded bg-slate-600" />
                  <div className="w-8 h-3 rounded bg-orange-500" />
                  <div className="w-8 h-3 rounded bg-yellow-500" />
                  <div className="w-8 h-3 rounded bg-green-500" />
                </div>
                <span>Peak Activity</span>
              </div>

              {/* Selected Slot Details */}
              {selectedSlot !== null && timeSlots[selectedSlot] && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 bg-slate-800/50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-slate-200">
                      {getTimeLabel(selectedSlot)} - {getTimeLabel(selectedSlot + 1)}
                    </h4>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Optimal Slot
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Audience Online</p>
                      <p className="text-lg font-bold text-slate-200">
                        {timeSlots[selectedSlot].audienceCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Predicted Engagement</p>
                      <p className="text-lg font-bold text-green-400">
                        {timeSlots[selectedSlot].engagement.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Optimization Score</p>
                      <p className="text-lg font-bold text-blue-400">
                        {timeSlots[selectedSlot].score}%
                      </p>
                    </div>
                  </div>
                </motion.div>
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
          {/* Best Times */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Best Times Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bestSlots.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No optimal time slots found.</p>
              )}
              {bestSlots.map((slot, idx) => (
                <motion.div
                  key={slot.hour}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      idx === 0 ? 'bg-yellow-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Clock4 className={`w-4 h-4 ${idx === 0 ? 'text-yellow-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{getTimeLabel(slot.hour)}</p>
                      <p className="text-xs text-slate-400">{slot.audienceCount.toLocaleString()} online</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${slot.score >= 90 ? 'text-green-400' : 'text-blue-400'}`}>
                      {slot.score}%
                    </p>
                    <p className="text-xs text-slate-400">score</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Scheduled Posts */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Scheduled Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduledPosts.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No scheduled posts yet.</p>
              )}
              {scheduledPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-200 text-sm">{post.title}</h4>
                    {post.status === 'ready' && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                      </Badge>
                    )}
                    {post.status === 'optimizing' && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                        <Zap className="w-3 h-3 mr-1" /> Optimizing
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {post.platform}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.scheduledTime}
                    </span>
                  </div>
                  {post.optimalScore > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Optimization</span>
                        <span className="text-green-400">{post.optimalScore}%</span>
                      </div>
                      <Progress value={post.optimalScore} className="h-1.5" />
                    </div>
                  )}
                </motion.div>
              ))}

              <Button 
                variant="outline" 
                className="w-full border-dashed border-slate-600 text-slate-400 hover:text-slate-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule New Post
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-200 mb-1">AI Insight</h4>
                  <p className="text-sm text-slate-400">
                    Your audience is most active between 6-8 PM. Posting during these hours could increase engagement by up to 34%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
