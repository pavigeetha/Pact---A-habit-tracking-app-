import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Search, Plus, Users, ChevronRight, X, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const categories = ['all', 'reading', 'fitness', 'writing', 'coding', 'wellness', 'music', 'art', 'general']
const categoryEmojis = { all: '🌐', reading: '📚', fitness: '💪', writing: '✍️', coding: '💻', wellness: '🧘', music: '🎵', art: '🎨', general: '⭐' }

export default function Clubs() {
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategory, setNewCategory] = useState('general')

  useEffect(() => { loadClubs() }, [category])

  async function loadClubs() {
    try { setLoading(true); const params = {}; if (category !== 'all') params.category = category; if (search) params.search = search; const data = await api.clubs.list(params); setClubs(data.clubs || []) }
    catch { toast.error('Failed to load clubs') }
    finally { setLoading(false) }
  }

  async function handleSearch(e) { e.preventDefault(); loadClubs() }

  async function createClub(e) {
    e.preventDefault()
    if (!newName.trim()) return
    try { const { club } = await api.clubs.create({ name: newName.trim(), description: newDesc.trim(), category: newCategory }); toast.success('Club created!'); setShowCreate(false); navigate(`/clubs/${club.id}`) }
    catch (err) { toast.error(err.message) }
  }

  async function joinClub(clubId) {
    try { await api.clubs.join(clubId); toast.success('Joined!'); loadClubs() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-pact-100 via-pink-50 to-amber-50 p-8 relative overflow-hidden">
        <div className="absolute top-4 right-6 text-6xl opacity-20">🏛️</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Clubs</h1>
        <p className="text-slate-600 text-sm mb-4 max-w-md">Find people with similar goals, join communities, and take on weekly challenges together.</p>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create Club</button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-11" placeholder="Search clubs..." />
      </form>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              category === cat ? 'bg-gradient-to-r from-pact-500 to-pact-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-pact-300 hover:bg-pact-50'
            }`}>{categoryEmojis[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
        ))}
      </div>

      {/* Club Grid */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-pact-200 border-t-pact-500 rounded-full animate-spin" /></div>
      ) : clubs.length === 0 ? (
        <div className="card-glow text-center py-12">
          <div className="text-5xl mb-3">🏛️</div>
          <p className="text-slate-500 mb-3">No clubs found. Be the first!</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">Create Club</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(club => (
            <div key={club.id} className="card-glow flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pact-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl shrink-0">{categoryEmojis[club.category] || '⭐'}</div>
                <div className="flex-1 min-w-0">
                  <Link to={`/clubs/${club.id}`} className="font-bold text-slate-900 hover:text-pact-600 transition-colors">{club.name}</Link>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{club.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" /> {club.memberCount} members</span>
                {club.isMember ? (
                  <Link to={`/clubs/${club.id}`} className="text-xs font-semibold text-pact-600 flex items-center gap-1 hover:text-pact-700">View <ChevronRight className="w-3 h-3" /></Link>
                ) : (
                  <button onClick={() => joinClub(club.id)} className="btn-primary text-xs py-1.5 px-4">Join</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-slate-900">Create a Club</h3><button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
            <form onSubmit={createClub} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Club Name</label><input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="input" placeholder="e.g., Bookworm Society" required /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label><textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="input min-h-[80px] resize-none" placeholder="What's this club about?" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label><select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input">{categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{categoryEmojis[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Create <ArrowRight className="w-4 h-4" /></button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
