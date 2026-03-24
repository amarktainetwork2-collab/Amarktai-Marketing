import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, ExternalLink, Play, Pause, Trash2, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { groupsApi, webAppApi } from '@/lib/api';
import type { BusinessGroup } from '@/lib/api';
import { toast } from 'sonner';

const PLATFORM_COLORS: Record<string, string> = {
  facebook: 'bg-blue-100 text-blue-700',
  reddit: 'bg-orange-100 text-orange-700',
  telegram: 'bg-sky-100 text-sky-700',
  discord: 'bg-indigo-100 text-indigo-700',
  linkedin: 'bg-blue-100 text-blue-800',
};

const STATUS_COLORS: Record<string, string> = {
  suggested: 'bg-yellow-100 text-yellow-700',
  joined: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-gray-100 text-gray-600',
  removed: 'bg-red-100 text-red-600',
};

interface WebApp {
  id: string;
  name: string;
  url: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<BusinessGroup[]>([]);
  const [webapps, setWebapps] = useState<WebApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const [filterWebapp, setFilterWebapp] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [searchWebappId, setSearchWebappId] = useState('');
  const [searchPlatform, setSearchPlatform] = useState('reddit');

  const [confirmGroup, setConfirmGroup] = useState<BusinessGroup | null>(null);
  const [platformGroupId, setPlatformGroupId] = useState('');

  const [postGroup, setPostGroup] = useState<BusinessGroup | null>(null);
  const [postText, setPostText] = useState('');
  const [postLink, setPostLink] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => { loadAll(); }, [filterWebapp, filterPlatform, filterStatus]);

  const loadAll = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [g, w] = await Promise.all([
        groupsApi.list(filterWebapp || undefined, filterPlatform || undefined, filterStatus || undefined),
        webAppApi.getAll(),
      ]);
      setGroups(g);
      setWebapps(w as WebApp[]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load groups';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchWebappId) { toast.error('Select a business first'); return; }
    setSearching(true);
    try {
      const result = await groupsApi.search(searchWebappId, searchPlatform);
      toast.success(`Found ${result.found} groups on ${searchPlatform} (${result.saved} new)`);
      await loadAll();
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirmJoin = async () => {
    if (!confirmGroup || !platformGroupId.trim()) return;
    try {
      await groupsApi.confirmJoin(confirmGroup.id, platformGroupId.trim());
      toast.success('Join confirmed! Group is now ready for AI posting.');
      setConfirmGroup(null);
      setPlatformGroupId('');
      await loadAll();
    } catch {
      toast.error('Failed to confirm join');
    }
  };

  const handleStatusChange = async (group: BusinessGroup, newStatus: string) => {
    try {
      await groupsApi.updateStatus(group.id, newStatus);
      toast.success(`Group ${newStatus}`);
      await loadAll();
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Failed to update status');
    }
  };

  const handlePost = async () => {
    if (!postGroup || !postText.trim()) return;
    setPosting(true);
    try {
      await groupsApi.post(postGroup.id, postText, postLink || undefined);
      toast.success('Posted successfully!');
      setPostGroup(null);
      setPostText('');
      setPostLink('');
      await loadAll();
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Post failed');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (group: BusinessGroup) => {
    if (!confirm(`Remove "${group.groupName}"?`)) return;
    try {
      await groupsApi.delete(group.id);
      toast.success('Group removed');
      await loadAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const suggestedCount = groups.filter(g => g.status === 'suggested').length;
  const joinedCount = groups.filter(g => g.status === 'joined').length;
  const activeCount = groups.filter(g => g.status === 'active').length;
  const totalPosts = groups.reduce((s, g) => s + g.postsSent, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community Groups</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI discovers relevant groups on Facebook, Reddit, Telegram &amp; Discord. Join manually, then let AI post organically.
          </p>
        </div>
        <Button onClick={loadAll} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Load error */}
      {loadError && (
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3 text-red-600">
            <span className="text-sm">{loadError}</span>
            <Button variant="outline" size="sm" onClick={loadAll}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Suggested', value: suggestedCount, color: 'text-yellow-600' },
          { label: 'Joined', value: joinedCount, color: 'text-blue-600' },
          { label: 'Active', value: activeCount, color: 'text-green-600' },
          { label: 'Total Posts', value: totalPosts, color: 'text-violet-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="w-4 h-4" /> Discover New Groups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-gray-500 mb-1 block">Business / Website</label>
              <Select value={searchWebappId} onValueChange={setSearchWebappId}>
                <SelectTrigger><SelectValue placeholder="Select business..." /></SelectTrigger>
                <SelectContent>
                  {webapps.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <label className="text-xs text-gray-500 mb-1 block">Platform</label>
              <Select value={searchPlatform} onValueChange={setSearchPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} disabled={searching || !searchWebappId}>
              {searching ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              {searching ? 'Searching...' : 'Search Groups'}
            </Button>
          </div>
          <p className="text-xs text-amber-600 mt-3">
            ⚠️ <strong>Compliance:</strong> Never auto-join groups. Use the join link, manually join each group, then click "Confirm Join" to unlock AI posting.
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterWebapp} onValueChange={setFilterWebapp}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All businesses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All businesses</SelectItem>
            {webapps.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All platforms" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All platforms</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="reddit">Reddit</SelectItem>
            <SelectItem value="telegram">Telegram</SelectItem>
            <SelectItem value="discord">Discord</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="suggested">Suggested</SelectItem>
            <SelectItem value="joined">Joined</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Groups list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading groups...</div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No groups found</p>
            <p className="text-sm mt-1">Use "Discover New Groups" above to search for communities.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {groups.map(group => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold truncate max-w-xs">{group.groupName}</span>
                      <Badge className={PLATFORM_COLORS[group.platform] || ''}>{group.platform}</Badge>
                      <Badge className={STATUS_COLORS[group.status] || ''}>{group.status}</Badge>
                      {group.memberCount > 0 && <span className="text-xs text-gray-400">{group.memberCount.toLocaleString()} members</span>}
                    </div>
                    {group.description && <p className="text-sm text-gray-500 line-clamp-2">{group.description}</p>}
                    {group.complianceNote && group.status === 'suggested' && (
                      <p className="text-xs text-amber-600 mt-1">{group.complianceNote}</p>
                    )}
                    {group.postsSent > 0 && (
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>📤 {group.postsSent} posts</span>
                        <span>👁 {group.totalViews} views</span>
                        <span>💬 {group.totalEngagements}</span>
                        <span>🎯 {group.totalLeads} leads</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.status === 'suggested' && group.groupUrl && (
                      <a href={group.groupUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm"><ExternalLink className="w-3 h-3 mr-1" /> Join</Button>
                      </a>
                    )}
                    {group.status === 'suggested' && (
                      <Button size="sm" variant="outline" onClick={() => setConfirmGroup(group)}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Confirm Join
                      </Button>
                    )}
                    {group.status === 'joined' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusChange(group, 'active')}>
                        <Play className="w-3 h-3 mr-1" /> Activate
                      </Button>
                    )}
                    {group.status === 'active' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => { setPostGroup(group); setPostText(''); setPostLink(''); }}>
                          <Send className="w-3 h-3 mr-1" /> Post Now
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(group, 'paused')}>
                          <Pause className="w-3 h-3 mr-1" /> Pause
                        </Button>
                      </>
                    )}
                    {group.status === 'paused' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(group, 'active')}>
                        <Play className="w-3 h-3 mr-1" /> Resume
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600" onClick={() => handleDelete(group)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm Join Modal */}
      {confirmGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-1">Confirm Join: {confirmGroup.groupName}</h2>
            <p className="text-sm text-gray-500 mb-4">
              After manually joining on {confirmGroup.platform}, enter the group's ID below to enable AI posting.
            </p>
            {confirmGroup.platform === 'discord' ? (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Discord Webhook URL</label>
                <Input placeholder="https://discord.com/api/webhooks/..." value={platformGroupId} onChange={e => setPlatformGroupId(e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">Channel Settings → Integrations → Webhooks</p>
              </div>
            ) : confirmGroup.platform === 'telegram' ? (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Telegram Chat ID or @username</label>
                <Input placeholder="@channelname or -100xxxxxxxxxx" value={platformGroupId} onChange={e => setPlatformGroupId(e.target.value)} />
              </div>
            ) : confirmGroup.platform === 'reddit' ? (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Subreddit name (without r/)</label>
                <Input placeholder="learnprogramming" value={platformGroupId} onChange={e => setPlatformGroupId(e.target.value)} />
              </div>
            ) : (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Facebook Group ID</label>
                <Input placeholder="123456789012345" value={platformGroupId} onChange={e => setPlatformGroupId(e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">Found in the group URL: facebook.com/groups/[id]</p>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button className="flex-1" onClick={handleConfirmJoin} disabled={!platformGroupId.trim()}>Confirm Join</Button>
              <Button variant="outline" onClick={() => { setConfirmGroup(null); setPlatformGroupId(''); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {postGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-lg font-bold mb-1">Post to: {postGroup.groupName}</h2>
            <Badge className={`${PLATFORM_COLORS[postGroup.platform] || ''} mb-3`}>{postGroup.platform}</Badge>
            <Textarea placeholder="Write your post content..." value={postText} onChange={e => setPostText(e.target.value)} rows={4} className="mb-3" />
            <Input placeholder="Optional link URL" value={postLink} onChange={e => setPostLink(e.target.value)} className="mb-4" />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handlePost} disabled={posting || !postText.trim()}>
                {posting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {posting ? 'Posting...' : 'Post Now'}
              </Button>
              <Button variant="outline" onClick={() => setPostGroup(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
