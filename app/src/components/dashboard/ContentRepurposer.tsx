import { useState, useEffect, useCallback } from 'react';
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
  Settings2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/motion';
import { remixApi } from '@/lib/api';

interface PlatformAdaptation {
  platform: string;
  icon: React.ComponentType<{ className?: string }>;
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

const platformIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  tiktok: Music,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

function mapRemix(raw: Record<string, unknown>): RepurposedContent {
  const outputs = (raw.outputs ?? raw.adaptations ?? []) as Record<string, unknown>[];
  const targetPlatforms = (raw.target_platforms ?? []) as string[];

  const adaptations: PlatformAdaptation[] = outputs.length > 0
    ? outputs.map((o) => ({
        platform: (o.platform ?? '') as string,
        icon: platformIconMap[(o.platform as string) ?? ''] ?? Music,
        enabled: true,
        adaptations: {
          caption: (o.caption ?? o.content ?? '') as string,
          hashtags: (o.hashtags as string[]) ?? [],
          format: (o.format ?? 'Post') as string,
          duration: o.duration as string | undefined,
          aspectRatio: (o.aspect_ratio ?? o.aspectRatio ?? 'N/A') as string,
        },
        status: ((o.status as string) ?? 'completed') as PlatformAdaptation['status'],
      }))
    : targetPlatforms.map(p => ({
        platform: p,
        icon: platformIconMap[p] ?? Music,
        enabled: true,
        adaptations: { caption: '', hashtags: [], format: 'Post', aspectRatio: 'N/A' },
        status: 'pending' as const,
      }));

  return {
    id: (raw.id ?? '') as string,
    originalTitle: (raw.source_text ?? raw.title ?? 'Untitled') as string,
    originalPlatform: (raw.source_type ?? 'text') as string,
    adaptations,
    createdAt: (raw.created_at ?? '') as string,
  };
}

export function ContentRepurposer() {
  const [remixes, setRemixes] = useState<RepurposedContent[]>([]);
  const [content, setContent] = useState<RepurposedContent | null>(null);
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New remix form state
  const [sourceText, setSourceText] = useState('');
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>(['instagram', 'twitter']);

  const fetchRemixes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await remixApi.getAll();
      const mapped = data.map(mapRemix);
      setRemixes(mapped);
      if (mapped.length > 0) {
        setContent(mapped[0]);
        const firstEnabled = mapped[0].adaptations.find(a => a.enabled);
        if (firstEnabled) setSelectedPlatform(firstEnabled.platform);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load remixes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRemixes();
    const id = setInterval(() => fetchRemixes(), 30_000);
    return () => clearInterval(id);
  }, [fetchRemixes]);

  const toggleTargetPlatform = (platform: string) => {
    setTargetPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleRepurpose = async () => {
    if (!sourceText.trim() || targetPlatforms.length === 0) return;

    setIsRepurposing(true);
    try {
      const result = await remixApi.create({
        source_type: 'text',
        source_text: sourceText.trim(),
        target_platforms: targetPlatforms,
      });

      // Fetch the newly created remix details
      if (result.id) {
        const detailed = await remixApi.getById(result.id);
        const mapped = mapRemix(detailed);
        setRemixes(prev => [mapped, ...prev]);
        setContent(mapped);
        const firstEnabled = mapped.adaptations.find(a => a.enabled);
        if (firstEnabled) setSelectedPlatform(firstEnabled.platform);
      } else {
        // If no id returned, just refetch all
        await fetchRemixes();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create remix');
    } finally {
      setIsRepurposing(false);
    }
  };

  const enabledCount = content?.adaptations.filter(a => a.enabled).length ?? 0;
  const completedCount = content?.adaptations.filter(a => a.status === 'completed').length ?? 0;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error && remixes.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-slate-400 mb-3">{error}</p>
          <Button onClick={fetchRemixes} variant="outline" className="border-slate-600 text-slate-300">
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Repeat, label: 'Content Pieces', value: remixes.length.toString(), color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { icon: Copy, label: 'Adaptations', value: remixes.reduce((s, r) => s + r.adaptations.length, 0).toString(), color: 'text-green-400', bg: 'bg-green-500/20' },
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
        {/* Original Content / Create Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                Repurpose Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Source Content</label>
                <Textarea
                  placeholder="Paste your content here to repurpose across platforms..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className="min-h-[120px] bg-slate-800/50 border-slate-700 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-700/50">
                <p className="text-sm text-slate-400 mb-3">Select target platforms:</p>
                <div className="space-y-2">
                  {Object.entries(platformIconMap).map(([platform, Icon]) => (
                    <motion.button
                      key={platform}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleTargetPlatform(platform)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                        targetPlatforms.includes(platform)
                          ? 'bg-purple-500/10 border-purple-500/30'
                          : 'bg-slate-800/50 border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${targetPlatforms.includes(platform) ? 'text-purple-400' : 'text-slate-500'}`} />
                        <span className={`capitalize ${targetPlatforms.includes(platform) ? 'text-slate-200' : 'text-slate-500'}`}>
                          {platform}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        targetPlatforms.includes(platform)
                          ? 'bg-purple-500 border-purple-500' 
                          : 'border-slate-600'
                      }`}>
                        {targetPlatforms.includes(platform) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleRepurpose}
                disabled={isRepurposing || !sourceText.trim() || targetPlatforms.length === 0}
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
                    Repurpose for {targetPlatforms.length} Platform{targetPlatforms.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>

              {/* Past remixes list */}
              {remixes.length > 1 && (
                <div className="pt-4 border-t border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-2">Previous Remixes</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {remixes.map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setContent(r);
                          const first = r.adaptations.find(a => a.enabled);
                          if (first) setSelectedPlatform(first.platform);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-sm transition-all ${
                          content?.id === r.id
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        <p className="text-slate-200 truncate">{r.originalTitle}</p>
                        <p className="text-xs text-slate-500">{r.adaptations.length} adaptations</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                {content && enabledCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">
                      {completedCount}/{enabledCount} completed
                    </span>
                    <Progress value={enabledCount > 0 ? (completedCount / enabledCount) * 100 : 0} className="w-24 h-2" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!content || content.adaptations.length === 0 ? (
                <div className="text-center py-12">
                  <Repeat className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No Remixes Yet</h3>
                  <p className="text-slate-400">Create a remix to see adapted content here.</p>
                </div>
              ) : (
                <Tabs value={selectedPlatform || ''} onValueChange={setSelectedPlatform}>
                  <TabsList className="bg-slate-800/50 mb-4">
                    {content.adaptations.filter(a => a.enabled).map((adaptation) => {
                      const Icon = adaptation.icon;
                      return (
                        <TabsTrigger key={adaptation.platform} value={adaptation.platform} className="capitalize">
                          <Icon className="w-4 h-4 mr-2" />
                          {adaptation.platform}
                        </TabsTrigger>
                      );
                    })}
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
                              <p className="text-slate-200 whitespace-pre-line">
                                {adaptation.adaptations.caption || 'Content will appear after generation.'}
                              </p>
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

                            {adaptation.adaptations.hashtags.length > 0 && (
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
                            )}

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
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
