from flask import Flask, redirect, request, session, jsonify
from oauth import get_flow, get_credentials, fetch_calendar_events

app = Flask(__name__)
app.secret_key = "dev-key"  

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

    return redirect("/calendar")

@app.route("/calendar")
def calendar():
    creds = get_credentials()
    events = fetch_calendar_events(creds)
    return jsonify(events)

if __name__ == "__main__":
    app.run(debug=True)
