import { supabase } from './supabase';

// ── AUTH ──

export async function signUp(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || 'Adventurer' },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// ── PROFILES ──

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) { console.warn('getProfile error:', error.message); return null; }
  
  // If profile doesn't exist, create it
  if (!data) {
    const { data: newProfile, error: insertErr } = await supabase
      .from('profiles')
      .upsert({ id: userId, display_name: 'Adventurer' }, { onConflict: 'id' })
      .select()
      .single();
    if (insertErr) { console.warn('Profile auto-create error:', insertErr.message); return null; }
    return newProfile;
  }
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── GROUPS ──

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createGroup(userId, name) {
  // Ensure profile exists (FK constraint: created_by references profiles.id)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!existingProfile) {
    // Profile wasn't auto-created by trigger, create it manually
    const { error: profErr } = await supabase
      .from('profiles')
      .insert({ id: userId, display_name: 'Adventurer' });
    if (profErr && profErr.code !== '23505') { // 23505 = unique violation (already exists)
      console.error('Profile creation error:', profErr);
      throw new Error('Failed to setup profile. Please try again.');
    }
  }

  const inviteCode = generateCode();
  const { data, error } = await supabase
    .from('groups')
    .insert({
      name: name || 'My Pact',
      invite_code: inviteCode,
      created_by: userId,
    })
    .select()
    .single();
  if (error) {
    console.error('Group creation error:', error);
    throw new Error('Failed to create group: ' + error.message);
  }

  // Auto-join the creator
  const { error: joinErr } = await supabase.from('group_members').insert({
    group_id: data.id,
    user_id: userId,
    role: 'owner',
  });
  if (joinErr) {
    console.error('Auto-join error:', joinErr);
    // Don't throw — group was created, just the join failed
  }

  return data;
}

export async function joinGroupByCode(userId, code) {
  // Ensure profile exists (FK constraint)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!existingProfile) {
    const { error: profErr } = await supabase
      .from('profiles')
      .insert({ id: userId, display_name: 'Adventurer' });
    if (profErr && profErr.code !== '23505') {
      console.error('Profile creation error:', profErr);
    }
  }

  // Find group by invite code
  const { data: group, error: findError } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .maybeSingle();
  if (findError || !group) throw new Error('Invalid group code. Please check and try again.');

  // Check if already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return group; // Already joined

  // Join
  const { error: joinError } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId });
  if (joinError) {
    console.error('Join error:', joinError);
    throw new Error('Failed to join group: ' + joinError.message);
  }

  return group;
}

export async function getUserGroups(userId) {
  // Step 1: Find ALL group memberships
  const { data: memberships, error: memError } = await supabase
    .from('group_members')
    .select('group_id, role')
    .eq('user_id', userId);
  if (memError) { console.error('getUserGroups error:', memError); return []; }
  if (!memberships || memberships.length === 0) return [];

  // Step 2: Get all group data
  const groupIds = memberships.map(m => m.group_id);
  const { data: groups, error: grpError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds);
  if (grpError) { console.error('getUserGroups groups error:', grpError); return []; }
  return groups || [];
}

// Backward compat — returns first group
export async function getUserGroup(userId) {
  const groups = await getUserGroups(userId);
  return groups.length > 0 ? groups[0] : null;
}

export async function getGroupMembers(groupId) {
  // Step 1: Get member records
  const { data: members, error: memError } = await supabase
    .from('group_members')
    .select('user_id, role')
    .eq('group_id', groupId);
  if (memError) { console.error('getGroupMembers error:', memError); return []; }
  if (!members || members.length === 0) return [];

  // Step 2: Get profiles for all member user_ids
  const userIds = members.map(m => m.user_id);
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);
  if (profError) { console.error('getGroupMembers profiles error:', profError); return []; }

  // Merge profiles with roles
  return members.map(m => {
    const profile = profiles?.find(p => p.id === m.user_id) || {};
    return { ...profile, role: m.role };
  });
}

export async function updateGroupHp(groupId, hp, extras = {}) {
  const { data, error } = await supabase
    .from('groups')
    .update({ hp, ...extras, updated_at: new Date().toISOString() })
    .eq('id', groupId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── HELPERS ──

function getLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// ── HABITS ──

export async function getHabits(userId, date = null) {
  let query = supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (date) {
    query = query.eq('date', date);
  } else {
    query = query.eq('date', getLocalDate());
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function addHabit(userId, groupId, title, icon = '📌') {
  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: userId,
      group_id: groupId,
      title,
      icon,
      status: 'pending',
      date: getLocalDate(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addGroupHabit(groupId, memberIds, title, icon = '📌') {
  const today = getLocalDate();
  const rows = memberIds.map(userId => ({
    user_id: userId,
    group_id: groupId,
    title,
    icon,
    status: 'pending',
    date: today,
  }));

  const { data, error } = await supabase
    .from('habits')
    .insert(rows)
    .select();
  if (error) throw error;
  return data || [];
}

export async function updateHabitStatus(habitId, status) {
  const { data, error } = await supabase
    .from('habits')
    .update({ status })
    .eq('id', habitId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteHabit(habitId) {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId);
  if (error) throw error;
}

// ── REWARDS ──

export async function getCollectedRewards(userId) {
  const { data, error } = await supabase
    .from('collected_rewards')
    .select('reward_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data?.map(r => r.reward_id) || [];
}

export async function collectReward(userId, rewardId, clubId) {
  const { data, error } = await supabase
    .from('collected_rewards')
    .insert({ user_id: userId, reward_id: rewardId, club_id: clubId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── ACTIVITY LOG ──

export async function logActivity(userId, groupId, completed, missed) {
  const today = getLocalDate();
  const { data, error } = await supabase
    .from('activity_log')
    .upsert({
      user_id: userId,
      group_id: groupId,
      date: today,
      completed,
      missed,
    }, { onConflict: 'user_id,date' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getWeeklyActivity(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const y = sevenDaysAgo.getFullYear();
  const m = String(sevenDaysAgo.getMonth() + 1).padStart(2, '0');
  const d = String(sevenDaysAgo.getDate()).padStart(2, '0');
  const startDate = `${y}-${m}-${d}`;

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .order('date', { ascending: true });
  if (error) throw error;
  return data || [];
}
