import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

// Global group leaderboard
router.get('/groups', async (req, res) => {
  try {
    // Get all groups with points
    const { data: allGroups } = await supabase
      .from('group_points')
      .select('group_id, points, groups(id, name, description)')
      .order('points', { ascending: false })

    // Get member counts for each group
    const ranked = []
    for (let i = 0; i < (allGroups || []).length; i++) {
      const g = allGroups[i]
      if (!g.groups) continue
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', g.group_id)
      ranked.push({
        rank: i + 1,
        groupId: g.group_id,
        name: g.groups.name,
        description: g.groups.description,
        points: g.points,
        memberCount: count || 0,
      })
    }

    // Find user's groups
    const { data: myMemberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', req.userId)

    const myGroupIds = new Set((myMemberships || []).map(m => m.group_id))
    const topGroups = ranked.slice(0, 5)
    const myGroups = ranked
      .filter(g => myGroupIds.has(g.groupId))
      .map(g => ({ ...g, isYou: true }))

    res.json({ topGroups, myGroups, totalGroups: ranked.length })
  } catch (err) {
    console.error('Leaderboard error:', err)
    res.status(500).json({ message: 'Failed to fetch leaderboard' })
  }
})

export default router
