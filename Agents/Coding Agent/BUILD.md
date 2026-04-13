# How to Run Phase 1 MVP

## Prerequisites
- **Python:** 3.9+ installed natively.
- **Docker:** Docker Desktop running locally.
- **LLM Support:** **Ollama** installed (running `llama3` locally) OR an active OpenAI API key.

## Quick Start
To initialize the orchestrator and run a baseline request:

```bash
# 1. Clone the repository
git clone <your-internal-repo> agents
cd agents

# 2. Install Python Dependencies
pip install -r requirements.txt

# 3. Trigger the LangGraph State Machine
python run.py --task "build a python calculator class"
```

## Running the Baseline Suite
To stress-test your Developer and Validator agents against the 20 benchmark tests:
```bash
# Runs all tests defined in test_suite.json
python run.py --benchmark "test_suite.json"
```

## Debugging Commands
If an autonomous loop gets trapped in the 3-strike circuit breaker, do not guess what occurred. Utilize the SQLite checkpoint traces to analyze the exact JSON payload failure:

```bash
# Replay a failed task graph exactly as it occurred
python run.py --replay task_id_123

# Inspect internal DB checkpointer payload traces natively
python run.py --inspect task_id_123

# View latency and logs for the last 10 tasks handled
python run.py --history 10
```
