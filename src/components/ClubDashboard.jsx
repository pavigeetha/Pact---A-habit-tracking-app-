import { useState } from 'react';
import { CLUBS } from '../data/clubData';
import { useGameState, useToast, useSupabaseActions } from '../context/GameContext';
import {
  ArrowLeft, Trophy, Users, Shield, Zap, TrendingUp, Gift,
  Star, Award, ChevronRight, Sparkles, BarChart3, Heart, CheckCircle
} from 'lucide-react';

export default function ClubDashboard({ clubId, onBack }) {
  const club = CLUBS.find(c => c.id === clubId);
  const [userPoints] = useState(80);
  const { collectedRewards } = useGameState();
  const actions = useSupabaseActions();
  const addToast = useToast();
  const [claimingId, setClaimingId] = useState(null);

  if (!club) return null;

  const sortedSquads = [...club.squads].sort((a, b) => b.points - a.points);
  const topSquad = sortedSquads[0];
  const mostConsistent = [...club.squads].sort((a, b) => b.streak - a.streak)[0];

  const handleClaim = (reward) => {
    if (collectedRewards.includes(reward.id)) return;
    setClaimingId(reward.id);

    setTimeout(() => {
      actions.collectReward(reward.id, clubId);
      addToast(`🎉 Collected: ${reward.title}!`, 'success');
      setClaimingId(null);
    }, 800);
  };

  return (
    <div className="club-dashboard-wrapper">
      <button className="btn btn-outline btn-sm" onClick={onBack} id="club-back-btn" style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} />
        Back to Clubs
      </button>

      {/* Club Hero */}
      <div className="club-hero" style={{ '--club-color': club.color, '--club-glow': club.colorGlow }}>
        <div className="club-hero-gradient" style={{ background: club.gradient }} />
        <div className="club-hero-content">
          <div className="club-hero-top">
            <span className="club-hero-icon">{club.icon}</span>
            <div>
              <h1 className="club-hero-title">{club.name}</h1>
              <p className="club-hero-desc">{club.description}</p>
            </div>
          </div>
          <div className="club-hero-stats">
            <div className="club-hero-stat">
              <Users size={16} />
              <span className="club-hero-stat-value">{club.members.toLocaleString()}</span>
              <span className="club-hero-stat-label">Members</span>
            </div>
            <div className="club-hero-stat">
              <BarChart3 size={16} />
              <span className="club-hero-stat-value">{club.activeSquads}</span>
              <span className="club-hero-stat-label">Active Squads</span>
            </div>
            <div className="club-hero-stat">
              <Star size={16} />
              <span className="club-hero-stat-value">{club.totalPoints.toLocaleString()}</span>
              <span className="club-hero-stat-label">Total Points</span>
            </div>
            <div className="club-hero-stat">
              <TrendingUp size={16} />
              <span className="club-hero-stat-value">{topSquad?.name}</span>
              <span className="club-hero-stat-label">Top Squad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="club-dash-grid">
        {/* Squad Leaderboard */}
        <div className="card club-dash-leaderboard" id="club-leaderboard">
          <div className="section-title">
            <Trophy size={14} />
            SQUAD LEADERBOARD
          </div>

          <div className="flex flex-col gap-4 stagger">
            {sortedSquads.map((squad, idx) => {
              const rank = idx + 1;
              const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-default';
              const hpPercent = (squad.hp / squad.maxHp) * 100;
              const hpStatus = hpPercent > 60 ? 'healthy' : hpPercent > 30 ? 'warning' : 'critical';
              const isTop = squad.id === topSquad?.id;
              const isConsistent = squad.id === mostConsistent?.id;

              return (
                <div key={squad.id} className="leaderboard-row fade-in-up">
                  <div className={`rank-badge ${rankClass}`}>{rank}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }} className="flex items-center gap-8">
                      {squad.name}
                      {isTop && <span className="badge badge-yellow" style={{ fontSize: '0.55rem' }}><Award size={9} /> Top Squad</span>}
                      {isConsistent && !isTop && <span className="badge badge-green" style={{ fontSize: '0.55rem' }}><Zap size={9} /> Most Consistent</span>}
                      {squad.shieldActive && <span style={{ fontSize: '0.7rem' }}>🛡️</span>}
                    </div>
                    <div className="flex items-center gap-12" style={{ marginTop: 4 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <Users size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                        {squad.members}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        🔥 {squad.streak}d streak
                      </span>
                    </div>
                    <div className="hp-bar-wrapper" style={{ height: 6, marginTop: 6 }}>
                      <div className={`hp-bar-fill ${hpStatus}`} style={{ width: `${hpPercent}%` }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--accent-purple)' }}>
                      {squad.points}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="club-dash-right">
          {/* Rewards */}
          <div className="card" id="club-rewards">
            <div className="section-title">
              <Gift size={14} />
              REWARDS
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Earn points through habits to unlock real-world rewards.
              You have <strong style={{ color: club.color }}>{userPoints} points</strong>.
            </p>

            <div className="rewards-scroll">
              {club.rewards.map(reward => {
                const progress = Math.min((userPoints / reward.points) * 100, 100);
                const canClaim = userPoints >= reward.points;
                const isCollected = collectedRewards.includes(reward.id);
                const isClaiming = claimingId === reward.id;

                return (
                  <div
                    key={reward.id}
                    className={`reward-card ${isClaiming ? 'reward-claiming' : ''} ${isCollected ? 'reward-collected' : ''}`}
                    style={{ '--club-color': club.color, '--club-glow': club.colorGlow }}
                  >
                    <div className={`reward-icon ${isClaiming ? 'reward-icon-spin' : ''}`}>
                      {isCollected ? '✅' : reward.icon}
                    </div>
                    <h4 className="reward-title">{reward.title}</h4>
                    <div className="reward-eligibility">{reward.eligibility}</div>
                    <div className="reward-progress-wrapper">
                      <div className="reward-progress-bar">
                        <div
                          className="reward-progress-fill"
                          style={{
                            width: isCollected ? '100%' : `${progress}%`,
                            background: isCollected ? 'var(--accent-green)' : canClaim ? club.gradient : 'var(--bg-elevated)',
                          }}
                        />
                      </div>
                      <span className="reward-progress-text" style={{ color: isCollected ? 'var(--accent-green)' : canClaim ? club.color : 'var(--text-muted)' }}>
                        {isCollected ? 'Collected!' : `${userPoints} / ${reward.points} pts`}
                      </span>
                    </div>
                    <button
                      className={`btn btn-sm w-full ${isCollected ? 'btn-outline' : canClaim ? '' : 'btn-outline'}`}
                      style={
                        isCollected
                          ? { background: 'rgba(134, 239, 172, 0.15)', color: 'var(--accent-green)', cursor: 'default' }
                          : canClaim
                            ? { background: club.gradient, color: '#fff' }
                            : { opacity: 0.5 }
                      }
                      disabled={!canClaim || isCollected}
                      onClick={() => handleClaim(reward)}
                    >
                      {isCollected
                        ? <><CheckCircle size={14} /> Collected</>
                        : isClaiming
                          ? '✨ Claiming...'
                          : canClaim
                            ? '🎁 Claim Reward'
                            : 'Not Enough Points'
                      }
                    </button>

                    {/* Confetti overlay */}
                    {isClaiming && (
                      <div className="reward-confetti">
                        <span className="confetti-piece c1">🎊</span>
                        <span className="confetti-piece c2">✨</span>
                        <span className="confetti-piece c3">🎉</span>
                        <span className="confetti-piece c4">⭐</span>
                        <span className="confetti-piece c5">💫</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Partners */}
          <div className="card" id="club-partners">
            <div className="section-title">
              <Sparkles size={14} />
              PARTNER ORGANIZATIONS
            </div>
            <p className="club-partner-desc">
              🤝 {club.partnerLabel}
            </p>
            <div className="partner-logos">
              {club.partners.map((partner, i) => (
                <div key={i} className="partner-logo-card">
                  <span className="partner-logo-emoji">{partner.logo}</span>
                  <span className="partner-logo-name">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
