import { useState, useEffect, useCallback } from 'react';
import { useGameState, useToast, useSupabaseActions, useCurrentUser } from '../context/GameContext';
import {
  CheckCircle, XCircle, ListChecks, Plus, Trash2, X, Users, User,
  ThumbsUp, Clock, Calendar, Bell, BellOff, ChevronDown, ChevronUp,
  Eye, Star, AlertTriangle, Repeat
} from 'lucide-react';

const HABIT_ICONS = ['📚', '💪', '📖', '🧘', '💧', '🏃', '🎨', '💻', '🎵', '🍎', '✍️', '🧠', '🛌', '🚶', '📝'];
const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', desc: 'Every day' },
  { value: '5x', label: '5x/week', desc: '5 times per week' },
  { value: '3x', label: '3x/week', desc: '3 times per week' },
  { value: '2x', label: '2x/week', desc: 'Twice per week' },
  { value: '1x', label: '1x/week', desc: 'Once per week' },
  { value: 'custom', label: 'Custom', desc: 'Pick days' },
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const REMINDER_TIMES = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

// Get mock group members' habits (demo data)
function getMockMemberHabits(groupMembers, currentUserId) {
  if (!groupMembers || groupMembers.length <= 1) return [];
  return groupMembers
    .filter(m => m.id !== currentUserId)
    .map(member => ({
      member,
      habits: [
        { id: `${member.id}-h1`, title: 'Morning workout', icon: '💪', status: Math.random() > 0.3 ? 'completed' : 'pending', approvals: Math.random() > 0.5 ? [currentUserId] : [], needsApproval: true },
        { id: `${member.id}-h2`, title: 'Study 1 hour', icon: '📚', status: Math.random() > 0.5 ? 'completed' : Math.random() > 0.5 ? 'pending' : 'missed', approvals: [], needsApproval: true },
        { id: `${member.id}-h3`, title: 'Read 20 pages', icon: '📖', status: Math.random() > 0.6 ? 'completed' : 'pending', approvals: [], needsApproval: true },
      ],
    }));
}

export default function HabitList() {
  const { habits, revivalMode, revivalProgress, group, groupMembers } = useGameState();
  const currentUser = useCurrentUser();
  const addToast = useToast();
  const actions = useSupabaseActions();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('📚');
  const [habitScope, setHabitScope] = useState('private');
  const [frequency, setFrequency] = useState('daily');
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4]); // Mon-Fri
  const [reminderTime, setReminderTime] = useState('08:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('mine'); // 'mine' | 'group'

  // Approval state (stored locally for demo)
  const [approvals, setApprovals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pact_habit_approvals') || '{}'); }
    catch { return {}; }
  });

  // Mock member habits
  const [memberHabits] = useState(() => getMockMemberHabits(groupMembers, currentUser?.id));

  // Notification check interval
  useEffect(() => {
    if (!notificationsEnabled) return;
    const interval = setInterval(() => {
      const pending = habits.filter(h => h.status === 'pending');
      if (pending.length > 0) {
        // In-app notification
        addToast(`⏰ You have ${pending.length} unfinished habit${pending.length > 1 ? 's' : ''}! Get moving!`, 'warning');

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 PACT Reminder', {
            body: `You have ${pending.length} pending habit${pending.length > 1 ? 's' : ''} today!`,
            icon: '🏰',
          });
        }
      }
    }, 120000); // Every 2 minutes

    return () => clearInterval(interval);
  }, [notificationsEnabled, habits]);

  const enableNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationsEnabled(true);
        addToast('🔔 Notifications enabled! You\'ll get reminders for pending habits.', 'success');

        // Immediate test notification
        new Notification('🏰 PACT Notifications Active', {
          body: 'You\'ll be notified when habits are due and when teammates need support!',
        });
      } else {
        addToast('❌ Notification permission denied. Enable it in browser settings.', 'warning');
      }
    } else {
      addToast('⚠️ Notifications not supported in this browser.', 'warning');
    }
  };

  const handleComplete = (habitId, title) => {
    actions.completeHabit(habitId);
    addToast(`✅ "${title}" marked done — awaiting group approval! +10 HP`, 'success');

    // Notify group about completion (simulated)
    if (notificationsEnabled && groupMembers.length > 1) {
      setTimeout(() => {
        addToast(`📢 ${currentUser?.name || 'You'} completed "${title}" — group members notified!`, 'info');
      }, 1000);
    }
  };

  const handleMiss = (habitId, title) => {
    actions.missHabit(habitId);
    addToast(`❌ "${title}" missed! -15 HP`, 'danger');

    // Slacker notification (simulated)
    if (notificationsEnabled) {
      setTimeout(() => {
        addToast(`⚠️ ${currentUser?.name || 'You'} missed "${title}" — the group has been notified!`, 'warning');
      }, 800);
    }
  };

  const handleApprove = (memberHabitId) => {
    const updated = { ...approvals, [memberHabitId]: [...(approvals[memberHabitId] || []), currentUser?.id || 'demo-user'] };
    setApprovals(updated);
    localStorage.setItem('pact_habit_approvals', JSON.stringify(updated));
    addToast('👍 Habit approved! Member notified.', 'success');
  };

  const isApproved = (memberHabitId) => {
    return (approvals[memberHabitId] || []).length > 0;
  };

  const handleAddHabit = async () => {
    if (!newTitle.trim()) return;

    // Build habit metadata
    const habitMeta = {
      frequency,
      selectedDays: frequency === 'custom' ? selectedDays : null,
      reminderTime,
    };

    if (habitScope === 'group' && group && groupMembers.length > 0) {
      await actions.addGroupHabit(newTitle.trim(), newIcon);
      addToast(`👥 Group habit "${newTitle.trim()}" added for all ${groupMembers.length} members!`, 'success');
    } else {
      actions.addHabit(newTitle.trim(), newIcon);
      addToast(`➕ "${newTitle.trim()}" added! (${FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label})`, 'info');
    }

    // Save frequency meta locally
    try {
      const meta = JSON.parse(localStorage.getItem('pact_habit_meta') || '{}');
      meta[newTitle.trim()] = habitMeta;
      localStorage.setItem('pact_habit_meta', JSON.stringify(meta));
    } catch {}

    setNewTitle('');
    setNewIcon('📚');
    setShowAddForm(false);
  };

  const handleDeleteHabit = (habitId, title) => {
    actions.deleteHabit(habitId);
    addToast(`🗑️ "${title}" removed`, 'warning');
  };

  const pendingCount = habits.filter(h => h.status === 'pending').length;
  const completedCount = habits.filter(h => h.status === 'completed').length;

  // Group completion stats
  const groupCompletionRate = memberHabits.length > 0
    ? Math.round(memberHabits.reduce((sum, m) => {
        const done = m.habits.filter(h => h.status === 'completed').length;
        return sum + (done / m.habits.length) * 100;
      }, 0) / memberHabits.length)
    : 0;

  return (
    <div className="card" id="habit-list">
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>
          <ListChecks size={14} />
          PACT HABITS
        </div>
        <div className="flex gap-4">
          <button
            className={`btn btn-sm ${notificationsEnabled ? 'btn-green' : 'btn-outline'}`}
            onClick={notificationsEnabled ? () => setNotificationsEnabled(false) : enableNotifications}
            title={notificationsEnabled ? 'Notifications on' : 'Enable notifications'}
          >
            {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
          </button>
          <button
            className="btn btn-purple btn-sm"
            onClick={() => setShowAddForm(!showAddForm)}
            id="add-habit-btn"
          >
            {showAddForm ? <X size={14} /> : <Plus size={14} />}
            {showAddForm ? 'Cancel' : 'Add'}
          </button>
        </div>
      </div>

      {/* Tab switch: My Habits / Group Habits */}
      <div className="flex gap-8" style={{ marginBottom: 12, marginTop: 8 }}>
        <button
          onClick={() => setActiveTab('mine')}
          className="flex items-center gap-4"
          style={{
            padding: '6px 14px', borderRadius: 'var(--radius-full)',
            border: `1px solid ${activeTab === 'mine' ? 'var(--accent-purple)' : 'var(--border-default)'}`,
            background: activeTab === 'mine' ? 'rgba(167,139,250,0.1)' : 'transparent',
            color: activeTab === 'mine' ? 'var(--accent-purple)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'mine' ? 700 : 500, fontSize: '0.8rem', cursor: 'pointer',
          }}
        >
          <User size={12} /> My Habits ({habits.length})
        </button>
        <button
          onClick={() => setActiveTab('group')}
          className="flex items-center gap-4"
          style={{
            padding: '6px 14px', borderRadius: 'var(--radius-full)',
            border: `1px solid ${activeTab === 'group' ? 'var(--accent-blue)' : 'var(--border-default)'}`,
            background: activeTab === 'group' ? 'rgba(59,130,246,0.1)' : 'transparent',
            color: activeTab === 'group' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'group' ? 700 : 500, fontSize: '0.8rem', cursor: 'pointer',
          }}
        >
          <Eye size={12} /> Group ({memberHabits.reduce((s, m) => s + m.habits.length, 0)})
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
        {activeTab === 'mine' ? (
          <>
            {completedCount}/{habits.length} completed
            {revivalMode && (
              <span style={{ color: 'var(--accent-red)', marginLeft: 8 }}>
                🔥 Revival: {revivalProgress}/3
              </span>
            )}
            {pendingCount > 0 && notificationsEnabled && (
              <span style={{ color: 'var(--accent-yellow)', marginLeft: 8 }}>
                🔔 Reminders active
              </span>
            )}
          </>
        ) : (
          <>
            Group avg: {groupCompletionRate}% done
            {memberHabits.some(m => m.habits.some(h => h.status === 'missed')) && (
              <span style={{ color: 'var(--accent-red)', marginLeft: 8 }}>
                ⚠️ Some members slacking
              </span>
            )}
          </>
        )}
      </div>

      {/* Add Habit Form */}
      {showAddForm && activeTab === 'mine' && (
        <div className="add-habit-form fade-in-up" style={{ marginBottom: 16 }}>
          {/* Scope Toggle */}
          <div className="flex gap-8" style={{ marginBottom: 10 }}>
            <button
              className={`btn btn-sm ${habitScope === 'private' ? 'btn-purple' : 'btn-outline'}`}
              onClick={() => setHabitScope('private')}
              style={{ flex: 1 }}
            >
              <User size={12} /> Private
            </button>
            <button
              className={`btn btn-sm ${habitScope === 'group' ? 'btn-purple' : 'btn-outline'}`}
              onClick={() => setHabitScope('group')}
              style={{ flex: 1 }}
            >
              <Users size={12} /> Group ({groupMembers?.length || 0})
            </button>
          </div>
          {habitScope === 'group' && (
            <div style={{
              fontSize: '0.75rem', color: 'var(--accent-purple)', marginBottom: 8,
              padding: '4px 8px', background: 'rgba(167,139,250,0.08)', borderRadius: 'var(--radius-sm)',
            }}>
              👥 This habit will be shared with all {groupMembers?.length || 0} group members and they must approve your completions
            </div>
          )}

          <div className="flex gap-8" style={{ marginBottom: 10 }}>
            <input
              type="text" className="habit-input" placeholder="Enter habit name..."
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddHabit()} autoFocus id="new-habit-input"
            />
            <button className="btn btn-green btn-sm" onClick={handleAddHabit} id="save-habit-btn">
              <Plus size={14} /> Add
            </button>
          </div>

          {/* Icons */}
          <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
            {HABIT_ICONS.map(icon => (
              <button key={icon} className={`icon-picker-btn ${newIcon === icon ? 'selected' : ''}`} onClick={() => setNewIcon(icon)}>
                {icon}
              </button>
            ))}
          </div>

          {/* Frequency & Schedule */}
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center gap-4"
            style={{
              background: 'none', border: 'none', color: 'var(--accent-purple)',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: '4px 0',
            }}
          >
            <Calendar size={12} /> Frequency & Reminder
            {showSchedule ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showSchedule && (
            <div className="fade-in-up" style={{ marginTop: 8 }}>
              {/* Frequency */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                  <Repeat size={10} /> FREQUENCY
                </div>
                <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                  {FREQUENCY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFrequency(opt.value)}
                      style={{
                        padding: '4px 10px', borderRadius: 'var(--radius-full)',
                        border: `1px solid ${frequency === opt.value ? 'var(--accent-purple)' : 'var(--border-default)'}`,
                        background: frequency === opt.value ? 'rgba(167,139,250,0.1)' : 'transparent',
                        color: frequency === opt.value ? 'var(--accent-purple)' : 'var(--text-secondary)',
                        fontWeight: frequency === opt.value ? 700 : 500,
                        fontSize: '0.75rem', cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom day picker */}
              {frequency === 'custom' && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                    SELECT DAYS
                  </div>
                  <div className="flex gap-4">
                    {DAYS.map((day, i) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDays(prev =>
                          prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
                        )}
                        style={{
                          width: 36, height: 36, borderRadius: 'var(--radius-full)',
                          border: `2px solid ${selectedDays.includes(i) ? 'var(--accent-purple)' : 'var(--border-default)'}`,
                          background: selectedDays.includes(i) ? 'rgba(167,139,250,0.15)' : 'transparent',
                          color: selectedDays.includes(i) ? 'var(--accent-purple)' : 'var(--text-muted)',
                          fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminder time */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                  <Clock size={10} /> REMINDER TIME
                </div>
                <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                  {REMINDER_TIMES.map(time => (
                    <button
                      key={time}
                      onClick={() => setReminderTime(time)}
                      style={{
                        padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${reminderTime === time ? 'var(--accent-green)' : 'var(--border-default)'}`,
                        background: reminderTime === time ? 'rgba(34,197,94,0.1)' : 'transparent',
                        color: reminderTime === time ? 'var(--accent-green)' : 'var(--text-muted)',
                        fontWeight: reminderTime === time ? 700 : 500,
                        fontSize: '0.72rem', cursor: 'pointer',
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MY HABITS TAB */}
      {activeTab === 'mine' && (
        <div className="flex flex-col gap-8 stagger">
          {habits.map((habit) => {
            const myApprovals = approvals[habit.id] || [];
            const isConfirmed = myApprovals.length > 0 && habit.status === 'completed';
            return (
              <div key={habit.id} className="fade-in-up" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                background: isConfirmed ? 'rgba(34,197,94,0.12)' : habit.status === 'completed'
                  ? 'rgba(250,204,21,0.06)' : habit.status === 'missed'
                  ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isConfirmed ? 'rgba(34,197,94,0.25)' : habit.status === 'completed'
                  ? 'rgba(250,204,21,0.2)' : habit.status === 'missed'
                  ? 'rgba(239,68,68,0.2)' : 'var(--border-default)'}`,
                transition: 'all var(--transition-base)',
              }}>
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{habit.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600, fontSize: '0.9rem',
                    textDecoration: isConfirmed ? 'line-through' : 'none',
                    color: habit.status === 'missed' ? 'var(--text-muted)' : 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {habit.title}
                    {habit.is_group_habit && (
                      <span style={{
                        fontSize: '0.6rem', background: 'rgba(167,139,250,0.12)',
                        color: 'var(--accent-purple)', padding: '1px 5px',
                        borderRadius: 'var(--radius-sm)', fontWeight: 700,
                      }}>GROUP</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {habit.status === 'completed' && !isConfirmed && (
                      <span style={{ color: 'var(--accent-yellow)' }}>⏳ Awaiting approval</span>
                    )}
                    {isConfirmed && (
                      <span style={{ color: 'var(--accent-green)' }}>✅ Approved by group</span>
                    )}
                    {habit.status === 'missed' && (
                      <span style={{ color: 'var(--accent-red)' }}>❌ Missed</span>
                    )}
                  </div>
                </div>

                {habit.status === 'pending' ? (
                  <div className="flex gap-8 items-center">
                    <button className="btn btn-green btn-sm" onClick={() => handleComplete(habit.id, habit.title)} id={`complete-${habit.id}`}>
                      <CheckCircle size={14} /> Done
                    </button>
                    <button className="btn btn-red btn-sm" onClick={() => handleMiss(habit.id, habit.title)} id={`miss-${habit.id}`}>
                      <XCircle size={14} /> Miss
                    </button>
                    <button className="habit-delete-btn" onClick={() => handleDeleteHabit(habit.id, habit.title)} title="Delete habit">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-8 items-center">
                    <div className={`badge ${isConfirmed ? 'badge-green' : habit.status === 'completed' ? 'badge-yellow' : 'badge-red'}`}>
                      {isConfirmed ? '✅ Confirmed' : habit.status === 'completed' ? '⏳ Pending' : 'Missed'}
                    </div>
                    <button className="habit-delete-btn" onClick={() => handleDeleteHabit(habit.id, habit.title)} title="Delete habit">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {habits.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No habits yet. Click "Add" to create your first habit! ✨
            </div>
          )}
        </div>
      )}

      {/* GROUP HABITS TAB */}
      {activeTab === 'group' && (
        <div className="flex flex-col gap-16 stagger">
          {memberHabits.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No other group members found. Invite people to your pact! 🤝
            </div>
          )}
          {memberHabits.map(({ member, habits: mHabits }) => {
            const mCompleted = mHabits.filter(h => h.status === 'completed').length;
            const mTotal = mHabits.length;
            const mPercent = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;
            const isSlacking = mPercent < 40 && mTotal > 0;

            return (
              <div key={member.id} className="fade-in-up">
                {/* Member header */}
                <div className="flex items-center gap-10" style={{ marginBottom: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: '0.75rem',
                  }}>
                    {(member.display_name || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-6" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                      {member.display_name || 'Unknown'}
                      {isSlacking && (
                        <span className="badge badge-red" style={{ fontSize: '0.55rem' }}>
                          <AlertTriangle size={9} /> Slacking
                        </span>
                      )}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {mCompleted}/{mTotal} done
                      </span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(150,150,150,0.12)', marginTop: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${mPercent}%`, height: '100%', borderRadius: 2,
                        background: mPercent >= 80 ? 'var(--accent-green)' : mPercent >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                </div>

                {/* Member's habits */}
                <div className="flex flex-col gap-6" style={{ paddingLeft: 42 }}>
                  {mHabits.map(habit => {
                    const approved = isApproved(habit.id);
                    return (
                      <div key={habit.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 'var(--radius-md)',
                        background: approved ? 'rgba(34,197,94,0.06)' : habit.status === 'completed' ? 'rgba(250,204,21,0.05)' : habit.status === 'missed' ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${approved ? 'rgba(34,197,94,0.15)' : 'var(--border-default)'}`,
                        fontSize: '0.85rem',
                      }}>
                        <span style={{ fontSize: '1.1rem' }}>{habit.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: 600,
                            textDecoration: approved ? 'line-through' : 'none',
                            opacity: approved ? 0.6 : 1,
                          }}>
                            {habit.title}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>
                            {approved ? '✅ You approved this' : habit.status === 'completed' ? '⏳ Needs your approval' : habit.status === 'missed' ? '❌ Missed' : '⏳ Not done yet'}
                          </div>
                        </div>

                        {habit.status === 'completed' && !approved ? (
                          <button
                            className="btn btn-green btn-sm"
                            onClick={() => handleApprove(habit.id)}
                            style={{ fontSize: '0.75rem' }}
                          >
                            <ThumbsUp size={12} /> Approve
                          </button>
                        ) : approved ? (
                          <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>
                            <ThumbsUp size={9} /> Approved
                          </span>
                        ) : habit.status === 'missed' ? (
                          <span className="badge badge-red" style={{ fontSize: '0.6rem' }}>Missed</span>
                        ) : (
                          <span className="badge badge-yellow" style={{ fontSize: '0.6rem' }}>Pending</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Slacker alerts */}
          {memberHabits.some(m => m.habits.filter(h => h.status === 'missed').length > 1) && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)',
              fontSize: '0.8rem', color: 'var(--accent-red)',
            }}>
              <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              <strong>Slacker Alert!</strong> Some team members have multiple missed habits today.
              {notificationsEnabled ? ' They have been notified.' : ' Enable notifications to nudge them!'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
