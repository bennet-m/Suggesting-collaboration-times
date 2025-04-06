from datetime import datetime
from typing import List, Optional, Dict, Any, TypedDict
from dataclasses import dataclass, field

def parse_datetime(datetime_str):
    """Parse ISO 8601 datetime strings, handling 'Z' timezone indicator."""
    # Replace 'Z' with '+00:00' for UTC timezone
    if datetime_str.endswith('Z'):
        datetime_str = datetime_str[:-1] + '+00:00'
    
    # Now parse with fromisoformat which can handle +00:00 format
    return datetime.fromisoformat(datetime_str)

class TimeBlock(TypedDict):
    start: datetime
    end: datetime

class Assignment(TypedDict):
    title: str
    due: datetime
    description: Optional[str]

@dataclass
class User:
    name: str
    email: str
    assignments: List[Assignment] = field(default_factory=list)
    free_time: List[TimeBlock] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert the User object to a dictionary for serialization."""
        return {
            "name": self.name,
            "email": self.email,
            "assignments": [
                {
                    "title": a["title"],
                    "due": a["due"].isoformat(),
                    "description": a.get("description")
                }
                for a in self.assignments
            ],
            "free_time": [
                {
                    "start": block["start"].isoformat(),
                    "end": block["end"].isoformat()
                }
                for block in self.free_time
            ]
        }

    def to_json(self) -> str:
        """Convert the User object to a JSON string."""
        import json
        return json.dumps(self.to_dict())

    def add_assignment(self, title: str, due: datetime, description: Optional[str] = None) -> None:
        """Add a new assignment to the user's list of assignments."""
        assignment: Assignment = {
            "title": title,
            "due": due,
            "description": description
        }
        self.assignments.append(assignment)

    def add_free_time(self, start: datetime, end: datetime) -> None:
        """Add a new free time block to the user's list of free times."""
        time_block: TimeBlock = {
            "start": start,
            "end": end
        }
        self.free_time.append(time_block)

    def set_free_time_from_blocks(self, blocks: List[tuple[datetime, datetime]]) -> None:
        """Convert list of (start, end) tuples into free_time blocks."""
        self.free_time = [
            TimeBlock(start=start, end=end)
            for start, end in blocks
        ]

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """Create a User object from a dictionary."""
        assignments: List[Assignment] = [
            Assignment(
                title=a["title"],
                due=parse_datetime(a["due"]),
                description=a.get("description")
            )
            for a in data.get("assignments", [])
        ]
        
        free_time: List[TimeBlock] = [
            TimeBlock(
                start=parse_datetime(block["start"]),
                end=parse_datetime(block["end"])
            )
            for block in data.get("free_time", [])
        ]
        
        return cls(
            name=data["name"],
            email=data["email"],
            assignments=assignments,
            free_time=free_time
        )
