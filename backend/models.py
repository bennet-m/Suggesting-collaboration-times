from datetime import datetime

class User:
    def __init__(self, name, email, assignments=None, free_time=None):
        self.name = name
        self.email = email
        self.assignments = assignments or []
        self.free_time = free_time or []

    def to_dict(self):
        def serialize_time(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            return obj

        def normalize_free_time(f):
            # If it's a tuple, convert it to dict
            if isinstance(f, tuple) and len(f) == 2:
                return {"start": f[0], "end": f[1]}
            return f

        return {
            "name": self.name,
            "email": self.email,
            "assignments": [
                {"title": a.get("title", a.get("summary")), "due": serialize_time(a.get("due", a.get("end")))}
                for a in self.assignments
            ],
            "free_time": [
                {
                    "start": serialize_time(normalize_free_time(f)["start"]),
                    "end": serialize_time(normalize_free_time(f)["end"])
                } for f in self.free_time
            ]
        }
    def __repr__(self):
        return str(self.to_dict())

    def to_json(self):
        import json
        return json.dumps(self.to_dict())

    def add_assignment(self, title, due):
        self.assignments.append({
            "title": title,
            "due": due
        })

    def add_free_time(self, start, end):
        self.free_time.append({
            "start": start,
            "end": end
        })

    def set_free_time_from_blocks(self, blocks):
        """Converts list of (start, end) tuples into free_time dicts."""
        self.free_time = [{"start": start, "end": end} for start, end in blocks]
