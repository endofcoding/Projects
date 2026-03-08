from __future__ import print_function
import datetime
import os
from dateutil import parser
from tzlocal import get_localzone

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']


class CalendarClient:
    def __init__(self, credentials_path='credentials.json', token_path='token.json'):
        self.creds = None
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.service = self._build_service()

    def _build_service(self):
        creds = None
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)
            with open(self.token_path, 'w') as token:
                token.write(creds.to_json())
        self.creds = creds
        return build('calendar', 'v3', credentials=creds)

    def list_upcoming(self, calendar_id='primary', time_min=None, time_max=None, max_results=50):
        if time_min is None:
            time_min = datetime.datetime.now(get_localzone()).isoformat()
        if time_max is None:
            time_max = (datetime.datetime.now(get_localzone()) + datetime.timedelta(hours=1)).isoformat()
        events_result = self.service.events().list(calendarId=calendar_id,
                                                  timeMin=time_min,
                                                  timeMax=time_max,
                                                  singleEvents=True,
                                                  orderBy='startTime',
                                                  maxResults=max_results).execute()
        events = events_result.get('items', [])
        # normalize times to datetime
        for e in events:
            if 'start' in e and 'dateTime' in e['start']:
                e['_start_dt'] = parser.isoparse(e['start']['dateTime'])
            elif 'start' in e and 'date' in e['start']:
                e['_start_dt'] = parser.isoparse(e['start']['date']).replace(tzinfo=get_localzone())
            else:
                e['_start_dt'] = None
        return events
