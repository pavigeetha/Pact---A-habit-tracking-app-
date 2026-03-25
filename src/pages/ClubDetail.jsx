import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Users, Trophy, Calendar, ChevronRight, Star, Check, Plus, X, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const tabs = ['Groups', 'Challenges', 'Members']
const avatarColors = ['bg-pact-400', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-pink-400', 'bg-purple-400']

export default function ClubDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [members, setMembers] = useState([])
  const [groups, setGroups] = useState([])
  const [challenges, setChallenges] = useState([])
  const [isMember, setIsMember] = useState(false)
  const [activeTab, setActiveTab] = useState('Groups')
  const [loading, setLoading] = useState(true)
  const [showCreateChallenge, setShowCreateChallenge] = useState(false)
  const [challengeTitle, setChallengeTitle] = useState('')
  const [challengeDesc, setChallengeDesc] = useState('')

  useEffect(() => { loadClub() }, [id])

  async function loadClub() {
    try { setLoading(true); const data = await api.clubs.get(id); setClub(data.club); setMembers(data.members || []); setGroups(data.groups || []); setChallenges(data.challenges || []); setIsMember(data.isMember) }
    catch { navigate('/clubs') }
    finally { setLoading(false) }
  }

  async function handleJoin() { try { await api.clubs.join(id); toast.success('Joined!'); loadClub() } catch (err) { toast.error(err.message) } }
  async function handleLeave() { try { await api.clubs.leave(id); toast.success('Left club'); loadClub() } catch (err) { toast.error(err.message) } }

  async function createChallenge(e) {
    e.preventDefault()
    if (!challengeTitle.trim()) return
    const startDate = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    try { await api.clubs.createChallenge(id, { title: challengeTitle.trim(), description: challengeDesc.trim(), startDate, endDate }); toast.success('Challenge created!'); setShowCreateChallenge(false); setChallengeTitle(''); loadClub() }
    catch (err) { toast.error(err.message) }
  }

  async function joinChallenge(cid) { try { await api.clubs.joinChallenge(cid); toast.success('Joined!'); loadClub() } catch (err) { toast.error(err.message) } }
  async function completeChallenge(cid) { try { await api.clubs.completeChallenge(cid); toast.success('Completed!'); loadClub() } catch (err) { toast.error(err.message) } }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-pact-200 border-t-pact-500 rounded-full animate-spin" /></div>

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="card-glow relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pact-50 via-transparent to-pink-50 pointer-events-none" />
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{club.name}</h1>
              {club.description && <p className="text-slate-500 text-sm mt-1">{club.description}</p>}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="badge badge-pact">{club.category}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" /> {members.length} members</span>
                <span className="text-xs text-slate-500 flex items-center gap-1"><Trophy className="w-3 h-3" /> {groups.length} groups</span>
              </div>
            </div>
            {isMember ? (
              <button onClick={handleLeave} className="btn-secondary text-red-500 border-red-200 hover:bg-red-50 text-sm">Leave</button>
            ) : (
              <button onClick={handleJoin} className="btn-primary">Join Club</button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-pact-100 rounded-2xl p-1.5 shadow-sm">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === tab ? 'bg-gradient-to-r from-pact-500 to-pact-600 text-white shadow-md' : 'text-slate-500 hover:bg-pact-50'}`}>{tab}</button>
        ))}
      </div>

      {/* Groups */}
      {activeTab === 'Groups' && (
        <div className="space-y-3 animate-fade-in">
          {isMember && (
            <Link to="/create-group" className="card-glow flex items-center gap-3 !border-dashed !border-pact-300 text-pact-600 hover:!bg-pact-50"><Plus className="w-5 h-5" /> <span className="font-medium text-sm">Create a group in this club</span></Link>
          )}
          {groups.map(g => (
            <Link key={g.id} to={`/group/${g.id}`} className="card-glow flex items-center gap-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-pact-100 to-pink-100 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-pact-600" /></div>
              <div className="flex-1"><p className="font-semibold text-slate-900 group-hover:text-pact-600 transition-colors text-sm">{g.name}</p><p className="text-xs text-slate-400">{g.memberCount} members · {g.points || 0} pts</p></div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-pact-500" />
            </Link>
          ))}
          {groups.length === 0 && <div className="card-glow text-center py-10"><div className="text-4xl mb-3">👥</div><p className="text-slate-400 text-sm">No groups yet.</p></div>}
        </div>
      )}

      {/* Challenges */}
      {activeTab === 'Challenges' && (
        <div className="space-y-3 animate-fade-in">
          {isMember && (
            <button onClick={() => setShowCreateChallenge(true)} className="card-glow flex items-center gap-3 !border-dashed !border-pact-300 text-pact-600 hover:!bg-pact-50 w-full text-left"><Plus className="w-5 h-5" /> <span className="font-medium text-sm">Create a weekly challenge</span></button>
          )}
          {challenges.map(c => {
            const isActive = new Date(c.end_date) >= new Date()
            return (
              <div key={c.id} className="card-glow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{c.title}</p>
                    {c.description && <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>}
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.start_date} → {c.end_date} · {c.participantCount} joined</p>
                  </div>
                  {!isActive && <span className="badge bg-slate-100 text-slate-500">Ended</span>}
                  {isActive && c.completed && <span className="badge badge-emerald">Done</span>}
                </div>
                {isActive && !c.joined && <button onClick={() => joinChallenge(c.id)} className="btn-primary text-xs w-full mt-2">Join Challenge</button>}
                {isActive && c.joined && !c.completed && <button onClick={() => completeChallenge(c.id)} className="btn-secondary text-xs w-full mt-2"><Check className="w-3 h-3" /> Mark Complete</button>}
              </div>
            )
          })}
          {challenges.length === 0 && <div className="card-glow text-center py-10"><div className="text-4xl mb-3">🏆</div><p className="text-slate-400 text-sm">No challenges yet.</p></div>}
        </div>
      )}

      {/* Members */}
      {activeTab === 'Members' && (
        <div className="card-glow animate-fade-in">
          <h3 className="section-title"><Users className="w-4 h-4" /> Members</h3>
          <div className="space-y-1">
            {members.map((m, i) => (
              <div key={m.user_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-pact-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${avatarColors[i % avatarColors.length]}`}>{(m.profiles?.name || '?').slice(0, 2).toUpperCase()}</div>
                <div className="flex-1"><p className="font-semibold text-slate-900 text-sm">{m.profiles?.name}</p><p className="text-xs text-slate-400">{m.role}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-slate-900">New Weekly Challenge</h3><button onClick={() => setShowCreateChallenge(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
            <form onSubmit={createChallenge} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label><input type="text" value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} className="input" placeholder="e.g., Read 3 chapters" required /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label><textarea value={challengeDesc} onChange={(e) => setChallengeDesc(e.target.value)} className="input min-h-[80px] resize-none" placeholder="Rules and details" /></div>
              <p className="text-xs text-slate-400">Runs for 7 days starting today.</p>
              <div className="flex gap-3"><button type="button" onClick={() => setShowCreateChallenge(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Create <ArrowRight className="w-4 h-4" /></button></div>
            </form>
          </div>
        </div>
      )}

      {/* AI Advisor */}
    </div>
  )
}
