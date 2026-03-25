import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

function getGeminiUrl() {
  const key = process.env.GEMINI_API_KEY
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`
}

// AI advisor for a club
router.post('/clubs/:clubId/ask', async (req, res) => {
  try {
    const { message } = req.body
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' })

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key not configured' })
    }

    // Get club context
    const { data: club } = await supabase
      .from('clubs')
      .select('name, description, category')
      .eq('id', req.params.clubId)
      .single()

    if (!club) return res.status(404).json({ message: 'Club not found' })

    // Verify membership
    const { data: membership } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', req.params.clubId)
      .eq('user_id', req.userId)
      .maybeSingle()

    if (!membership) return res.status(403).json({ message: 'Must be a club member' })

    // Get club stats for context
    const { count: memberCount } = await supabase
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', req.params.clubId)

    const { data: challenges } = await supabase
      .from('club_challenges')
      .select('title')
      .eq('club_id', req.params.clubId)
      .eq('is_active', true)
      .limit(5)

    const { data: groups } = await supabase
      .from('groups')
      .select('name')
      .eq('club_id', req.params.clubId)
      .limit(5)

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', req.userId)
      .single()

    const activeChallenges = (challenges || []).map(c => c.title).join(', ') || 'None'
    const groupNames = (groups || []).map(g => g.name).join(', ') || 'None yet'

    const systemPrompt = `You are the AI advisor for "${club.name}", a ${club.category} club on Pact (a social habit tracking app).

Club description: ${club.description || 'No description set'}
Category: ${club.category}
Members: ${memberCount || 0}
Active challenges: ${activeChallenges}
Groups: ${groupNames}
User asking: ${profile?.name || 'A member'}

Your role:
- Suggest habits, challenges, and goals relevant to this club's theme
- Give motivational and actionable advice
- Recommend weekly challenge ideas
- Help members improve their consistency
- Be friendly, concise, and encouraging
- Keep responses under 200 words
- Use emojis sparingly for warmth`

    const geminiRes = await fetch(getGeminiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\nUser message: ' + message.trim() }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    })

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}))
      const errMsg = errBody.error?.message || 'Unknown error'
      console.error('Gemini API error:', errMsg)

      if (geminiRes.status === 429) {
        return res.status(429).json({ message: 'AI quota exceeded. Please try again later.' })
      }
      return res.status(502).json({ message: 'AI service temporarily unavailable' })
    }

    const data = await geminiRes.json()
    console.log('GEMINI RESPONSE:', JSON.stringify(data, null, 2))
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'

    res.json({ reply })
  } catch (err) {
    console.error('AI error:', err)
    res.status(500).json({ message: 'Failed to get AI response' })
  }
})

// Quick suggestions (no user message needed)
router.get('/clubs/:clubId/suggestions', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key not configured' })
    }

    const { data: club } = await supabase
      .from('clubs')
      .select('name, description, category')
      .eq('id', req.params.clubId)
      .single()

    if (!club) return res.status(404).json({ message: 'Club not found' })

    const prompt = `You are an AI advisor for "${club.name}", a ${club.category} club on a habit tracking app.
Club description: ${club.description || 'Not set'}

Generate exactly 3 quick suggestions for this club. Each should be a short, actionable idea (one sentence each).
Format as a JSON array of strings like: ["suggestion 1", "suggestion 2", "suggestion 3"]
Only output the JSON array, nothing else.`

    const geminiRes = await fetch(getGeminiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 200 },
      }),
    })

    if (!geminiRes.ok) {
      return res.status(502).json({ message: 'AI service unavailable' })
    }

    const data = await geminiRes.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'

    // Parse JSON from response (handle markdown code blocks)
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    let suggestions = []
    try { suggestions = JSON.parse(cleaned) } catch { suggestions = ['Try a new weekly challenge!', 'Share your progress with the group', 'Set a daily habit goal'] }

    res.json({ suggestions })
  } catch (err) {
    console.error('Suggestions error:', err)
    res.status(500).json({ message: 'Failed to get suggestions' })
  }
})

export default router
