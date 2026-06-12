import { useState } from "react";

export default function AnalyzeForm({ onAnalyze, loading }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onAnalyze(text);
  }

  return (
    <div className="card">
      <h2>📝 Enter Review Text</h2>
      <div onSubmit={handleSubmit}>
        <textarea
          className="textarea"
          rows={5}
          placeholder="Type a review, feedback, or any text to analyze its sentiment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          maxLength={5000}
        />
        <div className="form-footer">
          <span className="char-count">{text.length} / 5000</span>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
          >
            {loading ? "⏳ Analyzing..." : "🚀 Analyze"}
          </button>
        </div>
      </div>
    </div>
  );
}
