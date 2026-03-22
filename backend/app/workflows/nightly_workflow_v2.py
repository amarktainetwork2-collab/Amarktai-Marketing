"""
Enhanced Nightly Workflow Orchestrator for AmarktAI Marketing
Uses LangGraph for stateful, multi-step content generation with A/B testing and feedback loops
"""

import json
import asyncio
from typing import Dict, List, Any, Optional, TypedDict, Annotated
from datetime import datetime, timedelta
from enum import Enum
import operator

# LangGraph imports
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolExecutor

# Import our agents
from app.agents.research_agent_v2 import ResearchAgentV2
from app.agents.creative_agent import CreativeAgent
from app.agents.media_agent_v2 import MediaAgentV2
from app.agents.optimizer_agent import OptimizerAgent
from app.agents.community_agent import CommunityAgent

class WorkflowStage(str, Enum):
    RESEARCH = "research"
    CREATIVE = "creative"
    MEDIA = "media"
    OPTIMIZE = "optimize"
    AB_TEST = "ab_test"
    APPROVAL_QUEUE = "approval_queue"
    COMPLETE = "complete"

class ContentWorkflowState(TypedDict):
    """State for the content generation workflow."""
    user_id: str
    webapp_id: str
    webapp_data: Dict[str, Any]
    user_api_keys: Dict[str, str]
    user_plan: str
    platforms: List[str]
    
    # Research outputs
    research_results: Dict[str, Any]
    
    # Creative outputs
    content_packages: Dict[str, Any]  # platform -> content package
    
    # Media outputs
    media_assets: Dict[str, Any]  # platform -> assets
    
    # Optimization outputs
    optimized_content: Dict[str, Any]  # platform -> optimized content
    viral_scores: Dict[str, Any]  # platform -> viral score
    
    # A/B testing
    ab_test_variants: Dict[str, List[Dict]]  # platform -> variants
    
    # Final outputs
    final_content: List[Dict[str, Any]]  # Content items ready for approval
    
    # Tracking
    current_stage: str
    errors: Annotated[List[str], operator.add]
    cost_estimate: float
    actual_cost: float

class NightlyWorkflowV2:
    """
    Enhanced nightly workflow orchestrator using LangGraph.
    Generates content for all platforms with A/B testing and viral optimization.
    """
    
    def __init__(self):
        self.research_agent = None
        self.creative_agent = None
        self.media_agent = None
        self.optimizer_agent = None
        self.community_agent = None
        
        # Build the workflow graph
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow."""
        
        # Define the workflow graph
        workflow = StateGraph(ContentWorkflowState)
        
        # Add nodes
        workflow.add_node("research", self._research_node)
        workflow.add_node("creative", self._creative_node)
        workflow.add_node("media", self._media_node)
        workflow.add_node("optimize", self._optimize_node)
        workflow.add_node("ab_test", self._ab_test_node)
        workflow.add_node("finalize", self._finalize_node)
        
        # Define edges
        workflow.set_entry_point("research")
        workflow.add_edge("research", "creative")
        workflow.add_edge("creative", "media")
        workflow.add_edge("media", "optimize")
        workflow.add_edge("optimize", "ab_test")
        workflow.add_edge("ab_test", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()
    
    async def _research_node(self, state: ContentWorkflowState) -> ContentWorkflowState:
        """Research node - gathers trends and competitor insights."""
        print(f"🔍 Starting research for webapp: {state['webapp_data'].get('name')}")
        
        try:
            self.research_agent = ResearchAgentV2()
            research_results = await self.research_agent.research_webapp(state["webapp_data"])
            
            state["research_results"] = research_results
            state["current_stage"] = WorkflowStage.RESEARCH
            
            print(f"✅ Research complete. Found {len(research_results.get('trending_topics', []))} trending topics")
            
        except Exception as e:
            state["errors"] = [f"Research failed: {str(e)}"]
            # Continue with fallback research
            state["research_results"] = {
                "trending_topics": [],
                "content_angles": self._get_fallback_content_angles(state["webapp_data"]),
                "recommended_hashtags": []
            }
        
        return state
    
    async def _creative_node(self, state: ContentWorkflowState) -> ContentWorkflowState:
        """Creative node - generates content for each platform."""
        print(f"✨ Generating creative content for {len(state['platforms'])} platforms")
        
        self.creative_agent = CreativeAgent()
        content_packages = {}
        
        for platform in state["platforms"]:
            try:
                package = await self.creative_agent.generate_content_package(
                    research_data=state["research_results"],
                    webapp_data=state["webapp_data"],
                    platform=platform
                )
                content_packages[platform] = package
                print(f"  ✅ Generated content for {platform}")
                
            except Exception as e:
                state["errors"] = state.get("errors", []) + [f"Creative failed for {platform}: {str(e)}"]
                print(f"  ❌ Failed to generate content for {platform}: {e}")
        
        state["content_packages"] = content_packages
        state["current_stage"] = WorkflowStage.CREATIVE
        
        return state
    
    async def _media_node(self, state: ContentWorkflowState) -> ContentWorkflowState:
        """Media node - generates images, videos, and audio."""
        print(f"🎨 Generating media assets")
        
        self.media_agent = MediaAgentV2(
            user_api_keys=state["user_api_keys"],
            user_plan=state["user_plan"]
        )
        
        media_assets = {}
        total_cost = 0.0
        
        for platform, package in state["content_packages"].items():
            try:
                # Estimate cost first
                cost_estimate = self.media_agent.estimate_cost(package)
                total_cost += cost_estimate["total"]
                
                # Check if user has budget
                # In production, check against user's remaining budget
                
                # Generate media
                assets = await self.media_agent.generate_content_media(package, platform)
                media_assets[platform] = assets
                
                # Track actual cost
                for asset in assets.values():
                    if isinstance(asset, dict):
                        total_cost += asset.get("cost", 0.0)
                
                print(f"  ✅ Generated media for {platform}")
                
            except Exception as e:
                state["errors"] = state.get("errors", []) + [f"Media failed for {platform}: {str(e)}"]
                print(f"  ❌ Failed to generate media for {platform}: {e}")
        
        state["media_assets"] = media_assets
        state["cost_estimate"] = total_cost
        state["current_stage"] = WorkflowStage.MEDIA
        
        return state
    
    async def _optimize_node(self, state: ContentWorkflowState) -> ContentWorkflowState:
        """Optimization node - optimizes content for virality."""
        print(f"🎯 Optimizing content for maximum engagement")
        
        self.optimizer_agent = OptimizerAgent(
            trend_data=state["research_results"]
        )
        
        optimized_content = {}
        viral_scores = {}
        
        for platform, package in state["content_packages"].items():
            try:
                optimized = await self.optimizer_agent.optimize_content(
                    content_package=package,
                    platform=platform,
                    webapp_data=state["webapp_data"]
                )
                optimized_content[platform] = optimized
                viral_scores[platform] = optimized["viral_score"]
                
                print(f"  ✅ Optimized {platform} - Viral Score: {optimized['viral_score'].overall}/100")
                
            except Exception as e:
                state["errors"] = state.get("errors", []) + [f"Optimization failed for {platform}: {str(e)}"]
                print(f"  ❌ Failed to optimize {platform}: {e}")
        
        state["optimized_content"] = optimized_content
        state["viral_scores"] = viral_scores
        state["current_stage"] = WorkflowStage.OPTIMIZE
        
        return state
    
    async def _ab_test_node(self, state: ContentWorkflowState) -> ContentWorkflowState:
        """A/B Testing node - generates variants for testing."""
        print(f"🧪 Generating A/B test variants")
        
        ab_test_variants = {}
        
        # Generate 2-3 variants for each platform
        for platform in state["platforms"]:
            try:
                variants = await self._generate_ab_variants(
                    platform=platform,
                    original_content=state["content_packages"].get(platform, {}),
                    optimized_content=state["optimized_content"].get(platform, {})
                )
                ab_test_variants[platform] = variants
                
                print(f"  ✅ Generated {len(variants)} variants for {platform}")
                
            except Exception as e:
                state["errors"] = state.get("errors", []) + [f"A/B test failed for {platform}: {str(e)}"]
                print(f"  ❌ Failed to generate A/B variants for {platform}: {e}")
        
        state["ab_test_variants"] = ab_test_variants
        state["current_stage"] = WorkflowStage.AB_TEST
        
        return state
    
    async def _finalize_node(self, state: ContentWorkflowState) -> ContentWorkflowState:
        """Finalize node - prepares content for approval queue."""
        print(f"📋 Finalizing content for approval queue")
        
        final_content = []
        
        for platform in state["platforms"]:
            try:
                # Get the best variant (or original if no A/B test)
                variants = state["ab_test_variants"].get(platform, [])
                
                if variants:
                    # Use the highest-scoring variant
                    best_variant = max(variants, key=lambda v: v.get("viral_score", 0))
                    
                    content_item = {
                        "id": f"content_{platform}_{datetime.now().timestamp()}",
                        "user_id": state["user_id"],
                        "webapp_id": state["webapp_id"],
                        "platform": platform,
                        "type": self._determine_content_type(platform),
                        "status": "pending",
                        "title": best_variant.get("title", f"Content for {platform}"),
                        "caption": best_variant.get("caption", ""),
                        "hashtags": best_variant.get("hashtags", []),
                        "media_urls": self._extract_media_urls(platform, state["media_assets"]),
                        "viral_score": best_variant.get("viral_score", 50),
                        "confidence_score": best_variant.get("confidence", 0.7),
                        "content_angle": best_variant.get("content_angle", {}),
                        "ab_test_id": best_variant.get("ab_test_id"),
                        "variant_id": best_variant.get("variant_id"),
                        "is_variant": True,
                        "generation_metadata": {
                            "research_date": state["research_results"].get("research_date"),
                            "trending_topics": [t["topic"] for t in state["research_results"].get("trending_topics", [])[:5]],
                            "cost_estimate": state.get("cost_estimate", 0)
                        }
                    }
                    
                    final_content.append(content_item)
                    print(f"  ✅ Finalized content for {platform} (Viral Score: {content_item['viral_score']})")
                
            except Exception as e:
                state["errors"] = state.get("errors", []) + [f"Finalize failed for {platform}: {str(e)}"]
                print(f"  ❌ Failed to finalize {platform}: {e}")
        
        state["final_content"] = final_content
        state["current_stage"] = WorkflowStage.COMPLETE
        
        print(f"\n✅ Workflow complete! Generated {len(final_content)} content items")
        print(f"💰 Estimated cost: ${state.get('cost_estimate', 0):.2f}")
        
        return state
    
    async def _generate_ab_variants(self,
                                   platform: str,
                                   original_content: Dict[str, Any],
                                   optimized_content: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate A/B test variants for a platform."""
        variants = []
        
        # Variant A: Original optimized content
        variant_a = {
            "variant_id": "A",
            "title": original_content.get("content", {}).get("caption", {}).get("text", "")[:50],
            "caption": original_content.get("content", {}).get("caption", {}).get("text", ""),
            "hashtags": optimized_content.get("optimizations", {}).get("hashtags", {}).get("hashtags", []),
            "viral_score": optimized_content.get("viral_score", {}).overall if optimized_content.get("viral_score") else 50,
            "confidence": 0.8,
            "content_angle": original_content.get("content_angle", {}),
            "test_hypothesis": "Original optimized version"
        }
        variants.append(variant_a)
        
        # Variant B: Different hook
        if original_content.get("content", {}).get("video_script"):
            hooks = optimized_content.get("optimizations", {}).get("hook_variations", [])
            if hooks:
                variant_b = variant_a.copy()
                variant_b["variant_id"] = "B"
                variant_b["title"] = hooks[0]
                variant_b["test_hypothesis"] = "Alternative hook variation"
                variant_b["viral_score"] = min(100, variant_a["viral_score"] + 5)  # Slight boost for testing
                variants.append(variant_b)
        
        # Variant C: Different CTA
        if len(variants) < 3:
            ctas = original_content.get("content", {}).get("cta", {}).get("variations", {})
            if ctas:
                variant_c = variant_a.copy()
                variant_c["variant_id"] = "C"
                variant_c["caption"] = variant_c["caption"].replace(
                    original_content.get("content", {}).get("cta", {}).get("recommended", ""),
                    list(ctas.values())[1] if len(ctas) > 1 else list(ctas.values())[0]
                )
                variant_c["test_hypothesis"] = "Alternative CTA"
                variants.append(variant_c)
        
        return variants
    
    def _get_fallback_content_angles(self, webapp_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get fallback content angles if research fails."""
        name = webapp_data.get("name", "Your Product")
        
        return [
            {
                "title": f"How {name} Saves You Time",
                "hook": f"Stop wasting time on manual tasks...",
                "platforms": ["youtube", "tiktok", "instagram"],
                "format": "tutorial",
                "key_message": f"{name} automates your workflow",
                "cta": "Try it free"
            },
            {
                "title": f"Before vs After with {name}",
                "hook": f"This is what changed everything...",
                "platforms": ["tiktok", "instagram", "facebook"],
                "format": "transformation",
                "key_message": "See real results",
                "cta": "Start now"
            }
        ]
    
    def _determine_content_type(self, platform: str) -> str:
        """Determine content type based on platform."""
        if "shorts" in platform or "reels" in platform or platform == "tiktok":
            return "video"
        elif platform in ["instagram", "facebook"]:
            return "image"
        else:
            return "text"
    
    def _extract_media_urls(self, platform: str, media_assets: Dict[str, Any]) -> List[str]:
        """Extract media URLs from generated assets."""
        urls = []
        platform_assets = media_assets.get(platform, {})
        
        for asset_type, asset in platform_assets.items():
            if isinstance(asset, dict) and asset.get("url"):
                urls.append(asset["url"])
            elif hasattr(asset, 'url') and asset.url:
                urls.append(asset.url)
        
        return urls
    
    async def run(self,
                 user_id: str,
                 webapp_id: str,
                 webapp_data: Dict[str, Any],
                 platforms: List[str],
                 user_api_keys: Dict[str, str] = None,
                 user_plan: str = "free") -> Dict[str, Any]:
        """
        Run the complete nightly workflow.
        
        Args:
            user_id: User ID
            webapp_id: WebApp ID
            webapp_data: Web app information
            platforms: List of platforms to generate content for
            user_api_keys: User-provided API keys
            user_plan: User's subscription plan
            
        Returns:
            Workflow results with generated content
        """
        # Initialize state
        initial_state = ContentWorkflowState(
            user_id=user_id,
            webapp_id=webapp_id,
            webapp_data=webapp_data,
            user_api_keys=user_api_keys or {},
            user_plan=user_plan,
            platforms=platforms,
            research_results={},
            content_packages={},
            media_assets={},
            optimized_content={},
            viral_scores={},
            ab_test_variants={},
            final_content=[],
            current_stage=WorkflowStage.RESEARCH,
            errors=[],
            cost_estimate=0.0,
            actual_cost=0.0
        )
        
        # Run the workflow
        try:
            result = await self.workflow.ainvoke(initial_state)
            return {
                "success": True,
                "content": result.get("final_content", []),
                "errors": result.get("errors", []),
                "cost_estimate": result.get("cost_estimate", 0),
                "stages_completed": result.get("current_stage", ""),
                "viral_scores": {
                    platform: score.__dict__ if hasattr(score, '__dict__') else score
                    for platform, score in result.get("viral_scores", {}).items()
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "errors": initial_state.get("errors", []) + [str(e)],
                "content": initial_state.get("final_content", [])
            }


# Singleton instance
_nightly_workflow = None

def get_nightly_workflow() -> NightlyWorkflowV2:
    """Get or create the nightly workflow instance."""
    global _nightly_workflow
    if _nightly_workflow is None:
        _nightly_workflow = NightlyWorkflowV2()
    return _nightly_workflow
