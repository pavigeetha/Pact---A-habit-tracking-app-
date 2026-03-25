import { useCurrentTeam } from '../context/GameContext';

export default function AnimatedBase() {
  const team = useCurrentTeam();
  if (!team) return null;

  const hp = team.hp;
  const hpPercent = (hp / team.maxHp) * 100;

  // Base state changes with HP
  const isHealthy = hpPercent > 60;
  const isWarning = hpPercent > 30 && hpPercent <= 60;
  const isCritical = hpPercent <= 30;

  return (
    <div className="base-scene" id="animated-base">
      {/* Sky */}
      <div className="base-sky">
        {/* Stars / particles */}
        <div className="base-particle p1" />
        <div className="base-particle p2" />
        <div className="base-particle p3" />
        <div className="base-particle p4" />
        <div className="base-particle p5" />
        <div className="base-particle p6" />
        <div className="base-particle p7" />
        <div className="base-particle p8" />

        {/* Floating clouds */}
        <div className="base-cloud cloud-1">☁️</div>
        <div className="base-cloud cloud-2">☁️</div>
      </div>

      {/* Ground */}
      <div className="base-ground">
        {/* Walls */}
        <div className={`base-wall wall-left ${isCritical ? 'wall-damaged' : ''}`}>
          <span className="wall-block">🧱</span>
          <span className="wall-block">🧱</span>
          {!isCritical && <span className="wall-block">🧱</span>}
        </div>
        <div className={`base-wall wall-right ${isCritical ? 'wall-damaged' : ''}`}>
          <span className="wall-block">🧱</span>
          <span className="wall-block">🧱</span>
          {!isCritical && <span className="wall-block">🧱</span>}
        </div>

        {/* Main Castle / Tower */}
        <div className={`base-castle ${isCritical ? 'castle-critical' : isWarning ? 'castle-warning' : 'castle-healthy'}`}>
          <div className="castle-tower">
            <div className="castle-flag">
              {isHealthy ? '🏴' : isCritical ? '🏳️' : '🚩'}
            </div>
            <div className="castle-roof" />
            <div className="castle-body">
              <div className="castle-window">🪟</div>
              <div className="castle-door">🚪</div>
            </div>
          </div>
          {/* Castle glow based on health */}
          <div className={`castle-glow ${isHealthy ? 'glow-green' : isWarning ? 'glow-yellow' : 'glow-red'}`} />
        </div>

        {/* Shield Dome (visible when shield active) */}
        {team.shieldActive && (
          <div className="shield-dome">
            <div className="shield-dome-inner" />
          </div>
        )}

        {/* Trees */}
        <div className="base-tree tree-1">{isHealthy ? '🌲' : '🌵'}</div>
        <div className="base-tree tree-2">{isHealthy ? '🌳' : isCritical ? '💀' : '🌾'}</div>
        <div className="base-tree tree-3">{isHealthy ? '🌲' : '🌵'}</div>

        {/* Animated Characters */}
        <div className="base-character char-warrior" title="Warrior">
          <span className="char-emoji">⚔️</span>
          <span className="char-body">🧑‍💻</span>
        </div>

        <div className="base-character char-builder" title="Builder">
          <span className="char-emoji">🔨</span>
          <span className="char-body">👷</span>
        </div>

        <div className="base-character char-mage" title="Mage">
          <span className="char-emoji">✨</span>
          <span className="char-body">🧙</span>
        </div>

        <div className="base-character char-archer" title="Archer">
          <span className="char-emoji">🏹</span>
          <span className="char-body">🧝</span>
        </div>

        {/* Campfire */}
        <div className="base-campfire">
          <span className="campfire-flame">🔥</span>
        </div>

        {/* Gold pile */}
        {isHealthy && (
          <div className="base-gold">
            <span>💰</span>
          </div>
        )}

        {/* Damage effects when critical */}
        {isCritical && (
          <>
            <div className="damage-crack crack-1">💥</div>
            <div className="damage-crack crack-2">💥</div>
            <div className="base-smoke smoke-1">💨</div>
          </>
        )}
      </div>

      {/* HP overlay */}
      <div className="base-hp-overlay">
        <span className="base-hp-icon">🏰</span>
        <span className={`base-hp-value ${isHealthy ? 'healthy' : isWarning ? 'warning' : 'critical'}`}>
          {hp} HP
        </span>
      </div>
    </div>
  );
}
