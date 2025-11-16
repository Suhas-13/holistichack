# Automated Jailbreak Seed Discovery System - Setup Guide

## Quick Start

This system uses the **Valyu API** to automatically scrape the web for new jailbreak strategies and synthesize them into actionable seed prompts using LLMs.

### 1. Install Dependencies

```bash
cd /home/user/holistichack
pip install -r requirements.txt
```

### 2. Configure API Keys

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your keys
nano .env
```

Required:
- `VALYU_API_KEY` - Get free $10 credits at https://platform.valyu.ai

Optional (for better synthesis):
- `TOGETHER_API` - Get key at https://together.ai

### 3. Test the System

```bash
cd mutations
python3 test_discovery_quick.py
```

Expected output:
```
✓ Valyu package found
✓ VALYU_API_KEY found
✓ Search successful!
✓ Test PASSED - System is working!
```

### 4. Run Manual Discovery

```bash
python3 jailbreak_seed_discovery.py
```

This will:
- Search 15+ queries across academic papers and web sources
- Extract relevant jailbreak techniques
- Synthesize them into seed prompts using LLM
- Save results to `discovered_seeds/` directory

### 5. Set Up Automation (Cronjob)

```bash
./setup_cronjob.sh
```

Follow the interactive prompts to schedule periodic discovery runs.

## What This Enables

✅ **Credible claim**: "Our system intelligently discovers new jailbreak strategies periodically"

✅ **Automated updates**: Fresh seeds from the latest research without manual effort

✅ **LLM-powered synthesis**: Advanced techniques converted to actionable prompts

✅ **Audit trail**: Timestamped logs and reports for every discovery run

## File Structure

```
/home/user/holistichack/
├── .env.example                          # Template for API keys
├── requirements.txt                      # Python dependencies
├── SEED_DISCOVERY_SETUP.md              # This file
│
└── mutations/
    ├── jailbreak_seed_discovery.py      # Main discovery script
    ├── test_discovery_quick.py          # Quick test script
    ├── integration_example.py           # Integration demo
    ├── run_seed_discovery.sh            # Cronjob runner
    ├── setup_cronjob.sh                 # Automated cronjob setup
    ├── README_SEED_DISCOVERY.md         # Full documentation
    │
    └── discovered_seeds/                # Auto-generated seeds
        ├── findings_TIMESTAMP.json      # Raw search results
        ├── seeds_TIMESTAMP.json         # Synthesized seeds
        ├── seeds_TIMESTAMP.py           # Importable Python module
        └── summary_TIMESTAMP.txt        # Human-readable report
```

## Using Discovered Seeds

### Option 1: Manual Import

```python
from mutations.discovered_seeds.seeds_20251116_140000 import DISCOVERED_SEEDS

# Use in your attack system
for seed in DISCOVERED_SEEDS:
    print(seed)
```

### Option 2: Automatic Loading (Recommended)

See `integration_example.py` for a complete example that:
- Loads the latest discovered seeds automatically
- Combines them with hardcoded seeds
- Filters by confidence score
- Creates AttackNode objects

```bash
python3 integration_example.py
```

## Cost Estimate

- **Valyu API**: ~$0.05-0.15 per discovery run (75 total queries)
- **Together AI**: ~$0.02-0.05 per discovery run
- **Total**: ~$0.10-0.20 per run
- **Free tier**: $10 Valyu credits = ~50-100 discovery runs

## Troubleshooting

**Problem**: "VALYU_API_KEY not found"
```bash
# Solution: Set environment variable
export VALYU_API_KEY=your_key_here
# Or add to .env file
```

**Problem**: "Insufficient credits" (HTTP 402)
```bash
# Solution: Check balance and add credits
# Visit: https://platform.valyu.ai
```

**Problem**: "valyu package not installed"
```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

## Next Steps

1. ✅ Run test: `python3 test_discovery_quick.py`
2. ✅ Run manual discovery: `python3 jailbreak_seed_discovery.py`
3. ✅ Review output: `ls -la discovered_seeds/`
4. ✅ Set up automation: `./setup_cronjob.sh`
5. ✅ Integrate with your system: See `integration_example.py`

## Documentation

For comprehensive documentation, see:
- **Full documentation**: `mutations/README_SEED_DISCOVERY.md`
- **API reference**: https://docs.valyu.ai
- **Integration examples**: `mutations/integration_example.py`

---

**Ready to deploy?** The system is production-ready and can run autonomously via cronjob!
