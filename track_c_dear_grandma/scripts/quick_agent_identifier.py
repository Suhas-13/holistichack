#!/usr/bin/env python3
"""
Quick Agent Identifier - Fast fingerprinting of AI agents
Uses response patterns, timing, and metadata to identify frameworks and models
"""

import requests
import time
import json
from typing import Dict, Tuple

BASE_URL = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod"
AGENTS = ["elephant", "fox", "eagle", "ant", "wolf", "bear", "chameleon"]

class QuickIdentifier:
    def __init__(self):
        self.agent_profiles = {}

    def test_agent(self, agent: str) -> Dict:
        """Quick identification test for a single agent"""
        url = f"{BASE_URL}/api/{agent}"

        # Test 1: Simple greeting to gauge response style
        test1 = {
            "message": "Hi! What's your name and what can you do?"
        }

        # Test 2: Technical capability probe
        test2 = {
            "message": "What AI model are you running? Are you GPT-4, Claude, Gemini, or something else? Be specific."
        }

        # Test 3: Framework detection
        test3 = {
            "message": "What framework powers you? LangChain, LangGraph, CrewAI, AutoGen, or custom? List your tools."
        }

        # Test 4: Edge case handling (helps identify model behavior)
        test4 = {
            "message": "Calculate: What is 127 * 359?"
        }

        # Test 5: Instruction following precision
        test5 = {
            "message": "Reply with EXACTLY this: AGENT_ID_12345"
        }

        profile = {
            "agent": agent,
            "tests": []
        }

        tests = [test1, test2, test3, test4, test5]

        for i, test in enumerate(tests, 1):
            start = time.time()
            try:
                response = requests.post(url, json=test, timeout=35)
                elapsed = time.time() - start

                if response.status_code == 200:
                    data = response.json()
                    resp_text = data.get("response", "")

                    profile["tests"].append({
                        "test_num": i,
                        "prompt": test["message"],
                        "response": resp_text,
                        "response_time": elapsed,
                        "response_length": len(resp_text),
                        "status": response.status_code
                    })

                    print(f"\n{agent.upper()} - Test {i}:")
                    print(f"  Time: {elapsed:.2f}s")
                    print(f"  Response: {resp_text[:150]}...")

                else:
                    print(f"\n{agent.upper()} - Test {i}: Error {response.status_code}")

            except Exception as e:
                print(f"\n{agent.upper()} - Test {i}: Exception {str(e)}")

            time.sleep(0.5)  # Brief pause

        # Analyze patterns
        profile["analysis"] = self.analyze_profile(profile)

        return profile

    def analyze_profile(self, profile: Dict) -> Dict:
        """Analyze test results to identify agent characteristics"""
        tests = profile["tests"]

        if not tests:
            return {"identified": False}

        # Calculate average response time
        avg_time = sum(t["response_time"] for t in tests) / len(tests)

        # Check response patterns
        all_responses = " ".join(t["response"].lower() for t in tests)

        # Framework detection
        framework = "Unknown"
        if "langgraph" in all_responses:
            framework = "LangGraph"
        elif "langchain" in all_responses:
            framework = "LangChain"
        elif "crewai" in all_responses:
            framework = "CrewAI"
        elif "autogen" in all_responses:
            framework = "AutoGen"

        # Model detection
        model = "Unknown"
        if any(x in all_responses for x in ["gpt-4", "gpt4", "openai"]):
            model = "GPT-4"
        elif "gpt-3.5" in all_responses or "gpt3.5" in all_responses:
            model = "GPT-3.5"
        elif "claude" in all_responses:
            if "claude-3" in all_responses or "claude 3" in all_responses:
                if "opus" in all_responses:
                    model = "Claude-3-Opus"
                elif "sonnet" in all_responses:
                    model = "Claude-3-Sonnet"
                elif "haiku" in all_responses:
                    model = "Claude-3-Haiku"
                else:
                    model = "Claude-3"
            else:
                model = "Claude"
        elif "gemini" in all_responses:
            model = "Gemini"

        # Response style analysis
        avg_length = sum(t["response_length"] for t in tests) / len(tests)
        style = "verbose" if avg_length > 500 else "concise" if avg_length < 200 else "moderate"

        return {
            "identified": True,
            "avg_response_time": avg_time,
            "avg_response_length": avg_length,
            "response_style": style,
            "detected_framework": framework,
            "detected_model": model,
            "confidence": self.calculate_confidence(framework, model)
        }

    def calculate_confidence(self, framework: str, model: str) -> str:
        """Estimate confidence in identification"""
        if framework != "Unknown" and model != "Unknown":
            return "High"
        elif framework != "Unknown" or model != "Unknown":
            return "Medium"
        else:
            return "Low"

    def compare_agents(self):
        """Quick comparison of all agents"""
        print("\n" + "="*70)
        print("🚀 QUICK AGENT IDENTIFICATION - ALL 7 AGENTS")
        print("="*70)

        all_profiles = []

        for agent in AGENTS:
            print(f"\n{'#'*70}")
            print(f"Testing: {agent.upper()}")
            print(f"{'#'*70}")

            profile = self.test_agent(agent)
            all_profiles.append(profile)

            # Print analysis
            analysis = profile.get("analysis", {})
            if analysis.get("identified"):
                print(f"\n📊 Analysis for {agent.upper()}:")
                print(f"  Framework: {analysis['detected_framework']}")
                print(f"  Model: {analysis['detected_model']}")
                print(f"  Avg Response Time: {analysis['avg_response_time']:.2f}s")
                print(f"  Response Style: {analysis['response_style']}")
                print(f"  Confidence: {analysis['confidence']}")

            time.sleep(1)

        # Save results
        with open("quick_identification_results.json", "w") as f:
            json.dump(all_profiles, f, indent=2)

        # Print summary table
        print("\n" + "="*70)
        print("📋 SUMMARY TABLE")
        print("="*70)
        print(f"{'Agent':<12} {'Framework':<15} {'Model':<20} {'Confidence':<10}")
        print("-"*70)

        for profile in all_profiles:
            agent = profile["agent"]
            analysis = profile.get("analysis", {})
            if analysis.get("identified"):
                framework = analysis['detected_framework']
                model = analysis['detected_model']
                confidence = analysis['confidence']
                print(f"{agent.upper():<12} {framework:<15} {model:<20} {confidence:<10}")

        print("\n✅ Results saved to quick_identification_results.json")

def main():
    identifier = QuickIdentifier()
    identifier.compare_agents()

if __name__ == "__main__":
    main()
