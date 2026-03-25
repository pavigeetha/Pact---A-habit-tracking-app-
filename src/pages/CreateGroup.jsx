import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Plus, Trash2, Users, ArrowRight, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateGroup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [habits, setHabits] = useState([
    { title: '', description: '', validation_type: 'self' }
  ])
  const [loading, setLoading] = useState(false)
  const [createdGroup, setCreatedGroup] = useState(null)
  const [copied, setCopied] = useState(false)

  function addHabit() {
    setHabits([...habits, { title: '', description: '', validation_type: 'self' }])
  }

  function removeHabit(index) {
    if (habits.length === 1) return
    setHabits(habits.filter((_, i) => i !== index))
  }

  function updateHabit(index, field, value) {
    const updated = [...habits]
    updated[index][field] = value
    setHabits(updated)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Group name is required'); return }
    if (habits.some(h => !h.title.trim())) { toast.error('All habits must have a title'); return }

    setLoading(true)
    try {
      const { group } = await api.groups.create({ name: name.trim(), description: description.trim(), habits })
      setCreatedGroup(group)
      toast.success('Group created!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(createdGroup.invite_code)
    setCopied(true)
    toast.success('Invite code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (createdGroup) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="card text-center py-10">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Group Created!</h2>
          <p className="text-slate-500 mb-6">Share this invite code with your group:</p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <code className="text-3xl font-bold text-violet-600 bg-violet-50 px-6 py-3 rounded-xl tracking-widest">
              {createdGroup.invite_code}
            </code>
            <button onClick={copyCode} className="btn-secondary p-3">
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <button onClick={() => navigate(`/group/${createdGroup.id}`)} className="btn-primary">
            Go to Group <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-violet-500" /> Create a Habit Group
        </h1>
        <p className="text-slate-500 text-sm mt-1">Set up a shared space for your group&apos;s habits.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-900">Group Details</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Group Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="input" placeholder="e.g., Morning Routine Squad" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[80px] resize-none" placeholder="What is this group about?" />
          </div>
        </div>
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Habits</h3>
            <button type="button" onClick={addHabit} className="btn-secondary text-xs py-1.5 px-3">
              <Plus className="w-3 h-3" /> Add Habit
            </button>
          </div>
          {habits.map((habit, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Habit Title</label>
                  <input type="text" value={habit.title}
                    onChange={(e) => updateHabit(index, 'title', e.target.value)}
                    className="input" placeholder="e.g., Meditate for 10 minutes" required />
                </div>
                {habits.length > 1 && (
                  <button type="button" onClick={() => removeHabit(index)}
                    className="mt-5 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description (optional)</label>
                <input type="text" value={habit.description}
                  onChange={(e) => updateHabit(index, 'description', e.target.value)}
                  className="input" placeholder="Any details or rules" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Validation</label>
                <select value={habit.validation_type}
                  onChange={(e) => updateHabit(index, 'validation_type', e.target.value)} className="input">
                  <option value="self">Self Report</option>
                  <option value="peer">Peer Validation</option>
                </select>
              </div>
              {habit.validation_type === 'peer' && (
                <p className="text-xs text-violet-600 bg-violet-50 px-3 py-2 rounded-lg">
                  Group members will vote to validate each check-in. A majority is needed for approval.
                </p>
              )}
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Creating...' : 'Create Group'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  )
}
