import { useState } from 'react';
import { CLUBS, USER_JOINED_CLUBS } from '../data/clubData';
import { useSupabaseActions, useToast, useGameState } from '../context/GameContext';
import { Users, TrendingUp, ArrowRight, Sparkles, Search, Plus, KeyRound, Loader } from 'lucide-react';

function getStoredClubJoins() {
  try { return JSON.parse(localStorage.getItem('pact_joined_clubs') || '[]'); }
  catch { return []; }
}

export default function ClubBrowser({ onOpenClub }) {
  const [joinedClubs, setJoinedClubs] = useState(() => [...USER_JOINED_CLUBS, ...getStoredClubJoins()]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [showPactForm, setShowPactForm] = useState(null); // 'create' | 'join' | null
  const [pactName, setPactName] = useState('');
  const [pactCode, setPactCode] = useState('');
  const [pactLoading, setPactLoading] = useState(false);
  const [pactError, setPactError] = useState('');
  const actions = useSupabaseActions();
  const addToast = useToast();
  const { allGroups } = useGameState();

  const handleJoinClub = (clubId, e) => {
    e.stopPropagation();
    if (!joinedClubs.includes(clubId)) {
      const updated = [...joinedClubs, clubId];
      setJoinedClubs(updated);
      // Persist to localStorage
      const stored = getStoredClubJoins();
      localStorage.setItem('pact_joined_clubs', JSON.stringify([...stored, clubId]));
      addToast('🎉 Joined the club!', 'success');
    }
  };

  const handleCreatePact = async () => {
    if (!pactName.trim()) return;
    setPactLoading(true);
    setPactError('');
    try {
      const group = await actions.createGroup(pactName.trim());
      addToast(`🏰 Pact "${pactName}" created! Code: ${group.invite_code}`, 'success');
      setShowPactForm(null);
      setPactName('');
    } catch (err) {
      setPactError(err.message || 'Failed to create pact');
    } finally {
      setPactLoading(false);
    }
  };

  const handleJoinPact = async () => {
    if (pactCode.trim().length < 4) return;
    setPactLoading(true);
    setPactError('');
    try {
      await actions.joinGroup(pactCode.trim().toUpperCase());
      addToast('🎉 Joined the pact!', 'success');
      setShowPactForm(null);
      setPactCode('');
    } catch (err) {
      setPactError(err.message || 'Invalid code');
    } finally {
      setPactLoading(false);
    }
  };

  const filtered = CLUBS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="clubs-section">
      {/* Header */}
      <div className="clubs-header">
        <div>
          <h2 className="clubs-title">
            <Sparkles size={22} style={{ color: 'var(--accent-purple)' }} />
            Explore Clubs
          </h2>
          <p className="clubs-subtitle">
            Join interest-based communities. Compete, earn points, and unlock real-world rewards.
          </p>
        </div>
        <div className="clubs-search-wrapper">
          <Search size={16} className="clubs-search-icon" />
          <input
            type="text"
            className="clubs-search"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            id="club-search"
          />
        </div>
      </div>

      {/* Create / Join Pact Quick Actions */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <button className="btn btn-purple btn-sm" onClick={() => setShowPactForm(showPactForm === 'create' ? null : 'create')}>
          <Plus size={14} /> Create New Pact
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => setShowPactForm(showPactForm === 'join' ? null : 'join')}>
          <KeyRound size={14} /> Join Pact by Code
        </button>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          You're in {allGroups.length} pact{allGroups.length !== 1 ? 's' : ''}
        </span>
      </div>

      {showPactForm && (
        <div className="card fade-in-up" style={{ marginBottom: 20, padding: 16 }}>
          {showPactForm === 'create' ? (
            <div>
              <div className="section-title" style={{ marginBottom: 8 }}><Plus size={12} /> CREATE NEW PACT</div>
              <div className="flex gap-8">
                <input
                  className="habit-input"
                  placeholder="Pact name..."
                  value={pactName}
                  onChange={e => setPactName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreatePact()}
                  autoFocus
                />
                <button className="btn btn-green btn-sm" onClick={handleCreatePact} disabled={pactLoading}>
                  {pactLoading ? <Loader size={14} className="spin-icon" /> : 'Create'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="section-title" style={{ marginBottom: 8 }}><KeyRound size={12} /> JOIN PACT</div>
              <div className="flex gap-8">
                <input
                  className="habit-input"
                  placeholder="Enter invite code..."
                  value={pactCode}
                  onChange={e => setPactCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleJoinPact()}
                  style={{ textTransform: 'uppercase', letterSpacing: 2 }}
                  autoFocus
                />
                <button className="btn btn-purple btn-sm" onClick={handleJoinPact} disabled={pactLoading}>
                  {pactLoading ? <Loader size={14} className="spin-icon" /> : 'Join'}
                </button>
              </div>
            </div>
          )}
          {pactError && (
            <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: 8 }}>
              ⚠️ {pactError}
            </div>
          )}
        </div>
      )}

      {/* Club Cards Grid */}
      <div className="clubs-grid stagger">
        {filtered.map((club) => {
          const isJoined = joinedClubs.includes(club.id);
          const isHovered = hoveredId === club.id;

          return (
            <div
              key={club.id}
              className="club-card fade-in-up"
              onClick={() => onOpenClub(club.id)}
              onMouseEnter={() => setHoveredId(club.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                '--club-color': club.color,
                '--club-glow': club.colorGlow,
                cursor: 'pointer',
              }}
              id={`club-${club.id}`}
            >
              <div className="club-card-strip" style={{ background: club.gradient }} />

              {club.trending && (
                <div className="club-trending-badge">
                  <TrendingUp size={10} /> Trending
                </div>
              )}

              <div className="club-icon-wrapper" style={{ background: club.colorGlow }}>
                <span className="club-icon">{club.icon}</span>
              </div>

              <h3 className="club-name">{club.name}</h3>
              <span className="club-category">{club.category}</span>
              <p className="club-description">{club.description}</p>

              <div className="club-stats">
                <div className="club-stat">
                  <Users size={13} />
                  <span>{club.members.toLocaleString()} members</span>
                </div>
                <div className="club-stat">
                  <span>⚔️</span>
                  <span>{club.activeSquads} squads</span>
                </div>
              </div>

              <div className="club-partner-label">
                🤝 {club.partnerLabel}
              </div>

              <div className="club-card-actions">
                {isJoined ? (
                  <button className="btn btn-outline btn-sm club-enter-btn" onClick={(e) => { e.stopPropagation(); onOpenClub(club.id); }}>
                    Enter Club
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button className="btn btn-sm club-join-btn" style={{ background: club.gradient, color: '#fff' }} onClick={(e) => handleJoinClub(club.id, e)}>
                    Join Club
                  </button>
                )}
                {isJoined && <span className="badge badge-green">Joined</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
