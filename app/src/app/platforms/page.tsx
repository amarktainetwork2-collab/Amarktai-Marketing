import { useEffect, useState } from 'react';
import { Youtube, Instagram, Facebook, Twitter, Linkedin, Music, Check, Link as LinkIcon, AlertCircle, Pin, MessageCircle, Send, Ghost, DollarSign, Settings2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import type { PlatformConnection, Platform } from '@/types';
import { platformApi } from '@/lib/api';
import { toast } from 'sonner';

const platforms: { id: Platform; name: string; icon: React.ElementType; color: string; description: string }[] = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', description: 'Share Shorts to reach billions of viewers' },
  { id: 'tiktok', name: 'TikTok', icon: Music, color: '#000000', description: 'Create viral short-form videos' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', description: 'Post Reels and images to engage your audience' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2', description: 'Reach diverse demographics with Reels and posts' },
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: '#000000', description: 'Share updates and engage with the tech community' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', description: 'Professional content for B2B marketing' },
  { id: 'pinterest', name: 'Pinterest', icon: Pin, color: '#E60023', description: 'Visual discovery engine for inspiration and shopping' },
  { id: 'reddit', name: 'Reddit', icon: MessageCircle, color: '#FF4500', description: 'Community-driven discussions and niche audiences' },
  { id: 'bluesky', name: 'Bluesky', icon: Twitter, color: '#0085FF', description: 'Decentralised social network growing rapidly' },
  { id: 'threads', name: 'Threads', icon: MessageCircle, color: '#000000', description: "Meta's text-based conversation platform" },
  { id: 'telegram', name: 'Telegram', icon: Send, color: '#26A5E4', description: 'Broadcast to engaged channel subscribers' },
  { id: 'snapchat', name: 'Snapchat', icon: Ghost, color: '#FFFC00', description: 'Ephemeral content for younger audiences' },
];

interface BudgetDialogState {
  platform: Platform;
  monthlyBudget: string;
  dailyBudget: string;
  adAccountId: string;
  autoPost: boolean;
  autoReply: boolean;
}

export default function PlatformsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState<Platform | null>(null);
  const [budgetDialog, setBudgetDialog] = useState<BudgetDialogState | null>(null);
  const [savingBudget, setSavingBudget] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const data = await platformApi.getAll();
      setConnections(data);
    } catch (error) {
      toast.error('Failed to load platform connections');
    }
  };

  const handleConnect = async (platform: Platform) => {
    setLoading(platform);
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      await platformApi.connect(platform, `demo_${platform}_account`);
      await fetchConnections();
      toast.success(`${platform} connected successfully`);
    } catch (error) {
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
      toast.success(`${platform} disconnected`);
    } catch (error) {
      toast.error(`Failed to disconnect ${platform}`);
    } finally {
      setLoading(null);
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

  const isConnected = (platformId: Platform) => {
    return connections.some(c => c.platform === platformId && c.isActive);
  };

  const getConnection = (platformId: Platform) => {
    return connections.find(c => c.platform === platformId);
  };

  const connectedCount = connections.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Platform Connections</h2>
        <p className="text-gray-500">
          Connect all 12 social media accounts to start autonomous posting.
          {connectedCount > 0 && (
            <span className="text-violet-600 font-medium"> {connectedCount}/12 connected</span>
          )}
        </p>
      </div>

      {/* Connected Platforms Summary */}
      {connectedCount > 0 && (
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
      )}

      {/* Platform Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const connected = isConnected(platform.id);
          const connection = getConnection(platform.id);
          const Icon = platform.icon;

          return (
            <Card key={platform.id} className={connected ? 'border-green-200' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${platform.color}15` }}>
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
                    {(connection as any).monthlyAdBudget > 0 && (
                      <div className="flex items-center text-sm text-emerald-600">
                        <DollarSign className="w-3 h-3 mr-1" />
                        <span>${(connection as any).monthlyAdBudget}/mo budget</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openBudgetDialog(platform.id)}
                      >
                        <Settings2 className="w-3 h-3 mr-1" />
                        Budget & Settings
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDisconnect(platform.id)}
                        disabled={loading === platform.id}
                      >
                        {loading === platform.id ? 'Disconnecting...' : 'Disconnect'}
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
                    {loading === platform.id ? 'Connecting...' : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect {platform.name}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
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
                We use OAuth to securely connect to your social media accounts.
                We never store your passwords and you can revoke access at any time.
                Content will only be posted after your approval. Use the Budget &amp; Settings dialog to set
                monthly/daily ad spend limits and enable autonomous posting per platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Settings Dialog */}
      <Dialog open={!!budgetDialog} onOpenChange={() => setBudgetDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Budget &amp; Settings — {budgetDialog && platforms.find(p => p.id === budgetDialog.platform)?.name}
            </DialogTitle>
          </DialogHeader>
          {budgetDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_budget">Monthly Ad Budget (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      id="monthly_budget"
                      type="number"
                      min="0"
                      step="1"
                      className="pl-7"
                      value={budgetDialog.monthlyBudget}
                      onChange={e => setBudgetDialog(d => d ? { ...d, monthlyBudget: e.target.value } : d)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_budget">Daily Ad Budget (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      id="daily_budget"
                      type="number"
                      min="0"
                      step="1"
                      className="pl-7"
                      value={budgetDialog.dailyBudget}
                      onChange={e => setBudgetDialog(d => d ? { ...d, dailyBudget: e.target.value } : d)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad_account_id">Ad Account ID (optional)</Label>
                <Input
                  id="ad_account_id"
                  placeholder="Platform-specific ad account ID"
                  value={budgetDialog.adAccountId}
                  onChange={e => setBudgetDialog(d => d ? { ...d, adAccountId: e.target.value } : d)}
                />
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto_post">Autonomous Posting</Label>
                  <Switch
                    id="auto_post"
                    checked={budgetDialog.autoPost}
                    onCheckedChange={v => setBudgetDialog(d => d ? { ...d, autoPost: v } : d)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto_reply">Auto-Reply to Comments</Label>
                  <Switch
                    id="auto_reply"
                    checked={budgetDialog.autoReply}
                    onCheckedChange={v => setBudgetDialog(d => d ? { ...d, autoReply: v } : d)}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleSaveBudget} disabled={savingBudget}>
                {savingBudget ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
