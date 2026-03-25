import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    // Profile + reputation
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

    // Groups
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id, groups(id, name, description, invite_code, created_at)')
      .eq('user_id', req.userId)

    const groups = (memberships || []).map(m => m.groups).filter(Boolean)
    const groupIds = groups.map(g => g.id)

    let todaysHabits = []
    let stats = { completedToday: 0, totalHabits: 0 }

    if (groupIds.length > 0) {
      // All active habits across groups
      const { data: habits } = await supabase
        .from('habits')
        .select('*, groups(name)')
        .in('group_id', groupIds)
        .eq('is_active', true)

      const today = new Date().toISOString().split('T')[0]
      const habitIds = (habits || []).map(h => h.id)

      let todayLogs = []
      if (habitIds.length > 0) {
        const { data: logs } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', req.userId)
          .in('habit_id', habitIds)
          .eq('log_date', today)
        todayLogs = logs || []
      }

      todaysHabits = (habits || []).map(h => ({
        ...h,
        log: todayLogs.find(l => l.habit_id === h.id) || null,
      }))

      stats = {
        completedToday: todayLogs.filter(l => ['self_completed', 'approved'].includes(l.status)).length,
        totalHabits: (habits || []).length,
      }
    }

    // Notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5)

    res.json({ user, groups, todaysHabits, stats, notifications: notifications || [] })
  } catch (err) {
    console.error('Dashboard error:', err)
    res.status(500).json({ message: 'Failed to load dashboard' })
  }
})

export default router
