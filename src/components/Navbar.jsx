import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Plus, UserPlus, User, LogOut, Menu, X, Flame } from 'lucide-react'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/create-group', label: 'Create Group', icon: Plus },
    { to: '/join', label: 'Join Group', icon: UserPlus },
  ]

  const isActive = (path) => location.pathname === path

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Pact</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to) ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {profile && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-full">
                <Flame className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-700">{profile.reputation || 0}</span>
              </div>
            )}
            <Link to="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/profile') ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100'
              }`}>
              <User className="w-4 h-4" /> {profile?.name || 'Profile'}
            </Link>
            <button onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to) ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
            <Link to="/profile" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
              <User className="w-4 h-4" /> Profile
            </Link>
            <button onClick={() => { handleSignOut(); setMobileOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
