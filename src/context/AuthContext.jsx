import { createContext, useContext, useState, useEffect } from 'react'
import { api, setToken } from '../lib/api'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pact_token')
    if (token) {
      api.auth.me()
        .then(({ user }) => setUser(user))
        .catch(() => setToken(null))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function signUp(email, password, name) {
    const { token, user } = await api.auth.register({ email, password, name })
    setToken(token)
    setUser(user)
    return { user }
  }

  async function signIn(email, password) {
    const { token, user } = await api.auth.login({ email, password })
    setToken(token)
    setUser(user)
    return { user }
  }

  async function signOut() {
    setToken(null)
    setUser(null)
  }

  async function refreshProfile() {
    try {
      const { user } = await api.auth.me()
      setUser(user)
    } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{ user, profile: user, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
