import { useState } from 'react';
import { useGameState, useGameDispatch, useToast } from '../context/GameContext';
import { Swords, Shield, Crosshair } from 'lucide-react';

export default function AttackPanel() {
  const { teams, currentTeamId } = useGameState();
  const dispatch = useGameDispatch();
  const addToast = useToast();
  const [attackAnimation, setAttackAnimation] = useState(null);

  const myTeam = teams.find(t => t.id === currentTeamId);
  const enemyTeams = teams.filter(t => t.id !== currentTeamId && t.hp > 0);

  const handleAttack = (targetId) => {
    const target = teams.find(t => t.id === targetId);
    if (!target) return;

    if (target.shieldActive) {
      addToast(`🛡️ ${target.name} has an active shield! Attack blocked.`, 'warning');
      return;
    }

    const damage = myTeam.hp > target.hp ? 15 : 10;
    setAttackAnimation(targetId);

    setTimeout(() => {
      dispatch({ type: 'ATTACK_TEAM', payload: targetId });
      addToast(`⚔️ Attack successful on ${target.name}! -${damage} HP`, 'danger');
      setAttackAnimation(null);
    }, 600);
  };

  return (
    <div className="card" id="attack-panel">
      <div className="section-title">
        <Swords size={14} />
        ATTACK SYSTEM
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
        Your HP determines attack power. Stronger bases deal more damage.
      </div>

      <div className="flex flex-col gap-8 stagger">
        {enemyTeams.map(team => (
          <div
            key={team.id}
            className={`fade-in-up ${attackAnimation === team.id ? 'attack-flash shake' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-default)',
              transition: 'all var(--transition-base)',
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Crosshair size={18} style={{ color: 'var(--accent-red)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }} className="flex items-center gap-8">
                {team.name}
                {team.shieldActive && (
                  <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>
                    <Shield size={10} />
                    Shielded
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {team.hp} HP remaining
              </div>
            </div>
            <button
              className="btn btn-red btn-sm"
              onClick={() => handleAttack(team.id)}
              disabled={team.shieldActive || attackAnimation !== null}
              style={{
                opacity: team.shieldActive ? 0.4 : 1,
                cursor: team.shieldActive ? 'not-allowed' : 'pointer',
              }}
              id={`attack-${team.id}`}
            >
              <Swords size={14} />
              Attack
            </button>
          </div>
        ))}

        {enemyTeams.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 24,
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}>
            No targets available — all enemies defeated!
          </div>
        )}
      </div>
    </div>
  );
}
