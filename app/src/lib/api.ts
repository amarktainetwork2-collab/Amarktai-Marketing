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
