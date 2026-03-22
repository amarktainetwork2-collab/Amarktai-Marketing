"""
Community Management Agent for AmarktAI Marketing
Handles comments, DMs, and engagement replies
"""

import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass
import asyncio

@dataclass
class EngagementAnalysis:
    sentiment: str  # positive, negative, neutral
    sentiment_score: float  # -1.0 to 1.0
    intent: str  # question, complaint, praise, spam, general
    urgency: str  # high, medium, low
    auto_reply_safe: bool
    risk_factors: List[str]
    suggested_tone: str

@dataclass
class GeneratedReply:
    text: str
    confidence: float
    tone: str
    estimated_engagement_boost: float
    alternative_replies: List[str]

class CommunityAgent:
    """
    Community Agent manages social media engagement by:
    - Analyzing incoming comments/DMs
    - Generating appropriate replies
    - Determining auto-reply safety
    - Tracking engagement metrics
    """
    
    def __init__(self, llm_client=None, webapp_data: Dict[str, Any] = None):
        self.llm = llm_client
        self.webapp_data = webapp_data or {}
        
        # Sentiment keywords
        self.sentiment_keywords = {
            "positive": [
                "love", "amazing", "awesome", "great", "fantastic", "excellent", "perfect",
                "thank", "thanks", "appreciate", "helpful", "useful", "brilliant", "cool",
                "nice", "good", "best", "wow", "incredible", "beautiful", "clean", "smooth"
            ],
            "negative": [
                "hate", "terrible", "awful", "bad", "worst", "suck", "broken", "bug",
                "error", "fail", "disappointing", "frustrating", "annoying", "useless",
                "waste", "problem", "issue", "crash", "slow", "confusing", "difficult"
            ],
            "urgent": [
                "urgent", "asap", "immediately", "emergency", "critical", "help", "support",
                "not working", "broken", "can't", "unable", "error", "bug", "issue"
            ]
        }
        
        # Reply templates by intent
        self.reply_templates = {
            "thank_you": [
                "Thank you so much! 🙏 We're thrilled you're enjoying {name}.",
                "So glad to hear that! Thanks for the love! 💙",
                "Appreciate the kind words! This is why we do what we do. ✨",
                "You made our day! Thank you for being part of the {name} community! 🎉"
            ],
            "question": [
                "Great question! {answer} Let us know if you need anything else! 💡",
                "Thanks for asking! {answer} Happy to help! 👍",
                "We'd love to help! {answer} Feel free to DM us for more details. 📩"
            ],
            "feature_request": [
                "Thanks for the suggestion! We've added it to our roadmap. Stay tuned! 🚀",
                "Love this idea! We're always looking for ways to improve. Thanks for sharing! 💡",
                "Great feedback! This helps us build a better {name}. We'll look into it! 🔍"
            ],
            "complaint": [
                "We're sorry to hear about your experience. Please DM us so we can make this right. 🙏",
                "We apologize for the inconvenience. Our team is looking into this. Please check your DMs. 📩",
                "Thanks for bringing this to our attention. We want to fix this - please reach out via DM. 💙"
            ],
            "comparison": [
                "Great question! {name} focuses on {differentiator}. Happy to share more details! 💡",
                "We believe in {value_prop}. Would love to show you how we compare! 🚀"
            ]
        }
    
    async def analyze_engagement(self, 
                                text: str,
                                platform: str,
                                engagement_type: str = "comment") -> EngagementAnalysis:
        """
        Analyze an incoming engagement (comment/DM) to determine sentiment, intent, and safety.
        
        Args:
            text: The comment/DM text
            platform: Source platform
            engagement_type: 'comment', 'dm', 'mention', or 'review'
            
        Returns:
            EngagementAnalysis with sentiment, intent, and safety assessment
        """
        text_lower = text.lower()
        
        # Analyze sentiment
        positive_count = sum(1 for word in self.sentiment_keywords["positive"] if word in text_lower)
        negative_count = sum(1 for word in self.sentiment_keywords["negative"] if word in text_lower)
        urgency_count = sum(1 for word in self.sentiment_keywords["urgent"] if word in text_lower)
        
        # Calculate sentiment score (-1.0 to 1.0)
        total_sentiment_words = positive_count + negative_count
        if total_sentiment_words > 0:
            sentiment_score = (positive_count - negative_count) / total_sentiment_words
        else:
            sentiment_score = 0.0
        
        # Determine sentiment category
        if sentiment_score > 0.3:
            sentiment = "positive"
        elif sentiment_score < -0.3:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        # Determine intent
        intent = self._determine_intent(text_lower)
        
        # Determine urgency
        if urgency_count >= 2 or sentiment == "negative":
            urgency = "high"
        elif urgency_count == 1 or "?" in text:
            urgency = "medium"
        else:
            urgency = "low"
        
        # Determine auto-reply safety
        auto_reply_safe, risk_factors = self._assess_auto_reply_safety(
            text, sentiment, intent, urgency
        )
        
        # Determine suggested tone
        suggested_tone = self._determine_reply_tone(sentiment, intent, urgency)
        
        return EngagementAnalysis(
            sentiment=sentiment,
            sentiment_score=sentiment_score,
            intent=intent,
            urgency=urgency,
            auto_reply_safe=auto_reply_safe,
            risk_factors=risk_factors,
            suggested_tone=suggested_tone
        )
    
    def _determine_intent(self, text: str) -> str:
        """Determine the intent of the engagement."""
        # Question detection
        if "?" in text or any(word in text for word in [
            "how", "what", "when", "where", "why", "can", "does", "is there", "do you"
        ]):
            return "question"
        
        # Feature request
        if any(phrase in text for phrase in [
            "would be great", "should add", "need to", "feature request", "wish", "hope"
        ]):
            return "feature_request"
        
        # Complaint
        if any(phrase in text for phrase in [
            "not working", "broken", "bug", "issue", "problem", "disappointed", "frustrated"
        ]):
            return "complaint"
        
        # Comparison
        if any(phrase in text for phrase in [
            "vs", "versus", "compared to", "better than", "difference between", "or"
        ]):
            return "comparison"
        
        # Spam detection
        if any(phrase in text for phrase in [
            "click here", "buy now", "free money", "earn $", "check my profile", "follow me"
        ]) or len(re.findall(r'http[s]?://', text)) > 1:
            return "spam"
        
        # Thank you / praise
        if any(phrase in text for phrase in [
            "thank", "love", "amazing", "awesome", "great job", "well done"
        ]):
            return "praise"
        
        return "general"
    
    def _assess_auto_reply_safety(self, 
                                   text: str, 
                                   sentiment: str, 
                                   intent: str, 
                                   urgency: str) -> tuple:
        """
        Determine if this engagement is safe for automatic reply.
        
        Returns:
            (is_safe: bool, risk_factors: List[str])
        """
        risk_factors = []
        
        # High-risk scenarios that need human review
        if sentiment == "negative":
            risk_factors.append("Negative sentiment detected")
        
        if intent == "complaint":
            risk_factors.append("Potential complaint - needs careful handling")
        
        if urgency == "high":
            risk_factors.append("High urgency - may need immediate attention")
        
        if intent == "spam":
            risk_factors.append("Potential spam - should not reply")
        
        # Check for sensitive topics
        sensitive_keywords = ["refund", "cancel", "chargeback", "lawsuit", "legal", "lawyer"]
        if any(word in text.lower() for word in sensitive_keywords):
            risk_factors.append("Sensitive topic detected")
        
        # Check for complex questions
        if text.count("?") > 2:
            risk_factors.append("Multiple questions - may need detailed response")
        
        # Check length - very long comments may need human review
        if len(text) > 500:
            risk_factors.append("Long comment - may need careful reading")
        
        # Safe for auto-reply if no risk factors
        is_safe = len(risk_factors) == 0
        
        # Exception: Simple thank-yous are always safe
        if intent == "praise" and sentiment == "positive" and urgency == "low":
            is_safe = True
            risk_factors = []
        
        return is_safe, risk_factors
    
    def _determine_reply_tone(self, sentiment: str, intent: str, urgency: str) -> str:
        """Determine the appropriate tone for the reply."""
        if sentiment == "negative" or intent == "complaint":
            return "empathetic_apologetic"
        elif intent == "question":
            return "helpful_informative"
        elif intent == "praise":
            return "grateful_enthusiastic"
        elif intent == "feature_request":
            return "appreciative_open"
        elif urgency == "high":
            return "urgent_supportive"
        else:
            return "friendly_professional"
    
    async def generate_reply(self,
                            original_text: str,
                            analysis: EngagementAnalysis,
                            platform: str) -> GeneratedReply:
        """
        Generate an appropriate reply to an engagement.
        
        Args:
            original_text: The original comment/DM
            analysis: EngagementAnalysis from analyze_engagement
            platform: Source platform
            
        Returns:
            GeneratedReply with reply text and alternatives
        """
        name = self.webapp_data.get("name", "our product")
        
        # Use template-based replies for common scenarios
        if analysis.intent == "praise" and analysis.sentiment == "positive":
            template = self.reply_templates["thank_you"]
            reply_text = template[hash(original_text) % len(template)].format(name=name)
            confidence = 0.95
            
        elif analysis.intent == "question":
            # Generate contextual answer
            answer = await self._generate_contextual_answer(original_text)
            template = self.reply_templates["question"]
            reply_text = template[hash(original_text) % len(template)].format(answer=answer, name=name)
            confidence = 0.85
            
        elif analysis.intent == "feature_request":
            template = self.reply_templates["feature_request"]
            reply_text = template[hash(original_text) % len(template)].format(name=name)
            confidence = 0.90
            
        elif analysis.intent == "complaint":
            template = self.reply_templates["complaint"]
            reply_text = template[hash(original_text) % len(template)].format(name=name)
            confidence = 0.80
            
        else:
            # Use LLM for complex replies
            reply_text = await self._generate_llm_reply(
                original_text, analysis, platform
            )
            confidence = 0.75
        
        # Generate alternative replies
        alternative_replies = await self._generate_alternatives(
            original_text, analysis, platform
        )
        
        return GeneratedReply(
            text=reply_text,
            confidence=confidence,
            tone=analysis.suggested_tone,
            estimated_engagement_boost=0.1 if analysis.sentiment == "positive" else 0.05,
            alternative_replies=alternative_replies
        )
    
    async def _generate_contextual_answer(self, question: str) -> str:
        """Generate a contextual answer to a question."""
        name = self.webapp_data.get("name", "our product")
        description = self.webapp_data.get("description", "")
        features = self.webapp_data.get("key_features", [])
        
        question_lower = question.lower()
        
        # Price question
        if any(word in question_lower for word in ["price", "cost", "how much", "pricing"]):
            return f"{name} has flexible pricing plans starting from free. Check our website for details!"
        
        # Feature question
        if any(word in question_lower for word in ["feature", "can it", "does it", "support"]):
            feature_list = ", ".join(features[:3]) if features else "many powerful features"
            return f"{name} includes {feature_list} and more!"
        
        # Integration question
        if any(word in question_lower for word in ["integrate", "connect", "work with", "api"]):
            return f"{name} integrates with popular tools and has a robust API!"
        
        # Trial question
        if any(word in question_lower for word in ["trial", "try", "free", "demo"]):
            return f"Yes! {name} offers a free trial so you can try all features."
        
        # Support question
        if any(word in question_lower for word in ["support", "help", "contact", "email"]):
            return f"Our support team is always here to help! Reach out anytime."
        
        # Default answer
        return f"{name} is designed to help you work smarter. We'd love to show you more!"
    
    async def _generate_llm_reply(self,
                                  original_text: str,
                                  analysis: EngagementAnalysis,
                                  platform: str) -> str:
        """Generate a reply using LLM for complex scenarios."""
        name = self.webapp_data.get("name", "our product")
        
        # Build prompt for LLM
        prompt = f"""You are the social media manager for {name}. 

Original message: "{original_text}"

Sentiment: {analysis.sentiment}
Intent: {analysis.intent}
Urgency: {analysis.urgency}
Tone: {analysis.suggested_tone}

Write a brief, friendly reply (max 2 sentences) that:
- Matches the {analysis.suggested_tone} tone
- Addresses the {analysis.intent} appropriately
- Is appropriate for {platform}
- Includes a relevant emoji

Reply:"""
        
        # If LLM client available, use it
        if self.llm:
            try:
                response = await self.llm.generate(prompt)
                return response.strip()
            except:
                pass
        
        # Fallback reply
        if analysis.sentiment == "positive":
            return f"Thanks for reaching out! We appreciate your support! 💙"
        else:
            return f"Thanks for your feedback. We'd love to learn more - please check your DMs! 📩"
    
    async def _generate_alternatives(self,
                                     original_text: str,
                                     analysis: EngagementAnalysis,
                                     platform: str) -> List[str]:
        """Generate alternative reply options."""
        alternatives = []
        
        # Generate 2-3 alternatives with different tones
        tones = ["friendly", "professional", "enthusiastic"]
        
        for tone in tones[:2]:
            if tone != analysis.suggested_tone:
                alt = await self._generate_llm_reply(original_text, analysis, platform)
                alternatives.append(alt)
        
        return alternatives[:2]
    
    async def process_batch(self,
                           engagements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process a batch of engagements.
        
        Args:
            engagements: List of engagement dicts with 'text', 'platform', 'type', 'id'
            
        Returns:
            List of processed engagements with analysis and replies
        """
        results = []
        
        for engagement in engagements:
            try:
                # Analyze
                analysis = await self.analyze_engagement(
                    engagement.get("text", ""),
                    engagement.get("platform", "unknown"),
                    engagement.get("type", "comment")
                )
                
                # Generate reply
                reply = await self.generate_reply(
                    engagement.get("text", ""),
                    analysis,
                    engagement.get("platform", "unknown")
                )
                
                results.append({
                    "engagement_id": engagement.get("id"),
                    "original_text": engagement.get("text"),
                    "platform": engagement.get("platform"),
                    "analysis": {
                        "sentiment": analysis.sentiment,
                        "sentiment_score": analysis.sentiment_score,
                        "intent": analysis.intent,
                        "urgency": analysis.urgency,
                        "auto_reply_safe": analysis.auto_reply_safe,
                        "risk_factors": analysis.risk_factors,
                        "suggested_tone": analysis.suggested_tone
                    },
                    "reply": {
                        "text": reply.text,
                        "confidence": reply.confidence,
                        "tone": reply.tone,
                        "alternative_replies": reply.alternative_replies
                    },
                    "status": "ready" if not analysis.auto_reply_safe else "auto_approved"
                })
                
            except Exception as e:
                results.append({
                    "engagement_id": engagement.get("id"),
                    "error": str(e),
                    "status": "failed"
                })
        
        return results
