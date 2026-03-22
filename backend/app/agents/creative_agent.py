"""
Creative Agent for AmarktAI Marketing
Generates scripts, copy, and creative concepts
"""

import json
import random
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass

@dataclass
class VideoScript:
    title: str
    hook: str
    scenes: List[Dict[str, str]]
    cta: str
    duration: int
    platform: str

@dataclass
class Caption:
    text: str
    hashtags: List[str]
    character_count: int
    platform: str

@dataclass
class ImagePrompt:
    prompt: str
    negative_prompt: str
    style: str
    aspect_ratio: str

class CreativeAgent:
    """
    Creative Agent generates compelling scripts, copy, and creative concepts
    that drive engagement and conversions across social platforms.
    """
    
    def __init__(self, llm_client=None):
        self.llm = llm_client
        
    async def generate_content_package(self,
                                     research_data: Dict[str, Any],
                                     webapp_data: Dict[str, Any],
                                     platform: str) -> Dict[str, Any]:
        """
        Generate a complete content package for a platform.
        
        Args:
            research_data: Research results from ResearchAgent
            webapp_data: Web app information
            platform: Target platform
            
        Returns:
            Complete content package with scripts, captions, and media prompts
        """
        print(f"✨ Generating content for {platform}")
        
        # Select best content angle for this platform
        content_angles = research_data.get("content_angles", [])
        angle = self._select_best_angle(content_angles, platform)
        
        package = {
            "platform": platform,
            "webapp_id": webapp_data.get("id"),
            "generated_at": datetime.now().isoformat(),
            "content_angle": angle,
            "content": {}
        }
        
        # Generate platform-specific content
        if platform in ["youtube_shorts", "tiktok", "instagram_reels", "facebook_reels"]:
            package["content"]["video_script"] = await self._generate_video_script(
                angle=angle,
                webapp_data=webapp_data,
                platform=platform
            )
        
        # Generate caption for all platforms
        package["content"]["caption"] = await self._generate_caption(
            angle=angle,
            webapp_data=webapp_data,
            platform=platform
        )
        
        # Generate image prompts for image-based platforms
        if platform in ["instagram", "facebook", "twitter", "linkedin"]:
            package["content"]["image_prompts"] = await self._generate_image_prompts(
                angle=angle,
                webapp_data=webapp_data,
                platform=platform
            )
        
        # Generate CTA variations
        package["content"]["cta"] = await self._generate_cta_variations(
            webapp_data=webapp_data,
            platform=platform
        )
        
        return package
    
    def _select_best_angle(self, angles: List[Dict[str, Any]], platform: str) -> Dict[str, Any]:
        """Select the best content angle for the platform."""
        if not angles:
            return {
                "title": "Discover This Amazing Tool",
                "hook": "You won't believe what this can do...",
                "platforms": [platform],
                "format": "general",
                "key_message": "This tool will help you",
                "cta": "Try it now"
            }
        
        # Filter angles that work for this platform
        suitable_angles = [
            a for a in angles 
            if platform in a.get("platforms", []) or platform.replace("_", "") in [p.replace("_", "") for p in a.get("platforms", [])]
        ]
        
        # If no specific match, use any angle
        if not suitable_angles:
            suitable_angles = angles
        
        # Return random angle for variety
        return random.choice(suitable_angles)
    
    async def _generate_video_script(self,
                                   angle: Dict[str, Any],
                                   webapp_data: Dict[str, Any],
                                   platform: str) -> Dict[str, Any]:
        """Generate a video script optimized for the platform."""
        
        name = webapp_data.get("name", "This Tool")
        hook = angle.get("hook", f"What if I told you {name} could change everything?")
        
        # Platform-specific durations
        durations = {
            "youtube_shorts": 45,
            "tiktok": 25,
            "instagram_reels": 30,
            "facebook_reels": 45
        }
        duration = durations.get(platform, 30)
        
        # Generate scene breakdown
        scenes = []
        
        if platform == "tiktok":
            scenes = [
                {"time": "0-1s", "visual": f"Hook: {hook}", "audio": hook, "text": "WAIT FOR IT 🔥"},
                {"time": "1-10s", "visual": "Show the problem", "audio": f"We've all been there...", "text": "The struggle is real 😩"},
                {"time": "10-20s", "visual": f"Show {name} in action", "audio": f"But then I found {name}...", "text": "Game changer! ✨"},
                {"time": "20-25s", "visual": "Show results", "audio": "Never going back!", "text": "Link in bio 👆"},
            ]
        elif platform == "youtube_shorts":
            scenes = [
                {"time": "0-3s", "visual": f"Attention grabber: {hook}", "audio": hook, "text": "This changes EVERYTHING"},
                {"time": "3-10s", "visual": "Problem statement", "audio": "Here's what most people get wrong...", "text": "The problem:"},
                {"time": "10-35s", "visual": f"{name} solution demo", "audio": f"{name} solves this by...", "text": "The solution 💡"},
                {"time": "35-45s", "visual": "Results + CTA", "audio": "Try it yourself!", "text": "Link below 👇"},
            ]
        else:  # Instagram/Facebook Reels
            scenes = [
                {"time": "0-3s", "visual": f"Eye-catching opener: {hook}", "audio": hook, "text": "Save this! 📌"},
                {"time": "3-15s", "visual": "Value demonstration", "audio": f"{name} helps you...", "text": "Watch this 👀"},
                {"time": "15-25s", "visual": "Social proof/results", "audio": "Just look at these results...", "text": "The results 🤯"},
                {"time": "25-30s", "visual": "Call to action", "audio": "Start your free trial!", "text": "Link in bio ✨"},
            ]
        
        return {
            "title": angle.get("title", f"How {name} Changed Everything"),
            "duration": duration,
            "hook": hook,
            "scenes": scenes,
            "cta": angle.get("cta", f"Try {name} free for 14 days"),
            "platform": platform,
            "key_message": angle.get("key_message", f"{name} makes your life easier"),
            "suggested_audio": self._get_trending_audio(platform)
        }
    
    async def _generate_caption(self,
                              angle: Dict[str, Any],
                              webapp_data: Dict[str, Any],
                              platform: str) -> Dict[str, Any]:
        """Generate platform-optimized caption."""
        
        name = webapp_data.get("name", "This Tool")
        description = webapp_data.get("description", "")
        key_message = angle.get("key_message", f"{name} helps you work smarter")
        
        # Platform-specific caption templates
        captions = {
            "youtube": f"""{angle.get('title', f'How {name} Changed My Workflow')}

{key_message}

In this video, I break down exactly how {name} can help you:
✅ Save 5+ hours per week
✅ Automate repetitive tasks  
✅ Focus on what actually matters

Whether you're a freelancer, team lead, or entrepreneur, this is for you.

🚀 Try {name} free: [link in bio]

#Productivity #{name.replace(' ', '')} #WorkSmarter #AITools #RemoteWork""",

            "tiktok": f"""{angle.get('hook', 'This changed everything for me')} 🔥

{key_message}

Who else needs this? 👇

#{name.replace(' ', '')} #ProductivityHacks #AITools #WorkLife""",

            "instagram": f"""{angle.get('title', f'The tool that changed everything ✨')}

{key_message}

Save this for later! 📌

What's your biggest productivity struggle? Comment below! 👇

🔗 Link in bio to try {name} free

#{name.replace(' ', '')} #ProductivityTips #Entrepreneur #WorkFromHome #Success""",

            "facebook": f"""{angle.get('title', f'Why I Switched to {name}')}

{key_message}

After using {name} for 30 days, here's what changed:

📊 40% more productive
⏰ 5 hours saved per week
🎯 Better focus and clarity

The best part? It's free to try for 14 days.

Who else is ready to level up their productivity?

{name} #Productivity #BusinessGrowth""",

            "twitter": f"""{angle.get('hook', f'What if I told you {name} could save you 5 hours every week?')}

It's not magic—it's automation.

Here's what {name} does:
• Automates repetitive tasks
• Prioritizes what matters
• Tracks your progress

Free trial: [link]

What's your biggest time waster? 🤔""",

            "linkedin": f"""{angle.get('title', f'Why Smart Teams Choose {name}')}

{key_message}

In today's fast-paced environment, efficiency isn't optional—it's essential.

{name} helps teams:
✅ Reduce manual work by 60%
✅ Improve project delivery times
✅ Increase team satisfaction

The ROI speaks for itself:
• 5 hours saved per employee per week
• 40% faster project completion
• 25% reduction in context switching

Is your team ready to work smarter?

#Leadership #Productivity #BusinessStrategy #{name.replace(' ', '')}"""
        }
        
        # Normalize platform name
        platform_key = platform.split("_")[0] if "_" in platform else platform
        caption_text = captions.get(platform_key, captions["instagram"])
        
        # Extract hashtags
        hashtags = self._extract_hashtags_from_caption(caption_text)
        
        return {
            "text": caption_text,
            "hashtags": hashtags,
            "character_count": len(caption_text),
            "platform": platform,
            "tone": self._get_platform_tone(platform)
        }
    
    async def _generate_image_prompts(self,
                                    angle: Dict[str, Any],
                                    webapp_data: Dict[str, Any],
                                    platform: str) -> Dict[str, Any]:
        """Generate AI image generation prompts."""
        
        name = webapp_data.get("name", "Product")
        category = webapp_data.get("category", "SaaS")
        
        # Platform-specific aspect ratios
        aspect_ratios = {
            "instagram": "1:1",
            "facebook": "1.91:1",
            "twitter": "16:9",
            "linkedin": "1.91:1"
        }
        
        aspect_ratio = aspect_ratios.get(platform, "1:1")
        
        prompts = {
            "primary": f"""Modern, professional product showcase for {name}, 
            a {category} tool. Clean minimalist design with gradient background 
            in purple and blue tones. Sleek interface mockup showing dashboard features. 
            High-quality 3D render, soft lighting, corporate aesthetic. 
            No text, no watermarks, professional photography style.""",
            
            "alternative_1": f"""Before and after comparison showing productivity improvement 
            with {name}. Split screen design, left side showing chaos/disorganization, 
            right side showing organized workflow. Modern flat design style, 
            bright colors, clean lines. Professional infographic aesthetic.""",
            
            "alternative_2": f"""Happy professional using {name} on laptop in modern 
            home office setting. Natural lighting, candid moment, genuine smile. 
            Clean background, focus on screen glow and satisfied expression. 
            Lifestyle photography style, warm tones, aspirational mood."""
        }
        
        return {
            "aspect_ratio": aspect_ratio,
            "prompts": prompts,
            "negative_prompt": "text, watermark, logo, blurry, low quality, distorted, ugly, amateur",
            "style": "professional, modern, clean",
            "platform": platform
        }
    
    async def _generate_cta_variations(self,
                                     webapp_data: Dict[str, Any],
                                     platform: str) -> Dict[str, Any]:
        """Generate call-to-action variations."""
        
        name = webapp_data.get("name", "This Tool")
        
        ctas = {
            "primary": f"Try {name} free for 14 days",
            "secondary": "Start your free trial",
            "urgency": "Limited time: Get 50% off your first month",
            "social_proof": f"Join 10,000+ teams using {name}",
            "curiosity": "See what {name} can do for you",
            "direct": f"Get {name} now",
            "benefit_focused": "Save 5 hours every week",
            "question": "Ready to boost your productivity?"
        }
        
        return {
            "variations": ctas,
            "recommended": ctas["primary"],
            "platform": platform
        }
    
    def _get_trending_audio(self, platform: str) -> str:
        """Get trending audio suggestion for platform."""
        trending = {
            "tiktok": ["Upbeat corporate", "Trending viral sound", "Motivational"],
            "instagram": ["Trending Reels audio", "Upbeat instrumental", "Lo-fi chill"],
            "youtube": ["Upbeat background music", "Corporate motivational", "Tech review style"]
        }
        return random.choice(trending.get(platform.split("_")[0], ["Upbeat background music"]))
    
    def _extract_hashtags_from_caption(self, caption: str) -> List[str]:
        """Extract hashtags from caption text."""
        import re
        hashtags = re.findall(r'#(\w+)', caption)
        return hashtags
    
    def _get_platform_tone(self, platform: str) -> str:
        """Get the appropriate tone for a platform."""
        tones = {
            "youtube": "informative and engaging",
            "tiktok": "casual and trendy",
            "instagram": "visual and aspirational",
            "facebook": "community-focused and conversational",
            "twitter": "concise and punchy",
            "linkedin": "professional and insightful"
        }
        return tones.get(platform.split("_")[0], "neutral")
