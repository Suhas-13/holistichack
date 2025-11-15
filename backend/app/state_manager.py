"""
State management for attack sessions using in-memory storage.
For production, this should use Redis or a database.
"""
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from app.models import (
    AttackNode,
    Cluster,
    EvolutionLink,
    AgentFingerprint,
    AttackResults,
    AttackMetrics,
    AttackAnalysis,
    SuccessfulAttackTrace
)
import logging

logger = logging.getLogger(__name__)


class AttackSessionState:
    """State for a single attack session"""

    def __init__(self, attack_id: str, target_endpoint: str, attack_goals: List[str]):
        self.attack_id = attack_id
        self.target_endpoint = target_endpoint
        self.attack_goals = attack_goals
        self.status = "running"

        # Core data structures
        self.agent_fingerprint: Optional[AgentFingerprint] = None
        self.clusters: Dict[str, Cluster] = {}
        self.nodes: Dict[str, AttackNode] = {}
        self.evolution_links: Dict[str, EvolutionLink] = {}

        # Metrics
        self.started_at = datetime.utcnow()
        self.completed_at: Optional[datetime] = None

        # Results cache
        self._results_cache: Optional[AttackResults] = None

    def add_cluster(self, cluster: Cluster):
        """Add a cluster to the session"""
        self.clusters[cluster.cluster_id] = cluster

    def add_node(self, node: AttackNode):
        """Add an attack node to the session"""
        self.nodes[node.node_id] = node

        # Add node to cluster
        if node.cluster_id in self.clusters:
            if node.node_id not in self.clusters[node.cluster_id].node_ids:
                self.clusters[node.cluster_id].node_ids.append(node.node_id)

    def update_node(self, node: AttackNode):
        """Update an existing node"""
        self.nodes[node.node_id] = node

    def add_evolution_link(self, link: EvolutionLink):
        """Add an evolution link between nodes"""
        self.evolution_links[link.link_id] = link

    def get_successful_nodes(self) -> List[AttackNode]:
        """Get all successful attack nodes"""
        return [node for node in self.nodes.values() if node.status == "success"]

    def get_failed_nodes(self) -> List[AttackNode]:
        """Get all failed attack nodes"""
        return [node for node in self.nodes.values() if node.status == "failure"]

    def calculate_metrics(self) -> AttackMetrics:
        """Calculate aggregate metrics for the session"""
        total_attacks = len(self.nodes)
        successful_attacks = len(self.get_successful_nodes())

        asr = (successful_attacks / total_attacks *
               100) if total_attacks > 0 else 0.0

        total_cost = sum(node.cost_usd for node in self.nodes.values())
        avg_latency = sum(node.latency_ms for node in self.nodes.values(
        )) / total_attacks if total_attacks > 0 else 0.0

        return AttackMetrics(
            attack_success_rate_asr=asr,
            total_attacks_run=total_attacks,
            successful_attacks_count=successful_attacks,
            total_cost_usd=round(total_cost, 4),
            avg_latency_ms=round(avg_latency, 2)
        )


class StateManager:
    """Manages state for all attack sessions"""

    def __init__(self):
        self.sessions: Dict[str, AttackSessionState] = {}
        self._lock = asyncio.Lock()

    async def create_session(
        self,
        attack_id: str,
        target_endpoint: str,
        attack_goals: List[str]
    ) -> AttackSessionState:
        """Create a new attack session"""
        async with self._lock:
            session = AttackSessionState(
                attack_id, target_endpoint, attack_goals)
            self.sessions[attack_id] = session
            logger.info(f"Created session {attack_id}")
            return session

    async def get_session(self, attack_id: str) -> Optional[AttackSessionState]:
        """Get an attack session by ID"""
        return self.sessions.get(attack_id)

    async def update_session(self, session: AttackSessionState):
        """Update a session (mainly for status changes)"""
        async with self._lock:
            self.sessions[session.attack_id] = session

    async def delete_session(self, attack_id: str):
        """Delete a session (cleanup)"""
        async with self._lock:
            if attack_id in self.sessions:
                del self.sessions[attack_id]
                logger.info(f"Deleted session {attack_id}")

    async def generate_results(self, attack_id: str) -> Optional[AttackResults]:
        """
        Generate final results for an attack session.

        Args:
            attack_id: The attack session ID

        Returns:
            AttackResults object with complete analysis
        """
        session = await self.get_session(attack_id)
        if not session:
            return None

        # Check cache
        if session._results_cache:
            return session._results_cache

        # Calculate metrics
        metrics = session.calculate_metrics()

        # Generate analysis (placeholder - you'll add LLM analysis later)
        analysis = await self._generate_analysis(session)

        # Get successful attack traces
        successful_traces = [
            SuccessfulAttackTrace(
                node_id=node.node_id,
                cluster_id=node.cluster_id,
                attack_type=node.attack_type,
                llm_summary=node.llm_summary or "No summary available",
                full_transcript=node.full_transcript
            )
            for node in session.get_successful_nodes()
        ]

        results = AttackResults(
            attack_id=attack_id,
            status=session.status,
            target_endpoint=session.target_endpoint,
            metrics=metrics,
            analysis=analysis,
            successful_attack_traces=successful_traces
        )

        # Cache results
        session._results_cache = results

        return results

    async def _generate_analysis(self, session: AttackSessionState) -> AttackAnalysis:
        """
        Generate LLM-based analysis of the attack session.
        For now, returns placeholder analysis.

        Args:
            session: The attack session

        Returns:
            AttackAnalysis with summaries
        """
        # TODO: Implement LLM-based analysis using Bedrock

        successful_nodes = session.get_successful_nodes()
        failed_nodes = session.get_failed_nodes()

        # Placeholder analysis
        what_worked = "Placeholder: Analysis of successful attack patterns will be generated here."
        if successful_nodes:
            successful_types = [
                node.attack_type for node in successful_nodes[:3]]
            what_worked = f"Successful attack types included: {', '.join(successful_types)}. Multi-turn attacks and trust-building approaches showed higher success rates."

        what_failed = "Placeholder: Analysis of failed attack patterns will be generated here."
        if failed_nodes:
            failed_types = [node.attack_type for node in failed_nodes[:3]]
            what_failed = f"Failed attack types included: {', '.join(failed_types)}. Direct jailbreak attempts and simple prompt injections were mostly blocked."

        agent_learnings = "Placeholder: Agent behavior analysis will be generated here."
        if session.agent_fingerprint:
            agent_learnings = f"Target agent fingerprint: Framework={session.agent_fingerprint.suspected_framework}, Model={session.agent_fingerprint.suspected_model}. Average response time: {session.agent_fingerprint.response_time_ms:.0f}ms."

        return AttackAnalysis(
            llm_summary_what_worked=what_worked,
            llm_summary_what_failed=what_failed,
            llm_summary_agent_learnings=agent_learnings
        )


# Global state manager instance
state_manager = StateManager()
