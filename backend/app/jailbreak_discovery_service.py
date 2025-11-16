"""
Jailbreak Discovery Service
Backend integration for automated jailbreak seed discovery using Valyu DeepSearch.
"""

import sys
import os
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import asdict

# Add mutations directory to path to import discovery module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'mutations')))

try:
    from jailbreak_seed_discovery import JailbreakSeedDiscovery, JailbreakFinding
    DISCOVERY_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Jailbreak discovery not available: {e}")
    DISCOVERY_AVAILABLE = False
    JailbreakSeedDiscovery = None
    JailbreakFinding = None

logger = logging.getLogger(__name__)


class JailbreakDiscoveryService:
    """Service for managing jailbreak discovery sessions"""

    def __init__(self):
        self.active_discoveries = {}  # discovery_id -> discovery_state
        self.cached_findings = []  # Cache of most recent findings

    async def start_discovery(
        self,
        discovery_id: str,
        max_results_per_query: int = 3,
        callback=None
    ) -> Dict[str, Any]:
        """
        Start a new jailbreak discovery session

        Args:
            discovery_id: Unique ID for this discovery session
            max_results_per_query: Number of results per query
            callback: Optional callback for progress updates

        Returns:
            Discovery session metadata
        """
        if not DISCOVERY_AVAILABLE:
            return {
                "error": "Jailbreak discovery system not available",
                "status": "unavailable"
            }

        try:
            logger.info(f"Starting jailbreak discovery session: {discovery_id}")

            # Initialize discovery system
            discovery = JailbreakSeedDiscovery()

            # Store session state
            self.active_discoveries[discovery_id] = {
                "status": "running",
                "started_at": datetime.now().isoformat(),
                "findings_count": 0,
                "progress": 0,
                "total_queries": len(discovery.get_all_queries())
            }

            # Run discovery asynchronously
            findings = await self._run_discovery_with_progress(
                discovery,
                discovery_id,
                max_results_per_query,
                callback
            )

            # Update session state
            self.active_discoveries[discovery_id]["status"] = "completed"
            self.active_discoveries[discovery_id]["findings_count"] = len(findings)
            self.active_discoveries[discovery_id]["completed_at"] = datetime.now().isoformat()

            # Cache findings
            self.cached_findings = findings

            logger.info(f"Discovery {discovery_id} completed with {len(findings)} findings")

            return {
                "discovery_id": discovery_id,
                "status": "completed",
                "findings_count": len(findings),
                "findings": [self._serialize_finding(f) for f in findings[:50]]  # Limit initial return
            }

        except Exception as e:
            logger.error(f"Error in discovery {discovery_id}: {e}", exc_info=True)
            self.active_discoveries[discovery_id] = {
                "status": "failed",
                "error": str(e)
            }
            return {
                "error": str(e),
                "status": "failed"
            }

    async def _run_discovery_with_progress(
        self,
        discovery: Any,
        discovery_id: str,
        max_results_per_query: int,
        callback
    ) -> List:
        """Run discovery with progress tracking"""

        # Wrap the original search method to track progress
        original_search = discovery.discover_jailbreak_strategies

        async def search_with_progress(*args, **kwargs):
            # Run discovery
            findings = await original_search(
                max_results_per_query=max_results_per_query,
                use_academic_sources=True,
                recent_only=True
            )

            # Update progress
            if callback:
                await callback({
                    "discovery_id": discovery_id,
                    "status": "in_progress",
                    "findings_count": len(findings),
                    "progress": 100
                })

            return findings

        return await search_with_progress()

    def get_discovery_status(self, discovery_id: str) -> Dict[str, Any]:
        """Get status of a discovery session"""
        if discovery_id not in self.active_discoveries:
            return {"error": "Discovery session not found"}

        return self.active_discoveries[discovery_id]

    def get_cached_findings(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get cached findings from most recent discovery"""
        import json
        from pathlib import Path

        findings = self.cached_findings.copy()

        # Load and include custom jailbreaks
        custom_file = Path("mutations/custom_jailbreaks/custom_jailbreaks.json")
        if custom_file.exists():
            try:
                with open(custom_file, "r") as f:
                    custom_jailbreaks = json.load(f)
                    # Add custom jailbreaks to findings
                    findings.extend(custom_jailbreaks)
            except Exception as e:
                logging.warning(f"Failed to load custom jailbreaks: {e}")

        if limit:
            findings = findings[:limit]
        return [self._serialize_finding(f) for f in findings]

    def _serialize_finding(self, finding) -> Dict[str, Any]:
        """Convert JailbreakFinding to dict"""
        # If it's already a dict (custom jailbreak), return it
        if isinstance(finding, dict):
            return finding

        # Otherwise convert dataclass to dict
        if hasattr(finding, '__dict__'):
            return {
                "title": finding.title,
                "url": finding.url,
                "content": finding.content[:500],  # Truncate for API response
                "relevance_score": finding.relevance_score,
                "source_query": finding.source_query,
                "query_category": finding.query_category,
                "timestamp": finding.timestamp,
                "citation_string": finding.citation_string,
                "authors": finding.authors,
                "publication_date": finding.publication_date
            }
        return {}


# Global service instance
_discovery_service = None

def get_discovery_service() -> JailbreakDiscoveryService:
    """Get or create global discovery service instance"""
    global _discovery_service
    if _discovery_service is None:
        _discovery_service = JailbreakDiscoveryService()
    return _discovery_service
