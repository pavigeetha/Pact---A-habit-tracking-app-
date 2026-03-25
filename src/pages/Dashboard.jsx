import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import {
  Plus, UserPlus, Flame, TrendingUp, Users, CheckCircle2,
  Clock, ChevronRight, Zap, Target
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [groups, setGroups] = useState([])
  const [todaysHabits, setTodaysHabits] = useState([])
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState({ completedToday: 0, totalHabits: 0 })
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.dashboard()
      setGroups(data.groups || [])
      setTodaysHabits(data.todaysHabits || [])
      setNotifications(data.notifications || [])
      setStats(data.stats || { completedToday: 0, totalHabits: 0 })
    } catch (err) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) loadDashboard()
  }, [user, loadDashboard])

  async function handleQuickLog(habit) {
    try {
      await api.habits.log(habit.id, { proofText: 'Quick check-in' })
      toast.success('Logged!')
      loadDashboard()
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function dismissNotification(id) {
    try {
      await api.notifications.dismiss(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hey, {profile?.name || 'there'}!</h1>
          <p className="text-slate-500 text-sm mt-1">Here&apos;s your habit overview for today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/create-group" className="btn-primary"><Plus className="w-4 h-4" /> Create Group</Link>
          <Link to="/join" className="btn-secondary"><UserPlus className="w-4 h-4" /> Join Group</Link>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className="flex items-center gap-3 px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl">
              <Zap className="w-4 h-4 text-violet-500 shrink-0" />
              <p className="text-sm text-violet-800 flex-1">{n.message}</p>
              <button onClick={() => dismissNotification(n.id)}
                className="text-violet-400 hover:text-violet-600 text-xs font-medium">Dismiss</button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Reputation', value: profile?.reputation || 0, color: 'text-violet-600 bg-violet-100' },
          { icon: CheckCircle2, label: 'Done Today', value: `${stats.completedToday}/${stats.totalHabits}`, color: 'text-blue-600 bg-blue-100' },
          { icon: Users, label: 'Groups', value: groups.length, color: 'text-amber-600 bg-amber-100' },
          { icon: TrendingUp, label: 'Habits', value: stats.totalHabits, color: 'text-emerald-600 bg-emerald-100' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg font-bold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-500" /> Today&apos;s Habits
        </h2>
        {todaysHabits.length === 0 ? (
          <div className="card text-center py-10">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-3">No habits yet. Join or create a group to get started!</p>
            <div className="flex justify-center gap-3">
              <Link to="/create-group" className="btn-primary text-sm">Create Group</Link>
              <Link to="/join" className="btn-secondary text-sm">Join Group</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {todaysHabits.map(habit => {
              const isDone = ['self_completed', 'approved'].includes(habit.log?.status)
              const isPending = habit.log?.status === 'pending'
              return (
                <div key={habit.id} className={`card flex items-center gap-4 ${isDone ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDone ? 'bg-emerald-100' : isPending ? 'bg-amber-100' : 'bg-slate-100'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
                     isPending ? <Clock className="w-5 h-5 text-amber-600" /> :
                     <Target className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isDone ? 'text-emerald-800' : 'text-slate-900'}`}>{habit.title}</p>
                    <p className="text-xs text-slate-500">
                      {habit.groups?.name} &middot; {habit.validation_type === 'peer' ? 'Peer validated' : 'Self reported'}
                    </p>
                  </div>
                  {!habit.log && (
                    <button onClick={() => handleQuickLog(habit)} className="btn-primary text-xs py-2 px-3">Check In</button>
                  )}
                  {isPending && <span className="badge badge-amber">Pending</span>}
                  {isDone && <span className="badge badge-emerald">Done</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-500" /> Your Groups
        </h2>
        {groups.length === 0 ? (
          <div className="card text-center py-10">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">You haven&apos;t joined any groups yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {groups.map(group => (
              <Link key={group.id} to={`/group/${group.id}`} className="card flex items-center gap-4 group">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">{group.name}</p>
                  <p className="text-xs text-slate-500 truncate">{group.description || 'No description'}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
