import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import {
  Users, Trophy, CheckCircle2, Clock, Target, Shield,
  Copy, Check, ArrowLeft, Flame, ThumbsUp, ThumbsDown,
  AlertCircle, MessageSquare, X, Star
} from 'lucide-react'
import toast from 'react-hot-toast'

const tabs = ['Habits', 'Leaderboard', 'Approvals', 'Members']

export default function Group() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [habits, setHabits] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [activeTab, setActiveTab] = useState('Habits')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [logModal, setLogModal] = useState(null)
  const [proofText, setProofText] = useState('')

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.groups.get(id)
      setGroup(data.group)
      setMembers(data.members || [])
      setHabits(data.habits || [])
      setLeaderboard(data.leaderboard || [])
      setPendingApprovals(data.pendingApprovals || [])
    } catch {
      toast.error('Group not found')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { loadGroup() }, [loadGroup])

  async function handleLog(habit) {
    if (habit.validation_type === 'peer') {
      setLogModal(habit)
      return
    }
    try {
      await api.habits.log(habit.id, { proofText: 'Self check-in' })
      toast.success('Logged!')
      loadGroup()
    } catch (err) { toast.error(err.message) }
  }

  async function submitPeerLog(e) {
    e.preventDefault()
    if (!proofText.trim()) { toast.error('Please provide proof'); return }
    try {
      await api.habits.log(logModal.id, { proofText: proofText.trim() })
      toast.success('Submitted for peer review!')
      setLogModal(null)
      setProofText('')
      loadGroup()
    } catch (err) { toast.error(err.message) }
  }

  async function handleVote(logId, decision) {
    try {
      await api.habits.vote(logId, decision)
      toast.success(decision === 'approved' ? 'Approved!' : 'Rejected')
      loadGroup()
    } catch (err) { toast.error(err.message) }
  }

  function copyCode() {
    navigator.clipboard.writeText(group.invite_code)
    setCopied(true)
    toast.success('Invite code copied!')
    setTimeout(() => setCopied(false), 2000)
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
      {/* Header */}
      <div className="card">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-violet-500" /> {group.name}
            </h1>
            {group.description && <p className="text-slate-500 text-sm mt-1">{group.description}</p>}
            <div className="flex items-center gap-4 mt-3">
              <span className="badge badge-violet"><Users className="w-3 h-3" /> {members.length} members</span>
              <span className="badge badge-emerald"><Target className="w-3 h-3" /> {habits.length} habits</span>
              <span className="badge badge-amber"><Star className="w-3 h-3" /> {group.points || 0} pts</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg">{group.invite_code}</code>
            <button onClick={copyCode} className="p-2 text-slate-400 hover:text-violet-600 transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}>
            {tab}
            {tab === 'Approvals' && pendingApprovals.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-white rounded-full">
                {pendingApprovals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Habits */}
      {activeTab === 'Habits' && (
        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="card text-center py-10">
              <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No habits in this group yet.</p>
            </div>
          ) : habits.map(habit => {
            const isDone = ['self_completed', 'approved'].includes(habit.log?.status)
            const isPending = habit.log?.status === 'pending'
            const isRejected = habit.log?.status === 'rejected'
            return (
              <div key={habit.id} className={`card flex items-center gap-4 ${isDone ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isDone ? 'bg-emerald-100' : isPending ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                  {isDone ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> :
                   isPending ? <Clock className="w-6 h-6 text-amber-600" /> :
                   <Target className="w-6 h-6 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${isDone ? 'text-emerald-800' : 'text-slate-900'}`}>{habit.title}</p>
                  {habit.description && <p className="text-xs text-slate-500 mt-0.5">{habit.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`badge text-[10px] ${habit.validation_type === 'peer' ? 'badge-amber' : 'badge-emerald'}`}>
                      <Shield className="w-2.5 h-2.5" /> {habit.validation_type === 'peer' ? 'Peer' : 'Self'}
                    </span>
                  </div>
                </div>
                {!habit.log && (
                  <button onClick={() => handleLog(habit)} className="btn-primary text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Check In
                  </button>
                )}
                {isPending && <span className="badge badge-amber">Awaiting Votes</span>}
                {isDone && <span className="badge badge-emerald">Completed</span>}
                {isRejected && <span className="badge badge-red">Rejected</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'Leaderboard' && (
        <div className="card">
          {leaderboard.length === 0 ? (
            <div className="text-center py-10">
              <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No data yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leaderboard.map((m, i) => (
                <div key={m.user_id} className="flex items-center gap-4 py-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                  }`}>{i + 1}</div>
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-violet-600 font-semibold text-sm">{(m.profiles?.name || '?')[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{m.profiles?.name}</p>
                    <p className="text-xs text-slate-500">{m.profiles?.email}</p>
                  </div>
                  <p className="font-bold text-violet-600 flex items-center gap-1">
                    <Flame className="w-4 h-4" /> {m.reputation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approvals */}
      {activeTab === 'Approvals' && (
        <div className="space-y-3">
          {pendingApprovals.length === 0 ? (
            <div className="card text-center py-10">
              <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No pending approvals.</p>
            </div>
          ) : pendingApprovals.map(log => (
            <div key={log.id} className="card">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-amber-600 font-semibold text-sm">{(log.profiles?.name || '?')[0].toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{log.profiles?.name}</p>
                  <p className="text-sm text-slate-500">
                    checked in for <span className="font-medium text-slate-700">{log.habits?.title}</span>
                  </p>
                </div>
                <span className="badge badge-amber"><Clock className="w-3 h-3" /> Pending</span>
              </div>
              {log.proof_text && (
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Proof
                  </p>
                  <p className="text-sm text-slate-700">{log.proof_text}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => handleVote(log.id, 'approved')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 font-medium text-sm rounded-lg hover:bg-emerald-100 transition-colors">
                  <ThumbsUp className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => handleVote(log.id, 'rejected')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-700 font-medium text-sm rounded-lg hover:bg-red-100 transition-colors">
                  <ThumbsDown className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members */}
      {activeTab === 'Members' && (
        <div className="card">
          <div className="divide-y divide-slate-100">
            {members.map(m => (
              <div key={m.user_id} className="flex items-center gap-3 py-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-600 font-semibold text-sm">{(m.profiles?.name || '?')[0].toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {m.profiles?.name}
                    {m.user_id === user?.id && <span className="text-xs text-slate-400 ml-2">(you)</span>}
                  </p>
                  <p className="text-xs text-slate-500">{m.profiles?.email}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-violet-600 font-semibold">
                  <Flame className="w-4 h-4" /> {m.reputation || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Modal for Peer Validation */}
      {logModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Submit Check-In</h3>
              <button onClick={() => { setLogModal(null); setProofText('') }} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                This habit requires peer validation. Provide proof for your group.
              </p>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Habit: <span className="font-semibold text-slate-900">{logModal.title}</span>
            </p>
            <form onSubmit={submitPeerLog}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Proof / Description</label>
                <textarea value={proofText} onChange={(e) => setProofText(e.target.value)}
                  className="input min-h-[100px] resize-none"
                  placeholder="Describe what you did or provide evidence..." required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setLogModal(null); setProofText('') }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Submit for Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
