import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FileText, Plus, Loader2, ExternalLink, Share2, Trash2,
  BookOpen, Target, Clock, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { blogApi, webAppApi, type BlogPost } from '@/lib/api';
import type { WebApp } from '@/types';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [webapps, setWebapps] = useState<WebApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [remixing, setRemixing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [selectedWebapp, setSelectedWebapp] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [customKeywords, setCustomKeywords] = useState('');

  useEffect(() => {
    Promise.all([loadPosts(), loadWebapps()]);
  }, []);

  async function loadPosts() {
    try {
      const data = await blogApi.getAll();
      setPosts(data);
    } catch {
      // silence
    } finally {
      setLoading(false);
    }
  }

  async function loadWebapps() {
    try {
      const data = await webAppApi.getAll();
      setWebapps(data);
      if (data.length > 0 && !selectedWebapp) setSelectedWebapp(data[0].id);
    } catch {
      // silence
    }
  }

  async function handleGenerate() {
    if (!selectedWebapp) {
      toast.error('Please select a web app first');
      return;
    }
    setGenerating(true);
    try {
      const post = await blogApi.generate({
        webapp_id: selectedWebapp,
        custom_topic: customTopic || undefined,
        custom_keywords: customKeywords
          ? customKeywords.split(',').map(k => k.trim()).filter(Boolean)
          : undefined,
      });
      setPosts(prev => [post, ...prev]);
      setCustomTopic('');
      setCustomKeywords('');
      setExpandedId(post.id);
      toast.success('Blog post generated! Review and publish.');
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  async function handleRemix(postId: string) {
    setRemixing(postId);
    try {
      const result = await blogApi.remixToSocial(postId);
      toast.success(`${result.message} — check Content Studio for approval`);
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Remix failed');
    } finally {
      setRemixing(null);
    }
  }

  async function handleDelete(postId: string) {
    try {
      await blogApi.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Delete failed');
    }
  }

  async function handlePublish(postId: string) {
    try {
      const updated = await blogApi.update(postId, { isPublished: true, status: 'published' });
      setPosts(prev => prev.map(p => p.id === postId ? updated : p));
      toast.success('Post marked as published');
    } catch {
      toast.error('Update failed');
    }
  }

  const draftCount = posts.filter(p => p.status === 'draft').length;
  const publishedCount = posts.filter(p => p.isPublished).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SEO Blog Generator</h1>
          <p className="text-gray-500 mt-1">
            AI-generated long-form blog posts to drive organic Google traffic and leads
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-yellow-100 text-yellow-700">{draftCount} drafts</Badge>
          <Badge className="bg-green-100 text-green-700">{publishedCount} published</Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: FileText, label: 'Total Posts', value: posts.length, iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
          { icon: BookOpen, label: 'Published', value: publishedCount, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
          { icon: Target, label: 'Drafts', value: draftCount, iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
        ].map(({ icon: Icon, label, value, iconBg, iconColor }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generator form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate New Blog Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Web App *</Label>
              <select
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                value={selectedWebapp}
                onChange={e => setSelectedWebapp(e.target.value)}
              >
                <option value="">Select a web app…</option>
                {webapps.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Custom Topic (optional)</Label>
              <Input
                placeholder="e.g. How to boost sales with AI"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Target Keywords (comma-separated)</Label>
              <Input
                placeholder="e.g. ai marketing, lead generation"
                value={customKeywords}
                onChange={e => setCustomKeywords(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating || !selectedWebapp}
            className="bg-gradient-to-r from-violet-600 to-indigo-600"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating with AI Engine…</>
            ) : (
              <><FileText className="w-4 h-4 mr-2" /> Generate SEO Blog Post</>
            )}
          </Button>
          <p className="text-xs text-gray-400">
            Powered by Amarkt<span style={{color: '#2563EB'}}>AI</span> Network. Posts take ~30s to generate.
            Each post can be remixed into social media content with one click.
          </p>
        </CardContent>
      </Card>

      {/* Posts list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No blog posts yet. Generate your first one above!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Post header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 flex items-start justify-between"
                  onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className={post.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {post.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {post.readingTimeMins && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{post.readingTimeMins} min read
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg leading-tight">{post.title}</h3>
                    {post.metaDescription && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.metaDescription}</p>
                    )}
                    {post.targetKeywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.targetKeywords.slice(0, 5).map(kw => (
                          <span key={kw} className="text-xs bg-violet-50 text-violet-600 rounded px-2 py-0.5">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!post.isPublished && (
                      <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handlePublish(post.id); }}>
                        Publish
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-violet-600 border-violet-300"
                      disabled={remixing === post.id}
                      onClick={e => { e.stopPropagation(); handleRemix(post.id); }}
                    >
                      {remixing === post.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <><Share2 className="w-3 h-3 mr-1" /> Remix</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-600"
                      onClick={e => { e.stopPropagation(); handleDelete(post.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedId === post.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {expandedId === post.id && (
                  <div className="border-t px-4 py-4 space-y-4 bg-gray-50">
                    {post.sections?.map((section, i) => (
                      <div key={i}>
                        <h4 className="font-semibold text-base mb-1">{section.heading}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
                      </div>
                    ))}
                    {post.ctaText && (
                      <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-violet-700">{post.ctaText}</p>
                        {post.ctaUrl && (
                          <a href={post.ctaUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-violet-600 text-white">
                              <ExternalLink className="w-3 h-3 mr-1" /> Visit
                            </Button>
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <RefreshCw className="w-3 h-3" />
                      Generated {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
