import { useState, useEffect } from 'react';
import { useCurrentTeam, useGameState } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Zap, Swords, Heart } from 'lucide-react';

export default function AnimatedBase() {
  const team = useCurrentTeam();
  const { themeId } = useTheme();
  const { groupMembers, attacksToday } = useGameState();
  const [attackFlash, setAttackFlash] = useState(false);
  const [lastAttackCount, setLastAttackCount] = useState(0);

  // Trigger attack animation when new attacks arrive
  useEffect(() => {
    if (attacksToday && attacksToday.length > lastAttackCount && lastAttackCount > 0) {
      setAttackFlash(true);
      setTimeout(() => setAttackFlash(false), 1500);
    }
    setLastAttackCount(attacksToday?.length || 0);
  }, [attacksToday?.length]);

  if (!team) return null;

  const hp = team.hp;
  const maxHp = team.maxHp || 100;
  const hpPercent = (hp / maxHp) * 100;
  const isHealthy = hpPercent > 60;
  const isWarning = hpPercent > 30 && hpPercent <= 60;
  const isCritical = hpPercent <= 30;
  const isCottage = themeId === 'cottagecore';

  // Level based on HP — determines visual complexity AND size
  const level = hpPercent > 80 ? 5 : hpPercent > 60 ? 4 : hpPercent > 40 ? 3 : hpPercent > 20 ? 2 : 1;
  const levelNames = { 1: 'Outpost', 2: 'Camp', 3: 'Fortress', 4: 'Stronghold', 5: 'Citadel' };
  const midnightNames = { 1: 'Terminal', 2: 'Hub', 3: 'Station', 4: 'Nexus', 5: 'Core' };

  // DRAMATIC scale: level 1 = 0.35x (tiny), level 5 = 1.0x (full)
  const scaleFactor = 0.3 + (level - 1) * 0.175;
  // Container height also changes dramatically
  const containerHeight = 120 + (level - 1) * 40; // 120px to 280px
  const statusColor = isHealthy ? 'var(--accent-green)' : isWarning ? 'var(--accent-yellow)' : 'var(--accent-red)';
  const memberCount = groupMembers?.length || 1;

  return (
    <div
      className={`game-base ${isCritical ? 'base-damaged' : ''} ${isCottage ? 'theme-cottage' : 'theme-midnight'} ${attackFlash ? 'base-under-attack' : ''}`}
      id="animated-base"
    >
      {/* Attack flash overlay */}
      {attackFlash && (
        <div className="attack-flash-overlay">
          <div className="attack-flash-text">⚔️ BASE UNDER ATTACK!</div>
        </div>
      )}

      {/* Fortress Visualization */}
      <div className="game-base-visual" style={{
        height: containerHeight,
        transition: 'height 0.8s ease',
      }}>
        <svg viewBox="0 0 400 220" className="base-fortress-svg" style={{
          maxHeight: containerHeight,
          transition: 'max-height 0.8s ease',
        }}>
          {isCottage ? (
            /* Medieval Fortress — scales dramatically by level */
            <g className="fortress-group" transform={`translate(${200 - 200 * scaleFactor}, ${220 - 210 * scaleFactor}) scale(${scaleFactor})`} style={{ transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)' }}>
              {/* Ground */}
              <rect x="0" y="170" width="400" height="30" fill="var(--base-ground)" rx="2"/>
              
              {/* Level 1: tiny hut */}
              {level === 1 && (
                <>
                  <rect x="170" y="130" width="60" height="40" fill="var(--base-keep)" rx="3"/>
                  <polygon points="165,130 200,100 235,130" fill="var(--base-roof)"/>
                  <rect x="190" y="145" width="20" height="25" fill="var(--base-gate)" rx="10"/>
                </>
              )}

              {/* Level 2+: walls */}
              {level >= 2 && (
                <>
                  <rect x="80" y="125" width="240" height="45" fill="var(--base-wall)" rx="3" className="wall-main"/>
                  <rect x="80" y="120" width="240" height="8" fill="var(--base-wall-top)" rx="2"/>
                  {Array.from({ length: Math.min(level * 2 + 2, 10) }, (_, i) => (
                    <rect key={i} x={85 + i * 24} y="113" width="14" height="10" fill="var(--base-wall-top)" rx="1"/>
                  ))}
                </>
              )}

              {/* Level 2+: Keep */}
              {level >= 2 && (
                <>
                  <rect x="150" y="75" width="100" height="95" fill="var(--base-keep)" rx="3"/>
                  <polygon points="145,75 200,35 255,75" fill="var(--base-roof)" className="keep-roof"/>
                  <rect x="167" y="92" width="14" height="20" fill="var(--base-window)" rx="7" className="window-glow delay-1"/>
                  {level >= 3 && <rect x="193" y="92" width="14" height="20" fill="var(--base-window)" rx="7" className="window-glow delay-3"/>}
                  {level >= 4 && <rect x="219" y="92" width="14" height="20" fill="var(--base-window)" rx="7" className="window-glow"/>}
                  <rect x="185" y="130" width="30" height="40" fill="var(--base-gate)" rx="15"/>
                  <rect x="199" y="130" width="3" height="40" fill="var(--base-gate-bar)"/>
                </>
              )}

              {/* Level 3+: Side towers */}
              {level >= 3 && (
                <>
                  <rect x="55" y="85" width="35" height="85" fill="var(--base-tower)" rx="2"/>
                  <polygon points="55,85 72,60 90,85" fill="var(--base-roof)" className="tower-roof-left"/>
                  <rect x="66" y="102" width="12" height="16" fill="var(--base-window)" rx="6" className="window-glow"/>
                  <rect x="66" y="130" width="12" height="16" fill="var(--base-window)" rx="6" className="window-glow delay-1"/>

                  <rect x="310" y="85" width="35" height="85" fill="var(--base-tower)" rx="2"/>
                  <polygon points="310,85 327,60 345,85" fill="var(--base-roof)" className="tower-roof-right"/>
                  <rect x="321" y="102" width="12" height="16" fill="var(--base-window)" rx="6" className="window-glow delay-2"/>
                  <rect x="321" y="130" width="12" height="16" fill="var(--base-window)" rx="6" className="window-glow"/>
                </>
              )}

              {/* Level 4+: Extra connected sections */}
              {level >= 4 && (
                <>
                  <rect x="95" y="100" width="50" height="30" fill="var(--base-keep)" rx="2" opacity="0.85"/>
                  <rect x="255" y="100" width="50" height="30" fill="var(--base-keep)" rx="2" opacity="0.85"/>
                  <rect x="105" y="105" width="10" height="14" fill="var(--base-window)" rx="5" className="window-glow delay-2"/>
                  <rect x="125" y="105" width="10" height="14" fill="var(--base-window)" rx="5" className="window-glow"/>
                  <rect x="265" y="105" width="10" height="14" fill="var(--base-window)" rx="5" className="window-glow delay-1"/>
                  <rect x="285" y="105" width="10" height="14" fill="var(--base-window)" rx="5" className="window-glow delay-3"/>
                </>
              )}

              {/* Level 5: Corner turrets + banner */}
              {level >= 5 && (
                <>
                  <rect x="25" y="105" width="25" height="65" fill="var(--base-tower)" rx="2"/>
                  <polygon points="25,105 37,85 50,105" fill="var(--base-roof)"/>
                  <circle cx="37" cy="120" r="4" fill="var(--base-window)" className="window-glow delay-2"/>

                  <rect x="350" y="105" width="25" height="65" fill="var(--base-tower)" rx="2"/>
                  <polygon points="350,105 362,85 375,105" fill="var(--base-roof)"/>
                  <circle cx="362" cy="120" r="4" fill="var(--base-window)" className="window-glow"/>

                  {/* Banners on keep */}
                  <line x1="165" y1="75" x2="165" y2="60" stroke="var(--accent-purple)" strokeWidth="1.5"/>
                  <rect x="165" y="60" width="12" height="8" fill="var(--accent-purple)" rx="1" className="flag-wave"/>
                  <line x1="235" y1="75" x2="235" y2="60" stroke="var(--accent-red)" strokeWidth="1.5"/>
                  <rect x="223" y="60" width="12" height="8" fill="var(--accent-red)" rx="1" className="flag-wave" style={{ animationDelay: '0.5s' }}/>
                </>
              )}

              {/* Main flag */}
              <line x1="200" y1={level >= 2 ? 35 : 100} x2="200" y2={level >= 2 ? 12 : 77} stroke="var(--base-wall-top)" strokeWidth="2"/>
              <polygon points={level >= 2 ? "200,12 228,20 200,28" : "200,77 228,85 200,93"} fill={statusColor} className="flag-wave"/>
              
              {/* Shield */}
              {team.shieldActive && (
                <g className="shield-emblem pulse-glow">
                  <circle cx="200" cy="155" r="10" fill="rgba(167,139,250,0.3)" stroke="var(--accent-purple)" strokeWidth="1.5"/>
                  <text x="200" y="159" textAnchor="middle" fontSize="10" fill="var(--accent-purple)">🛡</text>
                </g>
              )}
            </g>
          ) : (
            /* Cyberpunk — scales dramatically */
            <g className="cyber-base-group" transform={`translate(${200 - 200 * scaleFactor}, ${220 - 210 * scaleFactor}) scale(${scaleFactor})`} style={{ transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)' }}>
              <rect x="0" y="170" width="400" height="30" fill="var(--base-ground)" rx="2"/>
              <line x1="0" y1="171" x2="400" y2="171" stroke="var(--neon-accent)" strokeWidth="1" className="neon-line"/>
              
              {/* Main — building height grows with level */}
              <rect x="110" y={170 - level * 26} width="180" height={level * 26} fill="var(--base-wall)" rx="4" className="cyber-building"/>
              <rect x="110" y={168 - level * 26} width="180" height="3" fill="var(--neon-accent)" className="neon-pulse" rx="1"/>
              <rect x="110" y="167" width="180" height="3" fill="var(--neon-accent)" className="neon-pulse delay-2" rx="1"/>
              <line x1="110" y1={170 - level * 26} x2="110" y2="170" stroke="var(--neon-accent)" strokeWidth="1" className="neon-pulse delay-1"/>
              <line x1="290" y1={170 - level * 26} x2="290" y2="170" stroke="var(--neon-accent)" strokeWidth="1" className="neon-pulse delay-3"/>
              
              {/* Windows */}
              {Array.from({ length: Math.min(level, 5) }, (_, row) =>
                Array.from({ length: 4 }, (_, col) => (
                  <rect key={`${row}-${col}`} x={125 + col * 40} y={170 - level * 26 + 10 + row * 24} width="22" height="14" rx="2"
                    fill={(row + col) % 3 === 0 ? 'var(--neon-accent)' : 'var(--base-window)'}
                    className={`cyber-window ${(row + col) % 3 === 0 ? 'window-active' : ''}`}
                    opacity={(row + col) % 3 === 0 ? 0.9 : 0.3}
                  />
                ))
              )}
              
              {level >= 3 && (
                <>
                  <rect x="60" y="105" width="35" height="65" fill="var(--base-tower)" rx="3"/>
                  <line x1="77" y1="105" x2="77" y2="78" stroke="var(--base-tower)" strokeWidth="3"/>
                  <circle cx="77" cy="75" r="4" fill="var(--neon-accent)" className="neon-pulse"/>
                </>
              )}
              {level >= 4 && (
                <>
                  <rect x="305" y="115" width="35" height="55" fill="var(--base-tower)" rx="3"/>
                  <line x1="322" y1="115" x2="322" y2="88" stroke="var(--base-tower)" strokeWidth="3"/>
                  <circle cx="322" cy="85" r="4" fill="var(--neon-secondary)" className="neon-pulse delay-2"/>
                </>
              )}
              {level >= 5 && (
                <>
                  <rect x="30" y="125" width="22" height="45" fill="var(--base-tower)" rx="3" opacity="0.7"/>
                  <circle cx="41" cy="122" r="3" fill="var(--neon-accent)" className="neon-pulse delay-1"/>
                  <rect x="348" y="130" width="22" height="40" fill="var(--base-tower)" rx="3" opacity="0.7"/>
                  <circle cx="359" cy="127" r="3" fill="var(--neon-secondary)" className="neon-pulse delay-3"/>
                </>
              )}
              
              {level >= 2 && (
                <>
                  <ellipse cx="200" cy={170 - level * 26} rx={12 + level * 4} ry={5 + level * 2} fill="var(--base-roof)" className="cyber-dome"/>
                  <line x1="200" y1={170 - level * 26 - 10} x2="200" y2={170 - level * 26 - 28} stroke="var(--base-tower)" strokeWidth="2"/>
                  <circle cx="200" cy={170 - level * 26 - 30} r="5" fill={statusColor} className="neon-pulse"/>
                </>
              )}
              
              <rect x="175" y="145" width="50" height="25" fill="var(--base-gate)" rx="2"/>
              <rect x="180" y="148" width="40" height="19" fill="var(--neon-accent)" opacity="0.15" rx="2" className="gate-scan"/>
              
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

      {/* HP Bar — also scales */}
      <div style={{
        margin: '0 auto',
        width: `${50 + level * 10}%`,
        height: 8 + level,
        borderRadius: 'var(--radius-full)',
        background: 'rgba(150,150,150,0.12)',
        overflow: 'hidden',
        transition: 'all 0.6s ease',
        marginBottom: 8,
      }}>
        <div style={{
          width: `${hpPercent}%`,
          height: '100%',
          borderRadius: 'var(--radius-full)',
          background: statusColor,
          transition: 'width 0.5s ease',
        }} />
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
