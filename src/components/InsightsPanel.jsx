import { useCurrentTeam, useCurrentUser, useGameState } from '../context/GameContext';
import { BrainCircuit, AlertTriangle, Clock, Zap, RefreshCw } from 'lucide-react';

export default function InsightsPanel() {
  const team = useCurrentTeam();
  const user = useCurrentUser();
  const { revivalMode } = useGameState();

  if (!team || !user) return null;

  // Calculate collapse risk based on HP, streak, and consistency
  const hpFactor = Math.max(0, 100 - team.hp);
  const streakFactor = team.streak >= 3 ? 0 : (3 - team.streak) * 10;
  const consistencyFactor = Math.max(0, 100 - user.consistency);
  const collapseRisk = Math.min(Math.round((hpFactor * 0.4 + streakFactor * 0.3 + consistencyFactor * 0.3)), 100);

  const riskColor = collapseRisk > 60 ? 'var(--accent-red)' : collapseRisk > 30 ? 'var(--accent-yellow)' : 'var(--accent-green)';
  const riskLabel = collapseRisk > 60 ? 'HIGH' : collapseRisk > 30 ? 'MODERATE' : 'LOW';

  const insights = [
    {
      icon: <AlertTriangle size={18} />,
      iconBg: `rgba(${collapseRisk > 60 ? '239,68,68' : collapseRisk > 30 ? '250,204,21' : '34,197,94'}, 0.15)`,
      iconColor: riskColor,
      text: `Team Collapse Risk: ${collapseRisk}%`,
      label: riskLabel,
    },
    {
      icon: <Clock size={18} />,
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: 'var(--accent-blue)',
      text: 'You perform better before evening',
      label: 'BEHAVIORAL PATTERN',
    },
    {
      icon: <Zap size={18} />,
      iconBg: 'rgba(250, 204, 21, 0.15)',
      iconColor: 'var(--accent-yellow)',
      text: user.streak >= 3
        ? `Amazing ${user.streak}-day streak! Keep it up!`
        : 'Complete habits earlier today for bonus consistency',
      label: 'SUGGESTION',
    },
  ];

  if (revivalMode) {
    insights.push({
      icon: <RefreshCw size={18} />,
      iconBg: 'rgba(239, 68, 68, 0.15)',
      iconColor: 'var(--accent-red)',
      text: 'Start Revival Mode — Complete 3 habits in a row to restore base',
      label: 'REVIVAL AVAILABLE',
    });
  }

  return (
    <div className="card" id="insights-panel">
      <div className="section-title">
        <BrainCircuit size={14} />
        AI INSIGHTS
      </div>

      <div className="flex flex-col gap-8 stagger">
        {insights.map((insight, i) => (
          <div key={i} className="insight-row fade-in-up">
            <div
              className="insight-icon"
              style={{ background: insight.iconBg, color: insight.iconColor }}
            >
              {insight.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="insight-text">{insight.text}</div>
              <div className="insight-label">{insight.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
