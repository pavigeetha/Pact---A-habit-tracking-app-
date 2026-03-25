import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Plus, Trash2, ArrowRight, Copy, Check, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateGroup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [habits, setHabits] = useState([{ title: '', description: '', validation_type: 'self' }])
  const [loading, setLoading] = useState(false)
  const [createdGroup, setCreatedGroup] = useState(null)
  const [copied, setCopied] = useState(false)

  function addHabit() { setHabits([...habits, { title: '', description: '', validation_type: 'self' }]) }
  function removeHabit(i) { if (habits.length > 1) setHabits(habits.filter((_, j) => j !== i)) }
  function updateHabit(i, f, v) { const u = [...habits]; u[i][f] = v; setHabits(u) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name required'); return }
    if (habits.some(h => !h.title.trim())) { toast.error('All habits need a title'); return }
    setLoading(true)
    try { const { group } = await api.groups.create({ name: name.trim(), description: description.trim(), habits }); setCreatedGroup(group); toast.success('Created!') }
    catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  function copyCode() { navigator.clipboard.writeText(createdGroup.invite_code); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }

  if (createdGroup) {
    return (
      <div className="max-w-lg mx-auto animate-slide-up">
        <div className="card-glow text-center py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-pact-50 pointer-events-none" />
          <div className="relative">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Group Created!</h2>
            <p className="text-slate-500 mb-6">Share this invite code:</p>
            <div className="flex items-center justify-center gap-3 mb-8">
              <code className="text-3xl font-bold text-pact-600 bg-pact-50 px-6 py-3 rounded-2xl tracking-widest border border-pact-200">{createdGroup.invite_code}</code>
              <button onClick={copyCode} className="btn-secondary p-3 rounded-xl">{copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}</button>
            </div>
            <button onClick={() => navigate(`/group/${createdGroup.id}`)} className="btn-primary text-base py-3 px-8">Go to Group <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><span className="text-2xl">🏰</span> Create a Habit Group</h1><p className="text-slate-500 text-sm mt-1">Set up a shared space for habits.</p></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-glow space-y-4">
          <h3 className="section-title">Group Details</h3>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g., Morning Routine Squad" required /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[80px] resize-none" placeholder="What's this group about?" /></div>
        </div>
        <div className="card-glow space-y-4">
          <div className="flex items-center justify-between"><h3 className="section-title !mb-0">Habits</h3><button type="button" onClick={addHabit} className="btn-secondary text-xs py-1.5 px-3"><Plus className="w-3 h-3" /> Add</button></div>
          {habits.map((h, i) => (
            <div key={i} className="p-4 bg-gradient-to-r from-slate-50 to-pact-50/30 rounded-xl space-y-3 border border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1"><label className="block text-xs font-medium text-slate-600 mb-1">Title</label><input type="text" value={h.title} onChange={(e) => updateHabit(i, 'title', e.target.value)} className="input" placeholder="e.g., Meditate 10 min" required /></div>
                {habits.length > 1 && <button type="button" onClick={() => removeHabit(i)} className="mt-5 p-2 text-red-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Description</label><input type="text" value={h.description} onChange={(e) => updateHabit(i, 'description', e.target.value)} className="input" placeholder="Optional" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Validation</label><select value={h.validation_type} onChange={(e) => updateHabit(i, 'validation_type', e.target.value)} className="input"><option value="self">Self Report</option><option value="peer">Peer Validation</option></select></div>
              {h.validation_type === 'peer' && <p className="text-xs text-pact-600 bg-pact-50 px-3 py-2 rounded-lg flex items-center gap-1.5"><Shield className="w-3 h-3" /> Majority must approve.</p>}
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">{loading ? 'Creating...' : 'Create Group'}{!loading && <ArrowRight className="w-4 h-4" />}</button>
      </form>
    </div>
  )
}
