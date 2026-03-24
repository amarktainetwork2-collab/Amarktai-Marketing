import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload, Trash2, Image, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { webAppApi } from '@/lib/api';
import { toast } from 'sonner';
import type { WebApp, MediaAsset } from '@/types';

const categories = [
  'SaaS',
  'E-commerce',
  'Developer Tools',
  'Productivity',
  'Finance',
  'Health & Fitness',
  'Education',
  'Entertainment',
  'Other',
];

export default function EditWebAppPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, setWebApp] = useState<WebApp | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: '',
    targetAudience: '',
    keyFeatures: [''] as string[],
    brandVoice: '',
    marketLocation: '',
    contentGoals: '',
    scraperSourceUrls: [''] as string[],
  });

  useEffect(() => {
    const fetchWebApp = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const app = await webAppApi.getById(id);
        if (app) {
          setWebApp(app);
          setFormData({
            name: app.name,
            url: app.url,
            description: app.description,
            category: app.category,
            targetAudience: app.targetAudience,
            keyFeatures: app.keyFeatures.length > 0 ? app.keyFeatures : [''],
            brandVoice: app.brandVoice ?? '',
            marketLocation: app.marketLocation ?? '',
            contentGoals: app.contentGoals ?? '',
            scraperSourceUrls: (app.scraperSourceUrls && app.scraperSourceUrls.length > 0)
              ? app.scraperSourceUrls
              : [''],
          });
          setMediaAssets(app.mediaAssets ?? []);
        } else {
          toast.error('Web app not found');
          navigate('/dashboard/webapps');
        }
      } catch (error) {
        toast.error('Failed to load web app');
        navigate('/dashboard/webapps');
      } finally {
        setLoading(false);
      }
    };
    fetchWebApp();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);

    try {
      await webAppApi.update(id, {
        ...formData,
        keyFeatures: formData.keyFeatures.filter(f => f.trim() !== ''),
        brandVoice: formData.brandVoice.trim() || undefined,
        marketLocation: formData.marketLocation.trim() || undefined,
        contentGoals: formData.contentGoals.trim() || undefined,
        scraperSourceUrls: formData.scraperSourceUrls.filter(u => u.trim() !== '').length > 0
          ? formData.scraperSourceUrls.filter(u => u.trim() !== '')
          : undefined,
      });
      toast.success('Web app updated successfully');
      navigate('/dashboard/webapps');
    } catch (error) {
      toast.error('Failed to update web app');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, keyFeatures: [...formData.keyFeatures, ''] });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      keyFeatures: formData.keyFeatures.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.keyFeatures];
    newFeatures[index] = value;
    setFormData({ ...formData, keyFeatures: newFeatures });
  };

  const addScraperUrl = () => setFormData({ ...formData, scraperSourceUrls: [...formData.scraperSourceUrls, ''] });
  const removeScraperUrl = (index: number) =>
    setFormData({ ...formData, scraperSourceUrls: formData.scraperSourceUrls.filter((_, i) => i !== index) });
  const updateScraperUrl = (index: number, value: string) => {
    const next = [...formData.scraperSourceUrls];
    next[index] = value;
    setFormData({ ...formData, scraperSourceUrls: next });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const asset = await webAppApi.uploadMedia(id, file);
      setMediaAssets(prev => [...prev, asset]);
      toast.success(`"${file.name}" uploaded`);
    } catch (err) {
      toast.error((err as Error).message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!id) return;
    try {
      await webAppApi.deleteMedia(id, assetId);
      setMediaAssets(prev => prev.filter(a => a.id !== assetId));
      toast.success('Asset removed');
    } catch {
      toast.error('Failed to remove asset');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/dashboard/webapps')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Web Apps
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Web App</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">App Name *</Label>
              <Input
                id="name"
                placeholder="e.g., TaskFlow Pro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Website URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://yourapp.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="What does your app do? What problem does it solve?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={formData.category === cat ? 'default' : 'outline'}
                    className={`cursor-pointer ${
                      formData.category === cat 
                        ? 'bg-violet-600 hover:bg-violet-700' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setFormData({ ...formData, category: cat })}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience *</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Remote teams, project managers, startups"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Key Features</Label>
              <p className="text-sm text-gray-500 mb-2">
                Add features that make your app stand out. These help our AI create better content.
              </p>
              <div className="space-y-2">
                {formData.keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Feature ${index + 1}`}
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                    />
                    {formData.keyFeatures.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandVoice">Brand Voice &amp; Tone</Label>
              <Textarea
                id="brandVoice"
                placeholder="Describe your brand's voice and tone. e.g. 'Professional yet approachable, uses plain language, avoids jargon, energetic and motivating.'"
                value={formData.brandVoice}
                onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-gray-500">
                This guides AI content generation to match your brand personality.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketLocation">Market / Location</Label>
              <Input
                id="marketLocation"
                placeholder="e.g., United Kingdom, Global, US - New York"
                value={formData.marketLocation}
                onChange={(e) => setFormData({ ...formData, marketLocation: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                The geographic market or region you are targeting.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentGoals">Content Goals</Label>
              <Textarea
                id="contentGoals"
                placeholder="e.g., Drive app signups, build brand awareness, grow newsletter subscribers"
                value={formData.contentGoals}
                onChange={(e) => setFormData({ ...formData, contentGoals: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-gray-500">
                What do you want your content to achieve? This shapes AI generation priorities.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Additional Scraper Source URLs</Label>
              <p className="text-sm text-gray-500 mb-2">
                Extra pages to scrape (e.g. product pages, pricing, about). The main URL is always scraped automatically.
              </p>
              <div className="space-y-2">
                {formData.scraperSourceUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="url"
                      placeholder={`https://yourapp.com/page-${index + 1}`}
                      value={url}
                      onChange={(e) => updateScraperUrl(index, e.target.value)}
                    />
                    {formData.scraperSourceUrls.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeScraperUrl(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addScraperUrl}>
                <Plus className="w-4 h-4 mr-2" />
                Add URL
              </Button>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/webapps')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-violet-600 to-indigo-600"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Media Assets */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Brand Media Assets
          </CardTitle>
          <p className="text-sm text-gray-500">
            Upload logos, product images, and marketing assets for AI-assisted content generation.
            Accepted: images, videos, PDF — max 50 MB each.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" />Upload Asset</>
                )}
              </Button>
            </div>

            {mediaAssets.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Image className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">No media assets yet. Upload your first asset above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaAssets.map((asset) => (
                  <div key={asset.id} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                    {asset.type.startsWith('image/') ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-24 object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center bg-gray-100">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-xs text-gray-700 truncate" title={asset.name}>{asset.name}</p>
                      <p className="text-xs text-gray-400">{(asset.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
