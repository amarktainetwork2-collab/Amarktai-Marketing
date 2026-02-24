/**
 * Power Tools Hub – All 10 AI Add-On Tools
 *
 * Each tool runs entirely via HuggingFace Inference API.
 * Designed and created by Amarktai Network
 */

import { useState } from 'react';
import {
  RefreshCw, Shuffle, Search, MessageSquarePlus, Eye, Shield,
  TrendingUp, Zap, Users, FlaskConical, ArrowRight, CheckCircle2,
  Clock, Play, Tag, Copy, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// ─── Tool catalogue ───────────────────────────────────────────────────────────

const TOOLS = [
  {
    id: 'remix',
    icon: Shuffle,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    title: 'Content Remix Engine',
    badge: 'Remix Booster',
    description: 'Turn any blog post or URL into platform-native snippets for all 6 channels. Autonomous daily batches with trending hashtags.',
  },
  {
    id: 'competitor',
    icon: Search,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'Competitor Shadow Analyzer',
    badge: 'Nightly Crawl',
    description: 'Track competitor websites, spot content gaps, and get AI counter-strategies. Nightly auto-refresh.',
  },
  {
    id: 'feedback',
    icon: MessageSquarePlus,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    title: 'Feedback Alchemy Platform',
    badge: 'Alchemy Insights',
    description: 'Transform customer reviews into ad copy, response templates and A/B test ideas.',
  },
  {
    id: 'echo',
    icon: RefreshCw,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    title: 'Social Echo Amplifier',
    badge: 'Echo Expander',
    description: 'Convert site visitor queries into amplified social threads and stories ranked by virality potential.',
  },
  {
    id: 'seo',
    icon: Eye,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    title: 'SEO Mirage Creator',
    badge: 'Mirage Enhancer',
    description: 'Generate SEO-optimised titles, alt texts, hashtags and enhanced captions for any platform algorithm.',
  },
  {
    id: 'churn',
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    title: 'Churn Shield Defender',
    badge: 'Shield Retention',
    description: 'Predict daily audience churn risk and deploy AI re-engagement posts and DM templates automatically.',
  },
  {
    id: 'pricer',
    icon: TrendingUp,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    title: 'Dynamic Harmony Pricer',
    badge: 'Pricer Optimizer',
    description: 'Adjust promoted product prices in social ads based on real-time buzz, sentiment and competitor data.',
  },
  {
    id: 'viral',
    icon: Zap,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    title: 'Viral Spark Igniter',
    badge: 'Spark Generator',
    description: 'Daily viral opportunity report with trending hooks, challenges and optimal posting windows.',
  },
  {
    id: 'audience',
    icon: Users,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    title: 'Audience Mirage Mapper',
    badge: 'Segmentation AI',
    description: 'Map psychographic audience segments and get tailored campaign ideas per segment.',
  },
  {
    id: 'adalchemy',
    icon: FlaskConical,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    title: 'Ad Alchemy Optimizer',
    badge: 'Alchemy Refiner',
    description: 'Generate 3 A/B ad copy variants, score them against global benchmarks, and pick the winner.',
  },
] as const;

type ToolId = typeof TOOLS[number]['id'];

const PLATFORMS = ['instagram', 'tiktok', 'twitter', 'linkedin', 'facebook', 'youtube'];

// ─── Async fetch helpers ──────────────────────────────────────────────────────

async function callTool(endpoint: string, body: unknown): Promise<{ id: string; status: string }> {
  const res = await fetch(`/api/v1/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

async function pollResult(endpoint: string, id: string, maxWait = 60000): Promise<unknown> {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await new Promise(r => setTimeout(r, 2500));
    const res = await fetch(`/api/v1/${endpoint}/${id}`);
    if (!res.ok) throw new Error('Poll failed');
    const data = await res.json();
    if (data.status === 'done') return data;
    if (data.status === 'failed') throw new Error(data.error_message || 'Processing failed');
  }
  throw new Error('Timeout waiting for result');
}

// ─── Result display ───────────────────────────────────────────────────────────

function ResultCard({ data, toolId }: { data: Record<string, unknown>; toolId: ToolId }) {
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
  };

  if (toolId === 'remix') {
    const snippets = (data.snippets as Array<Record<string, unknown>>) || [];
    return (
      <div className="space-y-3 mt-4">
        <div className="flex items-center gap-2 flex-wrap">
          {(data.trending_hashtags as string[] || []).slice(0, 8).map(h => (
            <Badge key={h} variant="secondary">#{h}</Badge>
          ))}
        </div>
        {snippets.map((s, i) => (
          <Card key={i} className="bg-gray-50">
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-1">
                <Badge>{s.platform as string}</Badge>
                <button onClick={() => copyToClipboard(s.caption as string)}>
                  <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700" />
                </button>
              </div>
              <p className="text-xs font-semibold">{s.title as string}</p>
              <p className="text-xs text-gray-600 mt-1">{s.caption as string}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (toolId === 'competitor') {
    return (
      <div className="space-y-3 mt-4 text-sm">
        <p><span className="font-semibold">Strategy:</span> {data.content_strategy as string}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-semibold text-green-700">Strengths</p>
            <ul className="list-disc list-inside text-xs text-gray-600">{(data.strengths as string[] || []).map((s,i) => <li key={i}>{s}</li>)}</ul>
          </div>
          <div>
            <p className="font-semibold text-red-700">Weaknesses</p>
            <ul className="list-disc list-inside text-xs text-gray-600">{(data.weaknesses as string[] || []).map((s,i) => <li key={i}>{s}</li>)}</ul>
          </div>
        </div>
        <div>
          <p className="font-semibold">Content Gaps (your opportunity):</p>
          <ul className="list-disc list-inside text-xs text-gray-600">{(data.content_gaps as string[] || []).map((s,i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div>
          <p className="font-semibold">Counter Strategies:</p>
          <ul className="list-disc list-inside text-xs text-gray-600">{(data.counter_strategies as string[] || []).map((s,i) => <li key={i}>{s}</li>)}</ul>
        </div>
        {(data.predicted_next_moves as string[] || []).length > 0 && (
          <div>
            <p className="font-semibold text-purple-700">Predicted Next Moves:</p>
            <ul className="list-disc list-inside text-xs text-gray-600">{(data.predicted_next_moves as string[] || []).map((s,i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </div>
    );
  }

  if (toolId === 'feedback') {
    const sentiment = data.overall_sentiment as string;
    const score = data.sentiment_score as number;
    return (
      <div className="space-y-3 mt-4 text-sm">
        <div className="flex items-center gap-3">
          <Badge className={sentiment === 'positive' ? 'bg-green-100 text-green-800' : sentiment === 'negative' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
            {sentiment} ({Math.round(score * 100)}%)
          </Badge>
        </div>
        <div>
          <p className="font-semibold">Ad Copy Ideas:</p>
          {(data.ad_copy_suggestions as string[] || []).map((c,i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded mt-1">
              <p className="text-xs">{c}</p>
              <button onClick={() => copyToClipboard(c)}><Copy className="w-3 h-3 text-gray-400" /></button>
            </div>
          ))}
        </div>
        <div>
          <p className="font-semibold">A/B Test Ideas:</p>
          {(data.ab_test_ideas as Array<Record<string,string>> || []).map((t,i) => (
            <div key={i} className="bg-blue-50 p-2 rounded text-xs mt-1">
              <p><strong>A:</strong> {t.variant_a}</p>
              <p><strong>B:</strong> {t.variant_b}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolId === 'viral') {
    return (
      <div className="space-y-3 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold">Reach Multiplier: {data.predicted_reach_multiplier as number}×</span>
        </div>
        <div>
          <p className="font-semibold">Top Hooks:</p>
          {(data.hooks as string[] || []).map((h,i) => (
            <div key={i} className="flex items-center justify-between bg-yellow-50 p-2 rounded mt-1">
              <p className="text-xs">{h}</p>
              <button onClick={() => copyToClipboard(h)}><Copy className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
        <div>
          <p className="font-semibold">Best Posting Windows:</p>
          {(data.best_posting_windows as Array<Record<string,string>> || []).map((w,i) => (
            <div key={i} className="flex items-center gap-2 text-xs mt-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <Badge variant="outline">{w.platform}</Badge>
              <span>{w.time} – {w.reason}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolId === 'adalchemy') {
    const winner = data.recommended_winner as Record<string,string> || {};
    return (
      <div className="space-y-3 mt-4 text-sm">
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <p className="font-semibold text-green-800">🏆 Winner: Variant {winner.variant_id}</p>
          <p className="text-xs text-green-700">{winner.reason}</p>
        </div>
        {(data.variants as Array<Record<string,unknown>> || []).map((v,i) => (
          <Card key={i} className={`${(v.variant_id as string) === winner.variant_id ? 'border-green-300 bg-green-50' : 'bg-gray-50'}`}>
            <CardContent className="p-3">
              <div className="flex justify-between">
                <Badge>Variant {v.variant_id as string}</Badge>
                <span className="text-xs font-bold">{v.score as number}/100</span>
              </div>
              <p className="text-xs font-semibold mt-1">{v.headline as string}</p>
              <p className="text-xs text-gray-600">{v.body as string}</p>
              <p className="text-xs text-blue-600">CTA: {v.cta as string}</p>
            </CardContent>
          </Card>
        ))}
        <div>
          <p className="font-semibold">Benchmark:</p>
          <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(data.global_benchmark_comparison, null, 2)}</pre>
        </div>
      </div>
    );
  }

  // Generic JSON display for other tools
  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? 'Collapse' : 'View full results'}
      </button>
      {expanded && (
        <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-64">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ─── Tool panel ───────────────────────────────────────────────────────────────

function ToolPanel({ tool }: { tool: typeof TOOLS[number] }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  // Form state
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [sourceType, setSourceType] = useState<'url' | 'text'>('url');
  const [platform, setPlatform] = useState('instagram');
  const [platforms, setPlatforms] = useState(PLATFORMS.slice(0, 4).join(','));

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      let jobResp: { id: string; status: string };

      switch (tool.id) {
        case 'remix':
          jobResp = await callTool('remix/', {
            source_type: sourceType,
            source_url: sourceType === 'url' ? url : undefined,
            source_text: sourceType === 'text' ? text : undefined,
            target_platforms: platforms.split(',').map(p => p.trim()).filter(Boolean),
          });
          setResult(await pollResult('remix', jobResp.id));
          break;

        case 'competitor':
          jobResp = await callTool('tools/competitor', { competitor_name: text.split('\n')[0] || 'Competitor', competitor_url: url, our_niche: '' });
          toast.success('Analysis queued – check back in ~30s');
          setResult({ status: 'queued', id: jobResp.id, message: `Refresh GET /api/v1/tools/competitor/${jobResp.id}` });
          break;

        case 'feedback':
          jobResp = await callTool('tools/feedback', { feedback_texts: text.split('\n').filter(Boolean), source: 'manual' });
          setResult(await pollResult('tools/feedback', jobResp.id));
          break;

        case 'echo':
          jobResp = await callTool('tools/echo', { trigger_text: text, trigger_source: 'chat', target_platforms: platforms.split(',').map(p => p.trim()) });
          setResult(await pollResult('tools/echo', jobResp.id));
          break;

        case 'seo':
          jobResp = await callTool('tools/seo-mirage', { input_text: text || undefined, target_url: url || undefined, platform });
          setResult(await pollResult('tools/seo-mirage', jobResp.id));
          break;

        case 'churn':
          jobResp = await callTool('tools/churn-shield', { platform, audience_data_summary: text });
          setResult(await pollResult('tools/churn-shield', jobResp.id));
          break;

        case 'pricer':
          jobResp = await callTool('tools/harmony-pricer', { product_name: text.split('\n')[0] || 'Product', current_price: text.split('\n')[1] || '$0', platform });
          setResult(await pollResult('tools/harmony-pricer', jobResp.id));
          break;

        case 'viral':
          jobResp = await callTool('tools/viral-spark', { niche: text || 'marketing' });
          setResult(await pollResult('tools/viral-spark', jobResp.id));
          break;

        case 'audience':
          jobResp = await callTool('tools/audience-map', { platform, data_summary: text });
          setResult(await pollResult('tools/audience-map', jobResp.id));
          break;

        case 'adalchemy':
          jobResp = await callTool('tools/ad-alchemy', { product_or_service: text.split('\n')[0] || 'Product', platform, current_copy: text.split('\n').slice(1).join('\n') });
          setResult(await pollResult('tools/ad-alchemy', jobResp.id));
          break;

        default:
          toast.error('Unknown tool');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const needsUrl = ['remix', 'competitor', 'seo'].includes(tool.id);
  const needsText = ['remix', 'competitor', 'feedback', 'echo', 'seo', 'churn', 'pricer', 'viral', 'audience', 'adalchemy'].includes(tool.id);
  const needsPlatform = ['echo', 'seo', 'churn', 'pricer', 'audience', 'adalchemy'].includes(tool.id);
  const needsPlatforms = ['remix', 'echo'].includes(tool.id);

  const textPlaceholders: Record<string, string> = {
    remix: 'Paste article content (or use URL mode)',
    competitor: 'Competitor name (line 1)\nThen describe their niche...',
    feedback: 'Paste customer reviews, one per line:\n"Love this product!"\n"Shipping was slow..."',
    echo: 'Paste a visitor query or comment to amplify into social posts...',
    seo: 'Paste content to optimise (or use URL mode)',
    churn: 'Describe audience drop: e.g. "Lost 300 followers last week, engagement down 20%"',
    pricer: 'Product name (line 1)\nCurrent price (line 2, e.g. $49)\nCompetitor prices (line 3+)',
    viral: 'Describe your niche: e.g. "online fitness coaching for busy parents"',
    audience: 'Describe your audience data: e.g. "18-35, 60% female, interests: fitness, travel"',
    adalchemy: 'Product/service (line 1)\nCurrent ad copy (remaining lines)',
  };

  const Icon = tool.icon;

  return (
    <Card className={`${tool.border} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${tool.color}`} />
          </div>
          <Badge variant="outline" className="text-xs">{tool.badge}</Badge>
        </div>
        <CardTitle className="text-base mt-2">{tool.title}</CardTitle>
        <CardDescription className="text-xs">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Source type toggle for remix/seo */}
        {(tool.id === 'remix' || tool.id === 'seo') && (
          <div className="flex gap-2">
            <Button size="sm" variant={sourceType === 'url' ? 'default' : 'outline'} onClick={() => setSourceType('url')} className="text-xs">URL</Button>
            <Button size="sm" variant={sourceType === 'text' ? 'default' : 'outline'} onClick={() => setSourceType('text')} className="text-xs">Text</Button>
          </div>
        )}

        {/* URL input */}
        {needsUrl && (tool.id === 'competitor' || sourceType === 'url') && (
          <Input placeholder="https://competitor.com" value={url} onChange={e => setUrl(e.target.value)} className="text-xs" />
        )}

        {/* Text input */}
        {needsText && (tool.id !== 'remix' || sourceType === 'text') && (
          <Textarea
            placeholder={textPlaceholders[tool.id] || 'Enter input...'}
            value={text}
            onChange={e => setText(e.target.value)}
            className="text-xs min-h-[80px]"
          />
        )}

        {/* Platform select */}
        {needsPlatform && (
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {/* Platforms multi (comma-separated) */}
        {needsPlatforms && (
          <Input
            placeholder="instagram,tiktok,twitter,linkedin"
            value={platforms}
            onChange={e => setPlatforms(e.target.value)}
            className="text-xs"
          />
        )}

        <Button
          onClick={run}
          disabled={loading}
          className={`w-full ${tool.bg} ${tool.color} border ${tool.border} hover:opacity-90 font-semibold`}
          variant="outline"
        >
          {loading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />Processing…</> : <><Play className="w-3.5 h-3.5 mr-2" />Run {tool.title}</>}
        </Button>

        {result && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-1 text-xs font-semibold text-green-700 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Results
            </div>
            <ResultCard data={result} toolId={tool.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ToolsPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | string>('all');

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'content', label: 'Content', ids: ['remix', 'echo', 'seo', 'adalchemy', 'viral'] },
    { id: 'research', label: 'Research', ids: ['competitor', 'feedback', 'audience'] },
    { id: 'retention', label: 'Retention', ids: ['churn', 'pricer'] },
  ] as const;

  const filtered = activeFilter === 'all'
    ? TOOLS
    : TOOLS.filter(t => {
        const cat = categories.find(c => c.id === activeFilter);
        return cat && 'ids' in cat && cat.ids.includes(t.id as never);
      });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-teal-600" />
          Power Tools Hub
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          10 autonomous AI add-ons powered entirely by HuggingFace — Designed and created by Amarktai Network
        </p>
      </div>

      {/* Info bar */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
        <CardContent className="p-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-violet-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>All tools run via <strong>HuggingFace Inference API</strong> only</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-violet-700">
            <Clock className="w-4 h-4" />
            <span>Competitor + Viral Spark + Churn Shield run <strong>daily automatically</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-violet-700">
            <ArrowRight className="w-4 h-4" />
            <span>Set <strong>HUGGINGFACE_TOKEN</strong> in Admin → Integrations to activate</span>
          </div>
        </CardContent>
      </Card>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={activeFilter === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(cat.id)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(tool => (
          <ToolPanel key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
