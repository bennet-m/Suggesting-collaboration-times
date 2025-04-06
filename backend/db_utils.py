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

def parse_datetime(datetime_str):
    """Parse ISO 8601 datetime strings, handling 'Z' timezone indicator."""
    # Replace 'Z' with '+00:00' for UTC timezone
    if datetime_str.endswith('Z'):
        datetime_str = datetime_str[:-1] + '+00:00'
    
    # Now parse with fromisoformat which can handle +00:00 format
    return datetime.fromisoformat(datetime_str)

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
    """Create a new user or update an existing one."""
    if not email or not name:
        print("⚠️ Both name and email are required")
        return
        
    print(f"📝 Saving {name} ({email}) to local storage")
    try:
        data = load_data()
        
        # Check if user already exists and update name if needed
        if email in data["users"]:
            # Update name if changed
            if data["users"][email]["name"] != name:
                data["users"][email]["name"] = name
                print(f"✅ Updated name for user {email}")
            else:
                print(f"⚠️ User {email} already exists in the database")
            save_data(data)
            return
            
        # Create new user
        data["users"][email] = {
            "name": name,
            "email": email,
            "assignments": [],
            "free_time": []
        }
        save_data(data)
        print(f"✅ Created new user {name} ({email})")
    except Exception as e:
        print(f"❌ Error creating/updating user: {str(e)}")
        raise

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
            start1 = parse_datetime(block1["start"])
            end1 = parse_datetime(block1["end"])
        except Exception:
            continue
            
        for block2 in user2_times:
            try:
                start2 = parse_datetime(block2["start"])
                end2 = parse_datetime(block2["end"])
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
    """Send user data to storage, handling both User objects and dictionaries."""
    try:
        # Handle if user is a dictionary
        if isinstance(user, dict):
            email = user.get("email")
            name = user.get("name")
            assignments = user.get("assignments", [])
            free_time = user.get("free_time", [])
        else:
            # Handle if user is a User object
            email = user.email
            name = user.name
            assignments = user.assignments
            free_time = user.free_time
            
        if not email or not name:
            print("⚠️ Cannot send user: Missing email or name")
            return
            
        # Create or update the user
        create_user(name, email)
        data = load_data()  # Reload after creating user
        
        # Process assignments
        for assignment in assignments:
            if isinstance(assignment, dict):
                title = assignment.get("title")
                due = assignment.get("due")
                
                if not title or not due:
                    continue
                    
                if isinstance(due, str):
                    try:
                        due = parse_datetime(due)
                    except ValueError:
                        print(f"⚠️ Invalid date format for due date: {due}")
                        continue
                    
                add_assignment_to_user(email, title, due)
                
        # Process free time blocks
        for time_block in free_time:
            if isinstance(time_block, dict):
                start = time_block.get("start")
                end = time_block.get("end")
                
                if not start or not end:
                    continue
                    
                if isinstance(start, str):
                    try:
                        start = parse_datetime(start)
                    except ValueError:
                        print(f"⚠️ Invalid date format for start time: {start}")
                        continue
                        
                if isinstance(end, str):
                    try:
                        end = parse_datetime(end)
                    except ValueError:
                        print(f"⚠️ Invalid date format for end time: {end}")
                        continue
                        
                add_free_time_to_user(email, start, end)
                
        print(f"✅ Successfully processed user data for {name} ({email})")
    except Exception as e:
        print(f"❌ Error in send_user: {str(e)}")
        raise

def fetch_user_free_times_before_due(emails: List[str], due: datetime) -> List[TimeBlock]:
    due_datetime = due if isinstance(due, datetime) else parse_datetime(str(due))
    free_times = []
    data = load_data()
    
    for email in emails:
        if email not in data["users"]:
            continue
        blocks = data["users"][email]["free_time"]
        for block in blocks:
            try:
                start = parse_datetime(block["start"])
                end = parse_datetime(block["end"])
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
            due = parse_datetime(due)

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

