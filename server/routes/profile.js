import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url, created_at')
      .eq('id', req.userId)
      .single()

    if (!profile) return res.status(404).json({ message: 'User not found' })

    const { data: rep } = await supabase
      .from('reputation_scores')
      .select('score')
      .eq('user_id', req.userId)
      .maybeSingle()

    // Total completed logs
    const { count: totalLogs } = await supabase
      .from('habit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId)
      .in('status', ['self_completed', 'approved'])

    // Group count
    const { count: groupCount } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId)

    // Active habits with recent streaks (calculated from logs)
    const { data: habits } = await supabase
      .from('habits')
      .select('id, title, group_id, groups(name)')
      .eq('user_id', req.userId)
      .eq('is_active', true)

    // Calculate streaks per habit
    const streaks = []
    for (const habit of (habits || [])) {
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('log_date')
        .eq('habit_id', habit.id)
        .eq('user_id', req.userId)
        .in('status', ['self_completed', 'approved'])
        .order('log_date', { ascending: false })
        .limit(60)

      let currentStreak = 0
      let longestStreak = 0
      if (logs?.length) {
        const today = new Date()
        const dates = logs.map(l => l.log_date)
        let checkDate = new Date(today)
        checkDate.setHours(0, 0, 0, 0)

        // Check if today or yesterday has a log to start counting
        const todayStr = checkDate.toISOString().split('T')[0]
        const yesterday = new Date(checkDate)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
          currentStreak = 0
        } else {
          if (!dates.includes(todayStr)) {
            checkDate = yesterday
          }
          for (let i = 0; i < 60; i++) {
            const dateStr = checkDate.toISOString().split('T')[0]
            if (dates.includes(dateStr)) {
              currentStreak++
              checkDate.setDate(checkDate.getDate() - 1)
            } else {
              break
            }
          }
        }
        longestStreak = Math.max(currentStreak, longestStreak)
      }

      if (currentStreak > 0 || longestStreak > 0) {
        streaks.push({
          habit_id: habit.id,
          title: habit.title,
          groupName: habit.groups?.name,
          currentStreak,
          longestStreak,
        })
      }
    }

    res.json({
      user: { ...profile, reputation: rep?.score || 0 },
      totalLogs: totalLogs || 0,
      groupCount: groupCount || 0,
      streaks: streaks.sort((a, b) => b.currentStreak - a.currentStreak),
    })
  } catch (err) {
    console.error('Profile error:', err)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

export default router
