import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10)

    res.json({ notifications: notifications || [] })
  } catch (err) {
    console.error('Notifications error:', err)
    res.status(500).json({ message: 'Failed to fetch notifications' })
  }
})

router.put('/:id/read', async (req, res) => {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)

    res.json({ message: 'Dismissed' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to dismiss' })
  }
})

export default router
