import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { getUserLevel, USER_LEVELS } from '../lib/levels'
import { Flame, TrendingUp, Trophy, Target, CheckCircle2, Gift, Lock, Star } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [streaks, setStreaks] = useState([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [groupCount, setGroupCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) loadProfile() }, [user])

  async function loadProfile() {
    try {
      setLoading(true)
      const data = await api.profile()
      setProfile(data.user)
      setStreaks(data.streaks || [])
      setTotalLogs(data.totalLogs || 0)
      setGroupCount(data.groupCount || 0)
    } catch {} finally { setLoading(false) }
  }

  if (loading || !profile) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-pact-200 border-t-pact-500 rounded-full animate-spin" /></div>

  const level = getUserLevel(profile.reputation || 0)

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      {/* Profile Header */}
      <div className="card-glow text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pact-100/50 via-transparent to-pink-100/50 pointer-events-none" />
        <div className="relative">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold shadow-lg bg-gradient-to-br ${level.color}`}>
            {(profile.name || '?')[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
          <p className="text-slate-500 text-sm">{profile.email}</p>
          <div className="mt-4 inline-flex flex-col items-center">
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold ${level.bg} ${level.text} shadow-sm`}>
              <span className="text-lg">{level.emoji}</span> Lv.{level.level} {level.name}
            </div>
            {level.nextLevel && (
              <div className="mt-3 w-48">
                <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
                  <span>{profile.reputation} rep</span>
                  <span>{level.nextLevel.minRep} to {level.nextLevel.name}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all duration-1000`} style={{ width: `${level.progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Reputation', value: profile.reputation || 0, color: 'text-pact-600 bg-pact-100' },
          { icon: TrendingUp, label: 'Best Streak', value: streaks.length > 0 ? Math.max(...streaks.map(s => s.longestStreak)) : 0, color: 'text-emerald-600 bg-emerald-100' },
          { icon: CheckCircle2, label: 'Completions', value: totalLogs, color: 'text-blue-600 bg-blue-100' },
          { icon: Target, label: 'Groups', value: groupCount, color: 'text-amber-600 bg-amber-100' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card-glow text-center">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}><Icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Streaks */}
      <div className="card-glow">
        <h3 className="section-title"><Flame className="w-4 h-4" /> Active Streaks</h3>
        {streaks.filter(s => s.currentStreak > 0).length === 0 ? (
          <div className="text-center py-8"><div className="text-4xl mb-3">🔥</div><p className="text-slate-400">No active streaks. Start checking in!</p></div>
        ) : (
          <div className="space-y-2">
            {streaks.filter(s => s.currentStreak > 0).map(s => (
              <div key={s.habit_id} className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-transparent border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center"><Flame className="w-6 h-6 text-emerald-500" /></div>
                <div className="flex-1"><p className="font-semibold text-slate-900 text-sm">{s.title}</p><p className="text-xs text-slate-400">{s.groupName}</p></div>
                <div className="text-right"><p className="text-xl font-bold text-emerald-600">{s.currentStreak}</p><p className="text-[10px] text-slate-400">days</p></div>
                <div className="text-right"><p className="text-sm font-semibold text-slate-300">{s.longestStreak}</p><p className="text-[10px] text-slate-400">best</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Levels & Rewards */}
      <div className="card-glow">
        <h3 className="section-title"><Gift className="w-4 h-4" /> Levels & Rewards</h3>
        <div className="space-y-3">
          {USER_LEVELS.map((lvl) => {
            const rep = profile.reputation || 0
            const isUnlocked = rep >= lvl.minRep
            const isCurrent = lvl.level === level.level
            return (
              <div key={lvl.level} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                isCurrent ? 'bg-gradient-to-r from-pact-50 to-amber-50 border border-pact-200 shadow-sm' :
                isUnlocked ? 'bg-slate-50' : 'opacity-40'
              }`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${isUnlocked ? lvl.bg : 'bg-slate-100'}`}>
                  {isUnlocked ? lvl.emoji : <Lock className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <span className={isUnlocked ? 'text-slate-900' : 'text-slate-400'}>Lv.{lvl.level} {lvl.name}</span>
                    {isCurrent && <span className="text-[10px] bg-pact-500 text-white px-2 py-0.5 rounded-full font-bold">CURRENT</span>}
                    {isUnlocked && !isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Star className="w-3 h-3" /> {lvl.reward}</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">{lvl.minRep}+ rep</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
