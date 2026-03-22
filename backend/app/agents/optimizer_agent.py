"""
Optimizer Agent for AmarktAI Marketing
Optimizes content for virality, adds hashtags, emojis, and platform-specific formatting
"""

import json
import random
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass
import re

@dataclass
class ViralScoreResult:
    overall: int  # 0-100
    hook_strength: int
    emotional_impact: int
    shareability: int
    timing_score: int
    uniqueness: int
    trend_alignment: int
    viral_probability: int  # 0-100
    estimated_reach: int
    positive_factors: List[str]
    negative_factors: List[str]
    recommendations: List[str]

class OptimizerAgent:
    """
    Optimizer Agent enhances content for maximum engagement and viral potential.
    Adds hashtags, emojis, formats for platforms, and predicts viral score.
    """
    
    def __init__(self, llm_client=None, trend_data: Dict = None):
        self.llm = llm_client
        self.trend_data = trend_data or {}
        
        # Viral hooks database
        self.viral_hooks = {
            "youtube": [
                "Wait until you see this...",
                "This changes EVERYTHING",
                "I can't believe this actually works",
                "Stop doing this wrong",
                "The secret nobody talks about",
            ],
            "tiktok": [
                "POV: You finally found the answer",
                "This is your sign to...",
                "Tell me you {topic} without telling me you {topic}",
                "The way I just...",
                "Nobody asked but...",
            ],
            "instagram": [
                "Save this for later!",
                "Which one are you?",
                "Tag someone who needs this",
                "This is your reminder to...",
                "The secret to...",
            ],
            "twitter": [
                "Hot take:",
                "Unpopular opinion:",
                "What if I told you...",
                "The real reason...",
                "Stop believing this myth:",
            ],
            "linkedin": [
                "I made a $X mistake so you don't have to",
                "After X years in {industry}, here's what I learned",
                "The biggest misconception about...",
                "Why most people fail at...",
                "The framework that changed everything",
            ]
        }
        
        # Emoji sets by platform and tone
        self.emoji_sets = {
            "professional": ["💼", "📊", "🎯", "💡", "📈", "✅", "🔍", "📋"],
            "casual": ["🔥", "💯", "😎", "👏", "🙌", "✨", "💪", "🚀"],
            "friendly": ["😊", "👋", "🎉", "💫", "🌟", "❤️", "🤝", "🎊"],
            "urgent": ["⚡", "🔥", "⏰", "🚨", "💥", "⚠️", "🏃", "💨"],
        }
        
        # Trending hashtags by category
        self.trending_hashtags = {
            "SaaS": ["#SaaS", "#Productivity", "#Startup", "#TechTools", "#WorkSmarter", "#AITools", "#RemoteWork"],
            "Developer": ["#DevTools", "#Programming", "#Coding", "#SoftwareEngineering", "#OpenSource", "#WebDev"],
            "Productivity": ["#Productivity", "#TimeManagement", "#Efficiency", "#WorkLifeBalance", "#Focus", "#Success"],
            "AI": ["#AI", "#MachineLearning", "#ArtificialIntelligence", "#ChatGPT", "#Automation", "#FutureOfWork"],
            "Marketing": ["#Marketing", "#DigitalMarketing", "#ContentMarketing", "#GrowthHacking", "#SocialMedia"],
        }
    
    async def optimize_content(self,
                             content_package: Dict[str, Any],
                             platform: str,
                             webapp_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize content for maximum engagement on a specific platform.
        
        Args:
            content_package: Content from CreativeAgent
            platform: Target platform
            webapp_data: Web app information
            
        Returns:
            Optimized content package with viral score
        """
        print(f"🎯 Optimizing content for {platform}")
        
        optimized = {
            "platform": platform,
            "webapp_id": webapp_data.get("id"),
            "optimized_at": datetime.now().isoformat(),
            "original_content": content_package,
            "optimizations": {}
        }
        
        # Optimize caption
        if "caption" in content_package.get("content", {}):
            optimized["optimizations"]["caption"] = await self._optimize_caption(
                content_package["content"]["caption"],
                platform,
                webapp_data
            )
        
        # Optimize hashtags
        optimized["optimizations"]["hashtags"] = await self._optimize_hashtags(
            webapp_data,
            platform
        )
        
        # Add emojis
        if "caption" in content_package.get("content", {}):
            optimized["optimizations"]["emoji_enhanced"] = self._add_emojis(
                content_package["content"]["caption"]["text"],
                platform
            )
        
        # Calculate viral score
        optimized["viral_score"] = await self._calculate_viral_score(
            content_package,
            platform,
            webapp_data
        )
        
        # Generate platform-specific formatting
        optimized["optimizations"]["formatting"] = self._get_platform_formatting(platform)
        
        # Add trending hooks
        optimized["optimizations"]["hook_variations"] = self._generate_hook_variations(
            platform,
            webapp_data
        )
        
        return optimized
    
    async def _optimize_caption(self,
                               caption_data: Dict[str, Any],
                               platform: str,
                               webapp_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize caption for platform."""
        original_text = caption_data.get("text", "")
        
        # Platform-specific optimizations
        optimizations = {
            "original_length": len(original_text),
            "platform": platform
        }
        
        if platform == "twitter":
            # Twitter has 280 char limit
            if len(original_text) > 280:
                optimized_text = original_text[:277] + "..."
                optimizations["truncated"] = True
            else:
                optimized_text = original_text
                optimizations["truncated"] = False
            optimizations["character_limit"] = 280
            
        elif platform == "linkedin":
            # LinkedIn performs best with 100-150 words
            word_count = len(original_text.split())
            optimizations["word_count"] = word_count
            optimizations["optimal_range"] = "100-150 words"
            optimized_text = original_text
            
        else:
            optimized_text = original_text
        
        # Add line breaks for readability
        optimized_text = self._format_for_readability(optimized_text, platform)
        
        optimizations["optimized_text"] = optimized_text
        optimizations["final_length"] = len(optimized_text)
        
        return optimizations
    
    async def _optimize_hashtags(self,
                                webapp_data: Dict[str, Any],
                                platform: str) -> Dict[str, Any]:
        """Generate optimal hashtags for platform."""
        category = webapp_data.get("category", "SaaS")
        name = webapp_data.get("name", "Product").replace(" ", "")
        
        # Platform-specific hashtag counts
        hashtag_limits = {
            "instagram": {"min": 5, "max": 10, "optimal": 8},
            "tiktok": {"min": 3, "max": 5, "optimal": 4},
            "twitter": {"min": 1, "max": 2, "optimal": 1},
            "linkedin": {"min": 3, "max": 5, "optimal": 4},
            "facebook": {"min": 2, "max": 5, "optimal": 3},
            "youtube": {"min": 3, "max": 5, "optimal": 4},
        }
        
        limits = hashtag_limits.get(platform.split("_")[0], {"min": 3, "max": 5, "optimal": 4})
        
        # Get category hashtags
        category_hashtags = self.trending_hashtags.get(category, self.trending_hashtags["SaaS"])
        
        # Add product-specific hashtag
        product_hashtag = f"#{name}"
        
        # Add trending hashtags from research
        trending = self.trend_data.get("trending_hashtags", [])
        
        # Combine and select optimal number
        all_hashtags = [product_hashtag] + category_hashtags + trending
        selected = all_hashtags[:limits["optimal"]]
        
        return {
            "hashtags": selected,
            "count": len(selected),
            "optimal_count": limits["optimal"],
            "platform": platform,
            "strategy": f"Mix of branded ({product_hashtag}), category-specific, and trending hashtags"
        }
    
    def _add_emojis(self, text: str, platform: str, tone: str = "casual") -> str:
        """Add strategic emojis to text."""
        emoji_set = self.emoji_sets.get(tone, self.emoji_sets["casual"])
        
        # Platform-specific emoji strategy
        if platform == "linkedin":
            # Professional, minimal emojis
            emojis_to_add = ["💼", "📊", "💡", "✅"]
            max_emojis = 3
        elif platform == "twitter":
            # Punchy, one or two
            emojis_to_add = ["🔥", "💯", "⚡", "🎯"]
            max_emojis = 2
        else:
            emojis_to_add = emoji_set
            max_emojis = 5
        
        # Add emojis at strategic points
        lines = text.split('\n')
        enhanced_lines = []
        emoji_count = 0
        
        for i, line in enumerate(lines):
            if emoji_count >= max_emojis:
                enhanced_lines.append(line)
                continue
                
            # Add emoji to key points
            if i == 0 and len(line) > 10:  # First line (hook)
                line = random.choice(emojis_to_add) + " " + line
                emoji_count += 1
            elif "?" in line and emoji_count < max_emojis:  # Questions
                line = line + " " + random.choice(["🤔", "💭", "❓"])
                emoji_count += 1
            elif any(word in line.lower() for word in ["free", "try", "start"]) and emoji_count < max_emojis:
                line = line + " " + random.choice(["🚀", "✨", "👆"])
                emoji_count += 1
            
            enhanced_lines.append(line)
        
        return '\n'.join(enhanced_lines)
    
    async def _calculate_viral_score(self,
                                    content_package: Dict[str, Any],
                                    platform: str,
                                    webapp_data: Dict[str, Any]) -> ViralScoreResult:
        """Calculate viral potential score (0-100)."""
        
        content = content_package.get("content", {})
        caption = content.get("caption", {})
        video_script = content.get("video_script", {})
        
        # Score components
        hook_strength = self._score_hook(video_script.get("hook", ""), platform)
        emotional_impact = self._score_emotional_impact(caption.get("text", ""))
        shareability = self._score_shareability(content_package, platform)
        timing_score = self._score_timing(platform)
        uniqueness = self._score_uniqueness(content_package, webapp_data)
        trend_alignment = self._score_trend_alignment(webapp_data)
        
        # Calculate overall score
        overall = int((
            hook_strength * 0.25 +
            emotional_impact * 0.20 +
            shareability * 0.20 +
            timing_score * 0.10 +
            uniqueness * 0.15 +
            trend_alignment * 0.10
        ))
        
        # Calculate viral probability
        viral_probability = min(100, int(overall * 0.85))
        
        # Estimate reach
        estimated_reach = self._estimate_reach(overall, platform)
        
        # Generate factors and recommendations
        positive_factors, negative_factors, recommendations = self._generate_feedback(
            hook_strength, emotional_impact, shareability, timing_score, uniqueness, trend_alignment
        )
        
        return ViralScoreResult(
            overall=overall,
            hook_strength=hook_strength,
            emotional_impact=emotional_impact,
            shareability=shareability,
            timing_score=timing_score,
            uniqueness=uniqueness,
            trend_alignment=trend_alignment,
            viral_probability=viral_probability,
            estimated_reach=estimated_reach,
            positive_factors=positive_factors,
            negative_factors=negative_factors,
            recommendations=recommendations
        )
    
    def _score_hook(self, hook: str, platform: str) -> int:
        """Score the hook strength (0-100)."""
        score = 50  # Base score
        
        # Check for viral patterns
        viral_patterns = [
            r"wait (until|for)",
            r"this changes everything",
            r"can't believe",
            r"stop doing",
            r"secret",
            r"nobody",
            r"pov:",
            r"hot take",
            r"unpopular opinion",
        ]
        
        hook_lower = hook.lower()
        for pattern in viral_patterns:
            if re.search(pattern, hook_lower):
                score += 10
        
        # Length check
        if len(hook) < 10:
            score -= 10  # Too short
        elif len(hook) > 100:
            score -= 5  # Too long
        else:
            score += 5  # Good length
        
        # Platform-specific
        if platform == "tiktok" and any(word in hook_lower for word in ["pov", "tell me", "the way"]):
            score += 10
        
        return min(100, max(0, score))
    
    def _score_emotional_impact(self, text: str) -> int:
        """Score emotional impact (0-100)."""
        score = 50
        text_lower = text.lower()
        
        # Emotional triggers
        positive_triggers = ["amazing", "incredible", "love", "perfect", "game changer", "transform"]
        negative_triggers = ["struggle", "problem", "frustrated", "waste", "difficult"]
        urgency_triggers = ["now", "today", "limited", "urgent", "don't miss"]
        
        for trigger in positive_triggers:
            if trigger in text_lower:
                score += 5
        
        for trigger in negative_triggers:
            if trigger in text_lower:
                score += 3  # Negative emotions also drive engagement
        
        for trigger in urgency_triggers:
            if trigger in text_lower:
                score += 4
        
        return min(100, score)
    
    def _score_shareability(self, content_package: Dict, platform: str) -> int:
        """Score shareability (0-100)."""
        score = 50
        
        # Check for shareable elements
        content = content_package.get("content", {})
        
        # Has CTA
        if "cta" in content:
            score += 10
        
        # Has clear value proposition
        if "caption" in content and len(content["caption"].get("text", "")) > 50:
            score += 5
        
        # Visual content scores higher
        if "image_prompts" in content or "video_script" in content:
            score += 15
        
        # Platform-specific
        if platform in ["tiktok", "instagram"] and "video_script" in content:
            score += 10
        
        return min(100, score)
    
    def _score_timing(self, platform: str) -> int:
        """Score timing factor (0-100)."""
        # Based on current time vs optimal posting times
        from datetime import datetime
        
        now = datetime.now()
        hour = now.hour
        
        optimal_hours = {
            "youtube": [12, 15, 18],
            "tiktok": [7, 12, 19],
            "instagram": [11, 14, 19],
            "facebook": [9, 13, 15],
            "twitter": [8, 12, 17],
            "linkedin": [8, 12, 17],
        }
        
        platform_key = platform.split("_")[0]
        optimal = optimal_hours.get(platform_key, [12])
        
        if hour in optimal:
            return 90
        elif any(abs(hour - h) <= 1 for h in optimal):
            return 75
        else:
            return 60
    
    def _score_uniqueness(self, content_package: Dict, webapp_data: Dict) -> int:
        """Score uniqueness (0-100)."""
        score = 60  # Base assumption of moderate uniqueness
        
        content = content_package.get("content", {})
        
        # Check for unique angles
        angle = content_package.get("content_angle", {})
        if angle:
            unique_formats = ["pov", "transformation", "day_in_life", "comparison"]
            if angle.get("format") in unique_formats:
                score += 15
        
        # Product-specific content
        if webapp_data.get("name") in str(content):
            score += 10
        
        return min(100, score)
    
    def _score_trend_alignment(self, webapp_data: Dict) -> int:
        """Score alignment with current trends (0-100)."""
        score = 50
        
        category = webapp_data.get("category", "SaaS")
        
        # Check if category is trending
        trending_categories = self.trend_data.get("trending_categories", [])
        if category in trending_categories:
            score += 25
        
        # Check for AI/tech trends
        if category in ["SaaS", "Developer Tools", "AI"]:
            score += 15
        
        return min(100, score)
    
    def _estimate_reach(self, viral_score: int, platform: str) -> int:
        """Estimate potential reach based on viral score."""
        base_reach = {
            "youtube": 10000,
            "tiktok": 50000,
            "instagram": 15000,
            "facebook": 8000,
            "twitter": 5000,
            "linkedin": 3000,
        }
        
        platform_key = platform.split("_")[0]
        base = base_reach.get(platform_key, 10000)
        
        # Scale by viral score
        multiplier = viral_score / 50  # 50 = 1x, 100 = 2x
        return int(base * multiplier)
    
    def _generate_feedback(self, hook: int, emotional: int, shareable: int, 
                          timing: int, unique: int, trend: int) -> tuple:
        """Generate positive factors, negative factors, and recommendations."""
        positive = []
        negative = []
        recommendations = []
        
        if hook >= 70:
            positive.append("Strong hook that grabs attention immediately")
        else:
            negative.append("Hook could be more compelling")
            recommendations.append("Start with a question, bold statement, or curiosity gap")
        
        if emotional >= 70:
            positive.append("Good emotional resonance with audience")
        else:
            recommendations.append("Add more emotional language and relatable scenarios")
        
        if shareable >= 70:
            positive.append("High shareability factor")
        else:
            recommendations.append("Include a clear call-to-action and value proposition")
        
        if timing >= 80:
            positive.append("Optimal posting time")
        else:
            recommendations.append("Consider posting during peak engagement hours")
        
        if unique >= 70:
            positive.append("Unique angle that stands out")
        else:
            recommendations.append("Try a different content format or angle")
        
        if trend >= 70:
            positive.append("Well-aligned with current trends")
        else:
            recommendations.append("Incorporate trending topics or hashtags")
        
        return positive, negative, recommendations
    
    def _format_for_readability(self, text: str, platform: str) -> str:
        """Format text for better readability."""
        # Add line breaks after sentences for readability
        text = re.sub(r'([.!?])\s+', r'\1\n', text)
        
        # Ensure lists are properly formatted
        lines = text.split('\n')
        formatted_lines = []
        
        for line in lines:
            line = line.strip()
            if line:
                formatted_lines.append(line)
        
        return '\n'.join(formatted_lines)
    
    def _get_platform_formatting(self, platform: str) -> Dict[str, Any]:
        """Get platform-specific formatting guidelines."""
        formatting = {
            "youtube": {
                "chapters": True,
                "timestamps": True,
                "description_sections": ["About", "Resources", "Connect"],
                "pin_comment": True
            },
            "tiktok": {
                "caption_position": "bottom",
                "text_overlay": True,
                "hashtag_placement": "caption",
                "sound_credit": True
            },
            "instagram": {
                "alt_text": True,
                "location_tag": True,
                "collaboration": True,
                "carousel_order": "hook_first"
            },
            "twitter": {
                "thread_format": True,
                "tweet_numbering": True,
                "media_first": True
            },
            "linkedin": {
                "professional_tone": True,
                "industry_tags": True,
                "comment_engagement": True
            },
            "facebook": {
                "community_focus": True,
                "share_prompt": True,
                "tag_friends": True
            }
        }
        
        return formatting.get(platform.split("_")[0], {})
    
    def _generate_hook_variations(self, platform: str, webapp_data: Dict) -> List[str]:
        """Generate alternative hook variations."""
        name = webapp_data.get("name", "This tool")
        category = webapp_data.get("category", "SaaS")
        
        platform_hooks = self.viral_hooks.get(platform.split("_")[0], self.viral_hooks["youtube"])
        
        variations = []
        for hook in platform_hooks[:3]:
            # Personalize hook
            personalized = hook.replace("{topic}", category.lower())
            variations.append(personalized)
        
        return variations
