from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    text: str


class AnalyzeResponse(BaseModel):
    id: int
    input_text: str
    sentiment: str
    confidence: float
    created_at: str
