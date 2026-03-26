import { useState, useEffect } from 'react';
import { CLUBS } from '../data/clubData';
import { useGameState, useToast, useSupabaseActions } from '../context/GameContext';
import {
  ArrowLeft, Trophy, Users, Shield, Zap, TrendingUp, Gift,
  Star, Award, ChevronRight, Sparkles, BarChart3, Heart, CheckCircle,
  Plus, Check, X, Target, Loader
} from 'lucide-react';

const HABIT_ICONS = ['💪', '📚', '🏃', '🧘', '🎨', '🎵', '💻', '🍎', '💧', '🛌', '📝', '🧪'];

function getClubHabits(clubId) {
  try {
    return JSON.parse(localStorage.getItem(`pact_club_habits_${clubId}`) || '[]');
  } catch { return []; }
}

function saveClubHabits(clubId, habits) {
  localStorage.setItem(`pact_club_habits_${clubId}`, JSON.stringify(habits));
}

export default function ClubDashboard({ clubId, onBack }) {
  const club = CLUBS.find(c => c.id === clubId);
  const [userPoints] = useState(80);
  const { collectedRewards } = useGameState();
  const actions = useSupabaseActions();
  const addToast = useToast();
  const [claimingId, setClaimingId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'habits' | 'rewards'

  // Club-specific habits
  const [clubHabits, setClubHabits] = useState(() => getClubHabits(clubId));
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('💪');

  // Persist habits on change
  useEffect(() => {
    saveClubHabits(clubId, clubHabits);
  }, [clubHabits, clubId]);

  // Refresh habits when clubId changes
  useEffect(() => {
    setClubHabits(getClubHabits(clubId));
    setActiveTab('overview');
  }, [clubId]);

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

  const handleAddHabit = () => {
    if (!newHabitTitle.trim()) return;
    const newHabit = {
      id: `club-h-${Date.now()}`,
      title: newHabitTitle.trim(),
      icon: newHabitIcon,
      status: 'pending',
      clubId,
      createdAt: new Date().toISOString(),
    };
    setClubHabits(prev => [...prev, newHabit]);
    setNewHabitTitle('');
    setNewHabitIcon('💪');
    setShowAddHabit(false);
    addToast(`✅ Habit "${newHabit.title}" added to ${club.name}!`, 'success');
  };

  const toggleHabitStatus = (habitId) => {
    setClubHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const next = h.status === 'pending' ? 'completed' : h.status === 'completed' ? 'missed' : 'pending';
      return { ...h, status: next };
    }));
  };

  const deleteHabit = (habitId) => {
    setClubHabits(prev => prev.filter(h => h.id !== habitId));
    addToast('🗑️ Habit removed', 'info');
  };

  const completedCount = clubHabits.filter(h => h.status === 'completed').length;
  const totalCount = clubHabits.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={14} /> },
    { id: 'habits', label: `Habits (${totalCount})`, icon: <Target size={14} /> },
    { id: 'rewards', label: 'Rewards', icon: <Gift size={14} /> },
  ];

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
              <Target size={16} />
              <span className="club-hero-stat-value">{completionPercent}%</span>
              <span className="club-hero-stat-label">Habits Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-8" style={{ marginBottom: 20, marginTop: 16 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-4"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid',
              borderColor: activeTab === tab.id ? club.color : 'var(--border-default)',
              background: activeTab === tab.id ? (club.colorGlow || 'rgba(167,139,250,0.1)') : 'transparent',
              color: activeTab === tab.id ? club.color : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
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

          {/* Partners */}
          <div className="club-dash-right">
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
      )}

      {activeTab === 'habits' && (
        <div className="card fade-in-up" id="club-habits-section">
          <div className="section-title flex items-center" style={{ justifyContent: 'space-between' }}>
            <span className="flex items-center gap-8">
              <Target size={14} />
              CLUB HABITS — {club.name}
            </span>
            <button
              className="btn btn-sm"
              style={{ background: club.gradient, color: '#fff' }}
              onClick={() => setShowAddHabit(!showAddHabit)}
            >
              {showAddHabit ? <X size={14} /> : <Plus size={14} />}
              {showAddHabit ? 'Cancel' : 'Add Habit'}
            </button>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="flex items-center" style={{ justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {completedCount}/{totalCount} completed today
                </span>
                <span style={{ color: club.color, fontWeight: 700 }}>{completionPercent}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(150,150,150,0.12)', overflow: 'hidden' }}>
                <div style={{
                  width: `${completionPercent}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: club.gradient,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}

          {/* Add habit form */}
          {showAddHabit && (
            <div className="fade-in-up" style={{
              padding: 14, borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-default)',
              marginBottom: 16,
            }}>
              <div className="flex gap-8" style={{ marginBottom: 10 }}>
                <input
                  className="habit-input"
                  placeholder={`New habit for ${club.name}...`}
                  value={newHabitTitle}
                  onChange={e => setNewHabitTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                  autoFocus
                  style={{ flex: 1 }}
                />
                <button className="btn btn-green btn-sm" onClick={handleAddHabit} disabled={!newHabitTitle.trim()}>
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                {HABIT_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewHabitIcon(icon)}
                    style={{
                      width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                      border: `2px solid ${newHabitIcon === icon ? club.color : 'var(--border-default)'}`,
                      background: newHabitIcon === icon ? (club.colorGlow || 'rgba(167,139,250,0.1)') : 'transparent',
                      cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all var(--transition-base)',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Habit list */}
          <div className="flex flex-col gap-8 stagger">
            {clubHabits.length === 0 && !showAddHabit && (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                <Target size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                <p style={{ fontSize: '0.9rem' }}>No habits yet for this club</p>
                <p style={{ fontSize: '0.78rem' }}>Click "Add Habit" to create habits specific to {club.name}</p>
              </div>
            )}
            {clubHabits.map(habit => {
              const isCompleted = habit.status === 'completed';
              const isMissed = habit.status === 'missed';
              return (
                <div
                  key={habit.id}
                  className="fade-in-up"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 'var(--radius-md)',
                    background: isCompleted ? 'rgba(34, 197, 94, 0.06)' : isMissed ? 'rgba(239, 68, 68, 0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.15)' : isMissed ? 'rgba(239,68,68,0.15)' : 'var(--border-default)'}`,
                    transition: 'all var(--transition-base)',
                  }}
                >
                  <button
                    onClick={() => toggleHabitStatus(habit.id)}
                    style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-full)',
                      border: `2px solid ${isCompleted ? 'var(--accent-green)' : isMissed ? 'var(--accent-red)' : 'var(--border-default)'}`,
                      background: isCompleted ? 'rgba(34,197,94,0.15)' : isMissed ? 'rgba(239,68,68,0.15)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', transition: 'all var(--transition-base)',
                    }}
                  >
                    {isCompleted ? <Check size={16} style={{ color: 'var(--accent-green)' }} /> : isMissed ? <X size={16} style={{ color: 'var(--accent-red)' }} /> : habit.icon}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 600, fontSize: '0.9rem',
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      opacity: isCompleted ? 0.6 : 1,
                    }}>
                      {habit.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {club.name} • {isCompleted ? '✅ Done' : isMissed ? '❌ Missed' : '⏳ Pending'}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 4, borderRadius: 'var(--radius-sm)',
                    }}
                    title="Remove habit"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="club-dash-grid">
          <div className="card" id="club-rewards" style={{ gridColumn: '1 / -1' }}>
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
        </div>
      )}
    </div>
  );
}
