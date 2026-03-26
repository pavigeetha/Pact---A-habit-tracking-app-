import { useState } from 'react';
import { useGameState, useGameDispatch, useToast } from '../context/GameContext';
import { Swords, Shield, Crosshair, AlertTriangle, Clock, ChevronDown, ChevronUp, Ban } from 'lucide-react';
import { MOCK_TEAMS } from '../data/mockData';

const MAX_ATTACKS_PER_DAY = 2;

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AttackPanel() {
  const { group, attacksToday } = useGameState();
  const dispatch = useGameDispatch();
  const addToast = useToast();
  const [attackAnimation, setAttackAnimation] = useState(null);
  const [enemyHps, setEnemyHps] = useState(() => {
    const initial = {};
    MOCK_TEAMS.filter(t => !t.isPlayerTeam).forEach(t => {
      initial[t.id] = t.hp;
    });
    return initial;
  });
  const [attackLog, setAttackLog] = useState([
    { id: 1, attacker: 'Shadow Foxes', damage: 10, time: '2 hrs ago', incoming: true },
    { id: 2, attacker: 'Neon Titans', damage: 8, time: '5 hrs ago', incoming: true },
  ]);
  const [showLog, setShowLog] = useState(false);

  const myHp = group?.hp || 0;
  const today = getToday();
  const todaysAttacks = attacksToday.filter(a => a.date === today);
  const attacksRemaining = MAX_ATTACKS_PER_DAY - todaysAttacks.length;
  const alreadyAttackedIds = todaysAttacks.map(a => a.targetId);

  const enemyTeams = MOCK_TEAMS.filter(t => !t.isPlayerTeam && (enemyHps[t.id] ?? t.hp) > 0).map(t => ({
    ...t,
    hp: enemyHps[t.id] ?? t.hp,
    isPlayerTeam: false,
  }));

  const handleAttack = (targetId) => {
    const target = enemyTeams.find(t => t.id === targetId);
    if (!target) return;

    if (target.shieldActive) {
      addToast(`🛡️ ${target.name} has an active shield! Attack blocked.`, 'warning');
      return;
    }

    if (attacksRemaining <= 0) {
      addToast(`⚠️ No attacks remaining today! (${MAX_ATTACKS_PER_DAY}/day limit)`, 'warning');
      return;
    }

    if (alreadyAttackedIds.includes(targetId)) {
      addToast(`⚠️ Already attacked ${target.name} today! Pick a different target.`, 'warning');
      return;
    }

    if (target.hp >= myHp) {
      addToast(`⚠️ Cannot attack ${target.name} — their HP (${target.hp}) ≥ yours (${myHp})!`, 'warning');
      return;
    }

    const damage = Math.floor(Math.random() * 8) + 8; // 8-15 damage
    setAttackAnimation(targetId);

    setTimeout(() => {
      const newHp = Math.max((enemyHps[targetId] ?? target.hp) - damage, 0);
      setEnemyHps(prev => ({ ...prev, [targetId]: newHp }));

      // Record attack
      dispatch({ type: 'RECORD_ATTACK', payload: { targetId, date: today, damage } });

      // Add to attack log
      setAttackLog(prev => [
        { id: Date.now(), attacker: target.name, damage, time: 'Just now', incoming: false },
        ...prev.slice(0, 9),
      ]);

      addToast(`⚔️ Hit ${target.name} for ${damage} damage! (${newHp} HP left) — ${attacksRemaining - 1} attacks remaining`, 'danger');
      setAttackAnimation(null);
    }, 600);
  };

  const canAttack = (targetId, targetHp) => {
    if (targetHp >= myHp) return { allowed: false, reason: 'Too Strong' };
    if (alreadyAttackedIds.includes(targetId)) return { allowed: false, reason: 'Already Hit' };
    if (attacksRemaining <= 0) return { allowed: false, reason: 'No Attacks Left' };
    return { allowed: true };
  };

  return (
    <div className="card" id="attack-panel">
      <div className="section-title">
        <Swords size={14} />
        ATTACK SYSTEM
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
        Attack pacts with <strong>lower HP</strong> than yours ({myHp} HP).
      </div>

      {/* Attack budget */}
      <div className="flex items-center gap-8" style={{ marginBottom: 14 }}>
        <div style={{
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          background: attacksRemaining > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${attacksRemaining > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          fontSize: '0.78rem',
          fontWeight: 700,
          color: attacksRemaining > 0 ? 'var(--accent-green)' : 'var(--accent-red)',
        }}>
          ⚔️ {attacksRemaining}/{MAX_ATTACKS_PER_DAY} attacks remaining today
        </div>
      </div>

      <div className="flex flex-col gap-8 stagger">
        {enemyTeams.map(team => {
          const { allowed, reason } = canAttack(team.id, team.hp);
          const hpPercent = (team.hp / (team.maxHp || 100)) * 100;

          return (
            <div
              key={team.id}
              className={`fade-in-up ${attackAnimation === team.id ? 'attack-flash shake' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: allowed ? 'rgba(255,255,255,0.03)' : 'rgba(150,150,150,0.05)',
                border: `1px solid ${allowed ? 'var(--border-default)' : 'rgba(150,150,150,0.15)'}`,
                transition: 'all var(--transition-base)',
                opacity: allowed ? 1 : 0.55,
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: allowed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(150,150,150,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Crosshair size={18} style={{ color: allowed ? 'var(--accent-red)' : 'var(--text-muted)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }} className="flex items-center gap-8">
                  {team.name}
                  {team.shieldActive && (
                    <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>
                      <Shield size={10} /> Shielded
                    </span>
                  )}
                  {!allowed && reason && (
                    <span className="badge badge-yellow" style={{ fontSize: '0.6rem' }}>
                      {reason === 'Already Hit' ? <Ban size={10} /> : <AlertTriangle size={10} />}
                      {reason}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {team.hp} HP remaining
                </div>
                <div style={{ marginTop: 4, height: 4, borderRadius: 2, background: 'rgba(150,150,150,0.15)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${hpPercent}%`,
                    height: '100%',
                    borderRadius: 2,
                    background: hpPercent > 60 ? 'var(--accent-green)' : hpPercent > 30 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
              <button
                className="btn btn-red btn-sm"
                onClick={() => handleAttack(team.id)}
                disabled={!allowed || team.shieldActive || attackAnimation !== null}
                style={{
                  opacity: (!allowed || team.shieldActive) ? 0.3 : 1,
                  cursor: (!allowed || team.shieldActive) ? 'not-allowed' : 'pointer',
                }}
                id={`attack-${team.id}`}
              >
                <Swords size={14} /> Attack
              </button>
            </div>
          );
        })}

        {enemyTeams.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            🏆 All enemies defeated!
          </div>
        )}
      </div>

      {/* Attack Log */}
      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => setShowLog(!showLog)}
          className="flex items-center gap-8"
          style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '4px 0',
            width: '100%', justifyContent: 'space-between',
          }}
        >
          <span className="flex items-center gap-8">
            <Clock size={12} /> Attack Log ({attackLog.length})
          </span>
          {showLog ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showLog && (
          <div className="flex flex-col gap-4" style={{ marginTop: 8 }}>
            {attackLog.map(log => (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                background: log.incoming ? 'rgba(239, 68, 68, 0.06)' : 'rgba(34, 197, 94, 0.06)',
                border: `1px solid ${log.incoming ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)'}`,
                fontSize: '0.78rem',
              }}>
                <span style={{ fontWeight: 700, color: log.incoming ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                  {log.incoming ? '🔻' : '🔺'}
                </span>
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>
                  {log.incoming
                    ? `${log.attacker} attacked your base (-${log.damage} HP)`
                    : `You attacked ${log.attacker} (-${log.damage} HP)`}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', flexShrink: 0 }}>
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
