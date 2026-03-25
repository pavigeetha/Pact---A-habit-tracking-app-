import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try { await signIn(email, password); toast.success('Welcome back!'); navigate('/dashboard') }
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
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-pact-200">Sign in to continue your habits</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md rounded-2xl p-8 space-y-5 shadow-2xl">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@example.com" required /></div></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="Your password" required /></div></div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">{loading ? 'Signing in...' : 'Sign In'}{!loading && <ArrowRight className="w-4 h-4" />}</button>
          <p className="text-center text-sm text-slate-600">Don&apos;t have an account? <Link to="/register" className="text-pact-600 font-semibold hover:text-pact-700">Sign up</Link></p>
        </form>
      </div>
    </div>
  )
}
