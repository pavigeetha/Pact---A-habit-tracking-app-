import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

// Create a private habit
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body
    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' })

    const { data: habit, error } = await supabase
      .from('habits')
      .insert({
        user_id: req.userId,
        group_id: null,
        title: title.trim(),
        description: description?.trim() || '',
        type: 'private',
        validation_type: 'self',
        is_active: true,
      })
      .select()
      .single()

    if (error) return res.status(500).json({ message: 'Failed to create habit' })
    res.status(201).json({ habit })
  } catch (err) {
    console.error('Create habit error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Add habit(s) to an existing group
router.post('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params
    const { habits } = req.body

    if (!habits?.length) return res.status(400).json({ message: 'At least one habit is required' })

    // Verify membership
    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', req.userId)
      .maybeSingle()

    if (!membership) return res.status(403).json({ message: 'Not a member of this group' })

    const inserts = habits.map(h => ({
      user_id: req.userId,
      group_id: groupId,
      title: h.title.trim(),
      description: h.description?.trim() || '',
      type: 'group',
      validation_type: h.validation_type || 'peer',
      is_active: true,
    }))

    const { data, error } = await supabase.from('habits').insert(inserts).select()
    if (error) return res.status(500).json({ message: 'Failed to add habits' })
    res.status(201).json({ habits: data })
  } catch (err) {
    console.error('Add group habits error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Log a habit (check in)
router.post('/:id/log', async (req, res) => {
  try {
    const habitId = req.params.id
    const { proofText } = req.body

    const { data: habit } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single()

    if (!habit) return res.status(404).json({ message: 'Habit not found' })

    // Private habits: must be the owner
    if (habit.type === 'private' && habit.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not your habit' })
    }

    // Group habits: must be a member
    if (habit.group_id) {
      const { data: membership } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', habit.group_id)
        .eq('user_id', req.userId)
        .maybeSingle()

      if (!membership) return res.status(403).json({ message: 'Not a member of this group' })
    }

    // Check for existing log today
    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', habitId)
      .eq('user_id', req.userId)
      .eq('log_date', today)
      .maybeSingle()

    if (existing) return res.status(400).json({ message: 'Already logged today' })

    // Status set by DB trigger: self → self_completed, peer → pending
    const { data: log, error } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: habitId,
        user_id: req.userId,
        group_id: habit.group_id,
        log_date: today,
        status: 'pending',
        proof_text: proofText || '',
      })
      .select()
      .single()

    if (error) {
      console.error('Log error:', error)
      return res.status(500).json({ message: 'Failed to log habit' })
    }

    res.status(201).json({ log })
  } catch (err) {
    console.error('Log error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Vote on a habit log (approve/reject)
router.post('/logs/:id/vote', async (req, res) => {
  try {
    const logId = req.params.id
    const { decision } = req.body

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be "approved" or "rejected"' })
    }

    const { data: log } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('id', logId)
      .single()

    if (!log) return res.status(404).json({ message: 'Log not found' })
    if (log.user_id === req.userId) return res.status(400).json({ message: 'Cannot vote on your own log' })
    if (log.status !== 'pending') return res.status(400).json({ message: 'Log already resolved' })

    if (log.group_id) {
      const { data: membership } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', log.group_id)
        .eq('user_id', req.userId)
        .maybeSingle()

      if (!membership) return res.status(403).json({ message: 'Not a member of this group' })
    }

    const { error } = await supabase.from('approvals').insert({
      habit_log_id: logId,
      reviewer_id: req.userId,
      decision,
    })

    if (error) {
      if (error.code === '23505') return res.status(400).json({ message: 'Already voted' })
      return res.status(500).json({ message: 'Failed to vote' })
    }

    res.json({ message: decision === 'approved' ? 'Approved' : 'Rejected' })
  } catch (err) {
    console.error('Vote error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
