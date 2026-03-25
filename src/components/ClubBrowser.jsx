import { useState } from 'react';
import { CLUBS, USER_JOINED_CLUBS } from '../data/clubData';
import { Users, TrendingUp, ArrowRight, Sparkles, Search } from 'lucide-react';

export default function ClubBrowser({ onOpenClub }) {
  const [joinedClubs, setJoinedClubs] = useState(USER_JOINED_CLUBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  const handleJoin = (clubId, e) => {
    e.stopPropagation();
    if (!joinedClubs.includes(clubId)) {
      setJoinedClubs(prev => [...prev, clubId]);
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
              {/* Gradient top strip */}
              <div className="club-card-strip" style={{ background: club.gradient }} />

              {/* Trending badge */}
              {club.trending && (
                <div className="club-trending-badge">
                  <TrendingUp size={10} />
                  Trending
                </div>
              )}

              {/* Icon */}
              <div
                className="club-icon-wrapper"
                style={{ background: club.colorGlow }}
              >
                <span className="club-icon">{club.icon}</span>
              </div>

              {/* Info */}
              <h3 className="club-name">{club.name}</h3>
              <span className="club-category">{club.category}</span>
              <p className="club-description">{club.description}</p>

              {/* Stats */}
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

              {/* Partner label */}
              <div className="club-partner-label">
                🤝 {club.partnerLabel}
              </div>

              {/* Action */}
              <div className="club-card-actions">
                {isJoined ? (
                  <button className="btn btn-outline btn-sm club-enter-btn" onClick={(e) => { e.stopPropagation(); onOpenClub(club.id); }}>
                    Enter Club
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button className="btn btn-sm club-join-btn" style={{ background: club.gradient, color: '#fff' }} onClick={(e) => handleJoin(club.id, e)}>
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
