import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

function calcStreak(logs) {
  if (!logs?.length) return 0
  const dates = logs.map(l => l.log_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let streak = 0
  let checkDate = new Date(today)
  if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) return 0
  if (!dates.includes(todayStr)) checkDate = yesterday

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0]
    if (dates.includes(dateStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else break
  }
  return streak
}

router.get('/', async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url')
      .eq('id', req.userId)
      .single()

    const { data: rep } = await supabase
      .from('reputation_scores')
      .select('score')
      .eq('user_id', req.userId)
      .maybeSingle()

    const user = { ...profile, reputation: rep?.score || 0 }

    // ── Private habits with streaks ──
    const { data: privateHabits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', req.userId)
      .eq('type', 'private')
      .eq('is_active', true)

    const today = new Date().toISOString().split('T')[0]
    const privateHabitIds = (privateHabits || []).map(h => h.id)
    let privateLogs = []
    let privateStreaks = {}

    if (privateHabitIds.length > 0) {
      const { data: todayLogs } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', req.userId)
        .in('habit_id', privateHabitIds)
        .eq('log_date', today)
      privateLogs = todayLogs || []

      for (const hid of privateHabitIds) {
        const { data: recentLogs } = await supabase
          .from('habit_logs')
          .select('log_date')
          .eq('habit_id', hid)
          .eq('user_id', req.userId)
          .in('status', ['self_completed', 'approved'])
          .order('log_date', { ascending: false })
          .limit(60)
        privateStreaks[hid] = calcStreak(recentLogs)
      }
    }

    const privateHabitsWithStatus = (privateHabits || []).map(h => ({
      ...h,
      log: privateLogs.find(l => l.habit_id === h.id) || null,
      streak: privateStreaks[h.id] || 0,
    }))

    // ── Groups + group habits ──
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id, groups(id, name, description, invite_code, created_at)')
      .eq('user_id', req.userId)

    const groups = (memberships || []).map(m => m.groups).filter(Boolean)
    const groupIds = groups.map(g => g.id)

    let groupHabits = []
    let groupStats = { completedToday: 0, totalGroupHabits: 0 }

    if (groupIds.length > 0) {
      const { data: gHabits } = await supabase
        .from('habits')
        .select('*, groups(name)')
        .in('group_id', groupIds)
        .eq('is_active', true)

      const gHabitIds = (gHabits || []).map(h => h.id)
      let groupLogs = []

      if (gHabitIds.length > 0) {
        const { data: logs } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', req.userId)
          .in('habit_id', gHabitIds)
          .eq('log_date', today)
        groupLogs = logs || []
      }

      groupHabits = (gHabits || []).map(h => ({
        ...h,
        log: groupLogs.find(l => l.habit_id === h.id) || null,
      }))

      for (const g of groups) {
        const { data: gp } = await supabase
          .from('group_points')
          .select('points')
          .eq('group_id', g.id)
          .maybeSingle()
        g.points = gp?.points || 0
      }

      groupStats = {
        completedToday: groupLogs.filter(l => ['self_completed', 'approved'].includes(l.status)).length,
        totalGroupHabits: (gHabits || []).length,
      }
    }

    // ── Pact members (primary group) ──
    let pactMembers = []
    if (groupIds.length > 0) {
      const primaryGroupId = groupIds[0]
      const { data: members } = await supabase
        .from('group_members')
        .select('*, profiles(id, name, email, avatar_url)')
        .eq('group_id', primaryGroupId)

      for (const m of (members || [])) {
        const { count: totalCompleted } = await supabase
          .from('habit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', m.user_id)
          .eq('group_id', primaryGroupId)
          .in('status', ['self_completed', 'approved'])

        const joinDate = new Date(m.joined_at)
        const daysSinceJoin = Math.max(1, Math.floor((Date.now() - joinDate) / 86400000))

        const { count: daysActive } = await supabase
          .from('habit_logs')
          .select('log_date', { count: 'exact', head: true })
          .eq('user_id', m.user_id)
          .eq('group_id', primaryGroupId)
          .in('status', ['self_completed', 'approved'])

        // Get reputation for this member
        const { data: memberRep } = await supabase
          .from('reputation_scores')
          .select('score')
          .eq('user_id', m.user_id)
          .maybeSingle()

        // Calculate streak for this member's group habits
        const { data: memberLogs } = await supabase
          .from('habit_logs')
          .select('log_date')
          .eq('user_id', m.user_id)
          .eq('group_id', primaryGroupId)
          .in('status', ['self_completed', 'approved'])
          .order('log_date', { ascending: false })
          .limit(30)

        pactMembers.push({
          userId: m.user_id,
          name: m.profiles?.name || 'Unknown',
          email: m.profiles?.email,
          contribution: totalCompleted || 0,
          consistency: Math.min(100, Math.round(((daysActive || 0) / daysSinceJoin) * 100)),
          streak: calcStreak(memberLogs),
          reputation: memberRep?.score || 0,
          isYou: m.user_id === req.userId,
        })
      }

      pactMembers.sort((a, b) => b.contribution - a.contribution)
    }

    // ── Global leaderboard (top 3 + user's groups) ──
    const { data: allGroupPoints } = await supabase
      .from('group_points')
      .select('group_id, points, groups(id, name)')
      .order('points', { ascending: false })

    const ranked = (allGroupPoints || [])
      .filter(g => g.groups)
      .map((g, i) => ({
        rank: i + 1,
        groupId: g.group_id,
        name: g.groups.name,
        points: g.points,
      }))

    const myGroupIds = new Set(groupIds)
    const topGroups = ranked.slice(0, 5)
    const myGroupsRanked = ranked
      .filter(g => myGroupIds.has(g.groupId))
      .map(g => ({ ...g, isYou: true }))

    // ── Clubs ──
    let myClubs = []
    try {
      const { data: clubMemberships } = await supabase
        .from('club_members')
        .select('club_id, clubs(id, name, description, category)')
        .eq('user_id', req.userId)
      myClubs = (clubMemberships || []).map(m => m.clubs).filter(Boolean)
    } catch {
      // club_members table may not exist yet
    }

    // ── Notifications ──
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5)

    const privateCompleted = privateLogs.filter(l => l.status === 'self_completed').length

    res.json({
      user,
      groups,
      clubs: myClubs,
      privateHabits: privateHabitsWithStatus,
      groupHabits,
      stats: {
        completedToday: privateCompleted + groupStats.completedToday,
        totalHabits: (privateHabits || []).length + groupStats.totalGroupHabits,
        totalPrivate: (privateHabits || []).length,
        totalGroup: groupStats.totalGroupHabits,
      },
      pactMembers,
      primaryGroupName: groups[0]?.name || null,
      leaderboard: { topGroups, myGroups: myGroupsRanked },
      notifications: notifications || [],
    })
  } catch (err) {
    console.error('Dashboard error:', err)
    res.status(500).json({ message: 'Failed to load dashboard' })
  }
})

export default router
