import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

// List user's groups
router.get('/', async (req, res) => {
  try {
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id, groups(id, name, description, invite_code, created_at, club_id)')
      .eq('user_id', req.userId)

    const groups = (memberships || []).map(m => m.groups)

    // Get member counts
    for (const group of groups) {
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id)
      group.memberCount = count || 0
    }

    res.json({ groups })
  } catch (err) {
    console.error('List groups error:', err)
    res.status(500).json({ message: 'Failed to fetch groups' })
  }
})

// Get group details
router.get('/:id', async (req, res) => {
  try {
    const groupId = req.params.id

    // Verify membership
    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', req.userId)
      .maybeSingle()

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this group' })
    }

    const { data: group } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single()

    // Members with profiles and reputation
    const { data: members } = await supabase
      .from('group_members')
      .select('*, profiles(id, name, email, avatar_url)')
      .eq('group_id', groupId)

    // Attach reputation to each member
    for (const m of (members || [])) {
      const { data: rep } = await supabase
        .from('reputation_scores')
        .select('score')
        .eq('user_id', m.user_id)
        .maybeSingle()
      m.reputation = rep?.score || 0
    }

    // Habits for this group
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true)

    // Today's logs for current user
    const today = new Date().toISOString().split('T')[0]
    const habitIds = (habits || []).map(h => h.id)

    let myLogs = []
    let pendingApprovals = []

    if (habitIds.length > 0) {
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('*')
        .in('habit_id', habitIds)
        .eq('user_id', req.userId)
        .eq('log_date', today)
      myLogs = logs || []

      // Pending approvals (others' logs I haven't voted on)
      const { data: pendingLogs } = await supabase
        .from('habit_logs')
        .select('*, profiles!habit_logs_user_id_fkey(name, email), habits(title)')
        .in('habit_id', habitIds)
        .eq('status', 'pending')
        .neq('user_id', req.userId)

      if (pendingLogs?.length) {
        const logIds = pendingLogs.map(l => l.id)
        const { data: myVotes } = await supabase
          .from('approvals')
          .select('habit_log_id')
          .in('habit_log_id', logIds)
          .eq('reviewer_id', req.userId)

        const votedIds = new Set((myVotes || []).map(v => v.habit_log_id))
        pendingApprovals = pendingLogs.filter(l => !votedIds.has(l.id))
      }
    }

    // Build habits with today's status
    const habitsWithStatus = (habits || []).map(h => ({
      ...h,
      log: myLogs.find(l => l.habit_id === h.id) || null,
    }))

    // Group points
    const { data: gp } = await supabase
      .from('group_points')
      .select('points')
      .eq('group_id', groupId)
      .maybeSingle()

    // Leaderboard (members sorted by reputation)
    const leaderboard = (members || [])
      .map(m => ({ ...m }))
      .sort((a, b) => b.reputation - a.reputation)

    res.json({
      group: { ...group, points: gp?.points || 0 },
      members,
      habits: habitsWithStatus,
      leaderboard,
      pendingApprovals,
    })
  } catch (err) {
    console.error('Get group error:', err)
    res.status(500).json({ message: 'Failed to fetch group' })
  }
})

// Create group with habits
router.post('/', async (req, res) => {
  try {
    const { name, description, clubId, habits } = req.body

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Group name is required' })
    }

    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name: name.trim(),
        description: description?.trim() || '',
        club_id: clubId || null,
        created_by: req.userId,
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ message: 'Failed to create group' })
    }

    // Add creator as member
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: req.userId,
    })

    // Initialize group points
    await supabase.from('group_points').insert({
      group_id: group.id,
      points: 0,
    })

    // Create habits
    if (habits?.length) {
      const habitInserts = habits.map(h => ({
        user_id: req.userId,
        group_id: group.id,
        title: h.title.trim(),
        description: h.description?.trim() || '',
        type: 'group',
        validation_type: h.validation_type || 'self',
        is_active: true,
      }))
      await supabase.from('habits').insert(habitInserts)
    }

    res.status(201).json({ group })
  } catch (err) {
    console.error('Create group error:', err)
    res.status(500).json({ message: 'Failed to create group' })
  }
})

// Join group by invite code
router.post('/join', async (req, res) => {
  try {
    const { code } = req.body
    if (!code?.trim()) {
      return res.status(400).json({ message: 'Invite code is required' })
    }

    const { data: group } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', code.trim().toLowerCase())
      .maybeSingle()

    if (!group) {
      return res.status(404).json({ message: 'Group not found. Check the invite code.' })
    }

    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', req.userId)
      .maybeSingle()

    if (existing) {
      return res.json({ group, message: 'Already a member' })
    }

    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id)

    if (count >= (group.max_members || 10)) {
      return res.status(400).json({ message: 'This group is full' })
    }

    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: req.userId,
    })

    res.json({ group })
  } catch (err) {
    console.error('Join group error:', err)
    res.status(500).json({ message: 'Failed to join group' })
  }
})

export default router
