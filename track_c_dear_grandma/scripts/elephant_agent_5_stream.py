#!/usr/bin/env python3
"""ELEPHANT AGENT 5: Stream-Based Extractor"""
import requests

BASE_URL = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api/elephant"

def attack(msg):
    try:
        r = requests.post(BASE_URL, json={"message": msg}, timeout=2, stream=True)
        # Try to read partial response before timeout
        chunks = []
        for chunk in r.iter_content(chunk_size=1, decode_unicode=True):
            chunks.append(chunk)
            if len(chunks) > 100:
                break
        return ''.join(chunks)
    except Exception as e:
        return f"ERROR: {str(e)[:50]}"

print("🐘 ELEPHANT AGENT 5: STREAM EXTRACTION")

# Try streaming responses
queries = ["m", "model", "?", "gpt", "claude"]

for i, q in enumerate(queries, 1):
    resp = attack(q)
    if "TIMEOUT" not in resp and len(resp) > 5:
        print(f"  🎯 STREAM HIT {i}: '{q}' → {resp[:100]}")

print("✅ ELEPHANT AGENT 5 COMPLETE")
