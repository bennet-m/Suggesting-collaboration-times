import os
from datetime import datetime, timedelta, time, timezone
from flask import session
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import pickle
from models import User

CLIENT_SECRETS_FILE = "secrets.json"
SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/calendar.app.created",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid"
]
REDIRECT_URI = "http://127.0.0.1:5000/oauth2callback"

KEYWORDS = ["homework", "assignment", "due", "project", "exam", "test"]

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

def get_flow():
    return Flow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI)


def get_credentials():
    creds = None
    # Try to load from token.pickle (your cached creds)
    if os.path.exists("token.pickle"):
        with open("token.pickle", "rb") as token:
            creds = pickle.load(token)

    # If no valid creds, use session
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        elif "credentials" in session:
            creds = Credentials(**session["credentials"])
        else:
            raise Exception("No valid credentials found")

        # Save back to token.pickle
        with open("token.pickle", "wb") as token:
            pickle.dump(creds, token)

    return creds

def get_user_data(creds):
    service = build("calendar", "v3", credentials=creds)
    now = datetime.now(timezone.utc)

    # Define time range
    time_min = now
    time_max = now + timedelta(weeks=2)

    # Convert to ISO 8601 format with a 'Z' suffix
    time_min_str = time_min.isoformat()
    time_max_str = time_max.isoformat()

    events = []
    for cal in service.calendarList().list().execute().get("items", []):
        events += service.events().list(
            calendarId=cal["id"],
            timeMin=time_min_str,
            timeMax=time_max_str,
            maxResults=250,
            singleEvents=True,
            orderBy="startTime"
        ).execute().get("items", [])

    busy_times = []
    assignments = []
    for e in events:
        if any(e["summary"] == assignment["summary"] and e["end"] == assignment["end"] for assignment in assignments):
            continue
        if "start" not in e or "dateTime" not in e["start"]:
            continue
        start = datetime.fromisoformat(e["start"]["dateTime"])
        end = datetime.fromisoformat(e["end"]["dateTime"])
        busy_times.append((start, end))
        
        text = (e.get("summary", "") + " " + e.get("description", "")).lower()
        if any(k in text for k in KEYWORDS):
            assignments.append(e)

    busy_times = merge_intervals(sorted(busy_times))
    free_blocks = get_free_blocks(busy_times, time_min, time_max)
    userInfo = get_user_info(creds)
    user = User(userInfo[0], userInfo[1], assignments, free_blocks)
    return user

def get_user_info(creds):
    import requests
    import json 
    # Define the UserInfo endpoint URL
    userinfo_url = 'https://openidconnect.googleapis.com/v1/userinfo'

    # Prepare the headers with the access token
    headers = {
    'Authorization': f'Bearer {creds.token}'
    }

    # Make the GET request to the UserInfo endpoint
    response = requests.get(userinfo_url, headers=headers).content

    print(response)
    # print(response.json())
    decoded_response = response.decode('utf-8')

    # Step 2: Parse the JSON string into a dictionary
    parsed_response = json.loads(decoded_response)

    # Step 3: Access members
    name = parsed_response['name']
    email = parsed_response['email']

    return name, email

def merge_intervals(intervals):
    merged = []
    for start, end in intervals:
        if not merged or start > merged[-1][1]:
            merged.append((start, end))
        else:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
    return merged

def get_free_blocks(busy_times, start_time, end_time):
    free_blocks = []
    current = start_time
    while current < end_time:
        day_start = datetime.combine(current.date(), time(8, 0), tzinfo=current.tzinfo)
        day_end = datetime.combine(current.date(), time(23, 59), tzinfo=current.tzinfo)
        cursor = day_start

        for b_start, b_end in busy_times:
            if b_end <= day_start or b_start >= day_end:
                continue
            if b_start > cursor:
                free_blocks.append((cursor, min(b_start, day_end)))
            cursor = max(cursor, b_end)

        if cursor < day_end:
            free_blocks.append((cursor, day_end))

        current += timedelta(days=1)
    return free_blocks
