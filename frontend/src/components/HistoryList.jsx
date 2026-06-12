const ICONS = { positive: "😊", neutral: "😐", negative: "😞" };
const COLORS = { positive: "#22c55e", neutral: "#f59e0b", negative: "#ef4444" };

export default function HistoryList({ history, onDelete }) {
  if (history.length === 0) {
    return (
      <div className="card">
        <h2>📋 History</h2>
        <p className="empty-msg">No analyses yet. Submit your first review!</p>
      </div>
    );
  }

  return (
    <div className="card history-card">
      <h2>📋 History ({history.length})</h2>
      <ul className="history-list">
        {history.map((item) => (
          <li key={item.id} className="history-item">
            <div className="history-header">
              <span
                className="history-badge"
                style={{ background: COLORS[item.sentiment] }}
              >
                {ICONS[item.sentiment]} {item.sentiment}
              </span>
              <span className="history-confidence">
                {Math.round(item.confidence * 100)}%
              </span>
              <button
                className="btn-delete"
                onClick={() => onDelete(item.id)}
                title="Delete"
              >
                🗑
              </button>
            </div>
            <p className="history-text">"{item.input_text}"</p>
            <p className="history-time">
              {new Date(item.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
