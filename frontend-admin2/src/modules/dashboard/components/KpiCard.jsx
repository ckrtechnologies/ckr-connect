import React from 'react';

export default function KpiCard({ title, stat, footer, hint, icon, onClick, color }) {
  return (
    <div
      className="fluent-tile-card interactive-tile"
      onClick={onClick}
      title={hint}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="tile-header">
        <span>{title}</span>
        {icon}
      </div>
      <div className="tile-big-stat" style={color ? { color } : {}}>
        {stat}
      </div>
      <div className="tile-footer">{footer}</div>
      {hint && (
        <div className="interactive-tile-hint" style={color ? { color } : {}}>
          {hint} ›
        </div>
      )}
    </div>
  );
}
