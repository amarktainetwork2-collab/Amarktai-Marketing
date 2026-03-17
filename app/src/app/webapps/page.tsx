import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, ExternalLink, Edit2, Trash2, MoreVertical, Power,
  Globe, RefreshCw, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { WebApp } from '@/types';
import { webAppApi, scrapeApi } from '@/lib/api';
import { toast } from 'sonner';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' },
  }),
};

export default function WebAppsPage() {
  const [webApps, setWebApps] = useState<WebApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<WebApp | null>(null);

  useEffect(() => { fetchWebApps(); }, []);

  const fetchWebApps = async () => {
    try {
      const apps = await webAppApi.getAll();
      setWebApps(apps);
    } catch {
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appToDelete) return;
    try {
      await webAppApi.delete(appToDelete.id);
      setWebApps(webApps.filter(app => app.id !== appToDelete.id));
      toast.success('Business deleted successfully');
    } catch {
      toast.error('Failed to delete business');
    } finally {
      setDeleteDialogOpen(false);
      setAppToDelete(null);
    }
  };

  const handleToggleActive = async (app: WebApp) => {
    try {
      await webAppApi.update(app.id, { isActive: !app.isActive });
      setWebApps(webApps.map(a => a.id === app.id ? { ...a, isActive: !a.isActive } : a));
      toast.success(app.isActive ? 'Business paused' : 'Business activated');
    } catch {
      toast.error('Failed to update business');
    }
  };

  const handleRescan = async (app: WebApp) => {
    setScanningId(app.id);
    try {
      const result = await scrapeApi.scrapeWebapp(app.id);
      const data = result.scraped_data;
      toast.success(
        data.status === 'ok'
          ? `Scanned "${data.title || app.name}" — ${data.headings.length} headings, ${data.paragraphs.length} paragraphs found`
          : `Scan completed with warning: ${data.error}`
      );
      await fetchWebApps();
    } catch {
      toast.error('Website scan failed');
    } finally {
      setScanningId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Businesses</h2>
          <p className="text-gray-500">
            Manage up to 20 businesses the AI promotes across all 12 platforms
          </p>
        </div>
        <Link to="/dashboard/webapps/new">
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Business
          </Button>
        </Link>
      </div>

      {webApps.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No businesses yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Add your first business to start generating AI-powered social media content across all 12 platforms.
            </p>
            <Link to="/dashboard/webapps/new">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Business
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {webApps.map((app, i) => {
            const scraped = (app as any).scrapedData as Record<string, unknown> | null | undefined;
            const isScanning = scanningId === app.id;

            return (
              <motion.div
                key={app.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="show"
              >
                <Card className={!app.isActive ? 'opacity-60' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {app.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h3 className="font-semibold">{app.name}</h3>
                            <Badge variant={app.isActive ? 'default' : 'secondary'}>
                              {app.isActive ? 'Active' : 'Paused'}
                            </Badge>
                          </div>
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-violet-600 hover:text-violet-700 flex items-center mt-1"
                          >
                            {app.url.replace(/^https?:\/\//, '')}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{app.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>{app.category}</span>
                            <span>•</span>
                            <span>{app.keyFeatures.length} features</span>
                          </div>

                          {/* AI Scan status */}
                          <div className="mt-3">
                            {isScanning ? (
                              <span className="inline-flex items-center text-xs text-violet-600 gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                AI scanning website…
                              </span>
                            ) : scraped && (scraped as any).status === 'ok' ? (
                              <span className="inline-flex items-center text-xs text-green-600 gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                AI scan complete — {((scraped as any).headings?.length ?? 0)} headings extracted
                              </span>
                            ) : scraped && (scraped as any).error ? (
                              <span className="inline-flex items-center text-xs text-amber-600 gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Scan error — click Re-scan to retry
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs text-gray-400 gap-1">
                                <Globe className="w-3 h-3" />
                                Website not yet scanned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Re-scan website"
                          onClick={() => handleRescan(app)}
                          disabled={isScanning}
                        >
                          <RefreshCw className={`w-4 h-4 text-gray-400 ${isScanning ? 'animate-spin' : ''}`} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/webapps/edit/${app.id}`}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(app)}>
                              <Power className="w-4 h-4 mr-2" />
                              {app.isActive ? 'Pause' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRescan(app)} disabled={isScanning}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Re-scan Website
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => { setAppToDelete(app); setDeleteDialogOpen(true); }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{appToDelete?.name}" and all associated content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
