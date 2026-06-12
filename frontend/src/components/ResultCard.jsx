const SENTIMENT_CONFIG = {
  positive: { emoji: "😊", color: "#22c55e", label: "Positive" },
  neutral:  { emoji: "😐", color: "#f59e0b", label: "Neutral"  },
  negative: { emoji: "😞", color: "#ef4444", label: "Negative" },
};

export default function ResultCard({ result }) {
  const config = SENTIMENT_CONFIG[result.sentiment] || SENTIMENT_CONFIG.neutral;
  const pct = Math.round(result.confidence * 100);

  return (
    <div className="card result-card" style={{ borderLeft: `4px solid ${config.color}` }}>
      <h2>✅ Analysis Result</h2>

      <div className="result-text">
        <span className="label">Text:</span>
        <p className="input-text">"{result.input_text}"</p>
      </div>

      <div className="result-row">
        <div className="sentiment-badge" style={{ background: config.color }}>
          {config.emoji} {config.label}
        </div>

        <div className="confidence-block">
          <span className="label">Confidence</span>
          <div className="confidence-bar-wrap">
            <div
              className="confidence-bar"
              style={{ width: `${pct}%`, background: config.color }}
            />
          </div>
          <span className="confidence-pct">{pct}%</span>
        </div>
      </div>

      <p className="timestamp">
        🕐 {new Date(result.created_at).toLocaleString()}
      </p>
    </div>
  );
}
