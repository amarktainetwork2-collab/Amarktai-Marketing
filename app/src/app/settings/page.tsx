import { useState, useEffect, useCallback } from 'react';
import { Bell, Clock, Shield, User, CreditCard, Sparkles, Key, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

const cardStyle = {
  background: 'rgba(17,24,39,0.72)',
  border: '1px solid rgba(255,255,255,0.10)',
};

// ─── API helpers ─────────────────────────────────────────────────────────────

async function settingsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('amarktai_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`/api/v1/settings${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`Settings API ${res.status}`);
  return res.json() as Promise<T>;
}

interface SettingsData {
  timezone: string;
  language: string;
  notification_email: boolean;
  notification_digest: boolean;
  auto_post_enabled: boolean;
  auto_reply_enabled: boolean;
  plan_tier: string;
}

interface BillingData {
  plan_tier: string;
  quota_used: number;
  quota_limit: number;
  quota_remaining: number;
}

// ─── Plan display helpers ────────────────────────────────────────────────────

const PLAN_DISPLAY: Record<string, { label: string; price: string }> = {
  free: { label: 'Free', price: '$0/month' },
  pro: { label: 'Pro', price: '$29/month' },
  business: { label: 'Business', price: '$199/month' },
  enterprise: { label: 'Enterprise', price: 'Custom' },
};

export default function SettingsPage() {
  const { user } = useAuth();

  // ── Loading / fetched state ─────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingAutomation, setSavingAutomation] = useState(false);

  // ── Notification state ──────────────────────────────────────────────────
  const [notifications, setNotifications] = useState({
    emailDaily: true,
    emailWeekly: true,
  });

  // ── Preferences state ───────────────────────────────────────────────────
  const [preferences, setPreferences] = useState({
    postingTime: '10:00',
    timezone: 'America/New_York',
    language: 'en',
  });

  // ── Automation state ────────────────────────────────────────────────────
  const [autoPost, setAutoPost] = useState(false);
  const [autoReply, setAutoReply] = useState(false);
  const [organicMode, setOrganicMode] = useState(true);

  // ── Billing state ───────────────────────────────────────────────────────
  const [billing, setBilling] = useState<BillingData | null>(null);

  // ── Fetch settings from backend on mount ────────────────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      const [settingsData, billingData] = await Promise.all([
        settingsFetch<SettingsData>(''),
        settingsFetch<BillingData>('/billing'),
      ]);
      setPreferences({
        postingTime: '10:00',
        timezone: settingsData.timezone || 'America/New_York',
        language: settingsData.language || 'en',
      });
      setNotifications({
        emailDaily: settingsData.notification_email ?? true,
        emailWeekly: settingsData.notification_digest ?? true,
      });
      setAutoPost(settingsData.auto_post_enabled ?? false);
      setAutoReply(settingsData.auto_reply_enabled ?? false);
      setBilling(billingData);
    } catch {
      toast.error('Failed to load settings — using defaults');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── Save notifications ──────────────────────────────────────────────────
  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      await settingsFetch('', {
        method: 'PUT',
        body: JSON.stringify({
          notification_email: notifications.emailDaily,
          notification_digest: notifications.emailWeekly,
        }),
      });
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save notification preferences');
    } finally {
      setSavingNotifications(false);
    }
  };

  // ── Save preferences ────────────────────────────────────────────────────
  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      await settingsFetch('', {
        method: 'PUT',
        body: JSON.stringify({
          timezone: preferences.timezone,
          language: preferences.language,
        }),
      });
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  // ── Save automation ─────────────────────────────────────────────────────
  const handleSaveAutomation = async () => {
    setSavingAutomation(true);
    try {
      await settingsFetch('', {
        method: 'PUT',
        body: JSON.stringify({
          auto_post_enabled: autoPost,
          auto_reply_enabled: autoReply,
        }),
      });
      toast.success('Automation settings saved');
    } catch {
      toast.error('Failed to save automation settings');
    } finally {
      setSavingAutomation(false);
    }
  };

  // ── Derived plan display ────────────────────────────────────────────────
  const planTier = billing?.plan_tier ?? 'free';
  const planInfo = PLAN_DISPLAY[planTier] ?? PLAN_DISPLAY.free;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Settings</h2>
        <p className="text-slate-400">Manage your workspace, notifications, and preferences</p>
      </div>

      {/* Plan Info — live from billing API */}
      <Card style={{ background: 'linear-gradient(135deg, rgba(37,99,255,0.15) 0%, rgba(34,211,238,0.08) 100%)', border: '1px solid rgba(37,99,255,0.25)' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#4F7DFF' }}>Current Plan</p>
              <h3 className="text-2xl font-bold text-white">{planInfo.label}</h3>
              <p className="text-sm mt-1 text-slate-300">{planInfo.price}</p>
            </div>
            <Button variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}>
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          </div>
          {billing && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(37,99,255,0.2)' }}>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}>
                  {billing.quota_used} / {billing.quota_limit} posts used
                </Badge>
                <Badge variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}>
                  {billing.quota_remaining} remaining
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle className="flex items-center text-slate-100">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </CardTitle>
          <CardDescription className="text-slate-400">
            Choose how you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-xs uppercase tracking-widest text-slate-500">Email Notifications</h4>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-daily" className="font-medium text-slate-200">Daily Content Ready</Label>
                <p className="text-sm text-slate-400">Get an email when new content is generated</p>
              </div>
              <Switch
                id="email-daily"
                checked={notifications.emailDaily}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailDaily: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-weekly" className="font-medium text-slate-200">Weekly Analytics</Label>
                <p className="text-sm text-slate-400">Receive weekly performance summary</p>
              </div>
              <Switch
                id="email-weekly"
                checked={notifications.emailWeekly}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailWeekly: checked })}
              />
            </div>
          </div>

          <Button
            onClick={handleSaveNotifications}
            disabled={savingNotifications}
            style={{ background: '#2563FF' }}
            className="text-white hover:opacity-90"
          >
            {savingNotifications ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Posting Preferences */}
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle className="flex items-center text-slate-100">
            <Clock className="w-5 h-5 mr-2" />
            Posting Preferences
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure when and how your content is posted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="posting-time" className="text-slate-200">Preferred Posting Time</Label>
              <Input
                id="posting-time"
                type="time"
                value={preferences.postingTime}
                onChange={(e) => setPreferences({ ...preferences, postingTime: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)', color: '#F8FAFC' }}
              />
              <p className="text-sm text-slate-400">Content will be posted around this time</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-slate-200">Timezone</Label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: '#F8FAFC' }}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleSavePreferences}
            disabled={savingPreferences}
            style={{ background: '#2563FF' }}
            className="text-white hover:opacity-90"
          >
            {savingPreferences ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle className="flex items-center text-slate-100">
            <Shield className="w-5 h-5 mr-2" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div>
              <p className="font-medium text-slate-200">Two-Factor Authentication</p>
              <p className="text-sm text-slate-400">Add an extra layer of security</p>
            </div>
            <Badge variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#9AA3B8' }}>Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle className="flex items-center text-slate-100">
            <User className="w-5 h-5 mr-2" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3"
                style={{ background: 'linear-gradient(135deg, #2563FF 0%, #22D3EE 100%)' }}
              >
                {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-medium text-slate-200">
                  {user?.email ?? 'Account'}
                </p>
                <p className="text-sm text-slate-400">AmarktAI Account</p>
              </div>
            </div>
            <Badge style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>Connected</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Automation Preferences */}
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Sparkles className="w-5 h-5" style={{ color: '#2563FF' }} />
            Automation Preferences
          </CardTitle>
          <CardDescription className="text-slate-400">
            Control automation behavior and organic vs. paid distribution strategy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-slate-200">Auto-Post (Full Autonomy)</Label>
              <p className="text-sm text-slate-400">
                Posts approved content automatically without manual review
              </p>
            </div>
            <Switch checked={autoPost} onCheckedChange={setAutoPost} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-slate-200">Auto-Reply to DMs &amp; Comments</Label>
              <p className="text-sm text-slate-400">
                Replies to incoming messages with tone-matched responses (TOS-compliant)
              </p>
            </div>
            <Switch checked={autoReply} onCheckedChange={setAutoReply} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-slate-200">Organic Zero-Budget Mode</Label>
              <p className="text-sm text-slate-400">
                Default ON — use only free organic growth. Toggle OFF to enable paid boost connectors.
              </p>
            </div>
            <Switch checked={organicMode} onCheckedChange={setOrganicMode} />
          </div>
          {!organicMode && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#FCD34D' }}>
              Paid boost mode enabled. Connect your ad accounts in <strong>Integrations</strong> to use budget.
            </div>
          )}
          <Button
            onClick={handleSaveAutomation}
            disabled={savingAutomation}
            style={{ background: '#2563FF' }}
            className="text-white hover:opacity-90"
          >
            {savingAutomation ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Automation Settings
          </Button>
        </CardContent>
      </Card>

      {/* API Keys — managed in Integrations */}
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Key className="w-5 h-5" style={{ color: '#2563FF' }} />
            API Keys &amp; Platform Connections
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage your AI provider keys and social platform connections in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/dashboard/integrations">
            <Button style={{ background: '#2563FF' }} className="text-white hover:opacity-90">
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to Integrations
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
