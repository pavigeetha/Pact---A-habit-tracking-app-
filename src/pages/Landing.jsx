import { Link } from 'react-router-dom'
import {
  Flame, Users, Shield, Trophy, Zap, ArrowRight,
  CheckCircle2, Eye, TrendingUp, Heart
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Habit Rooms',
    desc: 'Create shared spaces where your group commits to habits together. No more tracking alone.',
    color: 'bg-pact-100 text-pact-500',
  },
  {
    icon: Shield,
    title: 'Social Validation',
    desc: 'Group members verify each other\'s check-ins. Proof-based or peer-voted — authenticity enforced.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Trophy,
    title: 'Reputation & Leaderboards',
    desc: 'Earn reputation through consistency. Climb the leaderboard and build trust within your group.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Zap,
    title: 'Smart Nudges',
    desc: 'Context-aware notifications triggered by group activity — not generic reminders.',
    color: 'bg-blue-100 text-blue-600',
  },
]

const howItWorks = [
  { step: '01', title: 'Create a Room', desc: 'Set up a habit room and define the habits your group will tackle together.' },
  { step: '02', title: 'Invite Your Group', desc: 'Share the invite code. Friends join and commit to the same habits.' },
  { step: '03', title: 'Check In Daily', desc: 'Complete your habit and submit proof. Self-report or get group validation.' },
  { step: '04', title: 'Stay Accountable', desc: 'See who\'s keeping up, earn reputation, and keep the group momentum going.' },
]

const psychology = [
  { icon: Eye, title: 'Hawthorne Effect', desc: 'People perform better when they know they\'re being observed by peers.' },
  { icon: TrendingUp, title: 'Commitment Devices', desc: 'Public commitments create social contracts that are harder to break.' },
  { icon: Heart, title: 'Positive Reinforcement', desc: 'Celebration and recovery systems sustain long-term behavior change.' },
  { icon: Users, title: 'Social Identity', desc: 'Group membership creates identity-based motivation beyond willpower.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pact-400 via-pact-500 to-pact-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pact-300 rounded-full blur-3xl" />
        </div>

        <nav className="relative max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Pact</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-white text-pact-600 rounded-xl hover:bg-pact-50 transition-colors">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-pact-100 text-sm font-medium mb-8">
            <Flame className="w-4 h-4" />
            Social accountability that actually works
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Turn Your Habits Into
            <br />
            <span className="text-pact-200">Social Commitments</span>
          </h1>
          <p className="text-lg text-pact-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Pact transforms habit tracking from a private, forgettable task into a shared social
            experience. Form groups, validate each other, and build habits that stick through
            real accountability.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-pact-600 font-semibold rounded-xl hover:bg-pact-50 transition-all hover:shadow-lg text-base"
            >
              Start Your Pact
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-base"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-pact-500 uppercase tracking-wider mb-3">The Problem</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Why Habit Apps Keep Failing You
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Existing apps like Habitica, HabitShare, and Streaks are private, easy to ignore,
            and lack real consequences. You check a box alone — and nobody notices when you stop.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'No Accountability', desc: 'Private tracking means zero social pressure to follow through.' },
            { label: 'Fake Progress', desc: 'Self-reporting without verification enables dishonest tracking.' },
            { label: 'No Recovery', desc: 'One missed day kills motivation with no system to bounce back.' },
          ].map((item) => (
            <div key={item.label} className="card border-red-100 bg-red-50/50">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-red-500 font-bold text-lg">!</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{item.label}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-pact-500 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for Real Accountability
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-pact-500 uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Four Steps to Better Habits</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {howItWorks.map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-14 h-14 bg-pact-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-pact-500 font-bold text-lg">{step}</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Psychology */}
      <section className="bg-pact-50 border-y border-pact-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-pact-500 uppercase tracking-wider mb-3">Science-Backed</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Grounded in Behavioral Psychology
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {psychology.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card bg-white">
                <Icon className="w-8 h-8 text-pact-500 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">{title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-pact-500 to-pact-700">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Make a Pact?
          </h2>
          <p className="text-pact-100 text-lg mb-8 max-w-xl mx-auto">
            Join a community where habits are shared commitments, not private checkboxes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-pact-600 font-semibold rounded-xl hover:bg-pact-50 transition-all hover:shadow-lg text-base"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-pact-400" />
            <span className="font-semibold text-white">Pact</span>
          </div>
          <p className="text-sm">Social accountability for habits that stick.</p>
        </div>
      </footer>
    </div>
  )
}
