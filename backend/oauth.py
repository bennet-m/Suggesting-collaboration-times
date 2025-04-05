import os
from datetime import datetime
from flask import session
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

CLIENT_SECRETS_FILE = "secrets.json"
SCOPES = ["https://www.googleapis.com/auth/calendar.events.readonly", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/calendar.app.created", "https://www.googleapis.com/auth/userinfo.profile"]
REDIRECT_URI = "http://localhost:5000/oauth2callback"

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"  # Only for local dev

def get_flow():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    return flow

def get_credentials():
    return Credentials(**session["credentials"])

def fetch_calendar_events(creds):
    service = build("calendar", "v3", credentials=creds)
    now = datetime.utcnow().isoformat() + "Z"
    events_result = service.events().list(
        calendarId="primary", timeMin=now,
        maxResults=50, singleEvents=True,
        orderBy="startTime"
    ).execute()
    return events_result.get("items", [])
