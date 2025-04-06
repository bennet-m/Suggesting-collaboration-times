from flask import Flask, redirect, request, session, jsonify
from oauth import get_flow, get_credentials, get_user_data
from models import User
from db_utils import get_suggestions, send_user, get_users_with_same_assignment, create_user, fetch_user_free_times_before_due, load_data, add_assignment_to_user, add_free_time_to_user
from oauth import get_user_data
from flask_cors import CORS
import json
from datetime import datetime
import os
from slugify import slugify

app = Flask(__name__)
app.secret_key = "dev-key"

# Update to allow both localhost and 127.0.0.1
FRONTEND_URL = ["http://localhost:3000", "http://127.0.0.1:3000"]
CORS(app, 
     supports_credentials=True, 
     origins=FRONTEND_URL,
     allow_headers=["Content-Type", "Authorization", "Accept"],
     expose_headers=["Content-Type", "Authorization"],
     allow_methods=["GET", "POST", "OPTIONS"],
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
    try:
        # Check if authenticated with Google OAuth
        if "credentials" in session:
            print("Found credentials in session, using Google OAuth")
            creds = get_credentials()
            user = get_user_data(creds)
            # Update the user data in local storage
            send_user(user)
        else:
            print("No credentials in session, falling back to email lookup")
            # Get email from query parameters
            email = request.args.get('email')
            if not email:
                return jsonify({"error": "Not authenticated and no email provided"}), 401
                
            # Try to get user from data.json
            data = load_data()
            if email not in data["users"]:
                return jsonify({"error": f"User with email {email} not found"}), 404
                
            # Get user data and convert to User object
            user_dict = data["users"][email]
            from models import User
            
            # Create user object with correct data structure
            user = User(
                name=user_dict["name"],
                email=email,
                assignments=user_dict.get("assignments", []),
                free_time=user_dict.get("free_time", [])
            )
        
        # Generate suggestions for the user
        suggestions = get_suggestions(user)
        
        return jsonify({
            "user": user.to_dict(),
            "suggestions": suggestions,
            "auth_method": "google" if "credentials" in session else "email"
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
        user_dict = {
            "name": data.get("name", ""),
            "email": data.get("email", ""),
            "assignments": data.get("assignments", []),
            "free_time": data.get("free_time", [])
        }

        # Create or update the user in the system
        send_user(user_dict)
        
        # Handle the case where user has no assignments or free time
        if not user_dict["assignments"] or not user_dict["free_time"]:
            return jsonify({"suggestions": []}), 200
            
        # Convert to User object for get_suggestions
        from models import User
        user = User.from_dict(user_dict)
            
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
        # Create a test user as a dict first
        user_dict = {
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
        send_user(user_dict)
        print("sent user successful")
        
        # Convert to User object for get_suggestions
        from models import User
        user = User.from_dict(user_dict)
        
        # Run the main suggestion logic
        suggestions = get_suggestions(user)
        print("get suggestion successful")

        return jsonify({
            "user": user.email,
            "suggestions": suggestions
        })

    except Exception as e:
        app.logger.error(f"Error in test_suggestions: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/logout")
def logout():
    """Clear the user session and log them out"""
    session.clear()
    return jsonify({"success": True, "message": "Successfully logged out"})

@app.route("/api/users", methods=["GET"])
def get_all_users():
    """Get all users in the system"""
    try:
        data = load_data()
        user_list = []
        
        # Convert user dict to list of users with their emails
        for email, user_data in data["users"].items():
            user_list.append({
                "name": user_data["name"],
                "email": email,
                # Only include high-level assignment info to keep response size small
                "assignment_count": len(user_data.get("assignments", [])),
                "free_time_count": len(user_data.get("free_time", []))
            })
            
        return jsonify({"users": user_list})
    except Exception as e:
        app.logger.error(f"Error getting all users: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/study-groups", methods=["GET"])
def get_study_groups():
    """Get study groups based on assignments with multiple students"""
    try:
        data = load_data()
        groups = []
        
        # Find assignments with multiple students and create study groups from them
        for assignment_id, assignment_data in data["assignments"].items():
            if len(assignment_data["students"]) > 1:
                # Get user names for the students
                student_names = []
                for email in assignment_data["students"]:
                    if email in data["users"]:
                        student_names.append(data["users"][email]["name"])
                
                groups.append({
                    "id": assignment_id,
                    "name": f"{assignment_data['title']} Group",
                    "assignment": assignment_data["title"],
                    "due": assignment_data["due"],
                    "members": assignment_data["students"],
                    "member_names": student_names,
                    "member_count": len(assignment_data["students"])
                })
        
        return jsonify({"groups": groups})
    except Exception as e:
        app.logger.error(f"Error getting study groups: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/assignments/all", methods=["GET"])
def get_all_assignments():
    """Get all assignments from all users"""
    try:
        data = load_data()
        assignments = []
        
        # Extract unique assignments
        assignment_dict = {}
        for assignment_id, assignment_data in data["assignments"].items():
            assignment_dict[assignment_id] = {
                "title": assignment_data["title"],
                "due": assignment_data["due"],
                "student_count": len(assignment_data["students"])
            }
        
        # Convert to list
        assignments = list(assignment_dict.values())
        
        # Sort by due date (closest first)
        assignments.sort(key=lambda x: x["due"])
        
        return jsonify({"assignments": assignments})
    except Exception as e:
        app.logger.error(f"Error getting all assignments: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/classmates/<email>", methods=["GET"])
def get_classmates(email):
    """Get users who have the same assignments as the given user"""
    try:
        data = load_data()
        classmates = {}
        
        # Ensure the user exists
        if email not in data["users"]:
            return jsonify({"error": "User not found"}), 404
        
        # Get assignments for the user
        user_assignments = data["users"][email]["assignments"]
        
        # For each assignment, find other users with the same assignment
        for assignment in user_assignments:
            title = assignment["title"]
            due = assignment["due"]
            assignment_id = slugify(f"{title}_{due}")
            
            if assignment_id in data["assignments"]:
                for student_email in data["assignments"][assignment_id]["students"]:
                    # Don't include the user themselves
                    if student_email != email:
                        # Add to classmates dict with the assignment as key
                        if student_email in data["users"]:
                            if title not in classmates:
                                classmates[title] = []
                            
                            # Only add if not already in the list
                            student_data = {
                                "name": data["users"][student_email]["name"],
                                "email": student_email
                            }
                            
                            # Check if this student is already in the list
                            if not any(c["email"] == student_email for c in classmates[title]):
                                classmates[title].append(student_data)
        
        return jsonify({"classmates": classmates})
    except Exception as e:
        app.logger.error(f"Error getting classmates: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/test_add_assignments')
def test_add_assignments():
    """Add existing assignments to other users for testing study groups"""
    try:
        data = load_data()
        assignments = []
        
        # Find assignments
        for assignment_id, assignment_data in data.get("assignments", {}).items():
            assignments.append({
                "title": assignment_data["title"],
                "due": assignment_data["due"]
            })
        
        if not assignments:
            return jsonify({"error": "No assignments found"}), 404
            
        # Add to test users
        test_users = ["alice@example.com", "bob@example.com", "testuser@example.com"]
        for email in test_users:
            if email in data["users"]:
                for assignment in assignments:
                    add_assignment_to_user(email, assignment["title"], assignment["due"])
                    
                # Also add free time slots
                user_dict = data["users"].get(email, {})
                if "free_time" not in user_dict or not user_dict["free_time"]:
                    start1 = "2025-04-06T14:00"
                    end1 = "2025-04-06T15:00"
                    start2 = "2025-04-07T16:00"
                    end2 = "2025-04-07T17:00"
                    
                    add_free_time_to_user(email, start1, end1)
                    add_free_time_to_user(email, start2, end2)
        
        return jsonify({
            "success": True,
            "message": "Assignments and free time added to test users",
            "users": test_users,
            "assignments": assignments
        })
            
    except Exception as e:
        app.logger.error(f"Error adding assignments to test users: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/add_data_to_profile')
def add_data_to_profile():
    """Add realistic assignments and free time blocks to a user profile"""
    try:
        # Get email from query parameter, or use a default if not provided
        email = request.args.get('email', 'amatheson53@students.claremontmckenna.edu')
        data = load_data()
        
        # Check if user exists
        if email not in data["users"]:
            return jsonify({"error": "User not found"}), 404
            
        # Get current user name
        name = data["users"][email]["name"]
            
        # Create realistic assignments
        assignments = [
            {
                "title": "CS 135 Final Project",
                "due": "2025-04-15T23:59:00"
            },
            {
                "title": "ECON 101 Problem Set",
                "due": "2025-04-10T12:00:00"
            },
            {
                "title": "Calculus II Midterm",
                "due": "2025-04-18T14:30:00"
            },
            {
                "title": "Chemistry Lab Report",
                "due": "2025-04-12T15:00:00"
            },
            {
                "title": "Computer Networks Assignment", 
                "due": "2025-04-20T23:59:00"
            }
        ]
        
        # Add each assignment
        for assignment in assignments:
            add_assignment_to_user(email, assignment["title"], assignment["due"])
        
        # Create free time blocks (using realistic times for a student)
        free_times = [
            # Monday
            {"start": "2025-04-08T10:00:00", "end": "2025-04-08T12:00:00"},
            {"start": "2025-04-08T15:00:00", "end": "2025-04-08T17:00:00"},
            # Tuesday
            {"start": "2025-04-09T13:00:00", "end": "2025-04-09T16:00:00"},
            # Wednesday
            {"start": "2025-04-10T09:00:00", "end": "2025-04-10T11:00:00"},
            {"start": "2025-04-10T14:00:00", "end": "2025-04-10T16:00:00"},
            # Thursday
            {"start": "2025-04-11T11:00:00", "end": "2025-04-11T13:00:00"},
            # Friday
            {"start": "2025-04-12T14:00:00", "end": "2025-04-12T18:00:00"},
            # Weekend
            {"start": "2025-04-13T10:00:00", "end": "2025-04-13T20:00:00"},
            {"start": "2025-04-14T12:00:00", "end": "2025-04-14T17:00:00"}
        ]
        
        # Add free time blocks
        for free_time in free_times:
            add_free_time_to_user(email, free_time["start"], free_time["end"])
            
        # Add these assignments to some other users as well to create study groups
        other_users = ["alice@example.com", "bob@example.com", "testuser@example.com"]
        for other_email in other_users:
            if other_email in data["users"]:
                # Give them some of the same assignments
                for assignment in assignments[:3]:  # First 3 assignments
                    add_assignment_to_user(other_email, assignment["title"], assignment["due"])
                
                # Also add some free time that overlaps with the user's free time
                for free_time in free_times[::2]:  # Every other free time slot
                    add_free_time_to_user(other_email, free_time["start"], free_time["end"])
            
        return jsonify({
            "success": True,
            "message": f"Added data to profile for {name} ({email})",
            "assignments_added": len(assignments),
            "free_time_blocks_added": len(free_times)
        })
            
    except Exception as e:
        app.logger.error(f"Error adding data to profile: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)


