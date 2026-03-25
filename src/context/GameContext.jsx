import { createContext, useContext, useReducer, useCallback } from 'react';
import {
  MOCK_TEAMS,
  MOCK_USERS,
  MOCK_HABITS,
  MOCK_WEEKLY_ACTIVITY,
  HP_GAIN,
  HP_LOSS,
  ATTACK_DAMAGE,
  REVIVAL_TARGET_HP,
  REVIVAL_STREAK_NEEDED,
  SHIELD_STREAK_NEEDED,
} from '../data/mockData';

const GameStateContext = createContext(null);
const GameDispatchContext = createContext(null);

const initialState = {
  teams: MOCK_TEAMS,
  users: MOCK_USERS,
  habits: MOCK_HABITS,
  weeklyActivity: MOCK_WEEKLY_ACTIVITY,
  currentUserId: 'u1',
  currentTeamId: 't1',
  revivalMode: false,
  revivalProgress: 0,
  toasts: [],
  hpChanges: [], // { id, value, timestamp }
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_HABIT': {
      const habitId = action.payload;
      const newHabits = state.habits.map(h =>
        h.id === habitId ? { ...h, status: 'completed' } : h
      );
      const team = state.teams.find(t => t.id === state.currentTeamId);
      const newHp = Math.min((team?.hp || 0) + HP_GAIN, team?.maxHp || 100);
      const newTeams = state.teams.map(t =>
        t.id === state.currentTeamId ? { ...t, hp: newHp } : t
      );

      // Update user contribution
      const newUsers = state.users.map(u =>
        u.id === state.currentUserId
          ? { ...u, contribution: u.contribution + HP_GAIN }
          : u
      );

      // Revival progress
      let revivalMode = state.revivalMode;
      let revivalProgress = state.revivalProgress;
      if (revivalMode) {
        revivalProgress += 1;
        if (revivalProgress >= REVIVAL_STREAK_NEEDED) {
          revivalMode = false;
          revivalProgress = 0;
          // Restore HP already handled by setting to REVIVAL_TARGET_HP
          const idx = newTeams.findIndex(t => t.id === state.currentTeamId);
          if (idx !== -1) newTeams[idx] = { ...newTeams[idx], hp: REVIVAL_TARGET_HP };
        }
      }

      // Check shield activation
      const updatedTeam = newTeams.find(t => t.id === state.currentTeamId);
      const allCompleted = newHabits.every(h => h.status === 'completed');
      if (allCompleted && updatedTeam) {
        const newStreak = (updatedTeam.streak || 0) + 1;
        const shouldShield = newStreak >= SHIELD_STREAK_NEEDED;
        const tIdx = newTeams.findIndex(t => t.id === state.currentTeamId);
        newTeams[tIdx] = {
          ...newTeams[tIdx],
          streak: newStreak,
          shieldActive: shouldShield || newTeams[tIdx].shieldActive,
          shieldExpiry: shouldShield ? Date.now() + 86400000 : newTeams[tIdx].shieldExpiry,
        };
      }

      return {
        ...state,
        habits: newHabits,
        teams: newTeams,
        users: newUsers,
        revivalMode,
        revivalProgress,
        hpChanges: [...state.hpChanges, { id: Date.now(), value: HP_GAIN }],
      };
    }

    case 'MISS_HABIT': {
      const habitId = action.payload;
      const newHabits = state.habits.map(h =>
        h.id === habitId ? { ...h, status: 'missed' } : h
      );
      const team = state.teams.find(t => t.id === state.currentTeamId);
      const newHp = Math.max((team?.hp || 0) - HP_LOSS, 0);
      const newTeams = state.teams.map(t =>
        t.id === state.currentTeamId ? { ...t, hp: newHp, streak: 0 } : t
      );

      // Check for revival mode
      let revivalMode = state.revivalMode;
      let revivalProgress = state.revivalProgress;
      if (newHp <= 0) {
        revivalMode = true;
        revivalProgress = 0;
      }

      return {
        ...state,
        habits: newHabits,
        teams: newTeams,
        revivalMode,
        revivalProgress,
        hpChanges: [...state.hpChanges, { id: Date.now(), value: -HP_LOSS }],
      };
    }

    case 'ATTACK_TEAM': {
      const targetId = action.payload;
      const myTeam = state.teams.find(t => t.id === state.currentTeamId);
      const targetTeam = state.teams.find(t => t.id === targetId);

      if (!myTeam || !targetTeam) return state;
      if (targetTeam.shieldActive) return state; // Shielded

      let damage = ATTACK_DAMAGE;
      if (myTeam.hp > targetTeam.hp) {
        damage = ATTACK_DAMAGE + 5; // Bonus damage if stronger
      }

      const newTeams = state.teams.map(t =>
        t.id === targetId ? { ...t, hp: Math.max(t.hp - damage, 0) } : t
      );

      return {
        ...state,
        teams: newTeams,
      };
    }

    case 'ADD_TOAST': {
      return {
        ...state,
        toasts: [...state.toasts, { id: Date.now(), ...action.payload }],
      };
    }

    case 'REMOVE_TOAST': {
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload),
      };
    }

    case 'CLEAR_HP_CHANGES': {
      return { ...state, hpChanges: [] };
    }

    case 'RESET_HABITS': {
      return {
        ...state,
        habits: state.habits.map(h => ({ ...h, status: 'pending' })),
      };
    }

    case 'START_REVIVAL': {
      return {
        ...state,
        revivalMode: true,
        revivalProgress: 0,
      };
    }

    case 'ADD_HABIT': {
      const { title, icon } = action.payload;
      const newHabit = {
        id: `h${Date.now()}`,
        title,
        icon: icon || '📌',
        status: 'pending',
      };
      return {
        ...state,
        habits: [...state.habits, newHabit],
      };
    }

    case 'DELETE_HABIT': {
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.payload),
      };
    }

    case 'UPDATE_USER': {
      const updates = action.payload;
      return {
        ...state,
        users: state.users.map(u =>
          u.id === state.currentUserId ? { ...u, ...updates } : u
        ),
      };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) throw new Error('useGameState must be used within GameProvider');
  return context;
}

export function useGameDispatch() {
  const context = useContext(GameDispatchContext);
  if (!context) throw new Error('useGameDispatch must be used within GameProvider');
  return context;
}

// Helper hooks
export function useCurrentTeam() {
  const state = useGameState();
  return state.teams.find(t => t.id === state.currentTeamId);
}

export function useCurrentUser() {
  const state = useGameState();
  return state.users.find(u => u.id === state.currentUserId);
}

export function useTeamMembers() {
  const state = useGameState();
  const team = state.teams.find(t => t.id === state.currentTeamId);
  if (!team) return [];
  return state.users.filter(u => team.members.includes(u.id));
}

export function useToast() {
  const dispatch = useGameDispatch();

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 3000);
  }, [dispatch]);

  return addToast;
}
