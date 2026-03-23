# Features — AmarktAI Marketing

All features listed below are implemented and available in the current release unless otherwise noted.

---

## Core AI Features

### AI Content Generation ✅
Generate platform-optimised content for 10+ social networks. Supports long-form, short-form, threads, captions, and hashtag packs. Uses the Qwen → HuggingFace provider chain with optional OpenAI/Gemini enhancement.

### Viral Predictor ✅
Analyses content before publishing and assigns a viral probability score. Factors in trending topics, audience engagement patterns, and historical platform data.

### Performance Predictor ✅
Forecasts expected reach, impressions, and engagement rate for a piece of content before it goes live. Compares predictions against post-publish actuals over time.

### Content Repurposer ✅
Automatically transforms a single piece of content into formats suited for multiple platforms (e.g., LinkedIn article → Twitter thread → Instagram caption → YouTube description).

---

## Publishing & Scheduling

### Smart Scheduler ✅
AI-powered scheduling engine that determines the optimal publish time per platform based on audience activity data. Supports bulk scheduling and calendar drag-and-drop.

### Autonomous Posting ✅
Queue content once and let the system publish autonomously across all connected platforms. Handles rate limits, retries, and failure alerts without manual intervention.

### Content Calendar ✅
Visual monthly/weekly calendar view showing all scheduled, published, and draft content across every connected account. Filter by platform, campaign, or tag.

---

## Optimisation & Testing

### A/B Testing ✅
Create variant versions of any post and run split tests across audiences. Automatically promotes the winning variant based on configurable engagement thresholds.

### Engagement Queue ✅
Prioritised inbox for incoming comments, messages, and mentions. AI suggests reply drafts ranked by urgency and sentiment. Supports bulk actions.

---

## Intelligence & Research

### Competitor Intelligence ✅
Powered by Firecrawl web scraping. Tracks competitor content calendars, posting frequency, engagement rates, and trending topics. Surfaces actionable insights via the dashboard.

### 10 Power Tools ✅
A suite of specialised AI writing tools including:
- Hook generator
- CTA optimiser
- Hashtag researcher
- Bio writer
- Caption rewriter
- Tone adjuster
- Trend spotter
- Keyword extractor
- Audience persona builder
- Content gap analyser

---

## Content Creation

### Blog Generator ✅
Produces full SEO-optimised blog posts from a keyword or topic. Includes headline, meta description, structured headings, and internal link suggestions.

### Lead Management ✅
Capture, score, and nurture leads generated from social content. Tracks lead source, engagement history, and pipeline stage. Integrates with email sequences.

---

## Platform Integrations

### Platform OAuth ✅ Ready
OAuth flows implemented and ready for the following platforms:

| Platform   | Status         |
|------------|----------------|
| YouTube    | ✅ Ready       |
| TikTok     | ✅ Ready       |
| Instagram  | ✅ Ready       |
| LinkedIn   | ✅ Ready       |
| Twitter/X  | ✅ Ready       |
| Facebook   | ✅ Ready       |
| Pinterest  | ✅ Ready       |
| Reddit     | ✅ Ready       |
| Bluesky    | ✅ Ready       |
| Telegram   | ✅ Ready       |
| Snapchat   | ✅ Ready       |

---

## AI Provider Strategy

The platform uses a tiered provider approach to maximise uptime and cost efficiency:

| Priority | Provider       | Role                                  |
|----------|----------------|---------------------------------------|
| 1        | Firecrawl      | Web scraping and competitive research |
| 2        | Qwen (DashScope) | Primary LLM for all generation tasks |
| 3        | HuggingFace    | Fallback LLM when Qwen is unavailable |
| 4        | OpenAI         | Optional enhancement (GPT-4 class)    |
| 5        | Gemini         | Optional enhancement (Gemini class)   |

If a higher-priority provider fails or returns an error, the system automatically falls back to the next available provider. Only Qwen and HuggingFace keys are required for the platform to be fully operational.
