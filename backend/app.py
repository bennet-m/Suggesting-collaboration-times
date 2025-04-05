from flask import Flask, redirect, request, session, jsonify
from oauth import get_flow, get_credentials, fetch_calendar_events
from flask_cors import CORS
import os

app = Flask(__name__)
app.secret_key = "dev-key"

# Update to allow both localhost and 127.0.0.1
FRONTEND_URL = ["http://localhost:3000", "http://127.0.0.1:3000"]
CORS(app, supports_credentials=True, origins=FRONTEND_URL)


@app.route("/")
def index():
    return "<a href='/login'>Login with Google</a>"

@app.route("/login")
def login():
    flow = get_flow()
    auth_url, state = flow.authorization_url(prompt='consent')
    session["state"] = state 
    return redirect(auth_url)

@app.route("/oauth2callback")
def oauth2callback():
    flow = get_flow()
    flow.fetch_token(authorization_response=request.url)

    creds = flow.credentials
    session["credentials"] = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes
    }

    return redirect(FRONTEND_URL[0])

@app.route("/calendar")
def calendar():
    try:
        if "credentials" not in session:
            return jsonify({"error": "Not authenticated"}), 403
            
        creds = get_credentials()
        events = fetch_calendar_events(creds)
        return jsonify(events)
    except Exception as e:
        app.logger.error(f"Error fetching calendar events: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Make sure to run on 127.0.0.1 not localhost to match frontend request
    app.run(debug=True, host="127.0.0.1", port=5000)
