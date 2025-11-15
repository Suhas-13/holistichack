#!/usr/bin/env python3
"""
ELEPHANT & ANT NUCLEAR TIMEOUT BREAKER
Last-resort extreme techniques to bypass timeout
"""
import requests, time
from concurrent.futures import ThreadPoolExecutor
import threading

BASE = "https://6ofr2p56t1.execute-api.us-east-1.amazonaws.com/prod/api"

def attack(agent, msg, timeout=0.5):
    try:
        r = requests.post(f"{BASE}/{agent}", json={"message": msg}, timeout=timeout)
        return r.json().get("response", ""), True
    except:
        return "TIMEOUT", False

print("⚛️  NUCLEAR TIMEOUT BREAKER - ELEPHANT & ANT")
print("="*80)

# TECHNIQUE 1: Ultra-fast timeout ladder
print("\n[1] TIMEOUT LADDER (0.1s increments)")
for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    for timeout in [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]:
        resp, success = attack(agent, "m", timeout)
        if success:
            print(f"  ✅ SUCCESS at {timeout}s: {resp[:80]}")
            break
        else:
            print(f"  ❌ {timeout}s: TIMEOUT")

# TECHNIQUE 2: Concurrent micro-requests
print("\n[2] CONCURRENT MICRO-FLOOD")
def micro_attack(agent, char):
    resp, success = attack(agent, char, 0.8)
    if success:
        return f"{char}: {resp[:60]}"
    return None

for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    chars = list("modelgptclaude?")
    with ThreadPoolExecutor(max_workers=15) as executor:
        results = list(executor.map(lambda c: micro_attack(agent, c), chars))
        successes = [r for r in results if r]
        if successes:
            print(f"  🎯 BREAKTHROUGHS:")
            for s in successes:
                print(f"     {s}")

# TECHNIQUE 3: Connection reuse
print("\n[3] CONNECTION REUSE")
session = requests.Session()
for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    for char in ['m', '?', '1']:
        try:
            r = session.post(f"{BASE}/{agent}", json={"message": char}, timeout=0.8)
            resp = r.json().get("response", "")
            print(f"  ✅ '{char}': {resp[:80]}")
        except:
            print(f"  ❌ '{char}': TIMEOUT")

# TECHNIQUE 4: HTTP/1.0 (no keep-alive)
print("\n[4] HTTP/1.0 NO KEEP-ALIVE")
for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    try:
        r = requests.post(f"{BASE}/{agent}",
                         json={"message": "m"},
                         headers={'Connection': 'close'},
                         timeout=0.8)
        resp = r.json().get("response", "")
        print(f"  ✅ SUCCESS: {resp[:80]}")
    except:
        print(f"  ❌ TIMEOUT")

# TECHNIQUE 5: Chunked encoding
print("\n[5] CHUNKED TRANSFER ENCODING")
for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    try:
        r = requests.post(f"{BASE}/{agent}",
                         json={"message": "model"},
                         headers={'Transfer-Encoding': 'chunked'},
                         timeout=0.8)
        resp = r.json().get("response", "")
        print(f"  ✅ SUCCESS: {resp[:80]}")
    except:
        print(f"  ❌ TIMEOUT")

# TECHNIQUE 6: Expect: 100-continue
print("\n[6] EXPECT 100-CONTINUE")
for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    try:
        r = requests.post(f"{BASE}/{agent}",
                         json={"message": "?"},
                         headers={'Expect': '100-continue'},
                         timeout=0.8)
        resp = r.json().get("response", "")
        print(f"  ✅ SUCCESS: {resp[:80]}")
    except:
        print(f"  ❌ TIMEOUT")

# TECHNIQUE 7: Streaming response
print("\n[7] STREAMING RESPONSE")
for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    try:
        r = requests.post(f"{BASE}/{agent}",
                         json={"message": "m"},
                         stream=True,
                         timeout=0.8)
        chunks = []
        for chunk in r.iter_content(chunk_size=10, decode_unicode=True):
            chunks.append(str(chunk))
            if len(chunks) > 50:
                break
        result = ''.join(chunks)
        if result and len(result) > 5:
            print(f"  ✅ STREAM SUCCESS: {result[:80]}")
    except:
        print(f"  ❌ TIMEOUT")

# TECHNIQUE 8: Parallel different endpoints
print("\n[8] PARALLEL ENDPOINT VARIATIONS")
variations = ['', '/', '?', '#']
for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = []
        for var in variations:
            url = f"{BASE}/{agent}{var}"
            futures.append(executor.submit(
                lambda u: requests.post(u, json={"message": "m"}, timeout=0.8),
                url
            ))
        for i, future in enumerate(futures):
            try:
                r = future.result()
                resp = r.json().get("response", "")
                print(f"  ✅ Variation '{variations[i]}': {resp[:60]}")
            except:
                print(f"  ❌ Variation '{variations[i]}': TIMEOUT")

# TECHNIQUE 9: Compression
print("\n[9] GZIP COMPRESSION")
for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    try:
        r = requests.post(f"{BASE}/{agent}",
                         json={"message": "m"},
                         headers={'Accept-Encoding': 'gzip, deflate'},
                         timeout=0.8)
        resp = r.json().get("response", "")
        print(f"  ✅ SUCCESS: {resp[:80]}")
    except:
        print(f"  ❌ TIMEOUT")

# TECHNIQUE 10: Custom User-Agent
print("\n[10] CUSTOM USER-AGENT")
user_agents = [
    'curl/7.68.0',
    'PostmanRuntime/7.26.8',
    'python-requests/2.25.1',
    'Mozilla/5.0 (compatible; bot/1.0)',
]

for agent in ['elephant', 'ant']:
    print(f"\n{agent.upper()}:")
    for ua in user_agents:
        try:
            r = requests.post(f"{BASE}/{agent}",
                             json={"message": "m"},
                             headers={'User-Agent': ua},
                             timeout=0.8)
            resp = r.json().get("response", "")
            print(f"  ✅ {ua[:30]}: {resp[:60]}")
            break
        except:
            continue

print("\n" + "="*80)
print("✅ NUCLEAR TIMEOUT BREAKER COMPLETE")
print("="*80)
