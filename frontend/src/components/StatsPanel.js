import React from 'react';
import './StatsPanel.css';

function StatsPanel({ stats }) {
  return (
    <div className="stats-panel">
      <h3 className="stats-title">Your Upload Statistics</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Uploads Used</div>
          <div className="stat-value">{stats.uploadsUsed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Remaining</div>
          <div className="stat-value remaining">{stats.remaining}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Images</div>
          <div className="stat-value">{stats.totalImages}</div>
        </div>
      </div>
    </div>
  );
}

export default StatsPanel;
