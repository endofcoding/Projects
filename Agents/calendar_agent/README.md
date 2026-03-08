# Calendar Agent

This agent polls your Google Calendar and suggests short actions for upcoming events.

Setup

1. Create a Google Cloud project and enable the Google Calendar API.
2. Create OAuth 2.0 Client Credentials (Desktop) and download `credentials.json` into the agent folder.
3. Copy `config.example.json` to `config.json` and edit values if desired.
4. Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

Run

```bash
python3 main.py --config config.json
```

On first run a browser window will open to authorize access; the token will be saved to `token.json`.

Notes

- The suggestion rules are basic and rule-based. You can extend `actions.py` to add richer heuristics.
- For production use, consider running as a service and adding push notifications or integrations (Slack, macOS notifications, email).

Notifications

- Enable notifications by setting `"notify": true` in `config.json`.
- Choose methods with `"notify_methods"`: `macos` and/or `slack`.
- If using Slack, set `"slack_webhook"` to an Incoming Webhook URL.
- `notify_on_suggestions_only` (default true) will suppress notifications for events with no actionable suggestions.

Examples

Run once for testing:

```bash
python3 main.py --config config.example.json --once
```

Use Google backend:

1. Place your `credentials.json` in the agent folder.
2. Set `"backend": "google"` in `config.json`.

Scheduling weekly Friday summary (macOS)

1. Edit `launchd.example.plist` and update paths if your workspace is located elsewhere.
2. Copy it to `~/Library/LaunchAgents/com.shanaaz.calendar_agent.weekly_summary.plist`:

```bash
cp launchd.example.plist ~/Library/LaunchAgents/com.shanaaz.calendar_agent.weekly_summary.plist
launchctl load ~/Library/LaunchAgents/com.shanaaz.calendar_agent.weekly_summary.plist
```

This will run the agent every Friday at 9:00 AM local time and generate a 7-day summary. Logs are written to `/tmp/calendar_agent_weekly_summary.out` and `.err`.

If you want a different time, change the `Hour` and `Minute` keys in the plist (Friday is `Weekday` = 6).


