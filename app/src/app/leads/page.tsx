import { useEffect, useState } from 'react';
import {
  Users, TrendingUp, Star, CheckCircle, Download, Search,
  Filter, Mail, Building2, Link as LinkIcon, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Lead, LeadStats } from '@/types';
import { leadsApi } from '@/lib/api';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-violet-100 text-violet-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-gray-100 text-gray-500',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUtmModal, setShowUtmModal] = useState(false);
  const [utmBaseUrl, setUtmBaseUrl] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmPlatform, setUtmPlatform] = useState('instagram');
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsData, statsData] = await Promise.all([
        leadsApi.getAll(statusFilter ? { status: statusFilter } : undefined),
        leadsApi.getStats(),
      ]);
      setLeads(leadsData);
      setStats(statsData);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Lead['status']) => {
    try {
      await leadsApi.update(id, { status });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      toast.success(`Lead marked as ${status}`);
    } catch {
      toast.error('Failed to update lead');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await leadsApi.delete(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const handleGenerateUtm = async () => {
    if (!utmBaseUrl || !utmCampaign) {
      toast.error('Please fill in the URL and campaign name');
      return;
    }
    try {
      const result = await leadsApi.generateUtmLink({
        base_url: utmBaseUrl,
        campaign: utmCampaign,
        platform: utmPlatform,
      });
      setGeneratedLink(result.utm_url);
    } catch {
      toast.error('Failed to generate UTM link');
    }
  };

  const filteredLeads = leads.filter(lead =>
    search === '' ||
    lead.email.toLowerCase().includes(search.toLowerCase()) ||
    (lead.name?.toLowerCase().includes(search.toLowerCase())) ||
    (lead.company?.toLowerCase().includes(search.toLowerCase()))
  );

  const statsCards = [
    { title: 'Total Leads', value: stats?.total ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Qualified', value: stats?.qualified ?? 0, sub: stats ? `${stats.qualificationRate}% rate` : '', icon: Star, color: 'text-violet-600', bg: 'bg-violet-50' },
    { title: 'Converted', value: stats?.converted ?? 0, sub: stats ? `${stats.conversionRate}% rate` : '', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Top Source', value: stats?.byPlatform ? (Object.entries(stats.byPlatform).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—') : '—', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Management</h2>
          <p className="text-gray-500">Track leads generated from your social media content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUtmModal(true)}>
            <LinkIcon className="w-4 h-4 mr-2" />UTM Builder
          </Button>
          <Button variant="outline" onClick={() => leadsApi.exportCsv()}>
            <Download className="w-4 h-4 mr-2" />Export CSV
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s) => (
          <Card key={s.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.title}</p>
                  <p className="text-2xl font-bold mt-1 capitalize">{s.value}</p>
                  {('sub' in s) && s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
                </div>
                <div className={`w-12 h-12 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats && Object.keys(stats.byPlatform).length > 0 && (
        <Card>
          <CardHeader><CardTitle>Leads by Platform</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.byPlatform).sort((a, b) => b[1] - a[1]).map(([platform, count]) => (
                <div key={platform} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium capitalize">{platform}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search leads..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />{statusFilter ? `Status: ${statusFilter}` : 'All Statuses'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {['', 'new', 'contacted', 'qualified', 'converted', 'lost'].map((s) => (
              <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>{s || 'All Statuses'}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No leads yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Use the UTM Builder to create tracking links for your posts. When visitors click
                your link and submit a form, they appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Lead</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Score</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{lead.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                          <Mail className="w-3 h-3" />{lead.email}
                        </div>
                        {lead.company && (
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Building2 className="w-3 h-3" />{lead.company}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.sourcePlatform ? (
                          <Badge variant="outline" className="capitalize">{lead.sourcePlatform}</Badge>
                        ) : <span className="text-gray-400">—</span>}
                        {lead.utmCampaign && <p className="text-xs text-gray-400 mt-0.5">{lead.utmCampaign}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-violet-600 h-1.5 rounded-full" style={{ width: `${lead.leadScore}%` }} />
                          </div>
                          <span className="text-xs font-medium">{lead.leadScore}</span>
                        </div>
                        {lead.isQualified && <Badge className="bg-green-100 text-green-700 mt-1 text-xs">Qualified</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Badge className={`cursor-pointer capitalize ${STATUS_COLORS[lead.status] || ''}`}>{lead.status}</Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {(['new', 'contacted', 'qualified', 'converted', 'lost'] as Lead['status'][]).map(s => (
                              <DropdownMenuItem key={s} onClick={() => handleStatusUpdate(lead.id, s)}>
                                <span className="capitalize">{s}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(lead.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showUtmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-violet-600" />UTM Link Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Create a tracked link to embed in your posts. Visitors' source platforms are automatically recorded.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Landing Page URL *</label>
                  <Input placeholder="https://yourwebsite.com/landing" value={utmBaseUrl} onChange={(e) => setUtmBaseUrl(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Campaign Name *</label>
                  <Input placeholder="e.g. spring-launch" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={utmPlatform} onChange={(e) => setUtmPlatform(e.target.value)}>
                    {['youtube','tiktok','instagram','facebook','twitter','linkedin','pinterest','reddit','bluesky','threads','telegram','snapchat'].map(p => (
                      <option key={p} value={p} className="capitalize">{p}</option>
                    ))}
                  </select>
                </div>
                {generatedLink && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Your tracking link:</p>
                    <p className="text-sm text-violet-700 break-all">{generatedLink}</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => { navigator.clipboard.writeText(generatedLink); toast.success('Link copied!'); }}>
                      Copy Link
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => { setShowUtmModal(false); setGeneratedLink(''); }}>Close</Button>
                <Button onClick={handleGenerateUtm}>Generate Link</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
