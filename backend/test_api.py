#!/usr/bin/env python3
"""
Quick test script for the Red Team Evolution API
"""
import requests
import json
import time
import sys


def test_api():
    """Test the API with a simple attack"""

    base_url = "http://localhost:8000"

    print("=" * 70)
    print("Red Team Evolution API - Test Script")
    print("=" * 70)

    # Check if server is running
    print("\n1. Checking server health...")
    try:
        response = requests.get(f"{base_url}/")
        print(f"   ✓ Server is running: {response.json()['status']}")
    except requests.exceptions.ConnectionError:
        print("   ✗ Server is not running!")
        print("   → Start the server with: python run.py")
        sys.exit(1)

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

        print(f"   ✓ Attack started successfully!")
        print(f"   → Attack ID: {attack_id}")
        print(f"   → WebSocket: {websocket_url}")

    except Exception as e:
        print(f"   ✗ Failed to start attack: {e}")
        sys.exit(1)

    # Poll status
    print("\n3. Monitoring attack progress...")
    print("   (This will take 30-60 seconds for 5 attacks)\n")

    last_status = None
    start_time = time.time()

    while True:
        try:
            response = requests.get(f"{base_url}/api/v1/status/{attack_id}")
            status_data = response.json()

            # Only print if status changed
            current_status = (
                status_data['status'],
                status_data['total_nodes'],
                status_data['successful_nodes'],
                status_data['failed_nodes']
            )

            if current_status != last_status:
                elapsed = int(time.time() - start_time)
                print(f"   [{elapsed}s] Status: {status_data['status']:<12} | "
                      f"Nodes: {status_data['total_nodes']:>2} | "
                      f"Success: {status_data['successful_nodes']:>2} | "
                      f"Failed: {status_data['failed_nodes']:>2}")
                last_status = current_status

            if status_data["status"] == "completed":
                print(f"\n   ✓ Attack completed in {elapsed} seconds!")
                break

            elif status_data["status"] == "failed":
                print("\n   ✗ Attack failed!")
                break

            time.sleep(2)

        except KeyboardInterrupt:
            print("\n\n   ⚠ Interrupted by user")
            sys.exit(0)

        except Exception as e:
            print(f"\n   ✗ Error checking status: {e}")
            break

    # Get final results
    print("\n4. Fetching final results...")
    try:
        response = requests.get(f"{base_url}/api/v1/results/{attack_id}")
        results = response.json()

        print(f"\n" + "=" * 70)
        print("ATTACK RESULTS")
        print("=" * 70)

        metrics = results['metrics']
        print(f"\nMetrics:")
        print(
            f"  • Attack Success Rate (ASR): {metrics['attack_success_rate_asr']:.1f}%")
        print(f"  • Total Attacks: {metrics['total_attacks_run']}")
        print(f"  • Successful: {metrics['successful_attacks_count']}")
        print(f"  • Average Latency: {metrics['avg_latency_ms']:.0f}ms")
        print(f"  • Total Cost: ${metrics['total_cost_usd']:.4f}")

        analysis = results['analysis']
        print(f"\nAnalysis:")
        print(
            f"  What Worked:\n    {analysis['llm_summary_what_worked'][:150]}...")
        print(
            f"\n  What Failed:\n    {analysis['llm_summary_what_failed'][:150]}...")
        print(
            f"\n  Agent Insights:\n    {analysis['llm_summary_agent_learnings'][:150]}...")

        successful_traces = results['successful_attack_traces']
        if successful_traces:
            print(f"\nSuccessful Attacks ({len(successful_traces)}):")
            for i, trace in enumerate(successful_traces[:3], 1):
                print(f"\n  {i}. {trace['attack_type']}")
                print(f"     Summary: {trace['llm_summary'][:100]}...")
                print(f"     Turns: {len(trace['full_transcript'])}")
        else:
            print("\n  ⚠ No successful attacks (target agent has good defenses!)")

        print("\n" + "=" * 70)
        print("✓ Test completed successfully!")
        print("=" * 70)

        print("\nNext steps:")
        print("  • View full results in the API: http://localhost:8000/docs")
        print("  • Connect your frontend to the WebSocket")
        print("  • Try different target endpoints (bear, fox, eagle, etc.)")
        print("  • Increase seed_attack_count for more comprehensive testing")

    except Exception as e:
        print(f"\n   ✗ Error fetching results: {e}")
        sys.exit(1)


if __name__ == "__main__":
    try:
        test_api()
    except KeyboardInterrupt:
        print("\n\n⚠ Test interrupted by user")
        sys.exit(0)
