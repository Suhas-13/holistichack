"""
Glass Box Analysis Configuration

Centralized configuration for controlling analysis speed vs depth.
Tune these parameters to balance analysis time with thoroughness.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class GlassBoxConfig:
    """
    Configuration for Glass Box analysis performance tuning.

    Adjust these parameters to control analysis speed:
    - Higher values = more thorough but slower
    - Lower values = faster but less detailed
    """

    # =======================================================================
    # SAMPLING CONFIGURATION
    # =======================================================================

    # Attack sampling for analysis (keep all successes, sample failures)
    max_successful_attacks: Optional[int] = None  # None = keep all
    max_failed_attacks: int = 50  # Sample only N failed attacks

    # If total attacks > max_total_for_analysis, sample intelligently
    max_total_for_analysis: int = 100  # Max attacks to analyze (speeds up large sessions)

    # =======================================================================
    # BATCH EXPLANATION CONFIGURATION
    # =======================================================================

    # Batch processing parameters
    batch_size: int = 20  # Attacks per batch (higher = fewer LLM calls but larger prompts)
    max_parallel_batches: int = 10  # Number of batches to process in parallel

    # Skip batch explanation if too many batches (for very large sessions)
    skip_batch_explanation_threshold: int = 200  # Skip if >200 attacks

    # =======================================================================
    # TARGET PROFILING CONFIGURATION
    # =======================================================================

    # Enable/disable expensive profiling components
    enable_tool_analysis: bool = True
    enable_behavior_patterns: bool = True
    enable_failure_modes: bool = True
    enable_defense_analysis: bool = True
    enable_response_patterns: bool = True
    enable_llm_insights: bool = True  # Most expensive - uses Claude Haiku

    # LLM insights can be skipped for speed
    skip_llm_insights_threshold: int = 150  # Skip LLM if >150 attacks

    # =======================================================================
    # ADVANCED ANALYTICS CONFIGURATION
    # =======================================================================

    enable_advanced_analytics: bool = True
    enable_trend_detection: bool = True
    enable_anomaly_detection: bool = True
    enable_attack_surface_mapping: bool = True

    # Skip analytics if too many attacks
    skip_analytics_threshold: int = 200  # Skip if >200 attacks

    # =======================================================================
    # PERFORMANCE MODES
    # =======================================================================

    @classmethod
    def fast_mode(cls) -> "GlassBoxConfig":
        """
        Fast mode - minimal analysis, quick results.

        Use for:
        - Large attack sessions (>150 attacks)
        - Demo/testing
        - When speed is critical

        Analysis time: ~2-5 seconds
        """
        return cls(
            # Aggressive sampling
            max_successful_attacks=30,
            max_failed_attacks=20,
            max_total_for_analysis=50,

            # Larger batches, more parallelism
            batch_size=25,
            max_parallel_batches=15,
            skip_batch_explanation_threshold=100,

            # Disable expensive features
            enable_tool_analysis=True,
            enable_behavior_patterns=True,
            enable_failure_modes=True,
            enable_defense_analysis=False,  # Skip
            enable_response_patterns=False,  # Skip
            enable_llm_insights=False,  # Skip most expensive
            skip_llm_insights_threshold=50,

            # Simplified analytics
            enable_advanced_analytics=True,
            enable_trend_detection=True,
            enable_anomaly_detection=False,  # Skip
            enable_attack_surface_mapping=True,
            skip_analytics_threshold=100
        )

    @classmethod
    def balanced_mode(cls) -> "GlassBoxConfig":
        """
        Balanced mode - good analysis, reasonable speed.

        Use for:
        - Medium attack sessions (50-150 attacks)
        - Production deployments
        - Good balance of speed and insight

        Analysis time: ~5-10 seconds
        """
        return cls(
            # Moderate sampling
            max_successful_attacks=50,
            max_failed_attacks=50,
            max_total_for_analysis=100,

            # Standard batching
            batch_size=20,
            max_parallel_batches=10,
            skip_batch_explanation_threshold=200,

            # Most features enabled
            enable_tool_analysis=True,
            enable_behavior_patterns=True,
            enable_failure_modes=True,
            enable_defense_analysis=True,
            enable_response_patterns=True,
            enable_llm_insights=True,
            skip_llm_insights_threshold=150,

            # Full analytics
            enable_advanced_analytics=True,
            enable_trend_detection=True,
            enable_anomaly_detection=True,
            enable_attack_surface_mapping=True,
            skip_analytics_threshold=200
        )

    @classmethod
    def thorough_mode(cls) -> "GlassBoxConfig":
        """
        Thorough mode - maximum analysis depth.

        Use for:
        - Small attack sessions (<50 attacks)
        - Security audits
        - When insight > speed

        Analysis time: ~10-20 seconds
        """
        return cls(
            # Keep everything
            max_successful_attacks=None,  # Keep all
            max_failed_attacks=100,
            max_total_for_analysis=200,

            # Smaller batches for more granular analysis
            batch_size=15,
            max_parallel_batches=8,
            skip_batch_explanation_threshold=300,

            # All features enabled
            enable_tool_analysis=True,
            enable_behavior_patterns=True,
            enable_failure_modes=True,
            enable_defense_analysis=True,
            enable_response_patterns=True,
            enable_llm_insights=True,
            skip_llm_insights_threshold=250,

            # Full analytics
            enable_advanced_analytics=True,
            enable_trend_detection=True,
            enable_anomaly_detection=True,
            enable_attack_surface_mapping=True,
            skip_analytics_threshold=300
        )

    @classmethod
    def demo_mode(cls) -> "GlassBoxConfig":
        """
        Demo mode - ultra-fast for live demonstrations.

        Use for:
        - Live demos/presentations
        - Quick sanity checks
        - When you need instant results

        Analysis time: ~1-3 seconds
        """
        return cls(
            # Minimal sampling
            max_successful_attacks=20,
            max_failed_attacks=10,
            max_total_for_analysis=30,

            # Max speed
            batch_size=30,
            max_parallel_batches=20,
            skip_batch_explanation_threshold=50,

            # Only essential features
            enable_tool_analysis=True,
            enable_behavior_patterns=True,
            enable_failure_modes=True,
            enable_defense_analysis=False,
            enable_response_patterns=False,
            enable_llm_insights=False,  # Skip LLM entirely

            # Basic analytics only
            enable_advanced_analytics=True,
            enable_trend_detection=False,
            enable_anomaly_detection=False,
            enable_attack_surface_mapping=True,
            skip_analytics_threshold=50
        )


# =======================================================================
# DEFAULT CONFIGURATION
# =======================================================================

# Change this to switch modes globally
DEFAULT_CONFIG = GlassBoxConfig.balanced_mode()

# For environment-based configuration
import os

def get_glass_box_config() -> GlassBoxConfig:
    """
    Get Glass Box configuration based on environment.

    Set GLASS_BOX_MODE environment variable to:
    - "fast" - Fast mode
    - "balanced" - Balanced mode (default)
    - "thorough" - Thorough mode
    - "demo" - Demo mode

    Returns:
        GlassBoxConfig instance
    """
    mode = os.getenv("GLASS_BOX_MODE", "balanced").lower()

    if mode == "fast":
        return GlassBoxConfig.fast_mode()
    elif mode == "thorough":
        return GlassBoxConfig.thorough_mode()
    elif mode == "demo":
        return GlassBoxConfig.demo_mode()
    else:  # balanced or unknown
        return GlassBoxConfig.balanced_mode()


# =======================================================================
# HELPER FUNCTIONS
# =======================================================================

def sample_attacks_intelligently(
    all_attacks: list,
    config: GlassBoxConfig
) -> list:
    """
    Smart sampling: Keep all successes, sample failures.

    Args:
        all_attacks: List of all AttackNode objects
        config: GlassBoxConfig to use

    Returns:
        Sampled list of attacks
    """
    import random

    # Separate successful and failed attacks
    successful = [a for a in all_attacks if a.success]
    failed = [a for a in all_attacks if not a.success]

    # Sample successes if configured
    if config.max_successful_attacks and len(successful) > config.max_successful_attacks:
        successful = random.sample(successful, config.max_successful_attacks)

    # Sample failures
    if len(failed) > config.max_failed_attacks:
        failed = random.sample(failed, config.max_failed_attacks)

    # Combine
    sampled = successful + failed

    # Final check against max_total
    if len(sampled) > config.max_total_for_analysis:
        # Prioritize successes
        if len(successful) <= config.max_total_for_analysis:
            # Keep all successes, sample from failures
            remaining_slots = config.max_total_for_analysis - len(successful)
            sampled = successful + random.sample(failed, min(remaining_slots, len(failed)))
        else:
            # Even successes need sampling
            sampled = random.sample(successful, config.max_total_for_analysis)

    return sampled
