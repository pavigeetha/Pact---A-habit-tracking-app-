import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { ArrowRight, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function JoinGroup() {
  const { code: paramCode } = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState(paramCode || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim()) { toast.error('Please enter an invite code'); return }
    setLoading(true)
    try { const { group } = await api.groups.join(code.trim().toLowerCase()); toast.success(`Joined "${group.name}"!`); navigate(`/group/${group.id}`) }
    catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <div className="text-5xl mb-4">🤝</div>
        <h1 className="text-2xl font-bold text-slate-900">Join a Group</h1>
        <p className="text-slate-500 text-sm mt-1">Enter the invite code shared by your group.</p>
      </div>
      <form onSubmit={handleSubmit} className="card-glow space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Invite Code</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="input pl-11 text-center text-xl font-mono tracking-[0.3em] py-4" placeholder="enter code" maxLength={8} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">{loading ? 'Joining...' : 'Join Group'}{!loading && <ArrowRight className="w-4 h-4" />}</button>
      </form>
    </div>
  )
}
