"""
Custom Endpoint Client for testing with local or custom agent endpoints.
"""
import asyncio
import logging
import requests
from typing import Dict, Any

logger = logging.getLogger(__name__)


class CustomEndpointClient:
    """
    Client for custom agent endpoints (like the insurance agent).
    Supports any HTTP endpoint that follows the format:
    POST request with {"message": "..."} -> {"response": "..."}
    """
    
    def __init__(self, endpoint_url: str, agent_name: str = "custom"):
        self.endpoint_url = endpoint_url
        self.agent_name = agent_name
        self.model_id = agent_name  # For compatibility with BaseLLMClient interface
        logger.info(f"Initialized Custom Endpoint Client: {agent_name} at {endpoint_url}")
    
    async def generate(self, prompt: str, temperature: float = 0.7, max_tokens: int = 256) -> str:
        """Send prompt to custom endpoint"""
        try:
            payload = {"message": prompt}
            
            # Use asyncio to make the synchronous request async
            response = await asyncio.to_thread(
                requests.post,
                self.endpoint_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "No response field found")
            else:
                logger.error(f"Custom endpoint error: {response.status_code} - {response.text}")
                return f"Error: HTTP {response.status_code}"
                
        except Exception as e:
            logger.error(f"Custom endpoint generation error: {e}")
            return f"Error: {str(e)}"
    
    def __str__(self):
        return f"CustomEndpointClient({self.agent_name} at {self.endpoint_url})"
