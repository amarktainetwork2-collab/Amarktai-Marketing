import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube, Instagram, Facebook, Twitter, Linkedin, Music,
  Check, Link as LinkIcon, AlertCircle, Pin, MessageCircle, Send, Ghost,
  DollarSign, Settings2, BarChart3, Lightbulb, Building2, ChevronDown,
  ChevronUp, Clock, Loader2, PlusCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import type { PlatformConnection, Platform } from '@/types';
import { platformApi, platformAuditApi, type PlatformAudit } from '@/lib/api';
import { toast } from 'sonner';

const platforms: {
  id: Platform; name: string; icon: React.ElementType; color: string; description: string
}[] = [
  { id: 'youtube',   name: 'YouTube',       icon: Youtube,        color: '#FF0000', description: 'Share Shorts to reach billions of viewers' },
  { id: 'tiktok',    name: 'TikTok',        icon: Music,          color: '#000000', description: 'Create viral short-form videos' },
  { id: 'instagram', name: 'Instagram',     icon: Instagram,      color: '#E4405F', description: 'Post Reels and images to engage your audience' },
  { id: 'facebook',  name: 'Facebook',      icon: Facebook,       color: '#1877F2', description: 'Reach diverse demographics with Reels and posts' },
  { id: 'twitter',   name: 'X (Twitter)',   icon: Twitter,        color: '#000000', description: 'Share updates and engage with the tech community' },
  { id: 'linkedin',  name: 'LinkedIn',      icon: Linkedin,       color: '#0A66C2', description: 'Professional content for B2B marketing' },
  { id: 'pinterest', name: 'Pinterest',     icon: Pin,            color: '#E60023', description: 'Visual discovery engine for inspiration and shopping' },
  { id: 'reddit',    name: 'Reddit',        icon: MessageCircle,  color: '#FF4500', description: 'Community-driven discussions and niche audiences' },
  { id: 'bluesky',   name: 'Bluesky',       icon: Twitter,        color: '#0085FF', description: 'Decentralised social network growing rapidly' },
  { id: 'threads',   name: 'Threads',       icon: MessageCircle,  color: '#000000', description: "Meta's text-based conversation platform" },
  { id: 'telegram',  name: 'Telegram',      icon: Send,           color: '#26A5E4', description: 'Broadcast to engaged channel subscribers' },
  { id: 'snapchat',  name: 'Snapchat',      icon: Ghost,          color: '#FFFC00', description: 'Ephemeral content for younger audiences' },
];

interface BudgetDialogState {
  platform: Platform;
  monthlyBudget: string;
  dailyBudget: string;
  adAccountId: string;
  autoPost: boolean;
  autoReply: boolean;
}

interface BusinessPageDialogState {
  platform: Platform;
  pageName: string;
  category: string;
  description: string;
  websiteUrl: string;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.05, duration: 0.35 } }),
};

export default function PlatformsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState<Platform | null>(null);
  const [auditMap, setAuditMap] = useState<Record<string, PlatformAudit>>({});
  const [loadingAudit, setLoadingAudit] = useState<string | null>(null);
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [budgetDialog, setBudgetDialog] = useState<BudgetDialogState | null>(null);
  const [savingBudget, setSavingBudget] = useState(false);
  const [bizPageDialog, setBizPageDialog] = useState<BusinessPageDialogState | null>(null);
  const [savingBizPage, setSavingBizPage] = useState(false);

  useEffect(() => { fetchConnections(); }, []);

  const fetchConnections = async () => {
    try {
      const data = await platformApi.getAll();
      setConnections(data);
    } catch {
      toast.error('Failed to load platform connections');
    }
  };

  const handleConnect = async (platform: Platform) => {
    setLoading(platform);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await platformApi.connect(platform, `demo_${platform}_account`);
      await fetchConnections();
      toast.success(`${platform} connected successfully`);
      // Auto-load audit
      loadAudit(platform);
    } catch {
      toast.error(`Failed to connect ${platform}`);
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    setLoading(platform);
    try {
      await platformApi.disconnect(platform);
      await fetchConnections();
      setAuditMap(prev => { const n = { ...prev }; delete n[platform]; return n; });
      toast.success(`${platform} disconnected`);
    } catch {
      toast.error(`Failed to disconnect ${platform}`);
    } finally {
      setLoading(null);
    }
  };

  const loadAudit = async (platform: string) => {
    setLoadingAudit(platform);
    try {
      const audit = await platformAuditApi.audit(platform);
      setAuditMap(prev => ({ ...prev, [platform]: audit }));
      setExpandedAudit(platform);
    } catch {
      // Audit is optional — don't error loudly
    } finally {
      setLoadingAudit(null);
    }
  };

  const openBudgetDialog = (platform: Platform) => {
    const conn = getConnection(platform);
    setBudgetDialog({
      platform,
      monthlyBudget: conn?.monthlyAdBudget?.toString() ?? '0',
      dailyBudget: conn?.dailyAdBudget?.toString() ?? '0',
      adAccountId: conn?.adAccountId ?? '',
      autoPost: conn?.autoPostEnabled ?? false,
      autoReply: conn?.autoReplyEnabled ?? false,
    });
  };

  const handleSaveBudget = async () => {
    if (!budgetDialog) return;
    setSavingBudget(true);
    try {
      await fetch(`/api/v1/platforms/${budgetDialog.platform}/budget`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthly_ad_budget: parseFloat(budgetDialog.monthlyBudget) || 0,
          daily_ad_budget: parseFloat(budgetDialog.dailyBudget) || 0,
          ad_account_id: budgetDialog.adAccountId || null,
          auto_post_enabled: budgetDialog.autoPost,
          auto_reply_enabled: budgetDialog.autoReply,
        }),
      });
      await fetchConnections();
      toast.success('Budget settings saved');
      setBudgetDialog(null);
    } catch {
      toast.error('Failed to save budget settings');
    } finally {
      setSavingBudget(false);
    }
  };

  const handleCreateBizPage = async () => {
    if (!bizPageDialog) return;
    setSavingBizPage(true);
    try {
      const result = await platformAuditApi.createBusinessPage(bizPageDialog.platform, {
        page_name: bizPageDialog.pageName,
        category: bizPageDialog.category,
        description: bizPageDialog.description || undefined,
        website_url: bizPageDialog.websiteUrl || undefined,
      });
      toast.success(result.message);
      setBizPageDialog(null);
    } catch {
      toast.error('Business page creation failed');
    } finally {
      setSavingBizPage(false);
    }
  };

  const isConnected = (platformId: Platform) => connections.some(c => c.platform === platformId && c.isActive);
  const getConnection = (platformId: Platform) => connections.find(c => c.platform === platformId);
  const connectedCount = connections.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Platform Connections</h2>
        <p className="text-gray-500">
          Connect all 12 social media accounts for autonomous posting.
          {connectedCount > 0 && (
            <span className="text-violet-600 font-medium"> {connectedCount}/12 connected</span>
          )}
        </p>
      </div>

      {connectedCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-violet-900">Ready to Post!</h3>
                  <p className="text-violet-700 text-sm">
                    Your content will be published to {connectedCount} platform{connectedCount !== 1 ? 's' : ''}.
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {connections.filter(c => c.isActive).map((conn) => {
                    const platform = platforms.find(p => p.id === conn.platform);
                    const Icon = platform?.icon || Youtube;
                    return (
                      <div key={conn.id} className="w-10 h-10 rounded-full bg-white border-2 border-violet-200 flex items-center justify-center">
                        <Icon className="w-5 h-5" style={{ color: platform?.color }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, i) => {
          const connected = isConnected(platform.id);
          const connection = getConnection(platform.id);
          const audit = auditMap[platform.id];
          const Icon = platform.icon;
          const isAuditExpanded = expandedAudit === platform.id;

          return (
            <motion.div key={platform.id} custom={i} variants={cardVariants} initial="hidden" animate="show">
              <Card className={connected ? 'border-green-200' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${platform.color}15` }}>
                      <Icon className="w-6 h-6" style={{ color: platform.color }} />
                    </div>
                    {connected ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <Check className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Connected</Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg">{platform.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{platform.description}</p>

                  {connected && connection ? (
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        <span className="text-gray-600">Connected as</span>
                        <span className="font-medium ml-1">{connection.accountName}</span>
                      </div>
                      {(connection.monthlyAdBudget ?? 0) > 0 && (
                        <div className="flex items-center text-sm text-emerald-600">
                          <DollarSign className="w-3 h-3 mr-1" />
                          <span>${connection.monthlyAdBudget}/mo budget</span>
                        </div>
                      )}

                      {/* Audit section */}
                      <div className="mt-2">
                        {loadingAudit === platform.id ? (
                          <div className="flex items-center gap-1 text-xs text-violet-600">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Loading AI insights…
                          </div>
                        ) : audit ? (
                          <div>
                            <button
                              className="flex items-center gap-1 text-xs text-violet-600 hover:underline"
                              onClick={() => setExpandedAudit(isAuditExpanded ? null : platform.id)}
                            >
                              <BarChart3 className="w-3 h-3" />
                              AI Insights
                              {isAuditExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            <AnimatePresence>
                              {isAuditExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 p-3 bg-violet-50 rounded-lg text-xs space-y-2">
                                    <p className="font-medium text-violet-800">{audit.accountTypeLabel}</p>
                                    {audit.algorithmInsights.best_post_times?.length > 0 && (
                                      <div className="flex items-start gap-1">
                                        <Clock className="w-3 h-3 text-violet-500 mt-0.5" />
                                        <span className="text-gray-600">
                                          Best times: {audit.algorithmInsights.best_post_times.join(', ')}
                                        </span>
                                      </div>
                                    )}
                                    {audit.recommendations.slice(0, 2).map((r, j) => (
                                      <div key={j} className="flex items-start gap-1">
                                        <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600">{r}</span>
                                      </div>
                                    ))}
                                    {audit.canCreateBusinessPages && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full h-7 text-xs mt-1"
                                        onClick={() => setBizPageDialog({
                                          platform: platform.id,
                                          pageName: '',
                                          category: '',
                                          description: '',
                                          websiteUrl: '',
                                        })}
                                      >
                                        <Building2 className="w-3 h-3 mr-1" />
                                        Create Business Page
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <button
                            className="text-xs text-violet-500 hover:underline flex items-center gap-1"
                            onClick={() => loadAudit(platform.id)}
                          >
                            <BarChart3 className="w-3 h-3" />
                            Load AI Insights
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openBudgetDialog(platform.id)}>
                          <Settings2 className="w-3 h-3 mr-1" />
                          Budget
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDisconnect(platform.id)}
                          disabled={loading === platform.id}
                        >
                          {loading === platform.id ? 'Disconnecting…' : 'Disconnect'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      style={{ backgroundColor: platform.color, color: 'white' }}
                      onClick={() => handleConnect(platform.id)}
                      disabled={loading === platform.id}
                    >
                      {loading === platform.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connecting…</>
                      ) : (
                        <><LinkIcon className="w-4 h-4 mr-2" />Connect {platform.name}</>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">About Platform Connections</h4>
              <p className="text-blue-700 text-sm mt-1">
                We use OAuth to securely connect to your social media accounts. After connecting, click
                "Load AI Insights" to view platform algorithm tips, best posting times, and engagement
                benchmarks the AI uses when scheduling your content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Dialog */}
      <Dialog open={!!budgetDialog} onOpenChange={() => setBudgetDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Budget & Settings — {budgetDialog && platforms.find(p => p.id === budgetDialog.platform)?.name}
            </DialogTitle>
          </DialogHeader>
          {budgetDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Ad Budget (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                    <Input type="number" min="0" step="1" className="pl-7" value={budgetDialog.monthlyBudget}
                      onChange={e => setBudgetDialog(d => d ? { ...d, monthlyBudget: e.target.value } : d)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Daily Ad Budget (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                    <Input type="number" min="0" step="1" className="pl-7" value={budgetDialog.dailyBudget}
                      onChange={e => setBudgetDialog(d => d ? { ...d, dailyBudget: e.target.value } : d)} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ad Account ID (optional)</Label>
                <Input placeholder="Platform-specific ad account ID" value={budgetDialog.adAccountId}
                  onChange={e => setBudgetDialog(d => d ? { ...d, adAccountId: e.target.value } : d)} />
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label>Autonomous Posting</Label>
                  <Switch checked={budgetDialog.autoPost}
                    onCheckedChange={v => setBudgetDialog(d => d ? { ...d, autoPost: v } : d)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Auto-Reply to Comments</Label>
                  <Switch checked={budgetDialog.autoReply}
                    onCheckedChange={v => setBudgetDialog(d => d ? { ...d, autoReply: v } : d)} />
                </div>
              </div>
              <Button className="w-full" onClick={handleSaveBudget} disabled={savingBudget}>
                {savingBudget ? 'Saving…' : 'Save Settings'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Business Page Creation Dialog */}
      <Dialog open={!!bizPageDialog} onOpenChange={() => setBizPageDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-violet-600" />
              Create Business Page — {bizPageDialog && platforms.find(p => p.id === bizPageDialog.platform)?.name}
            </DialogTitle>
          </DialogHeader>
          {bizPageDialog && (
            <div className="space-y-4">
              <div className="p-3 bg-violet-50 rounded-lg text-xs text-violet-700">
                Create a dedicated business page on {platforms.find(p => p.id === bizPageDialog.platform)?.name}.
                You can create up to 200 business pages from one Facebook account.
              </div>
              <div className="space-y-2">
                <Label>Page Name *</Label>
                <Input placeholder="e.g., TaskFlow Pro Official" value={bizPageDialog.pageName}
                  onChange={e => setBizPageDialog(d => d ? { ...d, pageName: e.target.value } : d)} />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Input placeholder="e.g., Software, E-commerce, Restaurant" value={bizPageDialog.category}
                  onChange={e => setBizPageDialog(d => d ? { ...d, category: e.target.value } : d)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Short description of your business" value={bizPageDialog.description}
                  onChange={e => setBizPageDialog(d => d ? { ...d, description: e.target.value } : d)} />
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input placeholder="https://yoursite.com" value={bizPageDialog.websiteUrl}
                  onChange={e => setBizPageDialog(d => d ? { ...d, websiteUrl: e.target.value } : d)} />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                onClick={handleCreateBizPage}
                disabled={savingBizPage || !bizPageDialog.pageName || !bizPageDialog.category}
              >
                {savingBizPage ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                ) : (
                  <><PlusCircle className="w-4 h-4 mr-2" />Create Business Page</>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
