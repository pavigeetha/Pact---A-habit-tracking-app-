import { useState } from 'react';
import { useGameState, useToast, useSupabaseActions } from '../context/GameContext';
import { CheckCircle, XCircle, ListChecks, Plus, Trash2, X, Users, User } from 'lucide-react';

const HABIT_ICONS = ['📚', '💪', '📖', '🧘', '💧', '🏃', '🎨', '💻', '🎵', '🍎', '✍️', '🧠', '🛌', '🚶', '📝'];

export default function HabitList() {
  const { habits, revivalMode, revivalProgress, group, groupMembers } = useGameState();
  const addToast = useToast();
  const actions = useSupabaseActions();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('📚');
  const [habitScope, setHabitScope] = useState('private'); // 'private' or 'group'

  const handleComplete = (habitId, title) => {
    actions.completeHabit(habitId);
    addToast(`✅ "${title}" completed! +10 HP`, 'success');
  };

  const handleMiss = (habitId, title) => {
    actions.missHabit(habitId);
    addToast(`❌ "${title}" missed! -15 HP`, 'danger');
  };

  const handleAddHabit = async () => {
    if (!newTitle.trim()) return;

    if (habitScope === 'group' && group && groupMembers.length > 0) {
      // Add habit for all group members
      await actions.addGroupHabit(newTitle.trim(), newIcon);
      addToast(`👥 Group habit "${newTitle.trim()}" added for all ${groupMembers.length} members!`, 'success');
    } else {
      actions.addHabit(newTitle.trim(), newIcon);
      addToast(`➕ New habit "${newTitle.trim()}" added!`, 'info');
    }
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

  return (
    <div className="card" id="habit-list">
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>
          <ListChecks size={14} />
          TODAY'S HABITS
        </div>
        <button
          className="btn btn-purple btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
          id="add-habit-btn"
        >
          {showAddForm ? <X size={14} /> : <Plus size={14} />}
          {showAddForm ? 'Cancel' : 'Add'}
        </button>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
        {completedCount}/{habits.length} completed
        {revivalMode && (
          <span style={{ color: 'var(--accent-red)', marginLeft: 8 }}>
            🔥 Revival: {revivalProgress}/3
          </span>
        )}
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
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
              fontSize: '0.75rem',
              color: 'var(--accent-purple)',
              marginBottom: 8,
              padding: '4px 8px',
              background: 'rgba(167,139,250,0.08)',
              borderRadius: 'var(--radius-sm)',
            }}>
              👥 This habit will be added for all {groupMembers?.length || 0} group members
            </div>
          )}
          <div className="flex gap-8" style={{ marginBottom: 10 }}>
            <input
              type="text"
              className="habit-input"
              placeholder="Enter habit name..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
              autoFocus
              id="new-habit-input"
            />
            <button className="btn btn-green btn-sm" onClick={handleAddHabit} id="save-habit-btn">
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            {HABIT_ICONS.map(icon => (
              <button
                key={icon}
                className={`icon-picker-btn ${newIcon === icon ? 'selected' : ''}`}
                onClick={() => setNewIcon(icon)}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 stagger">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="fade-in-up"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: habit.status === 'completed'
                ? 'rgba(34, 197, 94, 0.08)'
                : habit.status === 'missed'
                ? 'rgba(239, 68, 68, 0.08)'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${
                habit.status === 'completed'
                  ? 'rgba(34, 197, 94, 0.2)'
                  : habit.status === 'missed'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'var(--border-default)'
              }`,
              transition: 'all var(--transition-base)',
            }}
          >
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{habit.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: habit.status === 'completed' ? 'line-through' : 'none',
                color: habit.status === 'missed' ? 'var(--text-muted)' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                {habit.title}
                {habit.is_group_habit && (
                  <span style={{
                    fontSize: '0.6rem',
                    background: 'rgba(167,139,250,0.12)',
                    color: 'var(--accent-purple)',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                  }}>
                    GROUP
                  </span>
                )}
              </div>
            </div>

            {habit.status === 'pending' ? (
              <div className="flex gap-8 items-center">
                <button
                  className="btn btn-green btn-sm"
                  onClick={() => handleComplete(habit.id, habit.title)}
                  id={`complete-${habit.id}`}
                >
                  <CheckCircle size={14} />
                  Done
                </button>
                <button
                  className="btn btn-red btn-sm"
                  onClick={() => handleMiss(habit.id, habit.title)}
                  id={`miss-${habit.id}`}
                >
                  <XCircle size={14} />
                  Miss
                </button>
                <button
                  className="habit-delete-btn"
                  onClick={() => handleDeleteHabit(habit.id, habit.title)}
                  title="Delete habit"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-8 items-center">
                <div className={`badge ${habit.status === 'completed' ? 'badge-green' : 'badge-red'}`}>
                  {habit.status === 'completed' ? 'Done' : 'Missed'}
                </div>
                <button
                  className="habit-delete-btn"
                  onClick={() => handleDeleteHabit(habit.id, habit.title)}
                  title="Delete habit"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}

        {habits.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No habits yet. Click "Add" to create your first habit! ✨
          </div>
        )}
      </div>
    </div>
  );
}
