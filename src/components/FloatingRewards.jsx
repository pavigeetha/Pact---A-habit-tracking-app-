import { useState, useEffect } from 'react';
import { useGameDispatch, useGameState, useToast } from '../context/GameContext';

const REWARD_POOL = [
  { icon: '⭐', label: '+5 Points' },
  { icon: '💎', label: '+10 Points' },
  { icon: '🍀', label: 'Lucky Clover' },
  { icon: '🌟', label: '+3 Points' },
  { icon: '🎁', label: 'Mystery Box' },
  { icon: '🪙', label: '+2 Coins' },
];

export default function FloatingRewards() {
  const [rewards, setRewards] = useState([]);
  const [collected, setCollected] = useState([]);
  const addToast = useToast();

  // Spawn rewards periodically
  useEffect(() => {
    const spawn = () => {
      const r = REWARD_POOL[Math.floor(Math.random() * REWARD_POOL.length)];
      const id = Date.now() + Math.random();
      const newReward = {
        id,
        icon: r.icon,
        label: r.label,
        x: 10 + Math.random() * 80, // % from left
        y: 20 + Math.random() * 60, // % from top
        delay: Math.random() * 2,
      };
      setRewards(prev => {
        if (prev.length >= 3) return prev; // max 3 at once
        return [...prev, newReward];
      });

      // Auto-remove after 8s if not collected
      setTimeout(() => {
        setRewards(prev => prev.filter(r => r.id !== id));
      }, 8000);
    };

    // Initial spawn
    setTimeout(spawn, 3000);
    const interval = setInterval(spawn, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleCollect = (reward) => {
    setCollected(prev => [...prev, reward.id]);
    addToast(`${reward.icon} Collected: ${reward.label}!`, 'success');

    // Remove after animation
    setTimeout(() => {
      setRewards(prev => prev.filter(r => r.id !== reward.id));
      setCollected(prev => prev.filter(id => id !== reward.id));
    }, 600);
  };

  return (
    <div className="floating-rewards-container" aria-label="Floating rewards">
      {rewards.map(r => (
        <button
          key={r.id}
          className={`floating-reward ${collected.includes(r.id) ? 'collected' : ''}`}
          style={{
            left: `${r.x}%`,
            top: `${r.y}%`,
            animationDelay: `${r.delay}s`,
          }}
          onClick={() => handleCollect(r)}
          title={`Click to collect: ${r.label}`}
        >
          <span className="floating-reward-icon">{r.icon}</span>
          <span className="floating-reward-label">{r.label}</span>
        </button>
      ))}
    </div>
  );
}
