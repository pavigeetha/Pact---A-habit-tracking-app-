// Mock data and initial state for the PACT game

export const MOCK_USERS = [
  { id: 'u1', name: 'Alex Rivera', avatar: 'AR', contribution: 45, consistency: 92, streak: 7, weeklyCompleted: [true, true, true, false, true, true, true] },
  { id: 'u2', name: 'Jordan Chen', avatar: 'JC', contribution: 38, consistency: 85, streak: 5, weeklyCompleted: [true, false, true, true, true, true, false] },
  { id: 'u3', name: 'Sam Patel', avatar: 'SP', contribution: 30, consistency: 78, streak: 3, weeklyCompleted: [false, true, true, true, false, true, true] },
  { id: 'u4', name: 'Taylor Kim', avatar: 'TK', contribution: 22, consistency: 65, streak: 1, weeklyCompleted: [true, false, false, true, true, false, true] },
];

export const MOCK_TEAMS = [
  {
    id: 't1',
    name: 'Iron Wolves',
    hp: 85,
    maxHp: 100,
    streak: 5,
    shieldActive: true,
    shieldExpiry: Date.now() + 86400000,
    members: ['u1', 'u2', 'u3', 'u4'],
    isPlayerTeam: true,
  },
  {
    id: 't2',
    name: 'Shadow Foxes',
    hp: 72,
    maxHp: 100,
    streak: 2,
    shieldActive: false,
    shieldExpiry: null,
    members: [],
    isPlayerTeam: false,
  },
  {
    id: 't3',
    name: 'Neon Titans',
    hp: 60,
    maxHp: 100,
    streak: 0,
    shieldActive: false,
    shieldExpiry: null,
    members: [],
    isPlayerTeam: false,
  },
  {
    id: 't4',
    name: 'Crimson Hawks',
    hp: 45,
    maxHp: 100,
    streak: 1,
    shieldActive: false,
    shieldExpiry: null,
    members: [],
    isPlayerTeam: false,
  },
  {
    id: 't5',
    name: 'Phantom Vipers',
    hp: 30,
    maxHp: 100,
    streak: 0,
    shieldActive: false,
    shieldExpiry: null,
    members: [],
    isPlayerTeam: false,
  },
];

export const MOCK_HABITS = [
  { id: 'h1', title: 'Study for 1 hour', icon: '📚', status: 'pending' },
  { id: 'h2', title: 'Morning workout', icon: '💪', status: 'pending' },
  { id: 'h3', title: 'Read 20 pages', icon: '📖', status: 'pending' },
  { id: 'h4', title: 'Meditate 15 min', icon: '🧘', status: 'pending' },
  { id: 'h5', title: 'Drink 2L water', icon: '💧', status: 'pending' },
];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MOCK_WEEKLY_ACTIVITY = [
  { day: 'Mon', completed: 4, missed: 1 },
  { day: 'Tue', completed: 3, missed: 2 },
  { day: 'Wed', completed: 5, missed: 0 },
  { day: 'Thu', completed: 2, missed: 3 },
  { day: 'Fri', completed: 4, missed: 1 },
  { day: 'Sat', completed: 5, missed: 0 },
  { day: 'Sun', completed: 3, missed: 2 },
];

export const HP_GAIN = 10;
export const HP_LOSS = 15;
export const ATTACK_DAMAGE = 10;
export const REVIVAL_TARGET_HP = 50;
export const REVIVAL_STREAK_NEEDED = 3;
export const SHIELD_STREAK_NEEDED = 3;
