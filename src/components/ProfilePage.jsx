import { useState } from 'react';
import { useCurrentUser, useCurrentTeam, useGameState, useToast, useSupabaseActions } from '../context/GameContext';
import {
  User, Edit3, Save, X, Trophy, Flame, Target,
  BarChart3, Shield, Award, Calendar, ArrowLeft, Users, ChevronRight, Heart
} from 'lucide-react';

const AVATAR_OPTIONS = ['🧑‍💻', '🧙', '🦊', '🐺', '🧝', '🧑‍🚀', '🦉', '🐉', '🎮', '⚔️'];
const AVATAR_BG_OPTIONS = [
  'linear-gradient(135deg, #7C3AED, #A855F7)',
  'linear-gradient(135deg, #3B82F6, #60A5FA)',
  'linear-gradient(135deg, #22C55E, #4ADE80)',
  'linear-gradient(135deg, #F59E0B, #FBBF24)',
  'linear-gradient(135deg, #EC4899, #F472B6)',
  'linear-gradient(135deg, #EF4444, #F87171)',
];

export default function ProfilePage({ onBack }) {
  const user = useCurrentUser();
  const team = useCurrentTeam();
  const { habits, allGroups, group } = useGameState();
  const addToast = useToast();
  const actions = useSupabaseActions();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState('🧑‍💻');
  const [selectedBg, setSelectedBg] = useState(AVATAR_BG_OPTIONS[0]);

  if (!user) return null;

  const completedHabits = habits.filter(h => h.status === 'completed').length;
  const weeklyCompleted = [true, true, true, false, true, true, true];
  const totalDays = weeklyCompleted.length;
  const completedDays = weeklyCompleted.filter(Boolean).length;

  const handleSave = () => {
    if (editName.trim()) {
      actions.updateProfile({ display_name: editName.trim(), name: editName.trim() });
      addToast('✅ Profile updated successfully!', 'success');
    }
    setIsEditing(false);
  };

  const handleSwitchGroup = (groupId) => {
    actions.switchGroup(groupId);
    addToast('Switched active pact!', 'info');
  };

  return (
    <div className="profile-page">
      <button className="btn btn-outline btn-sm" onClick={onBack} id="profile-back-btn" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Profile Hero Card */}
      <div className="profile-hero card">
        <div className="profile-hero-bg" />
        <div className="profile-hero-content">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar" style={{ background: selectedBg }}>
              <span className="profile-avatar-emoji">{selectedAvatar}</span>
            </div>
            <div className={`profile-status-dot ${team?.shieldActive ? 'shielded' : 'online'}`} />
          </div>

          <div className="profile-info">
            {isEditing ? (
              <div className="flex items-center gap-8">
                <input
                  type="text"
                  className="profile-name-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                  id="profile-name-input"
                />
                <button className="btn btn-green btn-sm" onClick={handleSave}>
                  <Save size={14} /> Save
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(false)}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-12">
                <h1 className="profile-name">{user.name}</h1>
                <button className="btn btn-outline btn-sm" onClick={() => { setIsEditing(true); setEditName(user.name); }} id="profile-edit-btn">
                  <Edit3 size={14} /> Edit
                </button>
              </div>
            )}
            <p className="profile-team">
              <Shield size={13} style={{ verticalAlign: 'middle' }} /> {team?.name || 'No Group'}
              {team?.shieldActive && <span className="badge badge-purple" style={{ marginLeft: 8, fontSize: '0.6rem' }}>🛡️ Shielded</span>}
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="profile-avatar-picker fade-in-up">
            <div className="section-title" style={{ marginTop: 16 }}>Choose Avatar</div>
            <div className="flex gap-8" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
              {AVATAR_OPTIONS.map(a => (
                <button key={a} className={`avatar-option ${selectedAvatar === a ? 'selected' : ''}`} onClick={() => setSelectedAvatar(a)}>{a}</button>
              ))}
            </div>
            <div className="section-title">Choose Color</div>
            <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
              {AVATAR_BG_OPTIONS.map(bg => (
                <button key={bg} className={`color-option ${selectedBg === bg ? 'selected' : ''}`} style={{ background: bg }} onClick={() => setSelectedBg(bg)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* My Pacts Section */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">
          <Users size={14} />
          MY PACTS ({allGroups.length})
        </div>
        <div className="flex flex-col gap-8">
          {allGroups.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: 16 }}>
              You haven't joined any pacts yet. Go to Clubs to create or join one!
            </div>
          )}
          {allGroups.map(g => {
            const isActive = g.id === group?.id;
            const hpPercent = ((g.hp || 0) / (g.max_hp || 100)) * 100;
            return (
              <div
                key={g.id}
                onClick={() => !isActive && handleSwitchGroup(g.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(167, 139, 250, 0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? 'rgba(167,139,250,0.3)' : 'var(--border-default)'}`,
                  cursor: isActive ? 'default' : 'pointer',
                  transition: 'all var(--transition-base)',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: isActive ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : 'rgba(150,150,150,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? '#fff' : 'var(--text-muted)', fontWeight: 800, fontSize: '0.85rem',
                }}>
                  {(g.name || 'P').charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }} className="flex items-center gap-8">
                    {g.name || 'Unnamed Pact'}
                    {isActive && <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>Active</span>}
                    {g.shield_active && <Shield size={12} style={{ color: 'var(--accent-purple)' }} />}
                  </div>
                  <div className="flex items-center gap-8" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    <span className="flex items-center gap-4">
                      <Heart size={10} /> {g.hp || 0}/{g.max_hp || 100} HP
                    </span>
                    <span>Code: {g.invite_code}</span>
                    {g.streak > 0 && <span>🔥 {g.streak}d</span>}
                  </div>
                  <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: 'rgba(150,150,150,0.12)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${hpPercent}%`, height: '100%', borderRadius: 2,
                      background: hpPercent > 60 ? 'var(--accent-green)' : hpPercent > 30 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                    }} />
                  </div>
                </div>
                {!isActive && <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card card">
          <div className="profile-stat-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: 'var(--accent-purple)' }}>
            <Target size={20} />
          </div>
          <div className="profile-stat-value" style={{ color: 'var(--accent-purple)' }}>{user.consistency}%</div>
          <div className="profile-stat-label">Consistency Score</div>
          <div className="profile-stat-bar">
            <div className="profile-stat-bar-fill" style={{ width: `${user.consistency}%`, background: 'var(--accent-purple)' }} />
          </div>
        </div>

        <div className="profile-stat-card card">
          <div className="profile-stat-icon" style={{ background: 'rgba(250, 204, 21, 0.15)', color: 'var(--accent-yellow)' }}>
            <Flame size={20} />
          </div>
          <div className="profile-stat-value" style={{ color: 'var(--accent-yellow)' }}>{user.streak}</div>
          <div className="profile-stat-label">Day Streak</div>
          <div className="flex gap-4" style={{ justifyContent: 'center', marginTop: 8 }}>
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className={`streak-dot ${i < user.streak ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        <div className="profile-stat-card card">
          <div className="profile-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-green)' }}>
            <Trophy size={20} />
          </div>
          <div className="profile-stat-value" style={{ color: 'var(--accent-green)' }}>+{user.contribution}</div>
          <div className="profile-stat-label">HP Contributed</div>
        </div>

        <div className="profile-stat-card card">
          <div className="profile-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
            <Calendar size={20} />
          </div>
          <div className="profile-stat-value" style={{ color: 'var(--accent-blue)' }}>{completedDays}/{totalDays}</div>
          <div className="profile-stat-label">This Week</div>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">
          <BarChart3 size={14} />
          WEEKLY ACTIVITY
        </div>
        <div className="profile-week-grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className="profile-week-day">
              <div className={`profile-week-cell ${weeklyCompleted[i] ? 'completed' : 'missed'}`}>
                {weeklyCompleted[i] ? '✓' : '✗'}
              </div>
              <span className="profile-week-label">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">
          <Award size={14} />
          ACHIEVEMENTS
        </div>
        <div className="profile-achievements">
          <div className={`achievement ${user.streak >= 3 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">🔥</span>
            <span className="achievement-name">Fire Starter</span>
            <span className="achievement-desc">3-day streak</span>
          </div>
          <div className={`achievement ${user.streak >= 7 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">⚡</span>
            <span className="achievement-name">Unstoppable</span>
            <span className="achievement-desc">7-day streak</span>
          </div>
          <div className={`achievement ${user.contribution >= 50 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">💪</span>
            <span className="achievement-name">Team Carrier</span>
            <span className="achievement-desc">+50 HP contributed</span>
          </div>
          <div className={`achievement ${user.consistency >= 90 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">🏆</span>
            <span className="achievement-name">Perfectionist</span>
            <span className="achievement-desc">90%+ consistency</span>
          </div>
          <div className={`achievement ${allGroups.length >= 2 ? 'unlocked' : 'locked'}`}>
            <span className="achievement-icon">🤝</span>
            <span className="achievement-name">Social Butterfly</span>
            <span className="achievement-desc">Join 2+ pacts</span>
          </div>
          <div className="achievement locked">
            <span className="achievement-icon">👑</span>
            <span className="achievement-name">Legend</span>
            <span className="achievement-desc">30-day streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
