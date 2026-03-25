import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import groupRoutes from './routes/groups.js'
import habitRoutes from './routes/habits.js'
import profileRoutes from './routes/profile.js'
import notificationRoutes from './routes/notifications.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/notifications', notificationRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pact API server running on http://0.0.0.0:${PORT}`)
})
