import React from "react";
import type { TaskStats } from "../../types/task.types";
import "./StatisticsCard.css";

interface StatisticsCardProps {
  stats: TaskStats;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">{stats.total}</div>
        <div className="stat-label">Total Tasks</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.active}</div>
        <div className="stat-label">Active</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.completed}</div>
        <div className="stat-label">Completed</div>
      </div>
      <div className="stat-card stat-urgent">
        <div className="stat-value">{stats.highPriority}</div>
        <div className="stat-label">High Priority</div>
      </div>
    </div>
  );
};
