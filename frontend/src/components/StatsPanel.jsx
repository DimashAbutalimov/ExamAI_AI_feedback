export default function StatsPanel({ stats }) {
  if (!stats || stats.total === 0) return null;

  const items = [
    { key: "positive", label: "Positive", emoji: "😊", color: "#22c55e" },
    { key: "neutral",  label: "Neutral",  emoji: "😐", color: "#f59e0b" },
    { key: "negative", label: "Negative", emoji: "😞", color: "#ef4444" },
  ];

  return (
    <div className="card stats-card">
      <h2>📊 Statistics  <span className="total-badge">Total: {stats.total}</span></h2>
      <div className="stats-grid">
        {items.map(({ key, label, emoji, color }) => {
          const pct = stats.total > 0 ? Math.round((stats[key] / stats.total) * 100) : 0;
          return (
            <div key={key} className="stat-item">
              <div className="stat-top">
                <span>{emoji} {label}</span>
                <strong style={{ color }}>{stats[key]}</strong>
              </div>
              <div className="stat-bar-wrap">
                <div className="stat-bar" style={{ width: `${pct}%`, background: color }} />
              </div>
              <span className="stat-pct">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
