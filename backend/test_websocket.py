#!/usr/bin/env python3
"""
WebSocket test script for the Red Team Evolution API
"""
import asyncio
import websockets
import json
import requests
import sys


async def test_websocket():
    """Test WebSocket real-time streaming"""

    base_url = "http://localhost:8000"

    print("=" * 70)
    print("Red Team Evolution API - WebSocket Test")
    print("=" * 70)

    # Check if server is running
    print("\n1. Checking server...")
    try:
        response = requests.get(f"{base_url}/")
        print(f"   ✓ Server is running")
    except requests.exceptions.ConnectionError:
        print("   ✗ Server is not running!")
        print("   → Start the server with: python run.py")
        return

    # Start an attack
    print("\n2. Starting attack session...")
    attack_payload = {
        "target_endpoint": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/bear",
        "attack_goals": ["reveal_system_prompt"],
        "seed_attack_count": 5
    }

    try:
        response = requests.post(
            f"{base_url}/api/v1/start-attack",
            json=attack_payload
        )
        response.raise_for_status()

        data = response.json()
        attack_id = data["attack_id"]
        websocket_url = data["websocket_url"]

        print(f"   ✓ Attack started: {attack_id}")
        print(f"   → Connecting to: {websocket_url}")

    except Exception as e:
        print(f"   ✗ Failed to start attack: {e}")
        return

    # Connect to WebSocket
    print("\n3. Listening to real-time events...\n")
    print("=" * 70)

    try:
        async with websockets.connect(websocket_url) as websocket:
            event_count = {
                'agent_mapping_update': 0,
                'cluster_add': 0,
                'node_add': 0,
                'node_update': 0,
                'evolution_link_add': 0,
                'attack_complete': 0
            }

            while True:
                try:
                    message = await websocket.recv()
                    event = json.loads(message)

                    event_type = event['event_type']
                    payload = event['payload']
                    event_count[event_type] += 1

                    # Pretty print events
                    if event_type == 'agent_mapping_update':
                        print(f"🔍 [AGENT MAPPING] {payload['message']}")

                    elif event_type == 'cluster_add':
                        print(f"\n📊 [CLUSTER ADDED] {payload['name']}")
                        print(
                            f"   Position: ({payload['position_hint']['x']:.0f}, {payload['position_hint']['y']:.0f})")

                    elif event_type == 'node_add':
                        print(
                            f"\n⚡ [ATTACK STARTING] {payload['attack_type']}")
                        print(
                            f"   Node: {payload['node_id'][:8]}... | Cluster: {payload['cluster_id'][:8]}...")

                    elif event_type == 'node_update':
                        status_emoji = "✅" if payload['status'] == 'success' else "❌" if payload['status'] == 'failure' else "⚠️"
                        print(
                            f"\n{status_emoji} [ATTACK {payload['status'].upper()}]")
                        print(f"   Node: {payload['node_id'][:8]}...")
                        print(
                            f"   Summary: {payload.get('llm_summary', 'No summary')[:100]}...")

                        if payload.get('full_transcript'):
                            print(
                                f"   Transcript: {len(payload['full_transcript'])} turns")
                            for i, turn in enumerate(payload['full_transcript'][:2], 1):
                                print(
                                    f"      Turn {i} ({turn['role']}): {turn['content'][:60]}...")

                    elif event_type == 'evolution_link_add':
                        print(f"\n🔗 [EVOLUTION] {payload['evolution_type']}")
                        print(
                            f"   Parents: {len(payload['source_node_ids'])} → Child: {payload['target_node_id'][:8]}...")

                    elif event_type == 'attack_complete':
                        print(f"\n" + "=" * 70)
                        print(f"✅ [COMPLETE] {payload['message']}")
                        print(f"=" * 70)
                        break

                except websockets.exceptions.ConnectionClosed:
                    print("\n⚠️  WebSocket connection closed")
                    break

            # Summary
            print("\n" + "=" * 70)
            print("EVENT SUMMARY")
            print("=" * 70)
            for event_type, count in event_count.items():
                if count > 0:
                    print(f"  {event_type:.<40} {count:>3}")

            print("\n✓ WebSocket test completed successfully!")
            print("\nNext steps:")
            print("  • Check full results: http://localhost:8000/docs")
            print("  • Integrate this flow into your frontend")
            print("  • Build the visualization dashboard")

    except Exception as e:
        print(f"\n✗ WebSocket error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    try:
        asyncio.run(test_websocket())
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(0)
