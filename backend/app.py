from flask import Flask, redirect, request, session, jsonify
from oauth import get_flow, get_credentials, get_user_data, fetch_calendar_events
from models import User
from flask_cors import CORS

import firebase_admin
from firebase_admin import credentials, firestore

from slugify import slugify

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
    import json
    creds = get_credentials()
    user = get_user_data(creds)
    return json.dumps(user.to_dict())

if __name__ == "__main__":
    # Make sure to run on 127.0.0.1 not localhost to match frontend request
    app.run(debug=True, host="127.0.0.1", port=5000)


cred = credentials.Certificate("/Users/marilynma/Desktop/CS/Projects/Suggesting-collaboration-times/firebase-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
print("✅ Firebase initialized and Firestore client ready!")

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

# create_user_firebase
def create_user_firestore(name, email):
    print(f"📝 Saving {name} ({email}) to Firestore")
    
    db.collection("users").document(email).set({
        "name": name,
        "email": email,
        "assignments": [],
        "free_time": []
    }, merge=True)


# test create_user_firebase
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

# add assignments to specific user in firebase
def add_assignment_to_user(email, title, due):
    assignment = { "title": title, "due": due }

    # 1. Add to user profile 
    db.collection("users").document(email).update({
        # firestore.ArrayUnion([assignment]) adds assignment to the list without overwriting existing ones
        # Prevents duplicates (based on deep equality). Ensures other assignments remain intact.
        "assignments": firestore.ArrayUnion([assignment])
    })

    # 2. Create a unique key to identify the assignment
    assignment_id = slugify(f"{title}_{due}")
    print("Generated assignment_id:", assignment_id)  # 👈 check what this returns


    # 3. Update shared collection
    db.collection("assignments").document(assignment_id).set({
        "title": title,
        "due": due,
        "students": firestore.ArrayUnion([email])
    }, merge=True)


# add free_time to specific user in firebase
def add_free_time_to_user(email, start, end):
    # Normalize time to ISO 8601 (optional but safe)
    start_iso = datetime.fromisoformat(start).isoformat()
    end_iso = datetime.fromisoformat(end).isoformat()

    free_time_entry = { "start": start_iso, "end": end_iso }

    # 1. Update user profile 
    db.collection("users").document(email).update({
        "free_time": firestore.ArrayUnion([free_time_entry])
    })

# testing how to add assignment + freetime
@app.route('/test_add_assignment')
def test_add_assignment():
    test_email = "alice@example.com"
    test_email2 = "bob@example.com"
    test_email3 = "testuser@example.com"

    # Test assignment
    test_title = "MATH241 Homework 3"
    test_due = "2025-04-10T23:59"

    # Test free time
    free_start = "2025-04-06T14:00"
    free_end = "2025-04-10T23:59"

    # Test free time
    free_start3 = "2025-04-06T13:00"
    free_end3 = "2025-04-06T15:00"

    try:
        add_assignment_to_user(test_email, test_title, test_due)
        add_free_time_to_user(test_email, free_start, free_end)

        add_assignment_to_user(test_email2, test_title, test_due)
        add_free_time_to_user(test_email2, free_start, free_end)

        add_assignment_to_user(test_email3, test_title, test_due)
        add_free_time_to_user(test_email3, free_start3, free_end3)

        return (
            f"✅ Assignment and free time "
        )
    except Exception as e:
        return f"❌ Failed to add assignment or free time: {str(e)}", 500

# function that access the information stored in assignment in firebase, returning a list of students
def get_users_with_same_assignment(title, due):
    assignment_id = f"{title}_{due}"
    doc = db.collection("assignments").document(assignment_id).get()
    print(doc)
    
    if doc.exists:
        print ("exists!!!")
        data = doc.to_dict()
        return data.get("students", [])
    else:
        print ("notfound!!!")
        return []

# test get users with the same assignment
@app.route('/who_is_doing')
def who_is_doing():
    title = "MATH241 Homework 3"
    due = "2025-04-10T23:59"

    try:
        students = get_users_with_same_assignment(title, due)
        return f"👥 Users doing '{title}': {students}"
    except Exception as e:
        return f"❌ Error: {str(e)}", 500


# time

from datetime import datetime

# find overlap between two blocks
def get_overlap_minutes(start1_str, end1_str, start2_str, end2_str):
    # Convert to datetime
    start1 = datetime.fromisoformat(start1_str)
    end1 = datetime.fromisoformat(end1_str)
    start2 = datetime.fromisoformat(start2_str)
    end2 = datetime.fromisoformat(end2_str)

    # Find latest start and earliest end
    latest_start = max(start1, start2)
    earliest_end = min(end1, end2)

    # Calculate overlap in seconds
    if earliest_end > latest_start:
        return {
            "start": latest_start.isoformat(),
            "end": earliest_end.isoformat(),
            "duration_minutes": int((earliest_end - latest_start).total_seconds() // 60)
        }
    return None

# find overlap between two users
def get_overlaps_between_users(email1, email2):
    # Fetch user documents
    user1_doc = db.collection("users").document(email1).get()
    user2_doc = db.collection("users").document(email2).get()

    # If either user does not exist, return 0
    if not user1_doc.exists or not user2_doc.exists:
        return []

    # Extract free time blocks from each user
    user1_times = user1_doc.to_dict().get("free_time", [])
    user2_times = user2_doc.to_dict().get("free_time", [])

    overlaps = []

    # Compare all combinations of free time blocks
    for block1 in user1_times:
        start1 = block1.get("start")
        end1 = block1.get("end")
        if not start1 or not end1:
            continue

        for block2 in user2_times:
            start2 = block2.get("start")
            end2 = block2.get("end")
            if not start2 or not end2:
                continue

            overlap = get_overlap_minutes(start1, end1, start2, end2)
            if overlap:
                overlaps.append(overlap)
    return overlaps

#testing overlaps between two people
@app.route('/all_overlaps')
def test_all_overlaps():
    email1 = "alice@example.com"
    email2 = "bob@example.com"
    overlaps = get_overlaps_between_users(email1, email2)
    return {"overlaps": overlaps}

from slugify import slugify


#testing overlapping users for this assignment
def get_overlapping_users_for_assignment(email, title, due, min_overlap_minutes=30):
    assignment_id = slugify(f"{title}_{due}")

    # Step 1: Get users doing the same assignment
    assignment_doc = db.collection("assignments").document(assignment_id).get()
    if not assignment_doc.exists:
        return []

    students = assignment_doc.to_dict().get("students", [])
    students = [s for s in students if s != email]  # exclude self

    matches = []

    # Step 2: Compare with each user doing the assignment
    for other_email in students:
        overlaps = get_overlaps_between_users(email, other_email)

        # Step 3: Filter by minimum overlap time
    for o in overlaps:
        minutes = o.get("overlap_minutes", 0)
        if minutes >= min_overlap_minutes:
            matches.append({
                "email": other_email,
                "overlap_start": o["overlap_start"],
                "overlap_end": o["overlap_end"],
                "overlap_minutes": minutes
            })
    return matches
from flask import jsonify

@app.route('/test_overlap_results')
def test_overlap_results():
    email = "alice@example.com"
    title = "MATH241 Homework 3"
    due = "2025-04-10T23:59"
    min_overlap_minutes = 30

    try:
        results = get_overlapping_users_for_assignment(
            email, title, due, min_overlap_minutes
        )
        return jsonify({
            "user": email,
            "assignment": title,
            "due": due,
            "matches": results
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# function on a specific user, find other users with same and assignment



# max overlapping interval for free time!! (largest time where everyone is free)

# delete all the events before today


#go through each assigment and go through database and get other users with same assignment


if __name__ == "__main__":
    app.run(debug=True)
