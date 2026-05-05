"use client"

const rooms = [
  {
    id: 1,
    name: "Kitchen Cleaning",
    integrity: 45,
    status: "NEEDS ATTENTION",
    statusColor: "bg-red-500/20 text-red-400 border-red-500/50",
    progressColor: "bg-red-500",
    bgGradient: "from-red-950/20",
  },
  {
    id: 2,
    name: "Main Bathroom",
    integrity: 88,
    status: "STABLE",
    statusColor: "bg-primary/20 text-primary border-primary/50",
    progressColor: "bg-primary",
    bgGradient: "from-primary/10",
  },
  {
    id: 3,
    name: "Living Sector",
    integrity: 95,
    status: "OPTIMAL",
    statusColor: "bg-muted text-muted-foreground border-border",
    progressColor: "bg-yellow-400",
    bgGradient: "from-yellow-950/10",
  },
]

export function RoomCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`bg-card rounded-xl overflow-hidden border border-border relative`}
        >
          {/* Background gradient effect */}
          <div className={`absolute inset-0 bg-gradient-to-b ${room.bgGradient} to-transparent opacity-50`} />
          
          {/* Content */}
          <div className="relative p-4 pt-8 pb-6">
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-0.5 text-[10px] tracking-wider rounded border ${room.statusColor}`}>
                {room.status}
              </span>
            </div>

            {/* Room preview area - simulated interface elements */}
            <div className="h-20 mb-4 opacity-30">
              <div className="flex gap-2 mb-2">
                <div className="w-16 h-8 bg-muted rounded-sm" />
                <div className="w-12 h-8 bg-muted rounded-sm" />
                <div className="w-20 h-8 bg-muted rounded-sm" />
              </div>
              <div className="flex gap-2">
                <div className="w-24 h-6 bg-muted rounded-sm" />
                <div className="w-16 h-6 bg-muted rounded-sm" />
              </div>
            </div>

            {/* Room Info */}
            <h4 className="text-base font-semibold text-foreground">{room.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">Integrity: {room.integrity}%</p>
          </div>

          {/* Progress Bar */}
          <div className="h-1 w-full bg-muted">
            <div
              className={`h-full ${room.progressColor} transition-all duration-500`}
              style={{ width: `${room.integrity}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
