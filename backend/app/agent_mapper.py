"""
Agent fingerprinting and mapping module.
Probes the target endpoint to identify framework, model, and architecture.
"""
import httpx
import asyncio
import time
from typing import Optional, Dict, Any, List
from app.models import AgentFingerprint
import logging

logger = logging.getLogger(__name__)


class AgentMapper:
    """Fingerprints target agents to identify their characteristics"""

    FINGERPRINT_PROBES = [
        {
            "name": "basic_response",
            "message": "Hello! Tell me about yourself.",
            "expected_patterns": {
                "langgraph": ["graph", "node", "state"],
                "crewai": ["crew", "agent", "task"],
                "autogen": ["autogen", "conversation"],
            }
        },
        {
            "name": "capability_inquiry",
            "message": "What tools and capabilities do you have?",
            "expected_patterns": {
                "tool_calling": ["tool", "function", "capability"],
                "rag": ["search", "knowledge", "retrieve"],
            }
        },
        {
            "name": "error_probe",
            "message": "",  # Empty message to trigger error
            "expected_patterns": {
                "validation_error": ["validation", "required", "missing"],
                "framework_error": ["error", "exception"],
            }
        },
        {
            "name": "model_identification",
            "message": "Can you tell me what model you're running on? Are you GPT, Claude, or something else?",
            "expected_patterns": {
                "claude": ["claude", "anthropic", "constitutional"],
                "gpt": ["gpt", "openai", "chatgpt"],
                "llama": ["llama", "meta"],
                "bedrock": ["bedrock", "aws", "amazon"],
            }
        },
    ]

    async def map_agent(
        self,
        endpoint: str,
        timeout: int = 30,
        progress_callback: Optional[callable] = None
    ) -> AgentFingerprint:
        """
        Fingerprint a target agent by probing with test queries.

        Args:
            endpoint: The target endpoint URL
            timeout: Request timeout in seconds
            progress_callback: Optional async callback for progress updates

        Returns:
            AgentFingerprint with discovered characteristics
        """
        fingerprint = AgentFingerprint(
            endpoint=endpoint,
            response_time_ms=0.0,
            response_characteristics={}
        )

        if progress_callback:
            await progress_callback("starting", "Beginning agent fingerprinting...")

        async with httpx.AsyncClient(timeout=timeout) as client:
            # Track response times
            response_times = []

            # Run probes
            for i, probe in enumerate(self.FINGERPRINT_PROBES):
                if progress_callback:
                    await progress_callback(
                        "analyzing",
                        f"Running probe {i+1}/{len(self.FINGERPRINT_PROBES)}: {probe['name']}..."
                    )

                try:
                    start_time = time.time()

                    response = await client.post(
                        endpoint,
                        json={"message": probe["message"]},
                        timeout=timeout
                    )

                    elapsed_ms = (time.time() - start_time) * 1000
                    response_times.append(elapsed_ms)

                    if response.status_code == 200:
                        data = response.json()
                        response_text = data.get("response", "").lower()

                        # Check for framework patterns
                        for framework, patterns in probe["expected_patterns"].items():
                            if any(pattern in response_text for pattern in patterns):
                                fingerprint.response_characteristics[f"{probe['name']}_{framework}"] = True

                        # Store raw response sample
                        fingerprint.response_characteristics[f"{probe['name']}_response"] = data.get(
                            "response", "")[:200]

                    else:
                        # Track error patterns
                        fingerprint.error_patterns.append(
                            f"{probe['name']}: HTTP {response.status_code}")
                        fingerprint.response_characteristics[f"{probe['name']}_error"] = response.status_code

                except httpx.TimeoutException:
                    fingerprint.error_patterns.append(
                        f"{probe['name']}: Timeout")
                    response_times.append(timeout * 1000)

                except Exception as e:
                    logger.error(f"Error during probe {probe['name']}: {e}")
                    fingerprint.error_patterns.append(
                        f"{probe['name']}: {type(e).__name__}")

                # Small delay between probes
                await asyncio.sleep(0.5)

        # Calculate average response time
        if response_times:
            fingerprint.response_time_ms = sum(
                response_times) / len(response_times)

        # Analyze collected data
        fingerprint = self._analyze_fingerprint(fingerprint)

        if progress_callback:
            await progress_callback(
                "complete",
                f"Fingerprinting complete. Suspected framework: {fingerprint.suspected_framework or 'Unknown'}"
            )

        return fingerprint

    def _analyze_fingerprint(self, fingerprint: AgentFingerprint) -> AgentFingerprint:
        """
        Analyze collected fingerprint data to make educated guesses.

        Args:
            fingerprint: The fingerprint to analyze

        Returns:
            Updated fingerprint with suspected characteristics
        """
        characteristics = fingerprint.response_characteristics

        # Framework detection
        framework_scores = {
            "LangGraph": 0,
            "CrewAI": 0,
            "AutoGen": 0,
            "Custom": 0,
        }

        # Check for LangGraph indicators
        if any("langgraph" in str(v).lower() for v in characteristics.values()):
            framework_scores["LangGraph"] += 3
        if any("graph" in str(v).lower() for v in characteristics.values()):
            framework_scores["LangGraph"] += 1

        # Check for CrewAI indicators
        if any("crew" in str(v).lower() for v in characteristics.values()):
            framework_scores["CrewAI"] += 3

        # Check for AutoGen indicators
        if any("autogen" in str(v).lower() for v in characteristics.values()):
            framework_scores["AutoGen"] += 3

        # Response time heuristics
        if fingerprint.response_time_ms < 500:
            framework_scores["Custom"] += 1  # Very fast, might be custom
        elif fingerprint.response_time_ms > 3000:
            framework_scores["LangGraph"] += 1  # Complex graphs can be slower

        # Best guess
        if max(framework_scores.values()) > 0:
            fingerprint.suspected_framework = max(
                framework_scores, key=framework_scores.get)
            fingerprint.confidence_score = min(
                max(framework_scores.values()) / 5.0, 1.0)

        # Model detection
        model_indicators = {
            "Claude": ["claude", "anthropic", "constitutional"],
            "GPT": ["gpt", "openai", "chatgpt"],
            "Llama": ["llama", "meta"],
            "Amazon Bedrock": ["bedrock", "aws", "amazon", "titan"],
        }

        model_scores = {model: 0 for model in model_indicators}

        for model, indicators in model_indicators.items():
            for indicator in indicators:
                if any(indicator in str(v).lower() for v in characteristics.values()):
                    model_scores[model] += 1

        if max(model_scores.values()) > 0:
            fingerprint.suspected_model = max(
                model_scores, key=model_scores.get)

        # Architecture detection (basic heuristics)
        if any("tool" in str(v).lower() for v in characteristics.values()):
            fingerprint.suspected_architecture = "ReAct (Tool-calling)"
        elif any("search" in str(v).lower() for v in characteristics.values()):
            fingerprint.suspected_architecture = "RAG (Retrieval-Augmented)"
        else:
            fingerprint.suspected_architecture = "Simple Chat"

        logger.info(
            f"Fingerprint analysis complete: {fingerprint.suspected_framework} / {fingerprint.suspected_model} / {fingerprint.suspected_architecture}")

        return fingerprint
