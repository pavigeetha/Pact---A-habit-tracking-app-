import { Castle, Trophy, Swords, BarChart3, Home } from 'lucide-react';

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-items">
        <button className="mobile-nav-item active" id="nav-home">
          <Home size={20} />
          Home
        </button>
        <button className="mobile-nav-item" id="nav-base"
          onClick={() => document.getElementById('base-health')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Castle size={20} />
          Base
        </button>
        <button className="mobile-nav-item" id="nav-leaderboard"
          onClick={() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Trophy size={20} />
          Ranks
        </button>
        <button className="mobile-nav-item" id="nav-attack"
          onClick={() => document.getElementById('attack-panel')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Swords size={20} />
          Attack
        </button>
        <button className="mobile-nav-item" id="nav-stats"
          onClick={() => document.getElementById('activity-chart')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <BarChart3 size={20} />
          Stats
        </button>
      </div>
    </nav>
  );
}
