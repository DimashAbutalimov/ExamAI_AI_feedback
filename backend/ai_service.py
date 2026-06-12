from transformers import pipeline

# Load model once at startup (not on every request)
_sentiment_pipeline = None


def get_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        _sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest"
        )
    return _sentiment_pipeline


def analyze_sentiment(text: str) -> dict:
    """
    Analyze sentiment of text using cardiffnlp/twitter-roberta-base-sentiment-latest.
    Returns normalized label (positive/neutral/negative) and confidence score.
    """
    try:
        pipe = get_pipeline()
        result = pipe(text, truncation=True, max_length=512)[0]

        # Normalize label to lowercase
        label = result["label"].lower()

        # Some models return LABEL_0/LABEL_1/LABEL_2 — map them
        label_map = {
            "label_0": "negative",
            "label_1": "neutral",
            "label_2": "positive",
            "negative": "negative",
            "neutral": "neutral",
            "positive": "positive",
        }
        normalized = label_map.get(label, label)

        return {
            "sentiment": normalized,
            "confidence": round(float(result["score"]), 4)
        }
    except Exception as e:
        raise RuntimeError(f"AI model error: {str(e)}")
