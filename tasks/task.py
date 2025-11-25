from dataclasses import dataclass, asdict
from typing import Optional
from datetime import datetime

@dataclass
class Task:
    title: str
    description: str = ""
    priority: str = "Medium"
    deadline: Optional[str] = None
    status: str = "Pending"
    id: Optional[int] = None

    def to_dict(self):
        return asdict(self)

    @classmethod
    def from_dict(cls, data):
        return cls(**data)

    def __str__(self):
        return f"[{self.id}] {self.title} ({self.priority}) - {self.status} | Due: {self.deadline or 'None'}"
