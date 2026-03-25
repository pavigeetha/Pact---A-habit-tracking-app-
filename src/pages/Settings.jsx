import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getUserLevel } from '../lib/levels'
import { Settings as SettingsIcon, LogOut, Bell, Shield, Palette, Flame } from 'lucide-react'

export default function Settings() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const level = getUserLevel(profile?.reputation || 0)

  async function handleSignOut() { await signOut(); navigate('/') }

  return (
    <div className="max-w-lg mx-auto animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-pact-500" /> Settings
      </h1>

      {/* Account */}
      <div className="card-glow space-y-4">
        <h3 className="section-title">Account</h3>
        <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-pact-50 to-transparent">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md bg-gradient-to-br ${level.color}`}>
            {(profile?.name || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900">{profile?.name}</p>
            <p className="text-sm text-slate-500">{profile?.email}</p>
            <div className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${level.bg} ${level.text}`}>
              {level.emoji} Lv.{level.level} {level.name}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-pact-500 flex items-center gap-1"><Flame className="w-4 h-4" /> {profile?.reputation || 0}</p>
            <p className="text-[10px] text-slate-400">reputation</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card-glow space-y-1">
        <h3 className="section-title mb-3">Preferences</h3>
        {[
          { icon: Bell, label: 'Push Notifications', desc: 'Get notified when your group is active', on: true },
          { icon: Shield, label: 'Private Profile', desc: 'Hide your stats from others', on: false },
          { icon: Palette, label: 'Dark Mode', desc: 'Coming soon', on: false },
        ].map(({ icon: Icon, label, desc, on }) => (
          <div key={label} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"><Icon className="w-4 h-4 text-slate-500" /></div>
              <div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${on ? 'bg-pact-500' : 'bg-slate-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${on ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out */}
      <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 font-semibold rounded-2xl hover:bg-red-100 transition-all hover:-translate-y-0.5">
        <LogOut className="w-5 h-5" /> Sign Out
      </button>
    </div>
  )
}
