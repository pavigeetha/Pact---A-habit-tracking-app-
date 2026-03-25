import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import CastleVisual from '../components/CastleVisual'
import PactMembers from '../components/PactMembers'
import GlobalLeaderboard from '../components/GlobalLeaderboard'
import {
  Plus, UserPlus, Flame, CheckCircle2, Clock, ChevronRight,
  Zap, Target, Lock, Globe, X, ArrowRight, Star, Users
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateHabit, setShowCreateHabit] = useState(false)
  const [newHabitTitle, setNewHabitTitle] = useState('')
  const [newHabitDesc, setNewHabitDesc] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setData(await api.dashboard())
    } catch { toast.error('Failed to load dashboard') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  async function handleLog(habit) {
    try {
      await api.habits.log(habit.id, { proofText: 'Quick check-in' })
      toast.success('Logged!')
      load()
    } catch (err) { toast.error(err.message) }
  }

  async function createPrivateHabit(e) {
    e.preventDefault()
    if (!newHabitTitle.trim()) return
    try {
      await api.habits.create({ title: newHabitTitle.trim(), description: newHabitDesc.trim() })
      toast.success('Habit created!')
      setShowCreateHabit(false)
      setNewHabitTitle('')
      setNewHabitDesc('')
      load()
    } catch (err) { toast.error(err.message) }
  }

  async function dismissNotification(id) {
    try {
      await api.notifications.dismiss(id)
      setData(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== id) }))
    } catch {}
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-pact-200 border-t-pact-500 rounded-full animate-spin" />
      </div>
    )
  }

  const { groups, clubs, privateHabits, groupHabits, stats, pactMembers, primaryGroupName, leaderboard, notifications } = data

  return (
    <div className="animate-fade-in space-y-6">
      {/* Castle Visual */}
      {groups.length > 0 && (
        <CastleVisual groupName={primaryGroupName} points={groups[0]?.points || 0} />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hey, {profile?.name || 'there'}!</h1>
          <p className="text-slate-500 text-sm mt-1">Here&apos;s your habit overview for today.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCreateHabit(true)} className="btn-secondary">
            <Plus className="w-4 h-4" /> Private Habit
          </button>
          <Link to="/create-group" className="btn-primary"><Plus className="w-4 h-4" /> Create Group</Link>
        </div>
      </div>

      {/* Notifications */}
      {notifications?.length > 0 && (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className="flex items-center gap-3 px-4 py-3 bg-pact-50 border border-pact-100 rounded-xl">
              <Zap className="w-4 h-4 text-pact-500 shrink-0" />
              <p className="text-sm text-pact-800 flex-1">{n.message}</p>
              <button onClick={() => dismissNotification(n.id)} className="text-pact-400 hover:text-pact-600 text-xs font-medium">Dismiss</button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Reputation', value: profile?.reputation || 0, color: 'text-pact-600 bg-pact-100' },
          { icon: CheckCircle2, label: 'Done Today', value: `${stats.completedToday}/${stats.totalHabits}`, color: 'text-emerald-600 bg-emerald-100' },
          { icon: Lock, label: 'Private', value: stats.totalPrivate || 0, color: 'text-blue-600 bg-blue-100' },
          { icon: Globe, label: 'Group', value: stats.totalGroup || 0, color: 'text-amber-600 bg-amber-100' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg font-bold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3-column layout: Pact Members | Leaderboard | Habits */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pact Members */}
        <PactMembers members={pactMembers} groupName={primaryGroupName || 'Your Group'} />

        {/* Global Leaderboard */}
        <GlobalLeaderboard topGroups={leaderboard.topGroups} myGroups={leaderboard.myGroups} />

        {/* Habits Column */}
        <div className="space-y-4">
          {/* Private Habits */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-pact-700 uppercase tracking-wider flex items-center gap-2">
                <span className="text-base">🔒</span> Private Habits
              </h3>
              <button onClick={() => setShowCreateHabit(true)} className="text-xs text-pact-600 font-medium hover:text-pact-700">+ Add</button>
            </div>
            {privateHabits.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No private habits yet</p>
            ) : privateHabits.map(habit => {
              const isDone = habit.log?.status === 'self_completed'
              return (
                <div key={habit.id} className={`flex items-center gap-3 py-2 ${isDone ? 'opacity-60' : ''}`}>
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <button onClick={() => handleLog(habit)} className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-pact-500 shrink-0 transition-colors" />
                  )}
                  <span className={`text-sm flex-1 ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>{habit.title}</span>
                  {habit.streak > 0 && (
                    <span className="text-xs text-pact-500 font-semibold flex items-center gap-0.5">
                      <Flame className="w-3 h-3" />{habit.streak}d
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Group Habits */}
          <div className="card">
            <h3 className="text-sm font-bold text-pact-700 uppercase tracking-wider flex items-center gap-2 mb-3">
              <span className="text-base">🌐</span> Group Habits
            </h3>
            {groupHabits.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-400 mb-2">No group habits yet</p>
                <Link to="/join" className="text-xs text-pact-600 font-medium">Join a group</Link>
              </div>
            ) : groupHabits.map(habit => {
              const isDone = ['self_completed', 'approved'].includes(habit.log?.status)
              const isPending = habit.log?.status === 'pending'
              return (
                <div key={habit.id} className="flex items-center gap-3 py-2">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : isPending ? (
                    <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                  ) : (
                    <button onClick={() => handleLog(habit)} className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-pact-500 shrink-0 transition-colors" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>{habit.title}</span>
                    <p className="text-[10px] text-slate-400">{habit.groups?.name}</p>
                  </div>
                  {isPending && <span className="badge badge-amber text-[10px]">Pending</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Your Groups */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-pact-500" /> Your Groups
        </h2>
        {groups.length === 0 ? (
          <div className="card text-center py-8">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-3">No groups yet.</p>
            <div className="flex justify-center gap-3">
              <Link to="/create-group" className="btn-primary text-sm">Create Group</Link>
              <Link to="/join" className="btn-secondary text-sm">Join Group</Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {groups.map(group => (
              <Link key={group.id} to={`/group/${group.id}`} className="card flex items-center gap-4 group">
                <div className="w-12 h-12 bg-pact-100 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-pact-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 group-hover:text-pact-600 transition-colors">{group.name}</p>
                  <p className="text-xs text-slate-500 truncate">{group.description || 'No description'}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-amber-600 flex items-center gap-1"><Star className="w-3.5 h-3.5" />{group.points || 0}</span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-pact-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Your Clubs */}
      {(clubs || []).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-xl">🏛️</span> Your Clubs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map(club => (
              <Link key={club.id} to={`/clubs/${club.id}`} className="card-glow flex items-center gap-4 group">
                <div className="w-12 h-12 bg-gradient-to-br from-pact-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  🏛️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 group-hover:text-pact-600 transition-colors">{club.name}</p>
                  <p className="text-xs text-slate-500 truncate">{club.description || club.category || 'Club'}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-pact-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Create Private Habit Modal */}
      {showCreateHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">New Private Habit</h3>
              <button onClick={() => setShowCreateHabit(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Private habits use self-validation and are tracked by streaks.</p>
            <form onSubmit={createPrivateHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Habit Title</label>
                <input type="text" value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)} className="input" placeholder="e.g., Read for 30 minutes" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (optional)</label>
                <input type="text" value={newHabitDesc} onChange={(e) => setNewHabitDesc(e.target.value)} className="input" placeholder="Any details" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreateHabit(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create <ArrowRight className="w-4 h-4" /></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
