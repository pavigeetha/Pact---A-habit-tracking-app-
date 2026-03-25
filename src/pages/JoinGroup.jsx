import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { UserPlus, ArrowRight, Search } from 'lucide-react'
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
    try {
      const { group } = await api.groups.join(code.trim().toLowerCase())
      toast.success(`Joined "${group.name}"!`)
      navigate(`/group/${group.id}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-violet-500" /> Join a Group
        </h1>
        <p className="text-slate-500 text-sm mt-1">Enter the invite code shared by your group.</p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Invite Code</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
              className="input pl-10 text-center text-lg font-mono tracking-widest"
              placeholder="enter code" maxLength={8} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Joining...' : 'Join Group'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  )
}
