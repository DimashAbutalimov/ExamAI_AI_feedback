import { useState, useEffect } from "react";
import AnalyzeForm from "./components/AnalyzeForm";
import ResultCard from "./components/ResultCard";
import HistoryList from "./components/HistoryList";
import StatsPanel from "./components/StatsPanel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Загружаем историю и статистику при старте
  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch(`${API_URL}/results`);
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setHistory(data);
    } catch {
      // Сервер недоступен — показываем пустую историю
      setHistory([]);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API_URL}/stats`);
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    }
  }

  async function handleAnalyze(text) {
    if (!text.trim()) {
      setError("Please enter some text before analyzing.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);

      // Обновляем историю и статистику после нового анализа
      await fetchHistory();
      await fetchStats();
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError("❌ Server is unavailable. Make sure the backend is running on port 8000.");
      } else {
        setError(`❌ ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await fetch(`${API_URL}/results/${id}`, { method: "DELETE" });
      await fetchHistory();
      await fetchStats();
      if (result?.id === id) setResult(null);
    } catch {
      setError("Failed to delete entry.");
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🔍 AI Review Analyzer</h1>
        <p className="subtitle">Powered by cardiffnlp/twitter-roberta-base-sentiment-latest</p>
      </header>

      <main className="main">
        <div className="left-column">
          <AnalyzeForm onAnalyze={handleAnalyze} loading={loading} />

          {error && <div className="error-box">{error}</div>}

          {result && <ResultCard result={result} />}

          {stats && <StatsPanel stats={stats} />}
        </div>

        <div className="right-column">
          <HistoryList history={history} onDelete={handleDelete} />
        </div>
      </main>
    </div>
  );
}
