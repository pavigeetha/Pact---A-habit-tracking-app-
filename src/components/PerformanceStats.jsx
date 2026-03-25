import { useCurrentUser } from '../context/GameContext';
import { User, Flame, Target, TrendingUp } from 'lucide-react';

export default function PerformanceStats() {
  const user = useCurrentUser();
  if (!user) return null;

  const completedDays = user.weeklyCompleted.filter(Boolean).length;
  const totalDays = user.weeklyCompleted.length;
  const weeklyRate = Math.round((completedDays / totalDays) * 100);

  return (
    <div className="card" id="performance-stats">
      <div className="section-title">
        <User size={14} />
        YOUR PERFORMANCE
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>
            {user.consistency}%
          </div>
          <div className="stat-label">Consistency</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--accent-yellow)' }}>
            {user.streak}
          </div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
            {weeklyRate}%
          </div>
          <div className="stat-label">This Week</div>
        </div>
      </div>

      {/* Weekly dots */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
        WEEKLY OVERVIEW
      </div>
      <div className="flex gap-8 items-center" style={{ justifyContent: 'space-between' }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-full)',
              background: user.weeklyCompleted[i]
                ? 'rgba(34, 197, 94, 0.2)'
                : 'rgba(239, 68, 68, 0.15)',
              border: `2px solid ${user.weeklyCompleted[i] ? 'var(--accent-green)' : 'rgba(239, 68, 68, 0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 4px',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: user.weeklyCompleted[i] ? 'var(--accent-green)' : 'var(--accent-red)',
            }}>
              {user.weeklyCompleted[i] ? '✓' : '✗'}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
