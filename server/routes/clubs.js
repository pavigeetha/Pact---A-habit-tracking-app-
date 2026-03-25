import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

// Ensure club_members table exists (auto-create if not)
async function ensureClubMembersTable() {
  const { error } = await supabase.from('club_members').select('id').limit(0)
  if (error && error.message?.includes('could not find')) {
    // Table doesn't exist — create it via raw SQL
    await supabase.rpc('exec_sql', {
      query: `CREATE TABLE IF NOT EXISTS club_members (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        role text DEFAULT 'member',
        joined_at timestamptz DEFAULT now(),
        UNIQUE(club_id, user_id)
      )`
    }).catch(() => {}) // rpc may not exist, that's ok
    return false
  }
  return true
}

// List all clubs
router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    let query = supabase.from('clubs').select('*')
    if (search) query = query.ilike('name', `%${search}%`)

    const { data: clubs } = await query.order('created_at', { ascending: false })

    const tableExists = await ensureClubMembersTable()

    for (const club of (clubs || [])) {
      if (tableExists) {
        const { count } = await supabase
          .from('club_members')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', club.id)
        club.memberCount = count || 0

        const { data: membership } = await supabase
          .from('club_members')
          .select('id')
          .eq('club_id', club.id)
          .eq('user_id', req.userId)
          .maybeSingle()
        club.isMember = !!membership
      } else {
        // Fallback: creator is the only "member"
        club.memberCount = club.created_by === req.userId ? 1 : 0
        club.isMember = club.created_by === req.userId
      }
    }

    res.json({ clubs: clubs || [] })
  } catch (err) {
    console.error('List clubs error:', err)
    res.status(500).json({ message: 'Failed to fetch clubs' })
  }
})

// Get club details
router.get('/:id', async (req, res) => {
  try {
    const { data: club } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (!club) return res.status(404).json({ message: 'Club not found' })

    const tableExists = await ensureClubMembersTable()

    let members = []
    let isMember = false
    let myRole = null

    if (tableExists) {
      const { data } = await supabase
        .from('club_members')
        .select('*, profiles(id, name, email, avatar_url)')
        .eq('club_id', club.id)
      members = data || []
      isMember = members.some(m => m.user_id === req.userId)
      myRole = members.find(m => m.user_id === req.userId)?.role
    }

    // Creator is always considered a member
    if (!isMember && club.created_by === req.userId) {
      isMember = true
      myRole = 'admin'
      // Auto-add creator to club_members if table exists
      if (tableExists) {
        await supabase.from('club_members').upsert({
          club_id: club.id,
          user_id: req.userId,
          role: 'admin',
        }, { onConflict: 'club_id,user_id' }).catch(() => {})
        // Re-fetch members
        const { data } = await supabase
          .from('club_members')
          .select('*, profiles(id, name, email, avatar_url)')
          .eq('club_id', club.id)
        members = data || []
      }
    }

    // Groups in this club
    let groups = []
    const { data: groupData } = await supabase
      .from('groups')
      .select('*')
      .eq('club_id', club.id)
    for (const g of (groupData || [])) {
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', g.id)
      g.memberCount = count || 0
      const { data: gp } = await supabase
        .from('group_points')
        .select('points')
        .eq('group_id', g.id)
        .maybeSingle()
      g.points = gp?.points || 0
    }
    groups = groupData || []

    // Challenges
    let challenges = []
    try {
      const { data } = await supabase
        .from('club_challenges')
        .select('*')
        .eq('club_id', club.id)
        .order('start_date', { ascending: false })
      for (const c of (data || [])) {
        try {
          const { data: p } = await supabase
            .from('challenge_participants')
            .select('completed')
            .eq('challenge_id', c.id)
            .eq('user_id', req.userId)
            .maybeSingle()
          c.joined = !!p
          c.completed = p?.completed || false
          const { count } = await supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', c.id)
          c.participantCount = count || 0
        } catch {
          c.joined = false
          c.completed = false
          c.participantCount = 0
        }
      }
      challenges = data || []
    } catch {}

    res.json({ club, members, groups, challenges, isMember, myRole })
  } catch (err) {
    console.error('Get club error:', err)
    res.status(500).json({ message: 'Failed to fetch club' })
  }
})

// Create club
router.post('/', async (req, res) => {
  try {
    const { name, description, category } = req.body
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' })

    // Try full insert, fall back to basic
    let club, error
    ;({ data: club, error } = await supabase.from('clubs').insert({
      name: name.trim(),
      description: description?.trim() || '',
      created_by: req.userId,
      category: category || 'general',
      is_public: true,
    }).select().single())

    if (error && error.message?.includes('category')) {
      ;({ data: club, error } = await supabase.from('clubs').insert({
        name: name.trim(),
        description: description?.trim() || '',
        created_by: req.userId,
      }).select().single())
    }

    if (error) {
      console.error('Club insert error:', error)
      return res.status(500).json({ message: error.message || 'Failed to create club' })
    }

    // Add creator as admin member
    await ensureClubMembersTable()
    const { error: memberErr } = await supabase.from('club_members').insert({
      club_id: club.id,
      user_id: req.userId,
      role: 'admin',
    })
    if (memberErr) console.warn('club_members insert:', memberErr.message)

    res.status(201).json({ club })
  } catch (err) {
    console.error('Create club error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Join club
router.post('/:id/join', async (req, res) => {
  try {
    const clubId = req.params.id
    await ensureClubMembersTable()

    const { data: existing } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', req.userId)
      .maybeSingle()

    if (existing) return res.json({ message: 'Already a member' })

    const { error } = await supabase.from('club_members').insert({
      club_id: clubId,
      user_id: req.userId,
      role: 'member',
    })

    if (error) {
      console.error('Join club error:', error)
      return res.status(500).json({ message: error.message || 'Failed to join' })
    }

    res.json({ message: 'Joined!' })
  } catch (err) {
    console.error('Join club error:', err)
    res.status(500).json({ message: 'Failed to join club' })
  }
})

// Leave club
router.delete('/:id/leave', async (req, res) => {
  try {
    await supabase
      .from('club_members')
      .delete()
      .eq('club_id', req.params.id)
      .eq('user_id', req.userId)
    res.json({ message: 'Left club' })
  } catch {
    res.json({ message: 'Left club' })
  }
})

// Create challenge
router.post('/:id/challenges', async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body
    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' })

    const { data: challenge, error } = await supabase
      .from('club_challenges')
      .insert({
        club_id: req.params.id,
        title: title.trim(),
        description: description?.trim() || '',
        start_date: startDate,
        end_date: endDate,
        created_by: req.userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Challenge error:', error)
      return res.status(500).json({ message: error.message || 'Failed to create challenge' })
    }
    res.status(201).json({ challenge })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Join challenge
router.post('/challenges/:challengeId/join', async (req, res) => {
  try {
    const { error } = await supabase.from('challenge_participants').insert({
      challenge_id: req.params.challengeId,
      user_id: req.userId,
    })
    if (error) return res.status(500).json({ message: error.message })
    res.json({ message: 'Joined challenge!' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to join challenge' })
  }
})

// Complete challenge
router.put('/challenges/:challengeId/complete', async (req, res) => {
  try {
    await supabase
      .from('challenge_participants')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('challenge_id', req.params.challengeId)
      .eq('user_id', req.userId)
    res.json({ message: 'Challenge completed!' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete challenge' })
  }
})

export default router
