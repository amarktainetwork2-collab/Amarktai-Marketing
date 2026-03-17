import { useState } from 'react';
import { 
  Repeat, 
  Copy, 
  Wand2,
  CheckCircle2,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Music,
  Sparkles,
  RefreshCw,
  Download,
  Eye,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/motion';

interface PlatformAdaptation {
  platform: string;
  icon: any;
  enabled: boolean;
  adaptations: {
    caption: string;
    hashtags: string[];
    format: string;
    duration?: string;
    aspectRatio: string;
  };
  status: 'pending' | 'generating' | 'completed' | 'error';
}

interface RepurposedContent {
  id: string;
  originalTitle: string;
  originalPlatform: string;
  adaptations: PlatformAdaptation[];
  createdAt: string;
}

const mockContent: RepurposedContent = {
  id: 'rep-1',
  originalTitle: '10 Productivity Tips for Remote Workers',
  originalPlatform: 'youtube',
  createdAt: '2024-01-15',
  adaptations: [
    {
      platform: 'instagram',
      icon: Instagram,
      enabled: true,
      adaptations: {
        caption: 'Swipe through for 10 game-changing productivity tips! Which one is your favorite? 💡\n\n#productivity #remotework #workfromhome #productivitytips #digitalnomad',
        hashtags: ['productivity', 'remotework', 'workfromhome', 'productivitytips', 'digitalnomad'],
        format: 'Carousel (10 slides)',
        aspectRatio: '1:1 Square'
      },
      status: 'completed'
    },
    {
      platform: 'tiktok',
      icon: Music,
      enabled: true,
      adaptations: {
        caption: 'POV: You discovered these 10 productivity hacks and your life changed forever 🔥\n\n#productivityhacks #remotework #wfh #worktips #viral',
        hashtags: ['productivityhacks', 'remotework', 'wfh', 'worktips', 'viral'],
        format: 'Video',
        duration: '60 seconds',
        aspectRatio: '9:16 Vertical'
      },
      status: 'completed'
    },
    {
      platform: 'twitter',
      icon: Twitter,
      enabled: true,
      adaptations: {
        caption: '🧵 10 Productivity Tips for Remote Workers (that actually work):\n\n1. Time-block your day\n2. Use the 2-minute rule\n3. Create a dedicated workspace\n4. Take walking meetings\n5. Batch similar tasks\n\n👇 Continued...',
        hashtags: ['Productivity', 'RemoteWork'],
        format: 'Thread (10 tweets)',
        aspectRatio: 'N/A'
      },
      status: 'completed'
    },
    {
      platform: 'linkedin',
      icon: Linkedin,
      enabled: false,
      adaptations: {
        caption: 'After 5 years of remote work, I have compiled the 10 most effective productivity strategies that have transformed my workflow. Here is what I learned:\n\n[Article summary with professional tone]',
        hashtags: ['Productivity', 'RemoteWork', 'ProfessionalDevelopment'],
        format: 'Article/Post',
        aspectRatio: 'N/A'
      },
      status: 'pending'
    }
  ]
};



export function ContentRepurposer() {
  const [content, setContent] = useState<RepurposedContent>(mockContent);
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>('instagram');

  const togglePlatform = (platform: string) => {
    setContent({
      ...content,
      adaptations: content.adaptations.map(a =>
        a.platform === platform ? { ...a, enabled: !a.enabled } : a
      )
    });
  };

  const handleRepurpose = () => {
    setIsRepurposing(true);
    setTimeout(() => {
      setContent({
        ...content,
        adaptations: content.adaptations.map(a =>
          a.enabled ? { ...a, status: 'completed' as const } : a
        )
      });
      setIsRepurposing(false);
    }, 3000);
  };

  const enabledCount = content.adaptations.filter(a => a.enabled).length;
  const completedCount = content.adaptations.filter(a => a.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" /> Ready</Badge>;
      case 'generating':
        return <Badge className="bg-yellow-500/20 text-yellow-400"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Generating</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400">Error</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">Pending</Badge>;
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
          { icon: Repeat, label: 'Content Pieces', value: '47', color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { icon: Copy, label: 'Adaptations', value: '156', color: 'text-green-400', bg: 'bg-green-500/20' },
          { icon: Eye, label: 'Total Reach', value: '892K', color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { icon: Sparkles, label: 'Time Saved', value: '48h', color: 'text-orange-400', bg: 'bg-orange-500/20' },
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
        {/* Original Content */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-400" />
                Original Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=225&fit=crop"
                  alt="Original content"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium text-slate-200 mb-2">{content.originalTitle}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Badge variant="outline" className="capitalize">
                    {content.originalPlatform}
                  </Badge>
                  <span>•</span>
                  <span>12:34 duration</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50">
                <p className="text-sm text-slate-400 mb-3">Select platforms to repurpose:</p>
                <div className="space-y-2">
                  {content.adaptations.map((adaptation) => (
                    <motion.button
                      key={adaptation.platform}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => togglePlatform(adaptation.platform)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                        adaptation.enabled
                          ? 'bg-purple-500/10 border-purple-500/30'
                          : 'bg-slate-800/50 border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <adaptation.icon className={`w-5 h-5 ${adaptation.enabled ? 'text-purple-400' : 'text-slate-500'}`} />
                        <span className={`capitalize ${adaptation.enabled ? 'text-slate-200' : 'text-slate-500'}`}>
                          {adaptation.platform}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        adaptation.enabled 
                          ? 'bg-purple-500 border-purple-500' 
                          : 'border-slate-600'
                      }`}>
                        {adaptation.enabled && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleRepurpose}
                disabled={isRepurposing || enabledCount === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isRepurposing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Adapting Content...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Repurpose for {enabledCount} Platform{enabledCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Adapted Content Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Adapted Content Preview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">
                    {completedCount}/{enabledCount} completed
                  </span>
                  <Progress value={(completedCount / enabledCount) * 100} className="w-24 h-2" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedPlatform || ''} onValueChange={setSelectedPlatform}>
                <TabsList className="bg-slate-800/50 mb-4">
                  {content.adaptations.filter(a => a.enabled).map((adaptation) => (
                    <TabsTrigger key={adaptation.platform} value={adaptation.platform} className="capitalize">
                      <adaptation.icon className="w-4 h-4 mr-2" />
                      {adaptation.platform}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <AnimatePresence mode="wait">
                  {content.adaptations.filter(a => a.enabled).map((adaptation) => (
                    <TabsContent key={adaptation.platform} value={adaptation.platform} className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          {getStatusBadge(adaptation.status)}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-slate-600">
                              <Settings2 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="border-slate-600">
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-400 mb-2">Adapted Caption</p>
                            <p className="text-slate-200 whitespace-pre-line">{adaptation.adaptations.caption}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                              <p className="text-sm text-slate-400 mb-2">Format</p>
                              <p className="text-slate-200">{adaptation.adaptations.format}</p>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                              <p className="text-sm text-slate-400 mb-2">Aspect Ratio</p>
                              <p className="text-slate-200">{adaptation.adaptations.aspectRatio}</p>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-400 mb-2">Suggested Hashtags</p>
                            <div className="flex flex-wrap gap-2">
                              {adaptation.adaptations.hashtags.map((tag, i) => (
                                <span key={i} className="text-sm text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {adaptation.status === 'completed' && (
                            <div className="flex gap-3">
                              <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve & Schedule
                              </Button>
                              <Button variant="outline" className="border-slate-600">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Regenerate
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </TabsContent>
                  ))}
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
