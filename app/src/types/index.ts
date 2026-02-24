// Types for Amarktai Marketing Platform

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  createdAt: string;
}

export interface WebApp {
  id: string;
  userId: string;
  name: string;
  url: string;
  description: string;
  category: string;
  targetAudience: string;
  keyFeatures: string[];
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Platform =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'pinterest'
  | 'reddit'
  | 'bluesky'
  | 'threads'
  | 'telegram'
  | 'snapchat';

export interface PlatformConnection {
  id: string;
  userId: string;
  platform: Platform;
  accountName: string;
  accountId: string;
  isActive: boolean;
  connectedAt: string;
  expiresAt?: string;
}

export type ContentStatus = 'pending' | 'approved' | 'rejected' | 'posted' | 'failed';
export type ContentType = 'video' | 'image' | 'carousel' | 'text';

export interface Content {
  id: string;
  userId: string;
  webappId: string;
  platform: Platform;
  type: ContentType;
  status: ContentStatus;
  title: string;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  scheduledFor?: string;
  postedAt?: string;
  performance?: ContentPerformance;
  createdAt: string;
  updatedAt: string;
}

export interface ContentPerformance {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  ctr: number;
}

export interface AnalyticsSummary {
  totalPosts: number;
  totalViews: number;
  totalEngagement: number;
  avgCtr: number;
  platformBreakdown: Record<Platform, PlatformStats>;
  dailyStats: DailyStat[];
}

export interface PlatformStats {
  posts: number;
  views: number;
  engagement: number;
  ctr: number;
}

export interface DailyStat {
  date: string;
  posts: number;
  views: number;
  engagement: number;
}

export interface Lead {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  sourcePlatform?: Platform;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  qualifiers?: Record<string, string>;
  leadScore: number;
  isQualified: boolean;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  createdAt: string;
}

export interface LeadStats {
  total: number;
  qualified: number;
  converted: number;
  qualificationRate: number;
  conversionRate: number;
  byPlatform: Record<string, number>;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  limits: {
    webapps: number;
    platforms: number;
    postsPerDay: number;
    imagesPerMonth: number;
    videosPerMonth: number;
  };
  highlighted?: boolean;
}
