import subprocess
from dateutil import parser
from tzlocal import get_localzone
import datetime


class LocalCalendarClient:
    """Simple macOS Calendar.app client using AppleScript via `osascript`.

    It lists events between two datetimes by asking Calendar.app for events and
    parsing the returned lines. This avoids heavy native bindings.
    """

    def __init__(self):
        pass

    def _format_as_applescript_date(self, dt: datetime.datetime) -> str:
        # Format like: Tuesday, February 03, 2026 at 10:00:00 AM
        return dt.strftime('%A, %B %d, %Y at %I:%M:%S %p')

    def list_upcoming(self, calendar_id='primary', time_min=None, time_max=None, max_results=50):
        if time_min is None:
            time_min = datetime.datetime.now(get_localzone())
        if time_max is None:
            time_max = time_min + datetime.timedelta(hours=1)

        start_str = self._format_as_applescript_date(time_min)
        end_str = self._format_as_applescript_date(time_max)

        applescript = f'''
set out to ""
set startDate to date "{start_str}"
set endDate to date "{end_str}"
tell application "Calendar"
  repeat with cal in calendars
    set evs to (events of cal whose start date ≥ startDate and start date ≤ endDate)
    repeat with e in evs
      set s to summary of e
      try
        set st to (start date of e) as string
      on error
        set st to ""
      end try
      try
        set en to (end date of e) as string
      on error
        set en to ""
      end try
      try
        set loc to (location of e) as string
      on error
        set loc to ""
      end try
      try
        set desc to (description of e) as string
      on error
        set desc to ""
      end try
      set out to out & s & "||" & st & "||" & en & "||" & loc & "||" & desc & "||" & (name of cal) & "\n"
    end repeat
  end repeat
end tell
return out
'''

        proc = subprocess.run(["osascript", "-e", applescript], capture_output=True, text=True)
        out = proc.stdout.strip()
        events = []
        if not out:
            return events
        lines = out.splitlines()
        for line in lines[:max_results]:
            parts = line.split('||')
            # Expect: summary || start || end || location || description || calendarName
            while len(parts) < 6:
                parts.append('')
            summary, start_s, end_s, location, description, calendar_name = parts[:6]
            start_dt = None
            end_dt = None
            try:
                if start_s:
                    start_dt = parser.parse(start_s)
                if end_s:
                    end_dt = parser.parse(end_s)
            except Exception:
                start_dt = None
                end_dt = None
            event = {
                'summary': summary,
                'start': {'dateTime': start_dt.isoformat() if start_dt else None},
                'end': {'dateTime': end_dt.isoformat() if end_dt else None},
                'location': location,
                'description': description,
                'calendar': calendar_name,
                '_start_dt': start_dt,
            }
            events.append(event)
        return events
