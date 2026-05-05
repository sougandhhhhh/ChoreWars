"use client"

export function HouseHealth() {
  const score = 84
  const percentage = (score / 100) * 100
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-xs tracking-[0.2em] text-muted-foreground mb-6">HOUSE HEALTH</h3>
      
      <div className="flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative w-52 h-52">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-border"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="drop-shadow-[0_0_10px_rgba(0,229,208,0.5)]"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00e5d0" />
                <stop offset="100%" stopColor="#00d4e5" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-primary">{score}</span>
            <span className="text-lg text-primary">/ 100</span>
          </div>
        </div>

        {/* Status Row */}
        <div className="flex items-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <span className="text-xs tracking-wider text-muted-foreground">STATUS:</span>
            <span className="text-xs tracking-wider font-semibold text-primary">GOOD</span>
          </div>
          <span className="text-xs tracking-wider text-muted-foreground">+4 TODAY</span>
        </div>
      </div>
    </div>
  )
}
