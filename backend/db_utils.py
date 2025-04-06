from flask import Flask, redirect, request, session, jsonify
from models import User, Assignment, TimeBlock
from flask_cors import CORS
from datetime import datetime, timedelta
from slugify import slugify
import json
from typing import List, Dict, Any, Optional, Tuple
import os
from collections import defaultdict

app = Flask(__name__)
app.secret_key = "dev-key"

# Initialize local JSON storage
DATA_FILE = "data.json"

def load_data() -> Dict[str, Any]:
    if not os.path.exists(DATA_FILE):
        # Create file with initial structure if it doesn't exist
        new_data: Dict[str, Dict[str, Any]] = {"users": {}, "assignments": {}}
        with open(DATA_FILE, "w") as f:
            json.dump(new_data, f, indent=4)
        return new_data
    
    try:
        with open(DATA_FILE, "r") as f:
            content = f.read().strip()
            if not content:  # If file is empty
                empty_data: Dict[str, Dict[str, Any]] = {"users": {}, "assignments": {}}
                with open(DATA_FILE, "w") as f:
                    json.dump(empty_data, f, indent=4)
                return empty_data
            return json.loads(content)
    except json.JSONDecodeError:
        # If file is corrupted, reset it
        reset_data: Dict[str, Dict[str, Any]] = {"users": {}, "assignments": {}}
        with open(DATA_FILE, "w") as f:
            json.dump(reset_data, f, indent=4)
        return reset_data

def save_data(data: Dict[str, Any]) -> None:
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

FRONTEND_URL = ["http://localhost:3000", "http://127.0.0.1:3000"]
CORS(app, supports_credentials=True, origins=FRONTEND_URL)

def create_user(name: str, email: str) -> None:
    print(f"📝 Saving {name} ({email}) to local storage")
    data = load_data()
    
    # Check if user already exists
    if email in data["users"]:
        print(f"⚠️ User {email} already exists in the database")
        return
        
    data["users"][email] = {
        "name": name,
        "email": email,
        "assignments": [],
        "free_time": []
    }
    save_data(data)

def add_assignment_to_user(email: str, title: str, due: datetime) -> None:
    due_str = due.isoformat() if isinstance(due, datetime) else due
    data = load_data()
    
    if email not in data["users"]:
        return
        
    assignment = {
        "title": title,
        "due": due_str,
        "description": None
    }
    
    # Add to user's assignments
    if assignment not in data["users"][email]["assignments"]:
        data["users"][email]["assignments"].append(assignment)
    
    # Add to assignments collection
    assignment_id = slugify(f"{title}_{due_str}")
    if assignment_id not in data["assignments"]:
        data["assignments"][assignment_id] = {
            "title": title,
            "due": due_str,
            "students": [email]
        }
    elif email not in data["assignments"][assignment_id]["students"]:
        data["assignments"][assignment_id]["students"].append(email)
        
    save_data(data)

def add_free_time_to_user(email: str, start: datetime, end: datetime) -> None:
    start_str = start.isoformat() if isinstance(start, datetime) else start
    end_str = end.isoformat() if isinstance(end, datetime) else end
    
    data = load_data()
    if email not in data["users"]:
        return
        
    time_block = {
        "start": start_str,
        "end": end_str
    }
    
    if time_block not in data["users"][email]["free_time"]:
        data["users"][email]["free_time"].append(time_block)
        save_data(data)

def get_users_with_same_assignment(title: str, due: str) -> List[str]:
    if isinstance(due, datetime):
        due = due.isoformat()
    assignment_id = slugify(f"{title}_{due}")
    data = load_data()
    
    if assignment_id in data["assignments"]:
        return data["assignments"][assignment_id]["students"]
    return []

def get_overlap_minutes(start1: datetime, end1: datetime, start2: datetime, end2: datetime) -> Optional[Dict[str, Any]]:
    latest_start = max(start1, start2)
    earliest_end = min(end1, end2)

    if earliest_end > latest_start:
        return {
            "start": latest_start.isoformat(),
            "end": earliest_end.isoformat(),
            "duration_minutes": int((earliest_end - latest_start).total_seconds() // 60)
        }
    return None

def get_overlaps_between_users(email1: str, email2: str) -> List[Dict[str, Any]]:
    data = load_data()
    if email1 not in data["users"] or email2 not in data["users"]:
        return []
        
    user1_times = data["users"][email1]["free_time"]
    user2_times = data["users"][email2]["free_time"]
    
    overlaps = []
    
    for block1 in user1_times:
        try:
            start1 = datetime.fromisoformat(block1["start"])
            end1 = datetime.fromisoformat(block1["end"])
        except Exception:
            continue
            
        for block2 in user2_times:
            try:
                start2 = datetime.fromisoformat(block2["start"])
                end2 = datetime.fromisoformat(block2["end"])
            except Exception:
                continue
                
            overlap = get_overlap_minutes(start1, end1, start2, end2)
            if overlap:
                overlaps.append(overlap)
    return overlaps

def get_overlapping_users_for_assignment(email: str, title: str, due: str) -> List[str]:
    if isinstance(due, datetime):
        due = due.isoformat()
    assignment_id = slugify(f"{title}_{due}")
    data = load_data()
    
    if assignment_id not in data["assignments"]:
        return []
        
    students = data["assignments"][assignment_id]["students"]
    return [s for s in students if s != email]

def send_user(user: User) -> None:
    data = load_data()
    if user.email not in data["users"]:
        create_user(user.name, user.email)
        data = load_data()  # Reload after creating user
        
    for assignment in user.assignments:
        title = assignment["title"]
        due = assignment["due"]
        
        if not title or not due:
            continue
            
        if isinstance(due, str):
            due = datetime.fromisoformat(due)
            
        add_assignment_to_user(user.email, title, due)
        
    for time_block in user.free_time:
        start = time_block["start"]
        end = time_block["end"]
        
        if not start or not end:
            continue
            
        if isinstance(start, str):
            start = datetime.fromisoformat(start)
        if isinstance(end, str):
            end = datetime.fromisoformat(end)
            
        add_free_time_to_user(user.email, start, end)

def fetch_user_free_times_before_due(emails: List[str], due: datetime) -> List[TimeBlock]:
    due_datetime = due if isinstance(due, datetime) else datetime.fromisoformat(str(due))
    free_times = []
    data = load_data()
    
    for email in emails:
        if email not in data["users"]:
            continue
        blocks = data["users"][email]["free_time"]
        for block in blocks:
            try:
                start = datetime.fromisoformat(block["start"])
                end = datetime.fromisoformat(block["end"])
            except Exception:
                continue
                
            if end <= due_datetime:
                free_times.append(TimeBlock(start=start, end=end))
                
    return free_times

def find_largest_common_block(free_times: List[TimeBlock], group_size: int) -> Optional[Dict[str, str]]:
    if group_size < 2:
        print("Group size is less than 2, found no common time.")
        return None

    timeline = []
    for block in free_times:
        timeline.append((block["start"], "start"))
        timeline.append((block["end"], "end"))

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
                if best_start is None or (time - active_start) > (best_end - best_start if best_end is not None else timedelta(0)):
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

def get_suggestions(user: User) -> List[Dict[str, Any]]:
    suggestions = []

    for assignment in user.assignments:
        title = assignment["title"]
        due = assignment["due"]
        if isinstance(due, str):
            due = datetime.fromisoformat(due)

        overlapping_users = get_overlapping_users_for_assignment(user.email, title, due.isoformat())
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

