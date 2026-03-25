import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { getGroupLevel } from '../lib/levels'
import CastleVisual from '../components/CastleVisual'
import {
  Users, Trophy, CheckCircle2, Clock, Target, Shield,
  Copy, Check, ArrowLeft, Flame, ThumbsUp, ThumbsDown,
  AlertCircle, MessageSquare, X, Star, Plus, Crown
} from 'lucide-react'
import toast from 'react-hot-toast'

const tabs = ['Habits', 'Leaderboard', 'Approvals', 'Members']
const avatarColors = ['bg-pact-400', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-pink-400', 'bg-purple-400']

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
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [newHabitTitle, setNewHabitTitle] = useState('')
  const [newHabitDesc, setNewHabitDesc] = useState('')
  const [newHabitVal, setNewHabitVal] = useState('peer')

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
    } finally { setLoading(false) }
  }, [id, navigate])

  useEffect(() => { loadGroup() }, [loadGroup])

  async function handleLog(habit) {
    if (habit.validation_type === 'peer') { setLogModal(habit); return }
    try { await api.habits.log(habit.id, { proofText: 'Self check-in' }); toast.success('Logged!'); loadGroup() }
    catch (err) { toast.error(err.message) }
  }

  async function submitPeerLog(e) {
    e.preventDefault()
    if (!proofText.trim()) { toast.error('Please provide proof'); return }
    try { await api.habits.log(logModal.id, { proofText: proofText.trim() }); toast.success('Submitted for peer review!'); setLogModal(null); setProofText(''); loadGroup() }
    catch (err) { toast.error(err.message) }
  }

  async function handleVote(logId, decision) {
    try { await api.habits.vote(logId, decision); toast.success(decision === 'approved' ? 'Approved!' : 'Rejected'); loadGroup() }
    catch (err) { toast.error(err.message) }
  }

  async function addHabitToGroup(e) {
    e.preventDefault()
    if (!newHabitTitle.trim()) return
    try {
      await api.habits.addToGroup(id, { habits: [{ title: newHabitTitle.trim(), description: newHabitDesc.trim(), validation_type: newHabitVal }] })
      toast.success('Habit added!'); setShowAddHabit(false); setNewHabitTitle(''); setNewHabitDesc(''); loadGroup()
    } catch (err) { toast.error(err.message) }
  }

  function copyCode() { navigator.clipboard.writeText(group.invite_code); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-pact-200 border-t-pact-500 rounded-full animate-spin" /></div>

  const level = getGroupLevel(group.points || 0)

  return (
    <div className="animate-fade-in space-y-6">
      <CastleVisual groupName={group.name} points={group.points || 0} />

      <div className="card-glow">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-pact-500 mb-3 transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><span className="text-2xl">{level.emoji}</span> {group.name}</h1>
            {group.description && <p className="text-slate-500 text-sm mt-1">{group.description}</p>}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="badge badge-pact"><Users className="w-3 h-3" /> {members.length} members</span>
              <span className="badge badge-emerald"><Target className="w-3 h-3" /> {habits.length} habits</span>
              <span className={`badge ${level.bg} ${level.text}`}><Star className="w-3 h-3" /> Lv.{level.level} {level.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono text-pact-600 bg-pact-50 px-4 py-2 rounded-xl border border-pact-200">{group.invite_code}</code>
            <button onClick={copyCode} className="p-2.5 rounded-xl text-slate-400 hover:text-pact-500 hover:bg-pact-50 transition-all">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-white border border-pact-100 rounded-2xl p-1.5 shadow-sm">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === tab ? 'bg-gradient-to-r from-pact-500 to-pact-600 text-white shadow-md' : 'text-slate-500 hover:bg-pact-50'}`}>
            {tab}{tab === 'Approvals' && pendingApprovals.length > 0 && <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] bg-red-500 text-white rounded-full font-bold">{pendingApprovals.length}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'Habits' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex justify-end"><button onClick={() => setShowAddHabit(true)} className="btn-secondary text-sm"><Plus className="w-4 h-4" /> Add Habit</button></div>
          {habits.length === 0 ? (
            <div className="card-glow text-center py-12"><div className="text-4xl mb-3">🎯</div><p className="text-slate-500 mb-3">No habits yet.</p><button onClick={() => setShowAddHabit(true)} className="btn-primary text-sm">Add the first one</button></div>
          ) : habits.map(habit => {
            const isDone = ['self_completed', 'approved'].includes(habit.log?.status)
            const isPending = habit.log?.status === 'pending'
            return (
              <div key={habit.id} className={`card-glow flex items-center gap-4 ${isDone ? '!border-emerald-200 !bg-emerald-50/50' : ''}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-100' : isPending ? 'bg-amber-100' : 'bg-slate-100'}`}>
                  {isDone ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : isPending ? <Clock className="w-6 h-6 text-amber-500" /> : <Target className="w-6 h-6 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${isDone ? 'text-emerald-700' : 'text-slate-900'}`}>{habit.title}</p>
                  {habit.description && <p className="text-xs text-slate-400 mt-0.5">{habit.description}</p>}
                  <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${habit.validation_type === 'peer' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}><Shield className="w-2.5 h-2.5" /> {habit.validation_type === 'peer' ? 'Peer' : 'Self'}</span>
                </div>
                {!habit.log && <button onClick={() => handleLog(habit)} className="btn-primary text-sm py-2"><CheckCircle2 className="w-4 h-4" /> Check In</button>}
                {isPending && <span className="badge badge-amber">Awaiting</span>}
                {isDone && <span className="badge badge-emerald">Done</span>}
                {habit.log?.status === 'rejected' && <span className="badge badge-red">Rejected</span>}
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'Leaderboard' && (
        <div className="card-glow animate-fade-in">
          <h3 className="section-title"><Trophy className="w-4 h-4" /> Group Rankings</h3>
          {leaderboard.length === 0 ? (
            <div className="text-center py-10"><div className="text-4xl mb-3">🏆</div><p className="text-slate-400">No data yet.</p></div>
          ) : <div className="space-y-2">
            {leaderboard.map((m, i) => (
              <div key={m.user_id} className={`flex items-center gap-4 p-3 rounded-xl ${i === 0 ? 'bg-amber-50' : i === 1 ? 'bg-slate-50' : i === 2 ? 'bg-orange-50' : 'hover:bg-slate-50'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-200 text-amber-800' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-orange-200 text-orange-800' : 'bg-slate-100 text-slate-500'}`}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${avatarColors[i % avatarColors.length]}`}>{(m.profiles?.name || '?').slice(0, 2).toUpperCase()}</div>
                <div className="flex-1"><p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">{m.profiles?.name}{m.user_id === user?.id && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">YOU</span>}</p></div>
                <p className="font-bold text-pact-600 flex items-center gap-1"><Flame className="w-4 h-4" /> {m.reputation}</p>
              </div>
            ))}
          </div>}
        </div>
      )}

      {activeTab === 'Approvals' && (
        <div className="space-y-3 animate-fade-in">
          {pendingApprovals.length === 0 ? (
            <div className="card-glow text-center py-12"><div className="text-4xl mb-3">✅</div><p className="text-slate-400">No pending approvals.</p></div>
          ) : pendingApprovals.map(log => (
            <div key={log.id} className="card-glow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><span className="text-amber-700 font-bold text-sm">{(log.profiles?.name || '?')[0].toUpperCase()}</span></div>
                <div className="flex-1"><p className="font-semibold text-slate-900 text-sm">{log.profiles?.name}</p><p className="text-xs text-slate-500">checked in for <span className="font-semibold text-slate-700">{log.habits?.title}</span></p></div>
                <span className="badge badge-amber"><Clock className="w-3 h-3" /> Pending</span>
              </div>
              {log.proof_text && <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"><MessageSquare className="w-3 h-3 inline" /> Proof</p><p className="text-sm text-slate-700">{log.proof_text}</p></div>}
              <div className="flex gap-2">
                <button onClick={() => handleVote(log.id, 'approved')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-xl hover:bg-emerald-100 transition-all"><ThumbsUp className="w-4 h-4" /> Approve</button>
                <button onClick={() => handleVote(log.id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-100 transition-all"><ThumbsDown className="w-4 h-4" /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Members' && (
        <div className="card-glow animate-fade-in">
          <h3 className="section-title"><Users className="w-4 h-4" /> Members</h3>
          <div className="space-y-1">{members.map((m, i) => (
            <div key={m.user_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-pact-50/50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${avatarColors[i % avatarColors.length]}`}>{(m.profiles?.name || '?').slice(0, 2).toUpperCase()}</div>
              <div className="flex-1"><p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">{m.profiles?.name}{i === 0 && <Crown className="w-3.5 h-3.5 text-amber-500" />}{m.user_id === user?.id && <span className="text-[10px] bg-pact-100 text-pact-600 px-1.5 py-0.5 rounded-full font-bold">YOU</span>}</p><p className="text-xs text-slate-400">{m.profiles?.email}</p></div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-pact-500"><Flame className="w-4 h-4" /> {m.reputation || 0}</div>
            </div>
          ))}</div>
        </div>
      )}

      {logModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-slate-900">Submit Check-In</h3><button onClick={() => { setLogModal(null); setProofText('') }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4"><p className="text-sm text-amber-800 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> Peer validation required.</p></div>
            <p className="text-sm text-slate-500 mb-4">Habit: <span className="font-semibold text-slate-900">{logModal.title}</span></p>
            <form onSubmit={submitPeerLog} className="space-y-4">
              <textarea value={proofText} onChange={(e) => setProofText(e.target.value)} className="input min-h-[100px] resize-none" placeholder="Describe what you did..." required />
              <div className="flex gap-3"><button type="button" onClick={() => { setLogModal(null); setProofText('') }} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Submit</button></div>
            </form>
          </div>
        </div>
      )}

      {showAddHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-slate-900">Add Habit</h3><button onClick={() => setShowAddHabit(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
            <form onSubmit={addHabitToGroup} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label><input type="text" value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)} className="input" placeholder="e.g., Solve a LeetCode problem" required /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label><input type="text" value={newHabitDesc} onChange={(e) => setNewHabitDesc(e.target.value)} className="input" placeholder="Any details" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Validation</label><select value={newHabitVal} onChange={(e) => setNewHabitVal(e.target.value)} className="input"><option value="peer">Peer Validation</option><option value="self">Self Report</option></select></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowAddHabit(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Add</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
