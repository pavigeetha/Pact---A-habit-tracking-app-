import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'
import { Sparkles, Send, Lightbulb, RefreshCw, X, MessageCircle } from 'lucide-react'

export default function AiAdvisor({ clubId, clubName }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'ai',
        text: `Hey! I'm the AI advisor for **${clubName}**. Ask me for habit suggestions, challenge ideas, motivation tips, or anything related to your club goals! 🌟`,
      }])
      loadSuggestions()
    }
  }, [open])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function loadSuggestions() {
    setLoadingSuggestions(true)
    try {
      const { suggestions: s } = await api.ai.suggestions(clubId)
      setSuggestions(s || [])
    } catch {
      setSuggestions(['What habits should I track?', 'Suggest a weekly challenge', 'How can I stay consistent?'])
    } finally {
      setLoadingSuggestions(false)
    }
  }

  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg) return

    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)

    try {
      const { reply } = await api.ai.ask(clubId, msg)
      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    } catch (err) {
      const errorMsg = err.message?.includes('quota')
        ? 'AI quota exceeded for today. Please try again tomorrow!'
        : 'Sorry, I couldn\'t process that right now. Try again!'
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage()
  }

  // Floating button when closed
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-pact-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-pulse-glow"
        title="AI Club Advisor"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-pact-100 overflow-hidden flex flex-col" style={{ height: '520px' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-pact-500 to-purple-500 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">AI Advisor</p>
              <p className="text-white/70 text-[10px]">{clubName}</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-pact-50/50 to-white">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-pact-500 to-pact-600 text-white rounded-br-md'
                  : 'bg-white border border-pact-100 text-slate-700 rounded-bl-md shadow-sm'
              }`}>
                {msg.text.split('**').map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-pact-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-pact-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-pact-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-pact-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick suggestions */}
        {suggestions.length > 0 && messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-1 mb-1.5">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Ask</span>
              <button onClick={loadSuggestions} disabled={loadingSuggestions} className="ml-auto p-0.5 text-slate-300 hover:text-pact-500">
                <RefreshCw className={`w-3 h-3 ${loadingSuggestions ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} disabled={loading}
                  className="text-[11px] px-2.5 py-1.5 bg-pact-50 text-pact-700 rounded-lg hover:bg-pact-100 transition-colors font-medium text-left leading-tight">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-3 py-3 border-t border-slate-100 bg-white shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for suggestions..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pact-400 focus:bg-white transition-all"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="w-10 h-10 bg-gradient-to-r from-pact-500 to-purple-500 rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:shadow-md transition-all shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
