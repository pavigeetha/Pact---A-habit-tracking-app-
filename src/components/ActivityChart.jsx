import { useGameState } from '../context/GameContext';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { MOCK_WEEKLY_ACTIVITY } from '../data/mockData';

export default function ActivityChart() {
  const weeklyActivity = MOCK_WEEKLY_ACTIVITY;
  const maxVal = Math.max(...weeklyActivity.map(d => d.completed + d.missed), 1);

  // Detect trend: compare first half vs second half
  const firstHalf = weeklyActivity.slice(0, 3).reduce((s, d) => s + d.completed, 0);
  const secondHalf = weeklyActivity.slice(4).reduce((s, d) => s + d.completed, 0);
  const isImproving = secondHalf >= firstHalf;

  const totalCompleted = weeklyActivity.reduce((s, d) => s + d.completed, 0);
  const totalMissed = weeklyActivity.reduce((s, d) => s + d.missed, 0);

  return (
    <div className="card" id="activity-chart">
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>
          <BarChart3 size={14} />
          7-DAY MOMENTUM
        </div>
        <div className={`badge ${isImproving ? 'badge-green' : 'badge-red'}`}>
          {isImproving ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isImproving ? 'Improving' : 'Declining'}
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
        {totalCompleted} completed · {totalMissed} missed this week
      </div>

      <div className="chart-bars">
        {weeklyActivity.map((d, i) => {
          const completedHeight = (d.completed / maxVal) * 100;
          const missedHeight = (d.missed / maxVal) * 100;

          return (
            <div key={i} className="chart-bar-wrapper">
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, flex: 1, justifyContent: 'flex-end' }}>
                <div
                  className="chart-bar completed"
                  style={{ height: `${completedHeight}%` }}
                  title={`${d.completed} completed`}
                />
                {d.missed > 0 && (
                  <div
                    className="chart-bar missed"
                    style={{ height: `${missedHeight}%` }}
                    title={`${d.missed} missed`}
                  />
                )}
              </div>
              <div className="chart-label">{d.day}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-16" style={{ marginTop: 12, justifyContent: 'center' }}>
        <div className="flex items-center gap-4">
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-green)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Completed</span>
        </div>
        <div className="flex items-center gap-4">
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-red)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Missed</span>
        </div>
      </div>
    </div>
  );
}
