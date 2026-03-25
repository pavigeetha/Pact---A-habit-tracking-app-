import { useTeamMembers, useCurrentTeam, useGameState } from '../context/GameContext';
import { Users, Crown, AlertTriangle } from 'lucide-react';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #7C3AED, #A855F7)',
  'linear-gradient(135deg, #3B82F6, #60A5FA)',
  'linear-gradient(135deg, #22C55E, #4ADE80)',
  'linear-gradient(135deg, #F59E0B, #FBBF24)',
];

export default function TeamDashboard() {
  const team = useCurrentTeam();
  const members = useTeamMembers();

  if (!team || members.length === 0) return null;

  const sorted = [...members].sort((a, b) => b.contribution - a.contribution);
  const topContributor = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return (
    <div className="card" id="team-dashboard">
      <div className="section-title">
        <Users size={14} />
        PACT MEMBERS — {team.name}
      </div>

      <div className="flex flex-col gap-4 stagger">
        {sorted.map((member, idx) => {
          const isTop = member.id === topContributor.id;
          const isWeakest = member.id === weakest.id && members.length > 1;

          return (
            <div key={member.id} className="member-row fade-in-up">
              <div
                className="member-avatar"
                style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
              >
                {member.avatar}
              </div>
              <div className="member-info">
                <div className="member-name flex items-center gap-8">
                  {member.name}
                  {isTop && (
                    <Crown size={14} style={{ color: 'var(--accent-yellow)' }} />
                  )}
                  {isWeakest && (
                    <AlertTriangle size={14} style={{ color: 'var(--accent-red)' }} />
                  )}
                </div>
                <div className="member-stat">
                  +{member.contribution} HP contributed · {member.consistency}% consistency
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                  🔥 {member.streak}d
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
