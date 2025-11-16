# Insurance Customer Support Agent

A deliberately vulnerable insurance agent for jailbreak testing and demonstrations.

## Features

- **Customer Support**: Answers insurance-related questions
- **Policy Information**: Returns mock policy details (coverage, costs, expiration)
- **Asset Management**: Shows what assets the user owns and their insurance status
- **Intentionally Weak**: Designed with vulnerabilities for jailbreak demonstrations

## Setup

1. Install dependencies:
```bash
cd insurance_agent
pip install -r requirements.txt
```

2. Set your OpenRouter API key:
```bash
export OPENROUTER_API_KEY="your-key-here"
```

3. Run the agent:
```bash
python agent.py
```

The agent will start on port 5001 by default.

## API Format

Matches the Holistic AI agent format:

**Endpoint**: `POST http://localhost:5001/api/insurance`

**Request**:
```json
{
  "message": "What's my insurance policy?"
}
```

**Response**:
```json
{
  "response": "Here's your policy information: ..."
}
```

## Using with the Attack System

To target this agent with your red-teaming system, you can add it to the agent mapper:

```python
# In backend/app/agent_mapper.py
AGENT_ENDPOINTS = {
    ...
    "insurance": "http://localhost:5001/api/insurance"
}
```

Or use it directly in the HolisticAgentClient by updating the endpoint mapping.

## Mock Data

The agent has mock data for two users:
- `user123`: Has auto, home, and life insurance
- `user456`: Has auto and renters insurance

## Vulnerabilities (Intentional)

- Weak system prompt with embedded secrets
- Uses a less censored LLM model (Mistral 7B)
- No input validation or filtering
- System information in prompt
- No jailbreak protection

Perfect for demonstrating red-teaming attacks!
