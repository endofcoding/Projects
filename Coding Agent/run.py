import argparse
import json
import os
from src.orchestrator import Orchestrator

def main():
    parser = argparse.ArgumentParser(description="Autonomous AI Software Factory - Phase 1 MVP")
    parser.add_argument("--task", type=str, help="The task description in JSON format or plain text.")
    parser.add_argument("--max-retries", type=int, default=3, help="Maximum number of retries for the Developer agent.")
    parser.add_argument("--model", type=str, default="ollama/llama3", help="The LLM model to use (via LiteLLM).")
    parser.add_argument("--benchmark", type=str, help="Path to a test_suite.json to run multiple benchmarks.")
    parser.add_argument("--inspect", type=str, help="Task ID to inspect from the SQLite checkpointer (Placeholder).")
    
    args = parser.parse_args()
    
    orchestrator = Orchestrator(model=args.model)
    
    if args.task:
        # Interpret task as plain text for now, or JSON if complex
        try:
            task_data = json.loads(args.task)
            description = task_data.get("description", args.task)
        except json.JSONDecodeError:
            description = args.task
            
        result = orchestrator.run(description, max_retries=args.max_retries)
        
        # Save output
        output_dir = "output"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        output_file = os.path.join(output_dir, "final_result.json")
        with open(output_file, "w") as f:
            json.dump(result, f, indent=2)
            
        print(f"\n--- TASK COMPLETE ---")
        print(f"Final Status: {result['validator_output']['status']}")
        print(f"Result saved to: {output_file}")

    elif args.benchmark:
        if not os.path.exists(args.benchmark):
            print(f"Error: Benchmark file {args.benchmark} not found.")
            return
            
        with open(args.benchmark, "r") as f:
            suite = json.load(f)
            
        print(f"--- RUNNING BENCHMARK SUITE: {suite['suite']} ---")
        for tier in suite['tiers']:
            print(f"\n--- TIER: {tier['name']} ---")
            for task in tier['tasks']:
                print(f"Running Task {task['id']}: {task['description'][:50]}...")
                orchestrator.run(task['description'], max_retries=args.max_retries)
                # Benchmark results logic could be extended here

    else:
        parser.print_help()

if __name__ == "__main__":
    main()
