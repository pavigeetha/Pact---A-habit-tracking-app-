import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'pact-dev-secret-change-in-production'

export function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.sub
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' })
}
