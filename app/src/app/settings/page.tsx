import { useState } from 'react';
import { Bell, Clock, Shield, User, CreditCard, Sparkles, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { authFetch } from '@/lib/auth';

const cardStyle = {
  background: 'rgba(17,24,39,0.72)',
  border: '1px solid rgba(255,255,255,0.10)',
};

interface ApiKeyField {
  name: string;
  label: string;
  description: string;
  placeholder: string;
}

const AI_KEY_FIELDS: ApiKeyField[] = [
  { name: 'QWEN_API_KEY', label: 'Qwen / Hugging Face Key (Primary AI)', description: 'Primary AI content generation — Qwen2.5 via Hugging Face Serverless.', placeholder: 'hf_...' },
  { name: 'HUGGINGFACE_TOKEN', label: 'Hugging Face Token (AI Fallback)', description: 'Fallback AI via Hugging Face Inference API.', placeholder: 'hf_...' },
  { name: 'OPENAI_API_KEY', label: 'OpenAI API Key (AI Fallback)', description: 'Optional OpenAI fallback for content generation.', placeholder: 'sk-...' },
  { name: 'FIRECRAWL_API_KEY', label: 'Firecrawl API Key (Web Scraping)', description: 'Primary web scraping for richer brand extraction.', placeholder: 'fc-...' },
];

function PersonalApiKeys() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const toggleVisible = (name: string) =>
    setVisible(v => ({ ...v, [name]: !v[name] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(values)
        .filter(([, v]) => v.trim() !== '')
        .map(([key_name, key_value]) => ({ key_name, key_value }));
      if (updates.length === 0) {
        toast.info('No changes to save');
        setSaving(false);
        return;
      }
      await authFetch('/users/api-keys', {
        method: 'POST',
        body: JSON.stringify({ keys: updates }),
      });
      toast.success(`${updates.length} API key${updates.length !== 1 ? 's' : ''} saved`);
      setValues({});
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save keys');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={cardStyle}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Key className="w-5 h-5" style={{ color: '#2563FF' }} />
          Personal API Keys
        </CardTitle>
        <CardDescription className="text-slate-400">
          Override system-level AI and scraping keys with your own. Keys are encrypted at rest and never exposed to the frontend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {AI_KEY_FIELDS.map((f) => (
          <div key={f.name} className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-200">{f.label}</Label>
            <p className="text-xs text-slate-400">{f.description}</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={visible[f.name] ? 'text' : 'password'}
                  placeholder={f.placeholder}
                  value={values[f.name] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))}
                  className="pr-10 font-mono text-sm"
                  style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.12)', color: '#F8FAFC' }}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  onClick={() => toggleVisible(f.name)}
                >
                  {visible[f.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
        <p className="text-xs text-slate-500 pt-1">
          Leave a field blank to keep the existing key unchanged.
          Keys take effect immediately on the next generation or scrape.
        </p>
        <Button
          onClick={handleSave}
          disabled={saving}
          style={{ background: '#2563FF' }}
          className="text-white hover:opacity-90"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
          {saving ? 'Saving…' : 'Save API Keys'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    emailDaily: true,
    emailWeekly: true,
    pushApproval: true,
    pushPosted: false,
  });

  const [preferences, setPreferences] = useState({
    postingTime: '10:00',
    timezone: 'America/New_York',
    language: 'en',
  });

  const [autoPost, setAutoPost] = useState(false);
  const [autoReply, setAutoReply] = useState(false);
  const [organicMode, setOrganicMode] = useState(true);

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleSavePreferences = () => {
    toast.success('Preferences saved');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Settings</h2>
        <p className="text-slate-400">Manage your workspace, notifications, and preferences</p>
      </div>

      {/* Plan Info */}
      <Card style={{ background: 'linear-gradient(135deg, rgba(37,99,255,0.15) 0%, rgba(34,211,238,0.08) 100%)', border: '1px solid rgba(37,99,255,0.25)' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#4F7DFF' }}>Current Plan</p>
              <h3 className="text-2xl font-bold text-white">Pro</h3>
              <p className="text-sm mt-1 text-slate-300">$29/month</p>
            </div>
            <Button variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}>
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(37,99,255,0.2)' }}>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}>5 Web Apps</Badge>
              <Badge variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}>6 Platforms</Badge>
              <Badge variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}>12 posts/day</Badge>
              <Badge variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}>Priority Support</Badge>
            </div>
          </div>
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

          <div className="space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <h4 className="font-medium text-xs uppercase tracking-widest text-slate-500">Push Notifications</h4>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-approval" className="font-medium text-slate-200">Content Approval</Label>
                <p className="text-sm text-slate-400">Notify when content is ready for approval</p>
              </div>
              <Switch
                id="push-approval"
                checked={notifications.pushApproval}
                onCheckedChange={(checked) => setNotifications({ ...notifications, pushApproval: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-posted" className="font-medium text-slate-200">Content Posted</Label>
                <p className="text-sm text-slate-400">Notify when content goes live</p>
              </div>
              <Switch
                id="push-posted"
                checked={notifications.pushPosted}
                onCheckedChange={(checked) => setNotifications({ ...notifications, pushPosted: checked })}
              />
            </div>
          </div>

          <Button onClick={handleSaveNotifications} style={{ background: '#2563FF' }} className="text-white hover:opacity-90">
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
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Automation Schedule</Label>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-200">Daily at 2:00 AM</p>
                  <p className="text-sm text-slate-400">Content is generated automatically</p>
                </div>
                <Badge variant="outline" style={{ borderColor: 'rgba(16,185,129,0.4)', color: '#10B981' }}>Active</Badge>
              </div>
            </div>
          </div>

          <Button onClick={handleSavePreferences} style={{ background: '#2563FF' }} className="text-white hover:opacity-90">
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
            <Button variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}>Enable</Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div>
              <p className="font-medium text-slate-200">Change Password</p>
              <p className="text-sm text-slate-400">Last changed 30 days ago</p>
            </div>
            <Button variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}>Change</Button>
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
            onClick={() => toast.success('Automation settings saved')}
            style={{ background: '#2563FF' }}
            className="text-white hover:opacity-90"
          >
            Save Automation Settings
          </Button>
        </CardContent>
      </Card>

      <PersonalApiKeys />
    </div>
  );
}
