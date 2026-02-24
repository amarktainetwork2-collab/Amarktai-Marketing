/**
 * Amarktai Marketing – Real API client
 *
 * All calls go to the backend via /api/v1 (proxied through Nginx or Vite's
 * dev-server proxy).  No mock data is used here; the pricingPlans and
 * platformInfo static config remain in mockData.ts as they are UI-only.
 */

import type {
  WebApp,
  PlatformConnection,
  Content,
  AnalyticsSummary,
  Platform,
  Lead,
  LeadStats,
} from '@/types';

// ─── Base helpers ────────────────────────────────────────────────────────────

const BASE = '/api/v1';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${detail}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Convert snake_case backend object to camelCase frontend type. */
function toCamel(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      v,
    ])
  );
}

function mapWebApp(raw: Record<string, unknown>): WebApp {
  const c = toCamel(raw);
  return {
    id: c.id as string,
    userId: c.userId as string,
    name: c.name as string,
    url: c.url as string,
    description: c.description as string,
    category: c.category as string,
    targetAudience: c.targetAudience as string,
    keyFeatures: (c.keyFeatures as string[]) ?? [],
    logo: c.logo as string | undefined,
    isActive: c.isActive as boolean,
    createdAt: c.createdAt as string,
    updatedAt: (c.updatedAt as string) ?? c.createdAt as string,
  };
}

function mapPlatform(raw: Record<string, unknown>): PlatformConnection {
  const c = toCamel(raw);
  return {
    id: c.id as string,
    userId: c.userId as string,
    platform: c.platform as Platform,
    accountName: c.accountName as string,
    accountId: c.accountId as string,
    isActive: c.isActive as boolean,
    connectedAt: c.connectedAt as string,
    expiresAt: c.expiresAt as string | undefined,
  };
}

function mapContent(raw: Record<string, unknown>): Content {
  const c = toCamel(raw);
  // Build performance object from flat columns
  const performance =
    c.views != null
      ? {
          views: (c.views as number) ?? 0,
          likes: (c.likes as number) ?? 0,
          comments: (c.comments as number) ?? 0,
          shares: (c.shares as number) ?? 0,
          clicks: (c.clicks as number) ?? 0,
          ctr: (c.ctr as number) ?? 0,
        }
      : undefined;

  return {
    id: c.id as string,
    userId: c.userId as string,
    webappId: c.webappId as string,
    platform: c.platform as Platform,
    type: c.type as Content['type'],
    status: c.status as Content['status'],
    title: c.title as string,
    caption: c.caption as string,
    hashtags: (c.hashtags as string[]) ?? [],
    mediaUrls: (c.mediaUrls as string[]) ?? [],
    scheduledFor: c.scheduledFor as string | undefined,
    postedAt: c.postedAt as string | undefined,
    performance,
    createdAt: c.createdAt as string,
    updatedAt: (c.updatedAt as string) ?? c.createdAt as string,
  };
}

// ─── Web Apps ────────────────────────────────────────────────────────────────

export const webAppApi = {
  getAll: async (): Promise<WebApp[]> => {
    const data = await apiFetch<Record<string, unknown>[]>('/webapps/');
    return data.map(mapWebApp);
  },

  getById: async (id: string): Promise<WebApp | null> => {
    try {
      const data = await apiFetch<Record<string, unknown>>(`/webapps/${id}`);
      return mapWebApp(data);
    } catch {
      return null;
    }
  },

  create: async (
    payload: Omit<WebApp, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<WebApp> => {
    const body = {
      name: payload.name,
      url: payload.url,
      description: payload.description,
      category: payload.category,
      target_audience: payload.targetAudience,
      key_features: payload.keyFeatures,
      logo: payload.logo,
      is_active: payload.isActive,
    };
    const data = await apiFetch<Record<string, unknown>>('/webapps/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return mapWebApp(data);
  },

  update: async (id: string, payload: Partial<WebApp>): Promise<WebApp> => {
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.url !== undefined) body.url = payload.url;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.category !== undefined) body.category = payload.category;
    if (payload.targetAudience !== undefined) body.target_audience = payload.targetAudience;
    if (payload.keyFeatures !== undefined) body.key_features = payload.keyFeatures;
    if (payload.logo !== undefined) body.logo = payload.logo;
    if (payload.isActive !== undefined) body.is_active = payload.isActive;
    const data = await apiFetch<Record<string, unknown>>(`/webapps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return mapWebApp(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiFetch<void>(`/webapps/${id}`, { method: 'DELETE' });
  },
};

// ─── Platform Connections ────────────────────────────────────────────────────

export const platformApi = {
  getAll: async (): Promise<PlatformConnection[]> => {
    const data = await apiFetch<Record<string, unknown>[]>('/platforms/');
    return data.map(mapPlatform);
  },

  getByPlatform: async (platform: Platform): Promise<PlatformConnection | null> => {
    try {
      const data = await apiFetch<Record<string, unknown>>(`/platforms/${platform}`);
      return mapPlatform(data);
    } catch {
      return null;
    }
  },

  connect: async (platform: Platform, accountName: string): Promise<PlatformConnection> => {
    const data = await apiFetch<Record<string, unknown>>(
      `/platforms/${platform}/connect?account_name=${encodeURIComponent(accountName)}`,
      { method: 'POST' }
    );
    return mapPlatform(data);
  },

  disconnect: async (platform: Platform): Promise<void> => {
    await apiFetch<void>(`/platforms/${platform}/disconnect`, { method: 'POST' });
  },
};

// ─── Content ─────────────────────────────────────────────────────────────────

export const contentApi = {
  getAll: async (status?: Content['status']): Promise<Content[]> => {
    const qs = status ? `?status=${status}` : '';
    const data = await apiFetch<Record<string, unknown>[]>(`/content/${qs}`);
    return data.map(mapContent);
  },

  getPending: async (): Promise<Content[]> => {
    const data = await apiFetch<Record<string, unknown>[]>('/content/pending');
    return data.map(mapContent);
  },

  getById: async (id: string): Promise<Content | null> => {
    try {
      const data = await apiFetch<Record<string, unknown>>(`/content/${id}`);
      return mapContent(data);
    } catch {
      return null;
    }
  },

  approve: async (id: string): Promise<Content> => {
    const data = await apiFetch<Record<string, unknown>>(`/content/${id}/approve`, {
      method: 'POST',
    });
    return mapContent(data);
  },

  reject: async (id: string): Promise<Content> => {
    const data = await apiFetch<Record<string, unknown>>(`/content/${id}/reject`, {
      method: 'POST',
    });
    return mapContent(data);
  },

  approveAll: async (ids: string[]): Promise<void> => {
    await apiFetch<void>('/content/approve-all', {
      method: 'POST',
      body: JSON.stringify(ids),
    });
  },

  updateCaption: async (id: string, caption: string): Promise<Content> => {
    const data = await apiFetch<Record<string, unknown>>(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ caption }),
    });
    return mapContent(data);
  },

  generate: async (webappId: string, platform: Platform): Promise<Content> => {
    const data = await apiFetch<Record<string, unknown>>(
      `/content/generate?webapp_id=${webappId}&platform=${platform}`,
      { method: 'POST' }
    );
    return mapContent(data);
  },
};

// ─── Analytics ───────────────────────────────────────────────────────────────

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    return apiFetch<AnalyticsSummary>('/analytics/summary');
  },

  getPlatformStats: async (
    platform: Platform
  ): Promise<AnalyticsSummary['platformBreakdown'][Platform]> => {
    return apiFetch(`/analytics/platform/${platform}`);
  },
};

// ─── Leads ───────────────────────────────────────────────────────────────────

function mapLead(raw: Record<string, unknown>): Lead {
  const c = toCamel(raw);
  return {
    id: c.id as string,
    name: c.name as string | undefined,
    email: c.email as string,
    phone: c.phone as string | undefined,
    company: c.company as string | undefined,
    sourcePlatform: c.sourcePlatform as Platform | undefined,
    utmSource: c.utmSource as string | undefined,
    utmMedium: c.utmMedium as string | undefined,
    utmCampaign: c.utmCampaign as string | undefined,
    qualifiers: c.qualifiers as Record<string, string> | undefined,
    leadScore: (c.leadScore as number) ?? 0,
    isQualified: (c.isQualified as boolean) ?? false,
    status: (c.status as Lead['status']) ?? 'new',
    notes: c.notes as string | undefined,
    createdAt: c.createdAt as string,
  };
}

export const leadsApi = {
  getAll: async (params?: { status?: string; platform?: string; isQualified?: boolean }): Promise<Lead[]> => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.platform) qs.set('platform', params.platform);
    if (params?.isQualified !== undefined) qs.set('is_qualified', String(params.isQualified));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const data = await apiFetch<Record<string, unknown>[]>(`/leads/${query}`);
    return data.map(mapLead);
  },

  getStats: async (): Promise<LeadStats> => {
    const data = await apiFetch<Record<string, unknown>>('/leads/stats');
    const c = toCamel(data);
    return {
      total: c.total as number,
      qualified: c.qualified as number,
      converted: c.converted as number,
      qualificationRate: c.qualificationRate as number,
      conversionRate: c.conversionRate as number,
      byPlatform: c.byPlatform as Record<string, number>,
    };
  },

  update: async (id: string, update: Partial<Lead>): Promise<Lead> => {
    const data = await apiFetch<Record<string, unknown>>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: update.status,
        notes: update.notes,
        is_qualified: update.isQualified,
        lead_score: update.leadScore,
      }),
    });
    return mapLead(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiFetch<void>(`/leads/${id}`, { method: 'DELETE' });
  },

  generateUtmLink: async (params: {
    base_url: string;
    campaign: string;
    platform: string;
    content_id?: string;
  }): Promise<{ utm_url: string; params: Record<string, string> }> => {
    return apiFetch('/leads/utm/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  exportCsv: (): void => {
    window.location.href = `${BASE}/leads/export/csv`;
  },
};

// ─── Integrations (platform OAuth) ───────────────────────────────────────────

export const integrationsApi = {
  getApiKeys: async (): Promise<{ id: string; key_name: string; is_active: boolean; created_at: string }[]> => {
    return apiFetch('/integrations/api-keys');
  },

  saveApiKey: async (key_name: string, key_value: string): Promise<void> => {
    await apiFetch('/integrations/api-keys', {
      method: 'POST',
      body: JSON.stringify({ key_name, key_value }),
    });
  },

  deleteApiKey: async (id: string): Promise<void> => {
    await apiFetch(`/integrations/api-keys/${id}`, { method: 'DELETE' });
  },

  getPlatforms: async () => {
    return apiFetch<Record<string, unknown>[]>('/integrations/platforms');
  },

  getConnectUrl: async (platform: Platform): Promise<{ auth_url: string }> => {
    return apiFetch(`/integrations/platforms/${platform}/connect`);
  },

  disconnectPlatform: async (platform: Platform): Promise<void> => {
    await apiFetch(`/integrations/platforms/${platform}/disconnect`, { method: 'POST' });
  },

  updatePlatformSettings: async (
    platform: Platform,
    settings: { auto_post_enabled?: boolean; auto_reply_enabled?: boolean }
  ): Promise<void> => {
    await apiFetch(`/integrations/platforms/${platform}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },
};

// ─── Blog Posts ────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  webappId?: string;
  title: string;
  slug?: string;
  metaDescription?: string;
  sections: { heading: string; content: string }[];
  targetKeywords: string[];
  ctaText?: string;
  ctaUrl?: string;
  readingTimeMins?: string;
  customTopic?: string;
  status: string;
  isPublished: boolean;
  publishedUrl?: string;
  createdAt: string;
}

function mapBlogPost(raw: Record<string, unknown>): BlogPost {
  const c = toCamel(raw);
  return {
    id: c.id as string,
    webappId: c.webappId as string | undefined,
    title: c.title as string,
    slug: c.slug as string | undefined,
    metaDescription: c.metaDescription as string | undefined,
    sections: (c.sections as { heading: string; content: string }[]) ?? [],
    targetKeywords: (c.targetKeywords as string[]) ?? [],
    ctaText: c.ctaText as string | undefined,
    ctaUrl: c.ctaUrl as string | undefined,
    readingTimeMins: c.readingTimeMins as string | undefined,
    customTopic: c.customTopic as string | undefined,
    status: (c.status as string) ?? 'draft',
    isPublished: (c.isPublished as boolean) ?? false,
    publishedUrl: c.publishedUrl as string | undefined,
    createdAt: c.createdAt as string,
  };
}

export const blogApi = {
  generate: async (params: {
    webapp_id: string;
    custom_topic?: string;
    custom_keywords?: string[];
  }): Promise<BlogPost> => {
    const data = await apiFetch<Record<string, unknown>>('/blog/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return mapBlogPost(data);
  },

  getAll: async (): Promise<BlogPost[]> => {
    const data = await apiFetch<Record<string, unknown>[]>('/blog/');
    return data.map(mapBlogPost);
  },

  getById: async (id: string): Promise<BlogPost | null> => {
    try {
      const data = await apiFetch<Record<string, unknown>>(`/blog/${id}`);
      return mapBlogPost(data);
    } catch {
      return null;
    }
  },

  update: async (id: string, update: Partial<BlogPost>): Promise<BlogPost> => {
    const data = await apiFetch<Record<string, unknown>>(`/blog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: update.title,
        meta_description: update.metaDescription,
        status: update.status,
        is_published: update.isPublished,
        published_url: update.publishedUrl,
      }),
    });
    return mapBlogPost(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiFetch<void>(`/blog/${id}`, { method: 'DELETE' });
  },

  remixToSocial: async (id: string): Promise<{ message: string; platforms: string[] }> => {
    return apiFetch(`/blog/${id}/remix-to-social`, { method: 'POST' });
  },
};

// ─── Content batch generate-all ───────────────────────────────────────────────

export const contentBatchApi = {
  generateAll: async (): Promise<{ message: string; count: number; platforms: string[] }> => {
    return apiFetch('/content/generate-all', { method: 'POST' });
  },
};
