from flask import Flask, redirect, request, session, jsonify
from oauth import get_flow, get_credentials, get_user_data
from models import User
from db_utils import get_suggestions, send_user, get_users_with_same_assignment, create_user_firestore, fetch_user_free_times_before_due
from oauth import get_user_data
from flask_cors import CORS

from firebase_admin import firestore
db = firestore.client()


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
    return main_logic()
    
def main_logic():
    creds = get_credentials()
    user = get_user_data(creds)
    send_user(user)
    suggestions = get_suggestions(user)
    return jsonify(suggestions)














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
    create_user_firestore(name, email)

    name = "Alice"
    email = "alice@example.com"
    create_user_firestore(name, email)

    name = "Bob"
    email = "bob@example.com"
    create_user_firestore(name, email)  
    return f"✅ User {name} saved to Firestore!"


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
        # Get Alice's user document
        doc = db.collection("users").document("alice@example.com").get()
        if not doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = doc.to_dict()

        # Assuming you have a basic User class like this:
        user = User(
            name="Aaara",
            email="Aaara@example.com",
            assignments=[
                { "title": "CS225 Assignment 2", "due": "2025-04-07T23:59" },
                { "title": "MATH241 Quiz", "due": "2025-04-09T12:00" }
            ],
            free_time= [("2025-04-06T14:00", "2025-04-06T15:00"), ("2025-04-07T16:00",  "2025-04-07T17:00"), ("2025-04-08T10:00", "2025-04-08T11:00")
            ]
        )
        
        print("sending user")
        send_user(user) #issue is this line
        print("sent user successful")
        # Run the main suggestion logic
        suggestions = get_suggestions(user)
        print("get suggestion successful")

        return jsonify({
            "user": user.email,
            "suggestions": suggestions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)


