from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class InsightsQuery:
    id: Optional[int]
    user_id: Optional[int]
    prompt: str
    response: Optional[str]
    created_at: Optional[datetime]

    def __post_init__(self):
        if not self.prompt or len(self.prompt.strip()) == 0:
            raise ValueError("prompt required")

    @classmethod
    def from_db(cls, row: dict):
        return cls(
            id=row.get('id'),
            user_id=row.get('user_id'),
            prompt=row.get('prompt'),
            response=row.get('response'),
            created_at=row.get('created_at'),
        )
