import argparse
import json
import time
import datetime
from dateutil import tz
import collections

from actions import suggest_actions_for_event
from calendar_client import CalendarClient
from local_calendar_client import LocalCalendarClient
from notifier import notify


def load_config(path):
    with open(path, 'r') as f:
        return json.load(f)


def print_event_actions(events):
    now = datetime.datetime.now(tz.tzlocal())
    for e in events:
        start = e.get('_start_dt')
        start_str = start.astimezone(tz.tzlocal()).isoformat() if start else 'unknown'
        print(f"- {e.get('summary','(no title)')} @ {start_str}")
        suggestions = suggest_actions_for_event(e)
        for s in suggestions:
            print(f"    • {s}")


def summarize_events(events, days=7):
    # Group events by local date
    by_date = collections.defaultdict(list)
    for e in events:
        start = e.get('_start_dt')
        if start is None:
            date_key = 'unknown'
        else:
            local_dt = start.astimezone(tz.tzlocal())
            date_key = local_dt.date().isoformat()
        by_date[date_key].append(e)

    # Produce ordered summary for the next `days` days
    today = datetime.datetime.now(tz.tzlocal()).date()
    lines = []
    for d in range(days):
        day = today + datetime.timedelta(days=d)
        key = day.isoformat()
        lines.append(f"\n=== {day.isoformat()} ===")
        day_events = sorted(by_date.get(key, []), key=lambda ev: ev.get('_start_dt') or datetime.datetime.min)
        if not day_events:
            lines.append('  (no events)')
            continue
        for e in day_events:
            start = e.get('_start_dt')
            start_s = start.astimezone(tz.tzlocal()).strftime('%H:%M') if start else '??:??'
            title = e.get('summary', '(no title)')
            suggestions = suggest_actions_for_event(e)
            lines.append(f"  - {start_s} {title}: {', '.join(suggestions[:2])}")

    return '\n'.join(lines)


def run_loop(cfg, once=False):
    backend = cfg.get('backend', 'local')
    if backend == 'google':
        client = CalendarClient(credentials_path=cfg.get('credentials_path', 'credentials.json'),
                                token_path=cfg.get('token_path', 'token.json'))
    else:
        client = LocalCalendarClient()

    poll = cfg.get('poll_interval_seconds', 300)
    lookahead = cfg.get('lookahead_minutes', 60)
    calendar_id = cfg.get('calendar_id', 'primary')

    try:
        while True:
            now = datetime.datetime.now(tz.tzlocal())
            # If summary_days is set in cfg this run may be intended as a multi-day summary
            summary_days = cfg.get('_summary_days', 0)
            if summary_days and summary_days > 0:
                time_min = now
                time_max = now + datetime.timedelta(days=summary_days)
            else:
                time_min = now
                time_max = now + datetime.timedelta(minutes=lookahead)

            events = client.list_upcoming(calendar_id=calendar_id, time_min=time_min, time_max=time_max)
            if summary_days and summary_days > 0:
                print(f"\n== Summary for next {summary_days} days - {now.isoformat()} ==")
                summary_text = summarize_events(events, days=summary_days)
                print(summary_text)
                if cfg.get('notify', False):
                    notify(cfg, f'Summary: next {summary_days} days', summary_text)
            else:
                if events:
                    print(f"\n== Upcoming events (next {lookahead} minutes) - {now.isoformat()} ==")
                    print_event_actions(events)
                    # Build a short notification summary and optionally notify
                    cfg_notify = cfg.get('notify', False)
                    if cfg_notify:
                        for e in events:
                            title = e.get('summary', '(no title)')
                            suggestions = suggest_actions_for_event(e)
                            # Only notify if there are actionable suggestions when requested
                            if cfg.get('notify_on_suggestions_only', True) and suggestions == ['No specific actions — verify details']:
                                continue
                            msg = '; '.join(suggestions[:3])
                            notify(cfg, title, msg)
                else:
                    print(f"\nNo upcoming events in next {lookahead} minutes. ({now.isoformat()})")

            if once:
                break
            time.sleep(poll)
    except KeyboardInterrupt:
        print('\nStopped by user')


def main():
    parser = argparse.ArgumentParser(description='Calendar watcher that suggests actions for upcoming events')
    parser.add_argument('--config', '-c', default='config.example.json', help='Path to config JSON')
    parser.add_argument('--once', action='store_true', help='Run one iteration and exit')
    parser.add_argument('--summary-days', type=int, default=0, help='Produce a summary for the next N days and exit')
    args = parser.parse_args()
    cfg = load_config(args.config)
    # Allow CLI override for summary mode
    if args.summary_days and args.summary_days > 0:
        cfg['_summary_days'] = args.summary_days
        run_loop(cfg, once=True)
    else:
        run_loop(cfg, once=args.once)


if __name__ == '__main__':
    main()
