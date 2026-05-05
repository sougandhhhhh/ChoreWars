"use client"

import { Zap, Trash2, SprayCan, Disc, CheckCircle2 } from "lucide-react"

const directives = [
  {
    id: 1,
    icon: Trash2,
    title: "Purge Waste Receptacles",
    subtitle: "Kitchen & Main Bathroom",
    xp: 50,
    completed: false,
    iconBg: "bg-accent/20",
    iconColor: "text-accent",
  },
  {
    id: 2,
    icon: SprayCan,
    title: "Sanitize Preparation Surfaces",
    subtitle: "Kitchen Counters",
    xp: 30,
    completed: false,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
  {
    id: 3,
    icon: Disc,
    title: "Run Dishwasher Cycle",
    subtitle: "Completed by Alex",
    xp: 0,
    completed: true,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
]

export function DailyDirectives() {
  return (
    <div className="bg-card/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <h3 className="text-xs tracking-[0.2em] text-muted-foreground">DAILY DIRECTIVES</h3>
        </div>
        <button className="text-xs text-primary hover:underline tracking-wider">VIEW ALL</button>
      </div>

      {/* Directives List */}
      <div className="space-y-3">
        {directives.map((directive) => (
          <div
            key={directive.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${directive.iconBg} flex items-center justify-center`}>
              <directive.icon className={`w-5 h-5 ${directive.iconColor}`} />
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{directive.title}</p>
              <p className="text-xs text-muted-foreground">{directive.subtitle}</p>
            </div>

            {directive.completed ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span className="text-[8px] text-amber-400">⊕</span>
                  </div>
                  <span className="text-xs text-amber-400">{directive.xp} XP</span>
                </div>
                <button className="px-4 py-1.5 text-xs border border-primary text-primary rounded hover:bg-primary/10 transition-colors tracking-wider">
                  ACCEPT
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
