import { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import * as api from '../lib/api';
import {
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
  // Auth
  session: null,
  user: null,       // supabase auth user
  profile: null,    // profiles row
  loading: true,

  // Group
  group: null,      // active group (groups row)
  allGroups: [],    // all groups user belongs to
  groupMembers: [], // profiles[]
  hasGroup: false,

  // Habits
  habits: [],

  // Game
  revivalMode: false,
  revivalProgress: 0,
  toasts: [],
  hpChanges: [],
  collectedRewards: [],
  attacksToday: [],   // { targetId, date }

  // Fallback for demo mode
  isDemoMode: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload, loading: false };

    case 'SET_PROFILE':
      return { ...state, profile: action.payload };

    case 'SET_GROUP':
      return {
        ...state,
        group: action.payload,
        hasGroup: !!action.payload,
      };

    case 'SET_GROUP_MEMBERS':
      return { ...state, groupMembers: action.payload };

    case 'SET_ALL_GROUPS':
      return { ...state, allGroups: action.payload };

    case 'SET_HABITS':
      return { ...state, habits: action.payload };

    case 'SET_COLLECTED_REWARDS':
      return { ...state, collectedRewards: action.payload };

    case 'RECORD_ATTACK':
      return { ...state, attacksToday: [...state.attacksToday, action.payload] };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'ENABLE_DEMO': {
      // For demo mode — use mock data inline
      const demoGroup = {
        id: 'demo-group',
        name: 'Iron Wolves',
        invite_code: 'WOLF42',
        hp: 85,
        max_hp: 100,
        streak: 5,
        shield_active: true,
      };
      const demoGroup2 = {
        id: 'demo-group-2',
        name: 'Study Squad',
        invite_code: 'STDY99',
        hp: 60,
        max_hp: 100,
        streak: 2,
        shield_active: false,
      };
      return {
        ...state,
        isDemoMode: true,
        loading: false,
        session: { user: { id: 'demo-user' } },
        user: { id: 'demo-user', email: 'demo@pact.app' },
        profile: {
          id: 'demo-user',
          display_name: action.payload?.name || 'Alex Rivera',
          theme: 'cottagecore',
          consistency: 92,
          contribution: 45,
          streak: 7,
        },
        group: demoGroup,
        allGroups: [demoGroup, demoGroup2],
        hasGroup: true,
        groupMembers: [
          { id: 'demo-user', display_name: 'Alex Rivera', contribution: 45, consistency: 92, streak: 7 },
          { id: 'u2', display_name: 'Jordan Chen', contribution: 38, consistency: 85, streak: 5 },
          { id: 'u3', display_name: 'Sam Patel', contribution: 30, consistency: 78, streak: 3 },
          { id: 'u4', display_name: 'Taylor Kim', contribution: 22, consistency: 65, streak: 1 },
        ],
        habits: [
          { id: 'h1', title: 'Study for 1 hour', icon: '📚', status: 'pending' },
          { id: 'h2', title: 'Morning workout', icon: '💪', status: 'pending' },
          { id: 'h3', title: 'Read 20 pages', icon: '📖', status: 'pending' },
          { id: 'h4', title: 'Meditate 15 min', icon: '🧘', status: 'pending' },
          { id: 'h5', title: 'Drink 2L water', icon: '💧', status: 'pending' },
        ],
        collectedRewards: [],
        attacksToday: [],
      };
    }

    // ── HABIT ACTIONS (work in both demo and real mode) ──

    case 'COMPLETE_HABIT': {
      const habitId = action.payload;
      const newHabits = state.habits.map(h =>
        h.id === habitId ? { ...h, status: 'completed' } : h
      );
      const newHp = Math.min((state.group?.hp || 0) + HP_GAIN, state.group?.max_hp || 100);
      const newGroup = state.group ? { ...state.group, hp: newHp } : null;

      let revivalMode = state.revivalMode;
      let revivalProgress = state.revivalProgress;
      if (revivalMode) {
        revivalProgress += 1;
        if (revivalProgress >= REVIVAL_STREAK_NEEDED) {
          revivalMode = false;
          revivalProgress = 0;
          if (newGroup) newGroup.hp = REVIVAL_TARGET_HP;
        }
      }

      // Shield check
      const allCompleted = newHabits.every(h => h.status === 'completed');
      if (allCompleted && newGroup) {
        const newStreak = (newGroup.streak || 0) + 1;
        newGroup.streak = newStreak;
        if (newStreak >= SHIELD_STREAK_NEEDED) {
          newGroup.shield_active = true;
        }
      }

      // Update profile contribution
      const newProfile = state.profile
        ? { ...state.profile, contribution: (state.profile.contribution || 0) + HP_GAIN }
        : state.profile;

      return {
        ...state,
        habits: newHabits,
        group: newGroup,
        profile: newProfile,
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
      const newHp = Math.max((state.group?.hp || 0) - HP_LOSS, 0);
      const newGroup = state.group ? { ...state.group, hp: newHp, streak: 0 } : null;

      let revivalMode = state.revivalMode;
      let revivalProgress = state.revivalProgress;
      if (newHp <= 0) {
        revivalMode = true;
        revivalProgress = 0;
      }

      return {
        ...state,
        habits: newHabits,
        group: newGroup,
        revivalMode,
        revivalProgress,
        hpChanges: [...state.hpChanges, { id: Date.now(), value: -HP_LOSS }],
      };
    }

    case 'ADD_HABIT': {
      const { title, icon, id, is_group_habit } = action.payload;
      const newHabit = {
        id: id || `h${Date.now()}`,
        title,
        icon: icon || '📌',
        status: 'pending',
        is_group_habit: is_group_habit || false,
      };
      return { ...state, habits: [...state.habits, newHabit] };
    }

    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.payload) };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : action.payload,
      };

    case 'COLLECT_REWARD':
      return {
        ...state,
        collectedRewards: [...state.collectedRewards, action.payload],
      };

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.payload }] };

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    case 'CLEAR_HP_CHANGES':
      return { ...state, hpChanges: [] };

    case 'LOGOUT':
      return { ...initialState, loading: false };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Listen for auth state changes
  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch({ type: 'SET_SESSION', payload: session });
        loadUserData(session.user.id);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        dispatch({ type: 'SET_SESSION', payload: session });
        if (session) {
          await loadUserData(session.user.id);
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserData(userId) {
    try {
      // Load profile
      try {
        const profile = await api.getProfile(userId);
        if (profile) dispatch({ type: 'SET_PROFILE', payload: profile });
      } catch (err) { console.warn('Profile load error (non-fatal):', err.message); }

      // Load ALL groups
      let allGroups = [];
      try {
        allGroups = await api.getUserGroups(userId);
        dispatch({ type: 'SET_ALL_GROUPS', payload: allGroups });
        // Set first group as active
        if (allGroups.length > 0) {
          dispatch({ type: 'SET_GROUP', payload: allGroups[0] });
        }
      } catch (err) { console.warn('Groups load error (non-fatal):', err.message); }

      const activeGroup = allGroups[0] || null;
      if (activeGroup) {
        // Load group members for active group
        try {
          const members = await api.getGroupMembers(activeGroup.id);
          dispatch({ type: 'SET_GROUP_MEMBERS', payload: members });
        } catch (err) { console.warn('Members load error (non-fatal):', err.message); }

        // Load habits
        try {
          const habits = await api.getHabits(userId);
          dispatch({ type: 'SET_HABITS', payload: habits });
        } catch (err) { console.warn('Habits load error (non-fatal):', err.message); }
      }

      // Load collected rewards
      try {
        const rewards = await api.getCollectedRewards(userId);
        dispatch({ type: 'SET_COLLECTED_REWARDS', payload: rewards });
      } catch (err) { console.warn('Rewards load error (non-fatal):', err.message); }

    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

// ── Hooks ──

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

export function useCurrentTeam() {
  const { group } = useGameState();
  if (!group) return null;
  // Return in the shape components expect
  return {
    id: group.id,
    name: group.name,
    hp: group.hp,
    maxHp: group.max_hp,
    streak: group.streak,
    shieldActive: group.shield_active,
    shieldExpiry: group.shield_expiry,
    inviteCode: group.invite_code,
  };
}

export function useCurrentUser() {
  const { profile } = useGameState();
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.display_name,
    avatar: (profile.display_name || 'AA').slice(0, 2).toUpperCase(),
    contribution: profile.contribution || 0,
    consistency: profile.consistency || 0,
    streak: profile.streak || 0,
  };
}

export function useTeamMembers() {
  const { groupMembers } = useGameState();
  return groupMembers.map(m => ({
    id: m.id,
    name: m.display_name,
    avatar: (m.display_name || 'AA').slice(0, 2).toUpperCase(),
    contribution: m.contribution || 0,
    consistency: m.consistency || 0,
    streak: m.streak || 0,
  }));
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

// ── Async action helpers ──

export function useSupabaseActions() {
  const state = useGameState();
  const dispatch = useGameDispatch();

  const isDemo = state.isDemoMode;
  const userId = state.session?.user?.id;
  const groupId = state.group?.id;

  return {
    async completeHabit(habitId) {
      dispatch({ type: 'COMPLETE_HABIT', payload: habitId });
      if (!isDemo && userId) {
        try {
          await api.updateHabitStatus(habitId, 'completed');
          // Update group HP in DB
          const newHp = Math.min((state.group?.hp || 0) + HP_GAIN, state.group?.max_hp || 100);
          if (groupId) {
            await api.updateGroupHp(groupId, newHp);
          }
        } catch (err) {
          console.error('Error completing habit:', err);
        }
      }
    },

    async missHabit(habitId) {
      dispatch({ type: 'MISS_HABIT', payload: habitId });
      if (!isDemo && userId) {
        try {
          await api.updateHabitStatus(habitId, 'missed');
          const newHp = Math.max((state.group?.hp || 0) - HP_LOSS, 0);
          if (groupId) {
            await api.updateGroupHp(groupId, newHp);
          }
        } catch (err) {
          console.error('Error missing habit:', err);
        }
      }
    },

    async addHabit(title, icon) {
      if (!isDemo && userId && groupId) {
        try {
          const habit = await api.addHabit(userId, groupId, title, icon);
          dispatch({ type: 'ADD_HABIT', payload: habit });
        } catch (err) {
          console.error('Error adding habit:', err);
          // Fallback locally
          dispatch({ type: 'ADD_HABIT', payload: { title, icon } });
        }
      } else {
        dispatch({ type: 'ADD_HABIT', payload: { title, icon } });
      }
    },

    async addGroupHabit(title, icon) {
      if (!isDemo && userId && groupId) {
        try {
          // Add habit for all group members
          const memberIds = state.groupMembers.map(m => m.id);
          await api.addGroupHabit(groupId, memberIds, title, icon);
          // Add locally for current user
          dispatch({ type: 'ADD_HABIT', payload: { title, icon, is_group_habit: true, id: `gh-${Date.now()}` } });
        } catch (err) {
          console.error('Error adding group habit:', err);
          dispatch({ type: 'ADD_HABIT', payload: { title, icon, is_group_habit: true } });
        }
      } else {
        // Demo mode — just add for current user
        dispatch({ type: 'ADD_HABIT', payload: { title, icon, is_group_habit: true } });
      }
    },

    async deleteHabit(habitId) {
      dispatch({ type: 'DELETE_HABIT', payload: habitId });
      if (!isDemo) {
        try {
          await api.deleteHabit(habitId);
        } catch (err) {
          console.error('Error deleting habit:', err);
        }
      }
    },

    async collectReward(rewardId, clubId) {
      dispatch({ type: 'COLLECT_REWARD', payload: rewardId });
      if (!isDemo && userId) {
        try {
          await api.collectReward(userId, rewardId, clubId);
        } catch (err) {
          console.error('Error collecting reward:', err);
        }
      }
    },

    async updateProfile(updates) {
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
      if (!isDemo && userId) {
        try {
          await api.updateProfile(userId, {
            display_name: updates.display_name || updates.name,
            ...(updates.theme && { theme: updates.theme }),
          });
        } catch (err) {
          console.error('Error updating profile:', err);
        }
      }
    },

    async signUp(email, password, displayName) {
      const data = await api.signUp(email, password, displayName);
      return data;
    },

    async signIn(email, password) {
      const data = await api.signIn(email, password);
      return data;
    },

    async signOut() {
      await api.signOut();
      dispatch({ type: 'LOGOUT' });
    },

    async createGroup(name) {
      if (isDemo) {
        const newGroup = {
          id: `demo-group-${Date.now()}`,
          name: name || 'My Pact',
          invite_code: 'DEMO' + Math.random().toString(36).slice(2, 6).toUpperCase(),
          hp: 100,
          max_hp: 100,
          streak: 0,
          shield_active: false,
        };
        dispatch({ type: 'SET_GROUP', payload: newGroup });
        dispatch({ type: 'SET_ALL_GROUPS', payload: [...state.allGroups, newGroup] });
        return newGroup;
      }
      const group = await api.createGroup(userId, name);
      dispatch({ type: 'SET_GROUP', payload: group });
      dispatch({ type: 'SET_ALL_GROUPS', payload: [...state.allGroups, group] });
      return group;
    },

    async joinGroup(code) {
      if (isDemo) {
        const newGroup = {
          id: `demo-joined-${Date.now()}`,
          name: 'Joined Pact',
          invite_code: code,
          hp: 85,
          max_hp: 100,
          streak: 3,
          shield_active: false,
        };
        dispatch({ type: 'SET_GROUP', payload: newGroup });
        dispatch({ type: 'SET_ALL_GROUPS', payload: [...state.allGroups, newGroup] });
        return;
      }
      const group = await api.joinGroupByCode(userId, code);
      dispatch({ type: 'SET_GROUP', payload: group });
      dispatch({ type: 'SET_ALL_GROUPS', payload: [...state.allGroups, group] });
      // Load members
      const members = await api.getGroupMembers(group.id);
      dispatch({ type: 'SET_GROUP_MEMBERS', payload: members });
    },

    async switchGroup(groupId) {
      const target = state.allGroups.find(g => g.id === groupId);
      if (!target) return;
      dispatch({ type: 'SET_GROUP', payload: target });
      // Reload members for the new group
      if (!isDemo) {
        try {
          const members = await api.getGroupMembers(groupId);
          dispatch({ type: 'SET_GROUP_MEMBERS', payload: members });
          // Reload habits
          const habits = await api.getHabits(userId);
          dispatch({ type: 'SET_HABITS', payload: habits });
        } catch (err) { console.warn('switchGroup error:', err); }
      }
    },

    enableDemo(name) {
      dispatch({ type: 'ENABLE_DEMO', payload: { name } });
    },
  };
}
