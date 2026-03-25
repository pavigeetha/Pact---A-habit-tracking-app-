import { useCurrentTeam, useGameState } from '../context/GameContext';
import { Shield, Heart, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function BaseHealth() {
  const team = useCurrentTeam();
  const { hpChanges, revivalMode } = useGameState();
  const [displayHp, setDisplayHp] = useState(team?.hp || 0);
  const [hpPopups, setHpPopups] = useState([]);
  const prevHp = useRef(team?.hp);

  useEffect(() => {
    if (team) {
      setDisplayHp(team.hp);
      // Show HP change popup
      if (prevHp.current !== team.hp) {
        const diff = team.hp - prevHp.current;
        setHpPopups(prev => [...prev, { id: Date.now(), value: diff }]);
        prevHp.current = team.hp;
      }
    }
  }, [team?.hp]);

  // Clear popups after animation
  useEffect(() => {
    if (hpPopups.length > 0) {
      const timer = setTimeout(() => {
        setHpPopups(prev => prev.slice(1));
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [hpPopups]);

  if (!team) return null;

  const hpPercent = (displayHp / team.maxHp) * 100;
  const status = hpPercent > 60 ? 'healthy' : hpPercent > 30 ? 'warning' : 'critical';

  return (
    <div className={`card span-2 ${revivalMode ? 'revival-card' : ''}`} id="base-health">
      <div className="section-title">
        <Heart size={14} />
        BASE HEALTH — {team.name}
      </div>

      <div className="flex items-center justify-between gap-16" style={{ marginBottom: 16 }}>
        <div className="relative">
          <span className={`hp-text ${status}`}>{displayHp}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}> / {team.maxHp} HP</span>

          {/* HP change popups */}
          {hpPopups.map(p => (
            <span
              key={p.id}
              className={`hp-change ${p.value > 0 ? 'positive' : 'negative'}`}
              style={{ right: -50, top: 0 }}
            >
              {p.value > 0 ? '+' : ''}{p.value}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-8">
          {team.shieldActive && (
            <div className="badge badge-purple shield-active">
              <Shield size={12} />
              Shield Active
            </div>
          )}
          {team.streak > 0 && (
            <div className="badge badge-yellow">
              <Zap size={12} />
              {team.streak} day streak
            </div>
          )}
        </div>
      </div>

      <div className="hp-bar-wrapper">
        <div
          className={`hp-bar-fill ${status}`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>

      {revivalMode && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          fontSize: '0.85rem',
          color: 'var(--accent-red)',
          fontWeight: 600,
        }}>
          ⚠️ REVIVAL MODE — Complete 3 habits in a row to restore base to 50 HP!
        </div>
      )}
    </div>
  );
}
