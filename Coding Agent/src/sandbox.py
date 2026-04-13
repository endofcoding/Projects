import docker
import os
import tarfile
import io
import time
import yaml

class Sandbox:
    def __init__(self, config_path="validator_config.yaml"):
        self.client = docker.from_env()
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)
        
        self.image = f"python:{self.config['python_version']}"
        self.timeout = self.config['pytest_timeout_seconds']
        
        # Ensure image is present
        try:
            self.client.images.get(self.image)
        except docker.errors.ImageNotFound:
            print(f"Pulling image {self.image}...")
            self.client.images.pull(self.image)

    def run_tests(self, files, temp_dir="temp"):
        """
        Runs tests in a hardened Docker container.
        files: list of dicts with 'filename' and 'content'
        """
        # Create temp dir if not exists
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)
        
        # Write files to temp dir
        for file_info in files:
            file_path = os.path.join(temp_dir, file_info['filename'])
            # Ensure subdirectories exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w") as f:
                f.write(file_info['content'])

        # Prepare container configuration from yaml
        sb_config = self.config['sandbox']
        
        container = self.client.containers.run(
            self.image,
            command=f"sh -c 'pip install pytest && pytest --tb=short -v'",
            working_dir="/app",
            mem_limit=sb_config['memory'],
            nano_cpus=int(float(sb_config['cpus']) * 1e9),
            pids_limit=sb_config['pids_limit'],
            network_mode=sb_config['network'],
            security_opt=[sb_config['security_opt']],
            volumes={os.path.abspath(temp_dir): {'bind': '/app', 'mode': 'rw'}},
            detach=True
        )

        # Wait for container to finish or timeout
        start_time = time.time()
        status = "FAIL"
        logs = ""
        
        while time.time() - start_time < self.timeout:
            container.reload()
            if container.status == "exited":
                logs = container.logs().decode("utf-8")
                result = container.wait()
                exit_code = result['StatusCode']
                status = "PASS" if exit_code == 0 else "FAIL"
                break
            time.sleep(1)
        else:
            # Timeout
            container.stop()
            logs = "Execution Timeout Limit reached (30s)."
            status = "FAIL"

        container.remove()
        return status, logs

if __name__ == "__main__":
    # Simple self-test
    sandbox = Sandbox()
    test_files = [
        {"filename": "calc.py", "content": "class Calc:\n    def add(self, a, b): return a + b"},
        {"filename": "test_calc.py", "content": "from calc import Calc\ndef test_add():\n    assert Calc().add(2, 2) == 4"}
    ]
    status, logs = sandbox.run_tests(test_files)
    print(f"Status: {status}")
    print(f"Logs:\n{logs}")
