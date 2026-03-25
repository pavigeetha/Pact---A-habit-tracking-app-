const rankStyles = {
  1: 'bg-amber-100 text-amber-700 border-amber-300',
  2: 'bg-slate-100 text-slate-600 border-slate-300',
  3: 'bg-orange-100 text-orange-700 border-orange-300',
}

const barColors = {
  1: 'from-emerald-400 to-emerald-500',
  2: 'from-emerald-300 to-emerald-400',
  3: 'from-amber-300 to-amber-400',
  4: 'from-amber-200 to-amber-300',
  5: 'from-red-300 to-red-400',
}

export default function GlobalLeaderboard({ topGroups, myGroups }) {
  if (!topGroups?.length) return null

  const maxPoints = Math.max(...topGroups.map(g => g.points), 1)

  return (
    <div className="card">
      <h3 className="text-sm font-bold text-pact-700 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="text-base">🏆</span> Leaderboard
      </h3>
      <div className="space-y-3">
        {topGroups.map((group) => {
          const isMyGroup = myGroups?.some(mg => mg.groupId === group.groupId)
          const barWidth = Math.max(8, (group.points / maxPoints) * 100)
          return (
            <div
              key={group.groupId}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                isMyGroup ? 'bg-pact-50 border border-pact-200' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                rankStyles[group.rank] || 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {group.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  {group.name}
                  {isMyGroup && (
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">YOU</span>
                  )}
                </p>
                <div className="mt-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barColors[group.rank] || barColors[5]}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
              <p className={`text-sm font-bold whitespace-nowrap ${group.points < 0 ? 'text-red-500' : 'text-pact-600'}`}>
                {group.points} HP
              </p>
            </div>
          )
        })}
      </div>

      {/* Show user's group if not in top 5 */}
      {myGroups?.filter(mg => !topGroups.some(tg => tg.groupId === mg.groupId)).map(mg => (
        <div key={mg.groupId}>
          <div className="border-t border-dashed border-slate-200 my-3" />
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-pact-50 border border-pact-200">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-pact-100 text-pact-600 border border-pact-300">
              {mg.rank}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                {mg.name}
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">YOU</span>
              </p>
            </div>
            <p className={`text-sm font-bold ${mg.points < 0 ? 'text-red-500' : 'text-pact-600'}`}>
              {mg.points} HP
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
