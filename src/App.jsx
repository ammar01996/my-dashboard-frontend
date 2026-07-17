import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 1. Initialize metrics as an empty array. Python will fill this up!
  const [metrics, setMetrics] = useState([]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newTrend, setNewTrend] = useState('');

  // Advice API States
  const [advice, setAdvice] = useState('Loading daily developer insight...');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // --- NEW FULL-STACK PIPELINES ---
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // A. Function to fetch metrics from your Python Backend
  const fetchPythonMetrics = async () => {
    try {
      const response = await fetch('https://my-dashboard-backend-cevj.onrender.com/api/metrics');
      const data = await response.json();
      setMetrics(data); // Put the Python data into React state
    } catch (error) {
      console.error("Error connecting to Python backend:", error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  // B. Function to fetch random third-party advice
  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const response = await fetch('https://api.adviceslip.com/advice');
      const data = await response.json();
      setAdvice(data.slip.advice);
    } catch (error) {
      setAdvice("Could not load advice.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  // Run both fetches instantly when the web app opens up
  useEffect(() => {
    fetchPythonMetrics();
    fetchAdvice();
  }, []);

  // C. Handle Form Submission: Send data to Python API
  const handleAddMetric = async (e) => {
    e.preventDefault();
    if (!newTitle || !newValue || !newTrend) return;

    const newCard = {
      id: Date.now(),
      title: newTitle,
      value: newValue,
      trend: newTrend,
    };

    try {
      // Send a POST request to your Python server with the new card details
      const response = await fetch('https://my-dashboard-backend-cevj.onrender.com/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard)
      });

      if (response.ok) {
        // If Python successfully saved it, refresh our frontend metrics display list
        fetchPythonMetrics();
        setNewTitle('');
        setNewValue('');
      }
    } catch (error) {
      console.error("Failed to post new metric:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dash-header">
        <h1>Full-Stack Metrics Dashboard</h1>
        <p>Frontend: React (Vite) | Backend: Python (FastAPI)</p>
      </header>

      <div className="api-banner">
        <div className="banner-content">
          <span className="banner-tag">Daily Insight</span>
          <p className="advice-text">"{advice}"</p>
        </div>
        <button onClick={fetchAdvice} disabled={loadingAdvice} className="refresh-btn">
          {loadingAdvice ? "Fetching..." : "Next Tip"}
        </button>
      </div>

      {loadingMetrics ? (
        <div className="loading-spinner-box">
          <div className="spinner"></div>
          <h3>Loading.....</h3>
        </div>
      ) : (
        <div className="metrics-grid">
          {metrics.map(metric => (
            <div key={metric.id} className="metric-card">
              <h3>{metric.title}</h3>
              <div className="metric-value">{metric.value}</div>
              <span className="metric-trend">{metric.trend}</span>
            </div>
          ))}
        </div>
      )}

      <section className="form-section">
        <h2>Add Custom Metric Card</h2>
        <form onSubmit={handleAddMetric} className="metric-form">
          <div className="input-group">
            <label>Metric Title</label>
            <input
              type="text"
              placeholder="e.g., Code Reviews Completed"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Value</label>
            <input
              type="text"
              placeholder="e.g., 14 updates"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Trend</label>
            <input
              type="text"
              placeholder="Trend"
              value={newTrend}
              onChange={(e) => setNewTrend(e.target.value)}
            />
          </div>
          <button type="submit" className="add-btn">Add Card</button>
        </form>
      </section>
    </div>
  );
}

export default App;