from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response: str
    context_used: Optional[int] = 0