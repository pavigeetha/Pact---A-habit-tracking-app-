import { useGameState } from '../context/GameContext';
import { Trophy } from 'lucide-react';
import { MOCK_TEAMS } from '../data/mockData';

export default function Leaderboard() {
  const { group } = useGameState();

  // Build leaderboard: current team + mock rivals
  const currentTeam = group ? {
    id: group.id,
    name: group.name,
    hp: group.hp,
    maxHp: group.max_hp || 100,
    shieldActive: group.shield_active,
    isPlayerTeam: true,
  } : MOCK_TEAMS[0];

  const rivals = MOCK_TEAMS.filter(t => !t.isPlayerTeam).map(t => ({
    ...t,
    isPlayerTeam: false,
  }));

  const allTeams = [currentTeam, ...rivals];
  const sorted = [...allTeams].sort((a, b) => b.hp - a.hp);

  return (
    <div className="card" id="leaderboard">
      <div className="section-title">
        <Trophy size={14} />
        LEADERBOARD
      </div>

      <div className="flex flex-col gap-4 stagger">
        {sorted.map((team, idx) => {
          const rank = idx + 1;
          const isCurrentTeam = team.isPlayerTeam;
          const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-default';
          const hpPercent = (team.hp / (team.maxHp || 100)) * 100;
          const hpStatus = hpPercent > 60 ? 'healthy' : hpPercent > 30 ? 'warning' : 'critical';

          const hpColor =
            hpStatus === 'healthy'
              ? 'var(--accent-green)'
              : hpStatus === 'warning'
              ? 'var(--accent-yellow)'
              : 'var(--accent-red)';

          return (
            <div
              key={team.id}
              className={`leaderboard-row fade-in-up ${isCurrentTeam ? 'current-team' : ''}`}
            >
              <div className={`rank-badge ${rankClass}`}>{rank}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }} className="flex items-center gap-8">
                  {team.name}
                  {isCurrentTeam && (
                    <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>YOU</span>
                  )}
                  {team.shieldActive && (
                    <span style={{ fontSize: '0.75rem' }}>🛡️</span>
                  )}
                </div>
                <div style={{ marginTop: 6 }}>
                  <div className="hp-bar-wrapper" style={{ height: 8 }}>
                    <div
                      className={`hp-bar-fill ${hpStatus}`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: hpColor }}>
                  {team.hp}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}> HP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
