import { useCurrentTeam, useGameState } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Zap, Swords, Heart } from 'lucide-react';

export default function AnimatedBase() {
  const team = useCurrentTeam();
  const { themeId } = useTheme();
  const { groupMembers } = useGameState();
  if (!team) return null;

  const hp = team.hp;
  const maxHp = team.maxHp || 100;
  const hpPercent = (hp / maxHp) * 100;
  const isHealthy = hpPercent > 60;
  const isWarning = hpPercent > 30 && hpPercent <= 60;
  const isCritical = hpPercent <= 30;
  const isCottage = themeId === 'cottagecore';

  // Base level based on HP
  const level = hpPercent > 80 ? 5 : hpPercent > 60 ? 4 : hpPercent > 40 ? 3 : hpPercent > 20 ? 2 : 1;
  const levelNames = { 1: 'Outpost', 2: 'Camp', 3: 'Fortress', 4: 'Stronghold', 5: 'Citadel' };
  const midnightNames = { 1: 'Terminal', 2: 'Hub', 3: 'Station', 4: 'Nexus', 5: 'Core' };

  const statusColor = isHealthy ? 'var(--accent-green)' : isWarning ? 'var(--accent-yellow)' : 'var(--accent-red)';
  const memberCount = groupMembers?.length || 1;

  return (
    <div className={`game-base ${isCritical ? 'base-damaged' : ''} ${isCottage ? 'theme-cottage' : 'theme-midnight'}`} id="animated-base">
      {/* Fortress Visualization */}
      <div className="game-base-visual">
        <svg viewBox="0 0 400 200" className="base-fortress-svg">
          {isCottage ? (
            /* Medieval Fortress Theme */
            <g className="fortress-group">
              {/* Ground */}
              <rect x="0" y="170" width="400" height="30" fill="var(--base-ground)" rx="2"/>
              
              {/* Outer Walls */}
              <rect x="60" y="120" width="280" height="50" fill="var(--base-wall)" rx="3" className="wall-main"/>
              <rect x="60" y="115" width="280" height="8" fill="var(--base-wall-top)" rx="2"/>
              {/* Battlements */}
              {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                <rect key={i} x={65 + i * 24} y="108" width="14" height="10" fill="var(--base-wall-top)" rx="1"/>
              ))}
              
              {/* Left Tower */}
              <rect x="50" y="80" width="40" height="90" fill="var(--base-tower)" rx="2"/>
              <polygon points="50,80 70,55 90,80" fill="var(--base-roof)" className="tower-roof-left"/>
              <rect x="63" y="100" width="14" height="18" fill="var(--base-window)" rx="7 7 0 0" className="window-glow"/>
              <rect x="63" y="130" width="14" height="18" fill="var(--base-window)" rx="7 7 0 0" className="window-glow delay-1"/>
              
              {/* Right Tower */}
              <rect x="310" y="80" width="40" height="90" fill="var(--base-tower)" rx="2"/>
              <polygon points="310,80 330,55 350,80" fill="var(--base-roof)" className="tower-roof-right"/>
              <rect x="323" y="100" width="14" height="18" fill="var(--base-window)" rx="7 7 0 0" className="window-glow delay-2"/>
              <rect x="323" y="130" width="14" height="18" fill="var(--base-window)" rx="7 7 0 0" className="window-glow"/>
              
              {/* Main Keep */}
              <rect x="140" y="70" width="120" height="100" fill="var(--base-keep)" rx="3"/>
              <polygon points="135,70 200,30 265,70" fill="var(--base-roof)" className="keep-roof"/>
              {/* Keep Windows */}
              <rect x="160" y="90" width="16" height="22" fill="var(--base-window)" rx="8 8 0 0" className="window-glow delay-1"/>
              <rect x="192" y="90" width="16" height="22" fill="var(--base-window)" rx="8 8 0 0" className="window-glow delay-3"/>
              <rect x="224" y="90" width="16" height="22" fill="var(--base-window)" rx="8 8 0 0" className="window-glow"/>
              {/* Gate */}
              <rect x="180" y="130" width="40" height="40" fill="var(--base-gate)" rx="20 20 0 0"/>
              <rect x="198" y="130" width="4" height="40" fill="var(--base-gate-bar)"/>
              
              {/* Flag */}
              <line x1="200" y1="30" x2="200" y2="10" stroke="var(--base-wall-top)" strokeWidth="2"/>
              <polygon points="200,10 225,18 200,26" fill={statusColor} className="flag-wave"/>
              
              {/* Shield emblem on wall */}
              {team.shieldActive && (
                <g className="shield-emblem pulse-glow">
                  <circle cx="200" cy="155" r="10" fill="rgba(167,139,250,0.3)" stroke="var(--accent-purple)" strokeWidth="1.5"/>
                  <text x="200" y="159" textAnchor="middle" fontSize="10" fill="var(--accent-purple)">🛡</text>
                </g>
              )}
            </g>
          ) : (
            /* Cyberpunk/Midnight City Theme */
            <g className="cyber-base-group">
              {/* Ground with neon line */}
              <rect x="0" y="170" width="400" height="30" fill="var(--base-ground)" rx="2"/>
              <line x1="0" y1="171" x2="400" y2="171" stroke="var(--neon-accent)" strokeWidth="1" className="neon-line"/>
              
              {/* Main Structure */}
              <rect x="100" y="60" width="200" height="110" fill="var(--base-wall)" rx="4" className="cyber-building"/>
              {/* Neon trim */}
              <rect x="100" y="58" width="200" height="3" fill="var(--neon-accent)" className="neon-pulse" rx="1"/>
              <rect x="100" y="167" width="200" height="3" fill="var(--neon-accent)" className="neon-pulse delay-2" rx="1"/>
              <line x1="100" y1="60" x2="100" y2="170" stroke="var(--neon-accent)" strokeWidth="1" className="neon-pulse delay-1"/>
              <line x1="300" y1="60" x2="300" y2="170" stroke="var(--neon-accent)" strokeWidth="1" className="neon-pulse delay-3"/>
              
              {/* Windows Grid */}
              {[0,1,2,3].map(row => 
                [0,1,2,3,4].map(col => (
                  <rect key={`${row}-${col}`} x={118 + col * 36} y={72 + row * 22} width="20" height="12" rx="2"
                    fill={(row + col) % 3 === 0 ? 'var(--neon-accent)' : 'var(--base-window)'}
                    className={`cyber-window ${(row + col) % 3 === 0 ? 'window-active' : ''}`}
                    opacity={(row + col) % 3 === 0 ? 0.9 : 0.3}
                  />
                ))
              )}
              
              {/* Left Antenna Tower */}
              <rect x="60" y="100" width="30" height="70" fill="var(--base-tower)" rx="3"/>
              <line x1="75" y1="100" x2="75" y2="75" stroke="var(--base-tower)" strokeWidth="3"/>
              <circle cx="75" cy="73" r="3" fill="var(--neon-accent)" className="neon-pulse"/>
              
              {/* Right Antenna Tower */}
              <rect x="310" y="110" width="30" height="60" fill="var(--base-tower)" rx="3"/>
              <line x1="325" y1="110" x2="325" y2="85" stroke="var(--base-tower)" strokeWidth="3"/>
              <circle cx="325" cy="83" r="3" fill="var(--neon-secondary)" className="neon-pulse delay-2"/>
              
              {/* Central Dish/Dome */}
              <ellipse cx="200" cy="60" rx="30" ry="12" fill="var(--base-roof)" className="cyber-dome"/>
              <line x1="200" y1="48" x2="200" y2="30" stroke="var(--base-tower)" strokeWidth="2"/>
              <circle cx="200" cy="28" r="4" fill={statusColor} className="neon-pulse"/>
              
              {/* Gate */}
              <rect x="175" y="145" width="50" height="25" fill="var(--base-gate)" rx="2"/>
              <rect x="180" y="148" width="40" height="19" fill="var(--neon-accent)" opacity="0.15" rx="2" className="gate-scan"/>
              
              {/* Shield glow */}
              {team.shieldActive && (
                <g className="shield-hex pulse-glow">
                  <polygon points="200,38 210,44 210,56 200,62 190,56 190,44" fill="none" stroke="var(--accent-purple)" strokeWidth="1.5"/>
                  <polygon points="200,42 206,46 206,54 200,58 194,54 194,46" fill="rgba(167,139,250,0.2)"/>
                </g>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Stats Bar */}
      <div className="game-base-stats">
        <div className="base-stat-item">
          <span className="base-stat-label">
            {isCottage ? '🏰' : '🔮'} Lv.{level} {isCottage ? levelNames[level] : midnightNames[level]}
          </span>
        </div>
        <div className="base-stat-item">
          <Heart size={12} style={{ color: statusColor }} />
          <span className="base-stat-value" style={{ color: statusColor }}>{hp}/{maxHp}</span>
        </div>
        <div className="base-stat-item">
          <Swords size={12} />
          <span className="base-stat-value">ATK {Math.floor(hp * 0.8)}</span>
        </div>
        <div className="base-stat-item">
          <Shield size={12} />
          <span className="base-stat-value">DEF {Math.floor(hp * 0.5 + memberCount * 5)}</span>
        </div>
        {team.shieldActive && (
          <div className="base-stat-item shield-badge-stat">
            <Shield size={12} style={{ color: 'var(--accent-purple)' }} />
            <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>SHIELDED</span>
          </div>
        )}
      </div>
    </div>
  );
}
