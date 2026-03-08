import re


def suggest_actions_for_event(event):
    """Return a list of short action suggestions for a single event."""
    suggestions = []
    title = event.get('summary', '').lower()
    desc = (event.get('description') or '').lower()
    attendees = event.get('attendees', [])

    # Meeting join suggestion
    if 'hangout' in (event.get('conferenceData', {}) or {}) or 'zoom' in (event.get('location') or '').lower() or 'meet.google' in (event.get('hangoutLink') or ''):
        suggestions.append('Join meeting (check link)')
    elif any(k in title for k in ('call', 'meeting', 'sync')) or attendees:
        suggestions.append('Prepare to join meeting')

    # Prep suggestions
    if re.search(r'slide|presentation|demo|report', title + ' ' + desc):
        suggestions.append('Prepare slides / demo materials')
    if 'agenda' not in desc and any(k in title for k in ('planning', 'retro', 'kickoff', 'sync')):
        suggestions.append('Draft and send an agenda')

    # Follow-up or notes
    if any(k in title for k in ('1:1', 'one-on-one', 'review')):
        suggestions.append('Prepare topics and notes for one-on-one')

    # If the event is likely to be long, suggest a break plan
    duration_minutes = None
    start = event.get('_start_dt')
    end = None
    if 'end' in event and 'dateTime' in event['end']:
        from dateutil import parser
        end = parser.isoparse(event['end']['dateTime'])
    if start and end:
        duration_minutes = int((end - start).total_seconds() / 60)
    if duration_minutes and duration_minutes >= 90:
        suggestions.append('Schedule short breaks and buffer')

    if not suggestions:
        suggestions.append('No specific actions — verify details')

    # Return templated suggestions with short reasons
    templated = []
    for s in suggestions:
        reason = ''
        if 'Prepare slides' in s or 'presentation' in s:
            reason = 'You indicated slides or a demo in the title/description.'
        elif 'agenda' in s or 'Draft' in s:
            reason = 'Structured meetings benefit from agendas.'
        elif 'Join' in s or 'Prepare to join' in s:
            reason = 'Check call link, mic/camera, and materials.'
        elif 'break' in s.lower():
            reason = 'Long meeting — schedule short buffer.'
        if reason:
            templated.append(f"{s} — {reason}")
        else:
            templated.append(s)

    return templated
