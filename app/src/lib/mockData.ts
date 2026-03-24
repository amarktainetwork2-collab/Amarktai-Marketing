// UI-ONLY static configuration — no live data here.
// pricingPlans and platformInfo are used for UI rendering only.
// All live user data (webapps, platform connections, content, analytics) is
// fetched from the real backend API via api.ts. Do NOT import mock demo
// objects (formerly mockUser, mockWebApps, mockPlatformConnections,
// mockContent, mockAnalytics) in any dashboard page or live component.
import type { PricingPlan, Platform } from '@/types';

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '1 Web App',
      '3 Social Platforms',
      '3 posts per day',
      'Basic AI content generation',
      'Standard analytics',
      'Community support',
    ],
    limits: {
      webapps: 1,
      platforms: 3,
      postsPerDay: 3,
      imagesPerMonth: 30,
      videosPerMonth: 5,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    description: 'Best for growing businesses',
    features: [
      '5 Web Apps',
      'All 6 Platforms',
      '12 posts per day',
      'Advanced AI Engine',
      'A/B testing & optimization',
      'Priority email support',
      'Hashtag research',
    ],
    limits: {
      webapps: 5,
      platforms: 6,
      postsPerDay: 12,
      imagesPerMonth: 150,
      videosPerMonth: 30,
    },
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    description: 'For teams and agencies',
    features: [
      'Unlimited Web Apps',
      'All 6 Platforms',
      '36 posts per day',
      'Premium AI with GPT-4o',
      'Team collaboration (5 seats)',
      'Dedicated support',
      'Custom workflows',
      'White-label options',
    ],
    limits: {
      webapps: -1,
      platforms: 6,
      postsPerDay: 36,
      imagesPerMonth: 500,
      videosPerMonth: 100,
    },
  },
];

export const platformInfo: Record<Platform, { name: string; icon: string; color: string; description: string }> = {
  youtube: {
    name: 'YouTube Shorts',
    icon: 'Youtube',
    color: '#FF0000',
    description: 'Short-form video content for maximum reach',
  },
  tiktok: {
    name: 'TikTok',
    icon: 'Music',
    color: '#000000',
    description: 'Viral short videos for Gen Z and millennials',
  },
  instagram: {
    name: 'Instagram',
    icon: 'Instagram',
    color: '#E4405F',
    description: 'Reels and posts for visual storytelling',
  },
  facebook: {
    name: 'Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    description: 'Reels and posts for broad demographic reach',
  },
  twitter: {
    name: 'X (Twitter)',
    icon: 'Twitter',
    color: '#000000',
    description: 'Short posts and threads for tech audiences',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'Linkedin',
    color: '#0A66C2',
    description: 'Professional content for B2B marketing',
  },
  pinterest: {
    name: 'Pinterest',
    icon: 'Pin',
    color: '#E60023',
    description: 'Visual discovery engine for inspiration and shopping',
  },
  reddit: {
    name: 'Reddit',
    icon: 'MessageCircle',
    color: '#FF4500',
    description: 'Community-driven discussions and niche audiences',
  },
  bluesky: {
    name: 'Bluesky',
    icon: 'CloudSun',
    color: '#0085FF',
    description: 'Decentralised social network growing rapidly',
  },
  threads: {
    name: 'Threads',
    icon: 'AtSign',
    color: '#000000',
    description: 'Meta\'s text-based conversation platform',
  },
  telegram: {
    name: 'Telegram',
    icon: 'Send',
    color: '#26A5E4',
    description: 'Broadcast to engaged channel subscribers',
  },
  snapchat: {
    name: 'Snapchat',
    icon: 'Ghost',
    color: '#FFFC00',
    description: 'Ephemeral content for younger audiences',
  },
};
