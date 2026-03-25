import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { User, Flame, TrendingUp, Trophy, Target, CheckCircle2, Award, Shield } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [streaks, setStreaks] = useState([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [groupCount, setGroupCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadProfile()
  }, [user])

  async function loadProfile() {
    try {
      setLoading(true)
      const data = await api.profile()
      setProfile(data.user)
      setStreaks(data.streaks || [])
      setTotalLogs(data.totalLogs || 0)
      setGroupCount(data.groupCount || 0)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  function getLevel(rep) {
    if (rep >= 500) return { name: 'Legend', color: 'text-amber-600 bg-amber-100', icon: Trophy }
    if (rep >= 200) return { name: 'Veteran', color: 'text-violet-600 bg-violet-100', icon: Award }
    if (rep >= 100) return { name: 'Committed', color: 'text-emerald-600 bg-emerald-100', icon: Shield }
    if (rep >= 25) return { name: 'Rising', color: 'text-blue-600 bg-blue-100', icon: TrendingUp }
    return { name: 'Newcomer', color: 'text-slate-600 bg-slate-100', icon: User }
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  const level = getLevel(profile.reputation || 0)
  const LevelIcon = level.icon

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div className="card text-center">
        <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-violet-600">{(profile.name || '?')[0].toUpperCase()}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
        <p className="text-slate-500 text-sm">{profile.email}</p>
        <div className={`inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full text-sm font-semibold ${level.color}`}>
          <LevelIcon className="w-4 h-4" /> {level.name}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Reputation', value: profile.reputation || 0, color: 'text-violet-600 bg-violet-100' },
          { icon: TrendingUp, label: 'Best Streak', value: streaks.length > 0 ? Math.max(...streaks.map(s => s.longestStreak)) : 0, color: 'text-emerald-600 bg-emerald-100' },
          { icon: CheckCircle2, label: 'Completions', value: totalLogs, color: 'text-blue-600 bg-blue-100' },
          { icon: Target, label: 'Groups', value: groupCount, color: 'text-amber-600 bg-amber-100' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Flame className="w-5 h-5 text-emerald-500" /> Active Streaks
        </h2>
        {streaks.filter(s => s.currentStreak > 0).length === 0 ? (
          <div className="card text-center py-8">
            <Flame className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No active streaks. Start checking in!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {streaks.filter(s => s.currentStreak > 0).map(s => (
              <div key={s.habit_id} className="card flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.groupName}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">{s.currentStreak}</p>
                  <p className="text-xs text-slate-500">days</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-400">{s.longestStreak}</p>
                  <p className="text-xs text-slate-500">best</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-4">Reputation Levels</h3>
        <div className="space-y-3">
          {[
            { name: 'Newcomer', min: 0, max: 24, color: 'bg-slate-400' },
            { name: 'Rising', min: 25, max: 99, color: 'bg-blue-500' },
            { name: 'Committed', min: 100, max: 199, color: 'bg-emerald-500' },
            { name: 'Veteran', min: 200, max: 499, color: 'bg-violet-500' },
            { name: 'Legend', min: 500, max: 999, color: 'bg-amber-500' },
          ].map(lvl => {
            const rep = profile.reputation || 0
            const progress = rep >= lvl.max ? 100 : rep >= lvl.min ? ((rep - lvl.min) / (lvl.max - lvl.min)) * 100 : 0
            const isActive = rep >= lvl.min && rep <= lvl.max
            return (
              <div key={lvl.name} className={`flex items-center gap-3 ${isActive ? '' : 'opacity-50'}`}>
                <span className={`text-xs font-medium w-20 ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{lvl.name}</span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${lvl.color}`} style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{lvl.max}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
