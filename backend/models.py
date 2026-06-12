from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class Feedback(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    input_text: str
    sentiment: str
    confidence: float
    created_at: datetime = Field(default_factory=datetime.now)
