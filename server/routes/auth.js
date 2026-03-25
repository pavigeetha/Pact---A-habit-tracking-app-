import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { supabase } from '../lib/supabase.js'
import { signToken, authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({ name, email, password_hash: passwordHash })
      .select('id, name, email, avatar_url, created_at')
      .single()

    if (error) {
      console.error('Register error:', error)
      return res.status(500).json({ message: 'Failed to create account' })
    }

    // reputation_scores row is created by trigger

    const token = signToken(profile.id)
    res.status(201).json({ token, user: { ...profile, reputation: 0 } })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (!profile || !profile.password_hash) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, profile.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const { data: rep } = await supabase
      .from('reputation_scores')
      .select('score')
      .eq('user_id', profile.id)
      .maybeSingle()

    const token = signToken(profile.id)
    const { password_hash, ...safeProfile } = profile
    res.json({ token, user: { ...safeProfile, reputation: rep?.score || 0 } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/me', authenticate, async (req, res) => {
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

    res.json({ user: { ...profile, reputation: rep?.score || 0 } })
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
