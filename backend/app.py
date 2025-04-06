from flask import Flask, redirect, request, session, jsonify
from oauth import get_flow, get_credentials, get_user_data
from models import User
from db_utils import get_suggestions, send_user, get_users_with_same_assignment, create_user, fetch_user_free_times_before_due
from oauth import get_user_data
from flask_cors import CORS
import json
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = "dev-key"

# Update to use HTTP for local development
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
    
    # Get user data from Google
    user = get_user_data(creds)
    send_user(user)
    
    # Redirect back to frontend with success
    return redirect(f"{FRONTEND_URL[0]}/?auth=success")

@app.route("/api/user/current", methods=["GET"])
def get_current_user():
    try:
        print("Attempting to get credentials...")
        creds = get_credentials()
        print("Got credentials, getting user data...")
        user = get_user_data(creds)
        print(f"Got user data: {user.name}, {user.email}")
        
        # Initialize empty lists for assignments and free_time if they don't exist
        assignments = []
        free_time = []
        
        # If the user object has these attributes, use them
        if hasattr(user, 'assignments'):
            assignments = [{"title": a["title"], "due": a["due"].isoformat()} for a in user.assignments]
        if hasattr(user, 'free_time'):
            free_time = [{"start": t["start"].isoformat(), "end": t["end"].isoformat()} for t in user.free_time]
        
        response_data = {
            "name": user.name,
            "email": user.email,
            "assignments": assignments,
            "free_time": free_time
        }
        print(f"Sending response: {response_data}")
        return jsonify(response_data)
    except Exception as e:
        print(f"Error in get_current_user: {str(e)}")
        return jsonify({"error": str(e)}), 401

@app.route("/api/suggestions", methods=["POST"])
def get_suggestions_endpoint():
    try:
        print("Getting suggestions...")
        creds = get_credentials()
        user = get_user_data(creds)
        print(f"Got user data for suggestions: {user.name}, {user.email}")
        
        # Initialize empty lists if they don't exist
        if not hasattr(user, 'assignments'):
            user.assignments = []
        if not hasattr(user, 'free_time'):
            user.free_time = []
            
        print(f"User assignments: {len(user.assignments)}, free time slots: {len(user.free_time)}")
        
        suggestions = get_suggestions(user)
        print(f"Generated {len(suggestions)} suggestions")
        
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        print(f"Error in get_suggestions_endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 401

@app.route("/api/user", methods=["POST"])
def create_user_endpoint():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    create_user(name, email)
    return f"✅ User {name} saved to local storage!"

@app.route("/api/user/<email>", methods=["GET"])
def get_user_endpoint(email):
    try:
        with open("data.json", "r") as f:
            data = json.load(f)
            if email in data["users"]:
                return jsonify(data["users"][email])
            return jsonify({"error": "User not found"}), 404
    except FileNotFoundError:
        return jsonify({"error": "No users found"}), 404

@app.route("/api/assignments", methods=["GET"])
def get_assignments_endpoint():
    try:
        with open("data.json", "r") as f:
            data = json.load(f)
            return jsonify(data["assignments"])
    except FileNotFoundError:
        return jsonify({"assignments": {}})

# test get users with the same assignment
@app.route('/who_is_doing')
def who_is_doing():
    title = "CS225 Assignment 2"
    due = "2025-04-07T23:59"

    try:
        students = get_users_with_same_assignment(title, due)
        return f"👥 Users doing '{title}': {students}"
    except Exception as e:
        return f"❌ Error: {str(e)}", 500

@app.route('/test_save_user')
def test_save_user():
    name = "Test User"
    email = "testuser@example.com"
    create_user(name, email)

    name = "Alice"
    email = "alice@example.com"
    create_user(name, email)

    name = "Bob"
    email = "bob@example.com"
    create_user(name, email)  
    return f"✅ User {name} saved to local storage!"

@app.route('/test_free_times_before_due')
def test_free_times_before_due():
    test_emails = [
        "alice@example.com",
        "bob@example.com",
        "charlie@example.com"
    ]
    test_due = "2025-04-08T12:00"

    try:
        result = fetch_user_free_times_before_due(test_emails, test_due)
        # Format results for display
        formatted = [f"{start.isoformat()} → {end.isoformat()}" for (start, end) in result]
        return jsonify({
            "emails": test_emails,
            "due": test_due,
            "free_times": formatted
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test_suggestions')
def test_suggestions():
    try:
        # Create a test user
        user = {
            "name": "Aaara",
            "email": "Aaara@example.com",
            "assignments": [
                { "title": "CS225 Assignment 2", "due": "2025-04-07T23:59" },
                { "title": "MATH241 Quiz", "due": "2025-04-09T12:00" }
            ],
            "free_time": [
                { "start": "2025-04-06T14:00", "end": "2025-04-06T15:00" },
                { "start": "2025-04-07T16:00", "end": "2025-04-07T17:00" },
                { "start": "2025-04-08T10:00", "end": "2025-04-08T11:00" }
            ]
        }
        
        print("sending user")
        send_user(user)
        print("sent user successful")
        
        # Run the main suggestion logic
        suggestions = get_suggestions(user)
        print("get suggestion successful")

        return jsonify({
            "user": user["email"],
            "suggestions": suggestions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)


