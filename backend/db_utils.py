from flask import Flask, redirect, request, session, jsonify
from models import User
from flask_cors import CORS
from datetime import datetime
from slugify import slugify
import json

import firebase_admin
from firebase_admin import credentials, firestore
from collections import defaultdict

app = Flask(__name__)
app.secret_key = "dev-key"

cred = credentials.Certificate("../firebase-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
print("✅ Firebase initialized and Firestore client ready!")

FRONTEND_URL = ["http://localhost:3000", "http://127.0.0.1:3000"]
CORS(app, supports_credentials=True, origins=FRONTEND_URL)

# create_user_firebase
def create_user_firestore(name, email):
    print(f"📝 Saving {name} ({email}) to Firestore")
    
    db.collection("users").document(email).set({
        "name": name,
        "email": email,
        "assignments": [],
        "free_time": []
    }, merge=True)

# add assignments to specific user in firebase
def add_assignment_to_user(email, title, due):
    if isinstance(due, datetime):
        due = due.isoformat()

    assignment = { "title": title, "due": due }

    db.collection("users").document(email).update({
        "assignments": firestore.ArrayUnion([assignment])
    })

    assignment_id = slugify(f"{title}_{due}")
    print("Generated assignment_id:", assignment_id)

    db.collection("assignments").document(assignment_id).set({
        "title": title,
        "due": due,
        "students": firestore.ArrayUnion([email])
    }, merge=True)

# add free_time to specific user in firebase
def add_free_time_to_user(email, start, end):
    if isinstance(start, datetime):
        start = start.isoformat()
    if isinstance(end, datetime):
        end = end.isoformat()

    free_time_entry = { "start": start, "end": end }

    db.collection("users").document(email).update({
        "free_time": firestore.ArrayUnion([free_time_entry])
    })

# get list of students doing same assignment
def get_users_with_same_assignment(title, due):
    if isinstance(due, datetime):
        due = due.isoformat()
    assignment_id = slugify(f"{title}_{due}")
    doc = db.collection("assignments").document(assignment_id).get()

    if doc.exists:
        print("exists!!!")
        data = doc.to_dict()
        return data.get("students", [])
    else:
        print("notfound!!!")
        return []

# find overlap between two blocks
def get_overlap_minutes(start1, end1, start2, end2):
    latest_start = max(start1, start2)
    earliest_end = min(end1, end2)

    if earliest_end > latest_start:
        return {
            "start": latest_start.isoformat(),
            "end": earliest_end.isoformat(),
            "duration_minutes": int((earliest_end - latest_start).total_seconds() // 60)
        }
    return None

# find overlap between two users
def get_overlaps_between_users(email1, email2):
    user1_doc = db.collection("users").document(email1).get()
    user2_doc = db.collection("users").document(email2).get()

    if not user1_doc.exists or not user2_doc.exists:
        return []

    user1_times = user1_doc.to_dict().get("free_time", [])
    user2_times = user2_doc.to_dict().get("free_time", [])

    overlaps = []

    for block1 in user1_times:
        try:
            start1 = datetime.fromisoformat(block1.get("start"))
            end1 = datetime.fromisoformat(block1.get("end"))
        except Exception:
            continue

        for block2 in user2_times:
            try:
                start2 = datetime.fromisoformat(block2.get("start"))
                end2 = datetime.fromisoformat(block2.get("end"))
            except Exception:
                continue

            overlap = get_overlap_minutes(start1, end1, start2, end2)
            if overlap:
                overlaps.append(overlap)
    return overlaps

# list other students working on same assignment
def get_overlapping_users_for_assignment(email, title, due):
    if isinstance(due, datetime):
        due = due.isoformat()
    assignment_id = slugify(f"{title}_{due}")

    assignment_doc = db.collection("assignments").document(assignment_id).get()
    if not assignment_doc.exists:
        return []

    students = assignment_doc.to_dict().get("students", [])
    print(students)
    return [s for s in students if s != email]

# sync user object with Firestore
def send_user(user: User):
    user_doc = db.collection("users").document(user.email).get()
    
    if not user_doc.exists:
        create_user_firestore(user.name, user.email)
    
    for assignment in user.assignments:
        title = assignment.get("title") or assignment.get("summary")
        due = assignment.get("due") or assignment.get("end")

        if not title or not due:
            continue  # skip invalid assignments

        if isinstance(due, str):
            due = datetime.fromisoformat(due)

        add_assignment_to_user(user.email, title, due)
    
    for block in user.free_time: #changed this to account for every free
        start = block.get("start")
        end = block.get("end")

        if not start or not end:
            continue  # skip bad blocks

        # Convert to datetime if needed
        if isinstance(start, str):
            start = datetime.fromisoformat(start)
        if isinstance(end, str):
            end = datetime.fromisoformat(end)

        add_free_time_to_user(user.email, start, end)

# get all free times before an assignment due date
def fetch_user_free_times_before_due(emails, due):
    due_datetime = due if isinstance(due, datetime) else datetime.fromisoformat(str(due))
    free_times = []

    for email in emails:
        doc = db.collection("users").document(email).get()
        if not doc.exists:
            continue
        blocks = doc.to_dict().get("free_time", [])
        for block in blocks:
            try:
                start = datetime.fromisoformat(block["start"])
                end = datetime.fromisoformat(block["end"])
            except Exception:
                continue

            if end <= due_datetime:
                free_times.append((start, end))

    return free_times

# find best overlapping time among group
def find_largest_common_block(free_times, group_size):
    timeline = []
    if group_size < 2:
        print("Group size is less than 2, found no common time.")
        return None

    for start, end in free_times:
        timeline.append((start, "start"))
        timeline.append((end, "end"))

    timeline.sort()
    current_overlap = 0
    best_start = None
    best_end = None
    active_start = None

    for time, event in timeline:
        if event == "start":
            current_overlap += 1
            if current_overlap == group_size:
                active_start = time
        elif event == "end":
            if current_overlap == group_size and active_start:
                if best_start is None or (time - active_start) > (best_end - best_start):
                    best_start = active_start
                    best_end = time
                active_start = None
            current_overlap -= 1

    if best_start and best_end:
        return {
            "start": best_start.isoformat(),
            "end": best_end.isoformat(),
        }

    return find_largest_common_block(free_times, group_size - 1)

# main suggestion logic
def get_suggestions(user: User):
    suggestions = []

    for assignment in user.assignments:
        title = assignment.get("title")
        due = assignment.get("due")
        if isinstance(due, str):
            due = datetime.fromisoformat(due)

        overlapping_users = get_overlapping_users_for_assignment(user.email, title, due)
        print("Overlapping users:", overlapping_users, title)
        if not overlapping_users:
            continue
        all_emails = [user.email] + overlapping_users

        all_free_times = fetch_user_free_times_before_due(all_emails, due)

        best_block = find_largest_common_block(all_free_times, len(all_emails))
        print("Best block:", best_block)
        if best_block:
            suggestions.append({
                "assignment": title,
                "due": due.isoformat(),
                "start": best_block["start"],
                "end": best_block["end"],
            })

    return suggestions



""" # Load users from JSON and upload using your existing helper functions
def upload_users_from_json(filepath):
    with open(filepath, "r") as f:
        data = json.load(f)

    for user in data["users"]:
        name = user["name"]
        email = user["email"]
        assignments = user.get("assignments", [])
        free_times = user.get("free_time", [])

        create_user_firestore(name, email)

        for assignment in assignments:
            add_assignment_to_user(email, assignment["title"], assignment["due"])

        for block in free_times:
            add_free_time_to_user(email, block["start"], block["end"])

    print("✅ All users uploaded successfully!")

upload_users_from_json("./db/users.json") """

