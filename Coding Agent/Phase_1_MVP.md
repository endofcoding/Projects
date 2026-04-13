# Phase 1: Actionable MVP Specification

## 1. Business Value Proposition
**Problem:** 
- Junior developers spend 40% of their time writing boilerplate code and repetitive tests.
- Code review backlogs delay shipping by 2-3 days per isolated PR.
- Repetitive CRUD endpoint scaffolding costs $200-500/endpoint in raw developer time.

**Phase 1 MVP Value:**
- Autonomously generate simple utility functions and classes in under 60 seconds.
- Auto-validate all logic against self-generated unit tests mathematically *before* a human engineer ever reviews the code.
- **Target:** Save up to 10 hours a week for a standard team of 5 developers.

**Estimated ROI:**
- **Developer cost limit:** $100/hour × 10 hours/week = $1,000/week saved.
- **Build cost:** 4 weeks × 1 engineer × $100/hour × 40 hours = $16,000.
- **Breakpoint:** ~16 weeks post-deployment to break ROI positive.

---

## 2. Core Operational Scope
- **Time to Prototype:** 4 Weeks.
- **Primary Value Loop:** The system receives a structured JSON task, writes the backend code, and locally runs deterministic tests inside a hardened sandbox to verify the code mathematically before returning the result.
- **Exclusions (For Phase 2+):** No complex "AI Debates", no Designer/PM agents, no live cloud Canary deployments, and no RAG shared memory pollution.

---

## 3. The Minimal Agent Roster (2 Agents)

### A. Developer Agent (The Actor)
- **Role:** Generates Python/Node scripts based on an incoming JSON ticket.
- **Inputs:** A structured JSON object defining the precise task requirements.
- **Outputs:** A rigorous JSON payload strictly containing `{"files": [{"filename": "...", "content": "..."}]}`. The Developer *must* generate testing scripts alongside logic.

### B. Validation Agent Requirements (The Gatekeeper)
**Role:** Deterministically tests the Developer context using binary rules without probabilistic AI interpretation. 

**Test File Discovery Rules:**
1. Validator searches for files containing the schema `test_*.py` or `*_test.py`.
2. If **NO** test files are found → Auto-FAIL with the error: `"No tests provided by Developer."`
3. If test files are found → Natively execute `pytest --tb=short -v` natively inside the Docker Sandbox.

**Pass Criteria:**
- Exit code must strictly equal `0` from pytest.
- At least 1 test physically executed.
- No tests skipped or bypassed.

**Fail Criteria:**
- Exit code `!= 0`.
- Pytest crashes or hangs (10s forced timeout).
- No hard assertions natively present in the test files.

---

## 4. Strict Process Flow & Circuit Breakers

To explicitly eliminate the risk of infinite AI loops, the state system functions upon a strict Circuit Breaker constraint:

1. **Trigger:** Human executes `python run.py --task "..."`.
2. **Development:** Developer Agent yields logic and unit tests via JSON.
3. **Execution:** Validation Agent runs the tests in Docker.
4. **The Circuit Breaker (Timeout Policy):**
   - **Pass:** Save local files directly to the disk and cleanly exit. 
   - **Fail:** Validation Agent dumps the error trace natively back to the Developer Agent for a retry.
   - **Hard Limit:** The system enforces a maximum of **3 retries**. If the 3rd attempt critically fails, the Orchestrator instantly terminates and cleanly elevates to human escalation.

---

## 5. Complete Example: End-to-End Task Flow

### Input Task JSON:
```json
{
  "task_id": "calc_001",
  "description": "Create a Python Calculator class with add/subtract/multiply/divide methods",
  "requirements": [
    "Must handle division by zero gracefully",
    "Must support float and int inputs",
    "Must include unit tests"
  ],
  "language": "python",
  "test_framework": "pytest"
}
```

### Developer Agent Output:
```json
{
  "task_id": "calc_001",
  "files": [
    {
      "filename": "calculator.py",
      "content": "class Calculator:\n    def add(self, a, b):\n        return a + b\n    # ... (other methods)"
    },
    {
      "filename": "test_calculator.py", 
      "content": "import pytest\nfrom calculator import Calculator\n\ndef test_add():\n    calc = Calculator()\n    assert calc.add(2, 3) == 5\n\ndef test_divide_by_zero():\n # ..."
    }
  ]
}
```

### Validator Agent Execution:
```bash
$ docker run --rm -v ./temp:/app python:3.9 sh -c "cd /app && pip install pytest && pytest -v"
```

### Validator Output (Failure / Retry Triggered):
```json
{
  "task_id": "calc_001", 
  "status": "FAIL",
  "retry_count": 1,
  "error_trace": "test_calculator.py::test_divide_by_zero FAILED\nZeroDivisionError: division by zero",
  "failed_tests": ["test_divide_by_zero"]
}
```

### Validator Output (Success):
```json
{
  "task_id": "calc_001",
  "status": "PASS",
  "test_results": {
    "tests_run": 8,
    "tests_passed": 8,
    "tests_failed": 0,
    "execution_time_seconds": 2.3
  }
}
```

---

## 6. Sandbox Security Constraints

**Rationale**: If an LLM hallucinates `while True: append_to_list()`, or attempts to aggressively install unvetted third-party pip packages, standard local execution will crash the host or establish a data exfiltration vector.

**Docker Hardened Execution Command:**
```bash
docker run \
  --rm \
  --network none \               # Zero outbound internet access (no package exfiltration)
  --memory="512m" \              # Strict memory ceiling limit
  --cpus="1.0" \                 # CPU core cap restriction
  --pids-limit 50 \              # Process branching limits (blocks fork bombs)
  -v $(pwd)/temp:/app:ro \       # Strictly Read-Only internal mount
  --security-opt=no-new-privileges \
  python:3.9-slim \
  timeout 10 pytest /app         # Hard 10-second structural fail-stop limit
```

---

## 7. Success Metrics & Phase 1 Test Suite Baseline

We will strictly evaluate the factory's functional maturity against an immutable 20-Task `test_suite.json` to prevent subjective validation.

### The 20-Task Suite
- **Tier 1 - Basic Functions (10 tasks):** Simple calculator loops, string reversal, basic mapping arrays, basic JSON parsing.
- **Tier 2 - Intermediate Logic (7 tasks):** Animal class inheritances, regex email validations, HTTP request mocks, deep-dictionary merges.
- **Tier 3 - Known Hard Cases (3 tasks):** Recursive Fibonacci algorithms, asynchronous `await` sleeping loops, SQLite native parsing boundaries.

**Concrete Success Threshold Definitions:**
- **70% Threshold:** 14 out of 20 benchmark tasks cleanly pass on the absolute first attempt.
- **90% Threshold:** 18 out of 20 benchmark tasks successfully clear within the 3-Circuit Breaker retry limitation.

---

## 8. 4-Week Implementation Roadmap

**Week 1: Foundation Architecture**
- [ ] Initialize the basic local SQLite checkpointer connection.
- [ ] Connect LangGraph logic binding Developer nodes strictly to Validator nodes.
- [ ] Parse manual JSON input strings efficiently directly to the active LLM structure (Ollama).
- [ ] Log LLM text sequentially (No testing integration yet).

**Week 2: Validation Loop Security**
- [ ] Establish initial Docker Daemon shell restrictions safely.
- [ ] Hardcode memory and CPU bounds structurally.
- [ ] Program Pytest structural tracking natively measuring exit outputs safely.
- [ ] Parse Error traces correctly passing parameters securely to the circuit-breaker module cleanly.

**Week 3: End-to-End Integration Loops**
- [ ] Execute `python run.py --benchmark "test_suite.json"` tracking standard outputs.
- [ ] Attack Tier 1 tasks continuously monitoring logs.
- [ ] Add deep structured logging across parameters cleanly fixing any standard LLM JSON serialization defects natively.

**Week 4: Metric Consolidation & Rollout**
- [ ] Evaluate total runtime spanning Tier 2 and Tier 3 structures properly natively tracking fail metrics correctly.
- [ ] Compute success ratios determining metric baseline achievements accurately securely structurally.
- [ ] Capture local deployment screencasts demonstrating standard outputs easily.

---

## 9. Debugging & Observability

**Logged Database Telemetry (SQLite & Console):**
- Every Task Input structured JSON context accurately.
- Raw LLM prompt structures definitively recorded accurately.
- Output JSON Payloads mathematically tracked.
- Test failure stack traces explicitly indexed accurately structurally easily.

**Diagnostic Commands (`run.py` structure):**
If the State Machine drops logic unexpectedly, execute deterministic checks via the CLI parameter interface natively cleanly smoothly.

```bash
# Replay an exact failed Task Graph historically identically natively
python run.py --replay task_id_123

# Examine Checkpoint nodes strictly exploring graph structures successfully natively
python run.py --inspect task_id_123

# Output recent latency benchmarks and loop completions smoothly beautifully
python run.py --history 10
```
