import { Flame, Crown } from 'lucide-react'

const avatarColors = [
  'bg-pact-400 text-white',
  'bg-blue-400 text-white',
  'bg-emerald-400 text-white',
  'bg-amber-400 text-white',
  'bg-pink-400 text-white',
  'bg-purple-400 text-white',
]

export default function PactMembers({ members, groupName }) {
  if (!members?.length) return null

  return (
    <div className="card">
      <h3 className="text-sm font-bold text-pact-700 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="text-base">👥</span> Pact Members — {groupName}
      </h3>
      <div className="space-y-3">
        {members.map((member, i) => (
          <div key={member.userId} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
              {(member.name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                {member.name}
                {i === 0 && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                {member.isYou && (
                  <span className="text-[10px] bg-pact-100 text-pact-600 px-1.5 py-0.5 rounded-full font-bold">YOU</span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                +{member.contribution} contributed · {member.consistency}% consistency
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-pact-500">
              <Flame className="w-4 h-4" />
              {member.streak}d
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
