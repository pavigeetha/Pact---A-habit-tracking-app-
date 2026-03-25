import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, User, Settings, LogOut, Bell, Menu, X, Flame } from 'lucide-react'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/clubs', label: 'Clubs', icon: Users },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (path) => location.pathname === path

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-pact-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="text-xl font-bold text-pact-700">PACT</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(to)
                    ? 'bg-pact-500 text-white shadow-md'
                    : 'text-slate-600 hover:bg-pact-50 hover:text-pact-700'
                }`}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-pact-600 transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <Link to="/profile" className="w-9 h-9 bg-pact-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {(profile?.name || '?')[0].toUpperCase()}
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-pact-50">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-pact-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(to) ? 'bg-pact-50 text-pact-700' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
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
