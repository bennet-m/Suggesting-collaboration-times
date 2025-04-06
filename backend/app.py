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

# Update to allow both localhost and 127.0.0.1
FRONTEND_URL = ["http://localhost:3000", "http://127.0.0.1:3000"]
CORS(app, 
     supports_credentials=True, 
     origins=FRONTEND_URL,
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type", "Authorization"],
     max_age=1800  # 30 minutes in seconds
)

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
    
    # Process the user data
    user = process_authentication()
    
    # Prepare additional information about what was found
    has_assignments = len(user.assignments) > 0
    has_free_time = len(user.free_time) > 0
    
    # Redirect back to frontend with user info
    frontend_url = FRONTEND_URL[0]  # Use the first URL in the list
    redirect_url = (
        f"{frontend_url}?auth=success"
        f"&name={user.name}"
        f"&email={user.email}"
        f"&has_assignments={str(has_assignments).lower()}"
        f"&has_free_time={str(has_free_time).lower()}"
    )
    return redirect(redirect_url)
    
def process_authentication():
    """Process authentication and return user data"""
    creds = get_credentials()
    user = get_user_data(creds)
    send_user(user)
    return user

@app.route("/api/current-user")
def get_current_user():
    """Get current authenticated user's data"""
    if "credentials" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    try:
        creds = get_credentials()
        user = get_user_data(creds)
        suggestions = get_suggestions(user)
        return jsonify({
            "user": user.to_dict(),
            "suggestions": suggestions
        })
    except Exception as e:
        app.logger.error(f"Error getting current user: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/suggestions", methods=["POST"])
def get_suggestions_endpoint():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        user = {
            "name": data.get("name", ""),
            "email": data.get("email", ""),
            "assignments": data.get("assignments", []),
            "free_time": data.get("free_time", [])
        }

        # Create or update the user in the system
        send_user(user)
        
        # Handle the case where user has no assignments or free time
        if not user["assignments"] or not user["free_time"]:
            return jsonify({"suggestions": []}), 200
            
        suggestions = get_suggestions(user)
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        app.logger.error(f"Error generating suggestions: {str(e)}")
        return jsonify({"error": str(e), "suggestions": []}), 500

@app.route("/api/user", methods=["POST"])
def create_user_endpoint():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    try:
        create_user(name, email)
        return jsonify({"success": True, "message": f"User {name} saved successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error creating user: {str(e)}")
        return jsonify({"error": str(e)}), 500

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

@app.route("/logout")
def logout():
    """Clear the user session and log them out"""
    session.clear()
    return jsonify({"success": True, "message": "Successfully logged out"})

if __name__ == "__main__":
    app.run(debug=True)


