// ── Group HP Levels ──
export const GROUP_LEVELS = [
  { level: 1, name: 'Village', emoji: '🏠', minHP: 0, color: 'from-slate-400 to-slate-500', bg: 'bg-slate-100', text: 'text-slate-700', reward: 'Base established' },
  { level: 2, name: 'Town', emoji: '🏘️', minHP: 50, color: 'from-blue-400 to-blue-500', bg: 'bg-blue-100', text: 'text-blue-700', reward: 'Town walls unlocked' },
  { level: 3, name: 'Castle', emoji: '🏰', minHP: 150, color: 'from-emerald-400 to-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700', reward: 'Castle towers unlocked' },
  { level: 4, name: 'Fortress', emoji: '⚔️', minHP: 300, color: 'from-pact-400 to-pact-500', bg: 'bg-pact-100', text: 'text-pact-700', reward: 'Fortress defenses active' },
  { level: 5, name: 'Kingdom', emoji: '👑', minHP: 500, color: 'from-amber-400 to-amber-500', bg: 'bg-amber-100', text: 'text-amber-700', reward: 'Kingdom title unlocked' },
  { level: 6, name: 'Empire', emoji: '🌟', minHP: 1000, color: 'from-purple-400 to-purple-500', bg: 'bg-purple-100', text: 'text-purple-700', reward: 'Legendary empire status' },
]

export function getGroupLevel(hp) {
  let current = GROUP_LEVELS[0]
  for (const lvl of GROUP_LEVELS) {
    if (hp >= lvl.minHP) current = lvl
  }
  const nextLevel = GROUP_LEVELS[current.level] || null
  const progress = nextLevel
    ? ((hp - current.minHP) / (nextLevel.minHP - current.minHP)) * 100
    : 100
  return { ...current, progress: Math.min(100, Math.max(0, progress)), nextLevel }
}

// ── User Reputation Levels ──
export const USER_LEVELS = [
  { level: 1, name: 'Seedling', emoji: '🌱', minRep: 0, color: 'from-slate-400 to-slate-500', bg: 'bg-slate-100', text: 'text-slate-700', reward: 'Welcome to Pact!' },
  { level: 2, name: 'Sprout', emoji: '🌿', minRep: 25, color: 'from-emerald-400 to-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700', reward: 'Custom avatar border' },
  { level: 3, name: 'Bloomer', emoji: '🌸', minRep: 75, color: 'from-pink-400 to-pink-500', bg: 'bg-pink-100', text: 'text-pink-700', reward: 'Club creation unlocked' },
  { level: 4, name: 'Warrior', emoji: '🔥', minRep: 150, color: 'from-pact-400 to-pact-500', bg: 'bg-pact-100', text: 'text-pact-700', reward: 'Challenge creation unlocked' },
  { level: 5, name: 'Champion', emoji: '⭐', minRep: 300, color: 'from-amber-400 to-amber-500', bg: 'bg-amber-100', text: 'text-amber-700', reward: 'Gold profile badge' },
  { level: 6, name: 'Legend', emoji: '👑', minRep: 500, color: 'from-purple-400 to-purple-500', bg: 'bg-purple-100', text: 'text-purple-700', reward: 'Legendary title' },
]

export function getUserLevel(rep) {
  let current = USER_LEVELS[0]
  for (const lvl of USER_LEVELS) {
    if (rep >= lvl.minRep) current = lvl
  }
  const nextLevel = USER_LEVELS[current.level] || null
  const progress = nextLevel
    ? ((rep - current.minRep) / (nextLevel.minRep - current.minRep)) * 100
    : 100
  return { ...current, progress: Math.min(100, Math.max(0, progress)), nextLevel }
}
