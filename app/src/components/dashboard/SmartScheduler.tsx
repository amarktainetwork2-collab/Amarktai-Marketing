import { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/motion';

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

const generateTimeSlots = (): TimeSlot[] => {
  return Array.from({ length: 24 }, (_, i) => {
    const baseScore = Math.sin((i - 6) * Math.PI / 12) * 40 + 50;
    const randomVariation = Math.random() * 20 - 10;
    return {
      hour: i,
      score: Math.max(20, Math.min(95, baseScore + randomVariation)),
      audienceCount: Math.floor(Math.random() * 5000) + 1000,
      engagement: Math.random() * 8 + 2
    };
  });
};

const mockScheduledPosts: ScheduledPost[] = [
  {
    id: 'post-1',
    title: 'Product Launch Announcement',
    platform: 'Instagram',
    scheduledTime: 'Today, 6:00 PM',
    predictedEngagement: 12.5,
    optimalScore: 94,
    status: 'ready'
  },
  {
    id: 'post-2',
    title: 'Behind the Scenes Video',
    platform: 'TikTok',
    scheduledTime: 'Tomorrow, 7:30 PM',
    predictedEngagement: 15.2,
    optimalScore: 91,
    status: 'scheduled'
  },
  {
    id: 'post-3',
    title: 'Weekly Tips Thread',
    platform: 'Twitter',
    scheduledTime: 'Optimizing...',
    predictedEngagement: 8.7,
    optimalScore: 0,
    status: 'optimizing'
  }
];



export function SmartScheduler() {
  const [timeSlots] = useState<TimeSlot[]>(generateTimeSlots());
  const [scheduledPosts] = useState<ScheduledPost[]>(mockScheduledPosts);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(18);

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
          { icon: Clock, label: 'Optimal Time', value: '6:00 PM', color: 'text-green-400', bg: 'bg-green-500/20' },
          { icon: Users, label: 'Peak Audience', value: '4.2K', color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { icon: TrendingUp, label: 'Predicted Engagement', value: '+28%', color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { icon: Target, label: 'Optimization Score', value: '94%', color: 'text-orange-400', bg: 'bg-orange-500/20' },
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
              {selectedSlot !== null && (
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
