import { useCurrentTeam } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';

export default function AnimatedBase() {
  const team = useCurrentTeam();
  const { themeId } = useTheme();
  if (!team) return null;

  const hp = team.hp;
  const hpPercent = (hp / team.maxHp) * 100;
  const isHealthy = hpPercent > 60;
  const isWarning = hpPercent > 30 && hpPercent <= 60;
  const isCritical = hpPercent <= 30;
  const isCottage = themeId === 'cottagecore';

  return (
    <div className={`base-scene ${isCritical ? 'base-damaged' : ''}`} id="animated-base">
      {/* Sky */}
      <div className={`base-sky ${isCottage ? 'sky-cottage' : 'sky-midnight'}`}>
        {isCottage ? (
          <>
            <div className="sky-cloud cloud-1" />
            <div className="sky-cloud cloud-2" />
            <div className="sky-sun" />
          </>
        ) : (
          <>
            <div className="sky-star star-1" />
            <div className="sky-star star-2" />
            <div className="sky-star star-3" />
            <div className="sky-star star-4" />
            <div className="sky-star star-5" />
            <div className="sky-moon" />
          </>
        )}
      </div>

      {/* Ground */}
      <div className={`base-ground ${isCottage ? 'ground-cottage' : 'ground-midnight'}`} />

      {/* Castle / City */}
      {isCottage ? (
        <div className="cottage-castle">
          {/* Left tree */}
          <div className="castle-tree tree-left">
            <div className="tree-crown" />
            <div className="tree-trunk" />
            <div className="tree-petals">
              <span className="t-petal tp-1" />
              <span className="t-petal tp-2" />
              <span className="t-petal tp-3" />
            </div>
          </div>

          {/* Castle Structure */}
          <div className="castle-body">
            <div className="castle-tower tower-left">
              <div className="tower-roof" />
              <div className="tower-wall">
                <div className="tower-window" />
              </div>
            </div>
            <div className="castle-main">
              <div className="castle-roof">
                <div className="castle-flag">
                  <div className="flag-pole" />
                  <div className={`flag-cloth ${isHealthy ? 'flag-green' : isWarning ? 'flag-yellow' : 'flag-red'}`} />
                </div>
              </div>
              <div className="castle-wall">
                <div className="castle-door" />
                <div className="castle-window cw-1" />
                <div className="castle-window cw-2" />
              </div>
            </div>
            <div className="castle-tower tower-right">
              <div className="tower-roof" />
              <div className="tower-wall">
                <div className="tower-window" />
              </div>
            </div>
          </div>

          {/* Right tree */}
          <div className="castle-tree tree-right">
            <div className="tree-crown" />
            <div className="tree-trunk" />
          </div>

          {/* Characters */}
          <div className="castle-char char-warrior">⚔️</div>
          <div className="castle-char char-mage">🧙</div>
          <div className="castle-char char-builder">🔨</div>
        </div>
      ) : (
        <div className="midnight-city">
          <div className="city-building b-1">
            <div className="building-windows">
              <span className="bw" /><span className="bw lit" /><span className="bw" />
              <span className="bw lit" /><span className="bw" /><span className="bw lit" />
              <span className="bw" /><span className="bw lit" /><span className="bw" />
            </div>
          </div>
          <div className="city-building b-2">
            <div className="building-windows">
              <span className="bw lit" /><span className="bw" />
              <span className="bw" /><span className="bw lit" />
              <span className="bw lit" /><span className="bw" />
            </div>
          </div>
          <div className="city-building b-3">
            <div className="building-windows">
              <span className="bw" /><span className="bw lit" /><span className="bw lit" />
              <span className="bw lit" /><span className="bw" /><span className="bw" />
              <span className="bw" /><span className="bw" /><span className="bw lit" />
              <span className="bw lit" /><span className="bw" /><span className="bw lit" />
            </div>
            <div className="building-antenna" />
          </div>
          <div className="city-building b-4">
            <div className="building-windows">
              <span className="bw lit" /><span className="bw" />
              <span className="bw" /><span className="bw lit" />
            </div>
          </div>
          <div className="city-building b-5">
            <div className="building-windows">
              <span className="bw" /><span className="bw lit" /><span className="bw" />
              <span className="bw lit" /><span className="bw lit" /><span className="bw" />
              <span className="bw" /><span className="bw" /><span className="bw lit" />
            </div>
          </div>

          {/* Neon signs */}
          <div className="neon-sign ns-1">PACT</div>
          <div className="neon-sign ns-2">⚡</div>

          {/* Characters */}
          <div className="city-char cc-1">🚶</div>
          <div className="city-char cc-2">🏃</div>
        </div>
      )}

      {/* HP Badge */}
      <div className="base-hp-overlay">
        <span className="base-hp-icon">{isCottage ? '🏰' : '🏙️'}</span>
        <span className={`base-hp-value ${isHealthy ? 'healthy' : isWarning ? 'warning' : 'critical'}`}>
          {hp} HP
        </span>
      </div>
    </div>
  );
}
