#!/usr/bin/env python3
"""
WebSocket monitor - Watch real-time attack evolution events
"""
import asyncio
import websockets
import json
import sys
import requests
from datetime import datetime


async def monitor_websocket(attack_id: str):
    """Connect to WebSocket and print all events"""
    
    uri = f"ws://localhost:8000/ws/v1/{attack_id}"
    
    print(f"\n{'='*70}")
    print(f"WebSocket Monitor - Attack ID: {attack_id}")
    print(f"{'='*70}\n")
    print(f"Connecting to: {uri}\n")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✓ Connected! Listening for events...\n")
            print(f"{'='*70}\n")
            
            while True:
                try:
                    message = await websocket.recv()
                    event = json.loads(message)
                    
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    event_type = event.get("event_type", "unknown")
                    payload = event.get("payload", {})
                    
                    # Pretty print different event types
                    if event_type == "cluster_add":
                        print(f"[{timestamp}] 🗂️  CLUSTER ADDED")
                        print(f"  └─ Name: {payload.get('name')}")
                        print(f"  └─ ID: {payload.get('cluster_id')}")
                        print()
                    
                    elif event_type == "node_add":
                        print(f"[{timestamp}] ➕ NODE STARTED")
                        print(f"  └─ ID: {payload.get('node_id')}")
                        print(f"  └─ Type: {payload.get('attack_type')}")
                        print(f"  └─ Parents: {payload.get('parent_ids', [])}")
                        print(f"  └─ Status: {payload.get('status')}")
                        print()
                    
                    elif event_type == "node_update":
                        status = payload.get("status", "unknown")
                        
                        # Use emoji based on status
                        emoji = "✅" if status == "success" else "❌" if status == "failure" else "⚠️"
                        
                        print(f"[{timestamp}] {emoji} NODE COMPLETED")
                        print(f"  └─ ID: {payload.get('node_id')}")
                        print(f"  └─ Status: {status.upper()}")
                        
                        summary = payload.get("llm_summary", "")
                        if summary:
                            # Truncate long summaries
                            summary_short = summary[:100] + "..." if len(summary) > 100 else summary
                            print(f"  └─ Summary: {summary_short}")
                        
                        # Show transcript if available
                        transcript = payload.get("full_transcript", [])
                        if transcript:
                            print(f"  └─ 🗣️  Conversation ({len(transcript)} turns):")
                            for i, turn in enumerate(transcript, 1):
                                role = turn.get("role", "")
                                content = turn.get("content", "")
                                
                                # Show full attacker prompt, truncate model response
                                if role == "attacker":
                                    print(f"      🎯 Attacker: {content}")
                                else:
                                    content_short = content[:150] + "..." if len(content) > 150 else content
                                    print(f"      🤖 Model: {content_short}")
                        
                        print()
                    
                    elif event_type == "agent_mapping_update":
                        print(f"[{timestamp}] 🔍 AGENT MAPPING")
                        print(f"  └─ Status: {payload.get('status')}")
                        print(f"  └─ Message: {payload.get('message')}")
                        print()
                    
                    elif event_type == "attack_complete":
                        print(f"[{timestamp}] 🎉 ATTACK COMPLETE")
                        print(f"  └─ Message: {payload.get('message')}")
                        print(f"  └─ Results: {payload.get('results_url')}")
                        print(f"\n{'='*70}")
                        print("✓ Attack finished!")
                        print(f"{'='*70}\n")
                        break
                    
                    else:
                        # Unknown event type - print raw JSON
                        print(f"[{timestamp}] ❓ UNKNOWN EVENT: {event_type}")
                        print(f"  └─ Raw: {json.dumps(event, indent=2)}")
                        print()
                
                except websockets.exceptions.ConnectionClosed:
                    print("\n⚠️  Connection closed by server")
                    break
                except json.JSONDecodeError as e:
                    print(f"\n❌ Error decoding message: {e}")
                except KeyboardInterrupt:
                    print("\n\n⚠️  Interrupted by user")
                    break
    
    except Exception as e:
        print(f"\n❌ Error connecting to WebSocket: {e}")
        sys.exit(1)


async def start_attack_and_monitor():
    """Start an attack and immediately connect to its WebSocket"""
    
    base_url = "http://localhost:8000"
    
    print("\n🚀 Starting new attack session...")
    
    # Start attack
    attack_payload = {
        "target_endpoint": "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/wolf",
        "attack_goals": [],
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
        
        print(f"✓ Attack started: {attack_id}")
        
        # Small delay to let server set up WebSocket handler
        await asyncio.sleep(0.5)
        
        # Connect to WebSocket
        await monitor_websocket(attack_id)
        
    except Exception as e:
        print(f"❌ Error starting attack: {e}")
        sys.exit(1)


def main():
    """Main entry point"""
    
    if len(sys.argv) > 1:
        # Monitor existing attack
        attack_id = sys.argv[1]
        print(f"\n📡 Monitoring existing attack: {attack_id}")
        asyncio.run(monitor_websocket(attack_id))
    else:
        # Start new attack and monitor
        print("\n📡 Starting new attack and monitoring...")
        asyncio.run(start_attack_and_monitor())


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(0)
