import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (name.length < 2) { toast.error('Name is required'); return }
    setLoading(true)
    try { await signUp(email, password, name); toast.success('Welcome to Pact!'); navigate('/dashboard') }
    catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pact-400 via-pact-500 to-pact-700 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><span className="text-3xl">🌸</span><span className="text-2xl font-bold text-white">PACT</span></Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-pact-200">Start building habits with your group</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md rounded-2xl p-8 space-y-4 shadow-2xl">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label><div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input pl-10" placeholder="John Doe" required /></div></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@example.com" required /></div></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="Minimum 6 characters" required /></div></div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">{loading ? 'Creating...' : 'Create Account'}{!loading && <ArrowRight className="w-4 h-4" />}</button>
          <p className="text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="text-pact-600 font-semibold hover:text-pact-700">Sign in</Link></p>
        </form>
      </div>
    </div>
  )
}
