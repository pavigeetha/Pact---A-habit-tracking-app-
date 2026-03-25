import { getGroupLevel } from '../lib/levels'

export default function CastleVisual({ groupName, points }) {
  const level = getGroupLevel(points || 0)

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-200 via-pact-100 to-green-100 p-6 pb-4">
      {/* HP Display */}
      <div className="absolute top-4 right-5 z-10">
        <div className="glass px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
          <span className="text-xl">{level.emoji}</span>
          <span className="text-lg font-bold text-pact-700">{points || 0} HP</span>
        </div>
      </div>

      {/* Level Badge */}
      <div className="absolute top-4 left-5 z-10">
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${level.bg} ${level.text}`}>
          Lv.{level.level} {level.name}
        </div>
      </div>

      {/* Castle - scales with level */}
      <div className="relative flex flex-col items-center pt-10 pb-2">
        <div className="flex items-end gap-0.5">
          {/* Left tower */}
          {level.level >= 2 && (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-l-transparent border-r-transparent border-b-pact-400" />
              <div className="w-5 h-10 bg-pact-300 rounded-t-sm" />
            </div>
          )}
          {level.level >= 3 && <div className="w-6 h-8 bg-pact-200 rounded-t-sm" />}

          {/* Main tower */}
          <div className="flex flex-col items-center -mt-4">
            <div className={`w-0 h-0 border-l-[16px] border-r-[16px] border-b-[20px] border-l-transparent border-r-transparent ${
              level.level >= 5 ? 'border-b-amber-400' : level.level >= 4 ? 'border-b-pact-500' : 'border-b-pink-400'
            }`} />
            {level.level >= 5 && (
              <div className="text-sm -mt-1 mb-0.5 animate-float">👑</div>
            )}
            <div className={`w-8 h-14 rounded-t-sm flex items-end justify-center pb-1 ${
              level.level >= 4 ? 'bg-pact-400' : 'bg-pink-300'
            }`}>
              <div className="w-3.5 h-4 bg-pact-700 rounded-t-full" />
            </div>
          </div>

          {level.level >= 3 && <div className="w-6 h-8 bg-pact-200 rounded-t-sm" />}
          {/* Right tower */}
          {level.level >= 2 && (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-l-transparent border-r-transparent border-b-pact-400" />
              <div className="w-5 h-10 bg-pact-300 rounded-t-sm" />
            </div>
          )}
          {/* Outer towers for fortress+ */}
          {level.level >= 4 && (
            <div className="flex flex-col items-center ml-1 animate-fade-in">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-amber-400" />
              <div className="w-4 h-8 bg-amber-300 rounded-t-sm" />
            </div>
          )}
        </div>

        {/* Trees */}
        <div className="flex items-end gap-3 w-full justify-between px-6 -mt-0.5">
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 bg-pink-300 rounded-full" />
            <div className="w-1 h-3 bg-amber-700" />
          </div>
          <div className="flex-1" />
          {level.level >= 6 && <span className="text-lg animate-float">✨</span>}
          <div className="flex-1" />
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 bg-pink-300 rounded-full" />
            <div className="w-1 h-3 bg-amber-700" />
          </div>
        </div>
        <div className="w-full h-5 bg-gradient-to-r from-green-200 via-green-300 to-green-200 rounded-b-xl" />
      </div>

      {/* HP Progress Bar */}
      <div className="mt-2">
        <div className="flex justify-between text-[10px] text-pact-600/70 font-medium mb-1">
          <span>{level.name}</span>
          <span>{level.nextLevel ? `${Math.round(level.progress)}% → ${level.nextLevel.name}` : 'MAX LEVEL'}</span>
        </div>
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all duration-1000`}
            style={{ width: `${level.progress}%` }}
          />
        </div>
      </div>

      {groupName && <p className="text-center text-sm font-semibold text-pact-700/80 mt-2">{groupName}</p>}
    </div>
  )
}
