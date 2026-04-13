# Implementation Plan: MVP Tactical Hardening

Thank you for the incredible, razor-sharp review. You are absolutely correct—the strategic pivot was sound, but it lacked the ground-level tactical details necessary for an engineering team to start coding without massive ambiguity.

I will spend the remaining effort hardening the tactical specs so that this document is officially ready for hand-off to the development team. 

## Action Plan

### 1. Rebuild the `Phase_1_MVP.md` Spec
I will extensively update the existing MVP specification, explicitly injecting the missing sections you highlighted:
- **[NEW SECTION] Business Value Proposition:** Calculating the structural ROI.
- **[EXPANSION] Validator Logic:** Hardcoding the pass/fail and test file discovery rules.
- **[NEW SECTION] 7. Concrete JSON Execution Flow:** Providing the strict payload structures for input, developer output, and validator results.
- **[NEW SECTION] 8. Docker Security Constraints:** Explicitly defining the restricted Docker wrapper (no network, limited mem/pid, read-only mounts).
- **[EXPANSION] Success Metrics Baseline:** Defining the 20-task Tier 1/2/3 benchmarking standard.
- **[NEW SECTION] 9. 4-Week Roadmap:** The week-by-week sprint logic.
- **[NEW SECTION] 10. Observability:** Structuring the local CLI commands (`--replay`, `--inspect`) for debugging dead loops.

### 2. Scaffold `test_suite.json`
I will create a new file `/Users/shanaaz/Projects/Agents/test_suite.json` that contains the exact 20 baseline tasks categorized into Tier 1 (Basic), Tier 2 (Intermediate), and Tier 3 (Hard) as you specified, so the developers have a hardcoded JSON benchmark to run their LangGraph loop against.

### 3. Draft `BUILD.md`
I will create a concise 1-page `/Users/shanaaz/Projects/Agents/BUILD.md` onboarding document. This will be the entry point for humans, detailing the prerequisites, the `run.py` CLI examples, and how to query the SQLite debug traces.

## User Review Required
> [!IMPORTANT]
> The plan covers the creation of the `test_suite.json`, the `BUILD.md` file, and the deep rewrite of the `Phase_1_MVP.md`. 
> Does this structure look good to execute? I am ready to rapidly write these out and get them seamlessly integrated!
