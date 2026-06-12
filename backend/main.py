from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from ai_service import analyze_sentiment
from schemas import AnalyzeRequest
from database import create_db_and_tables, get_session
from models import Feedback

app = FastAPI(title="AI Review Analyzer API", version="1.0.0")

# Allow all origins in dev (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def home():
    return {"message": "AI Review Analyzer API is running ✅"}


# POST /analyze — принимает текст, запускает AI, сохраняет результат
@app.post("/analyze")
def analyze_feedback(
    data: AnalyzeRequest,
    session: Session = Depends(get_session)
):
    text = data.text.strip()

    # Валидация: пустой текст
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if len(text) > 5000:
        raise HTTPException(status_code=400, detail="Text is too long (max 5000 characters)")

    # AI-анализ
    try:
        ai_result = analyze_sentiment(text)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Сохранение в БД
    feedback = Feedback(
        input_text=text,
        sentiment=ai_result["sentiment"],
        confidence=ai_result["confidence"]
    )
    session.add(feedback)
    session.commit()
    session.refresh(feedback)

    return {
        "id": feedback.id,
        "input_text": feedback.input_text,
        "sentiment": feedback.sentiment,
        "confidence": feedback.confidence,
        "created_at": feedback.created_at.isoformat()
    }


# GET /results — история всех анализов
@app.get("/results")
def get_results(session: Session = Depends(get_session)):
    statement = select(Feedback).order_by(Feedback.id.desc())
    feedbacks = session.exec(statement).all()
    return [
        {
            "id": f.id,
            "input_text": f.input_text,
            "sentiment": f.sentiment,
            "confidence": f.confidence,
            "created_at": f.created_at.isoformat()
        }
        for f in feedbacks
    ]


# GET /stats — статистика по тональности
@app.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    feedbacks = session.exec(select(Feedback)).all()

    stats = {"positive": 0, "neutral": 0, "negative": 0, "total": len(feedbacks)}
    for f in feedbacks:
        if f.sentiment in stats:
            stats[f.sentiment] += 1

    return stats


# DELETE /results/{id} — удаление записи
@app.delete("/results/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    session: Session = Depends(get_session)
):
    feedback = session.get(Feedback, feedback_id)
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")

    session.delete(feedback)
    session.commit()
    return {"message": f"Feedback #{feedback_id} deleted"}
