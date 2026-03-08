import subprocess
import json
import requests


def notify_macos(title: str, message: str):
    # Use AppleScript via osascript to show a macOS notification
    safe_msg = message.replace('"', '\\"')
    safe_title = title.replace('"', '\\"')
    script = 'display notification "{}" with title "{}"'.format(safe_msg, safe_title)
    try:
        subprocess.run(["osascript", "-e", script], check=True)
    except Exception:
        print("[notify_macos] {}: {}".format(title, message))


def send_slack(webhook_url: str, blocks_or_text):
    if not webhook_url:
        return
    payload = None
    if isinstance(blocks_or_text, str):
        payload = {"text": blocks_or_text}
    else:
        payload = {"blocks": blocks_or_text}
    try:
        requests.post(webhook_url, json=payload, timeout=5)
    except Exception as e:
        print(f"[send_slack] failed: {e}")


def notify(config: dict, title: str, message: str):
    methods = config.get('notify_methods', ['macos'])
    if 'macos' in methods:
        notify_macos(title, message)
    if 'slack' in methods:
        send_slack(config.get('slack_webhook', ''), message)
