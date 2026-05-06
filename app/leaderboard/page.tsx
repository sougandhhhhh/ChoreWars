"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { SyncButton } from "@/components/SyncButton"
import { Bot, Trash2, Droplets, Home as HomeIcon, Sparkles, BarChart2, Utensils, Bath } from "lucide-react"
import Image from "next/image"
import { OPERATIVES } from "@/data/operatives"
import useAuthStore from "@/stores/useAuthStore"
import { useState } from "react"

import { useChoreStore } from "@/stores/useChoreStore"

const PEOPLE = ["sanjjay", "sougandh", "chris", "haady", "kichu"]

const CHORE_CONFIG = [
  { id: "waste", icon: Trash2, name: "WASTE", accent: "#ff59e3" },
  { id: "water", icon: Droplets, name: "WATER CAN", accent: "#99f7ff" },
  { id: "house", icon: HomeIcon, name: "HOUSE CLEANING", accent: "#ff59e3" },
  { id: "kitchen", icon: Utensils, name: "KITCHEN CLEANING", accent: "#99f7ff" },
  { id: "bathroom", icon: Bath, name: "BATHROOM", accent: "#ff59e3" },
  { id: "extra", icon: Sparkles, name: "EXTRA CHORES", accent: "#99f7ff" },
]

export default function LeaderboardPage() {
  const { profileOverrides = {} } = useAuthStore()
  const { completionStats, toggleChat } = useChoreStore()
  const [selectedCycle, setSelectedCycle] = useState("Lifetime")

  const getProfile = (id: string) => {
    const base = OPERATIVES.find(op => op.profileId === id) || OPERATIVES[0];
    const safeOverrides = profileOverrides || {};
    const overrides = safeOverrides[id] || {};
    return {
      ...base,
      name: overrides.name || base.name,
      codename: overrides.codename || base.codename,
    };
  };

  const getPoints = (pid: string) => {
    let total = 0;
    Object.values(completionStats).forEach((choreGroup: any) => {
      const stat = choreGroup[pid];
      if (stat) {
        total += (stat.count || 0) * 100;
        total += (stat.points || 0);
      }
    });
    return total;
  };

  const allStandings = PEOPLE.map(pid => {
    const profile = getProfile(pid);
    const pts = getPoints(pid);
    return {
      profileId: pid,
      name: profile.name,
      avatar: profile.animeImage || profile.image,
      pts,
      status: pts > 2000 ? "Elite Operative" : pts > 1000 ? "Active Service" : "In Training"
    };
  }).sort((a, b) => b.pts - a.pts).map((s, i) => ({ ...s, rank: i + 1 }));

  const podium = [allStandings[1], allStandings[0], allStandings[2]]; // 2nd, 1st, 3rd
  const runnersUp = allStandings.slice(3);

  const choreMastery = CHORE_CONFIG.map(c => {
    const scores = PEOPLE.map(pid => ({ 
      pid, 
      count: completionStats[c.id]?.[pid]?.count || 0 
    })).sort((a, b) => b.count - a.count);

    const top = scores[0];
    const bottom = scores[scores.length - 1];

    return {
      ...c,
      topHolder: top.count > 0 ? getProfile(top.pid).name : "Unclaimed",
      topCount: top.count,
      bottomHolder: bottom.count > 0 ? getProfile(bottom.pid).name : "Unclaimed",
      bottomCount: bottom.count
    };
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activePage="leaderboard" />

      <main className="flex-1 ml-64 flex flex-col overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h1 className="text-5xl font-black text-[#ff59e3] italic tracking-tight uppercase">Roomies Standings</h1>
          <div className="flex gap-2">
            <SyncButton />
            <button 
              onClick={toggleChat}
              className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
            >
              <Bot className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 flex-1 min-h-0">

          {/* Left column */}
          <div className="col-span-3 flex flex-col gap-4 min-h-0">

            {/* Podium */}
            <div className="bg-card rounded-xl border border-border p-5 flex-1 min-h-0 flex flex-col relative overflow-hidden">
              {/* Podium Filters */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button 
                  onClick={() => setSelectedCycle("Month")}
                  className={`text-[10px] px-3 py-1 rounded-full border transition-colors ${
                    selectedCycle === "Month" 
                      ? "text-[#99f7ff] border-[#99f7ff]/50 bg-[#99f7ff]/10" 
                      : "text-muted-foreground border-border hover:text-white"
                  }`}
                >
                  Month
                </button>
                <button 
                  onClick={() => setSelectedCycle("Semester")}
                  className={`text-[10px] px-3 py-1 rounded-full border transition-colors ${
                    selectedCycle === "Semester" 
                      ? "text-[#99f7ff] border-[#99f7ff]/50 bg-[#99f7ff]/10" 
                      : "text-muted-foreground border-border hover:text-white"
                  }`}
                >
                  Semester
                </button>
                <button 
                  onClick={() => setSelectedCycle("Lifetime")}
                  className={`text-[10px] px-3 py-1 rounded-full border transition-colors ${
                    selectedCycle === "Lifetime" 
                      ? "text-[#99f7ff] border-[#99f7ff]/50 bg-[#99f7ff]/10" 
                      : "text-muted-foreground border-border hover:text-white"
                  }`}
                >
                  Lifetime
                </button>
              </div>

              <div className="flex items-end justify-center gap-6 h-full pb-2 pt-8 mt-3">
                {/* 2nd Place */}
                {podium[0] && (
                  <div className="flex flex-col items-center">
                    <div className="text-gray-300 text-3xl mb-1 drop-shadow-[0_0_10px_rgba(156,163,175,0.5)]">🥈</div>
                    <div className="relative mb-2">
                      <div className="w-20 h-20 rounded-full border-2 border-[#99f7ff]/60 overflow-hidden relative shadow-[0_0_15px_rgba(153,247,255,0.3)]">
                        <Image src={podium[0].avatar} alt="" fill className="object-cover" />
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#adaaaa] text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">2ND</span>
                    </div>
                    <p className="text-white font-semibold text-base mt-1 text-center truncate w-24">{podium[0].name}</p>
                    <p className="text-[#99f7ff] text-2xl font-bold">{podium[0].pts.toLocaleString()}</p>
                    <p className="text-muted-foreground text-xs font-bold tracking-widest">PTS</p>
                    <div className="w-24 h-28 bg-gradient-to-t from-transparent to-[#99f7ff]/20 rounded-t-xl mt-3 border-t-[3px] border-[#99f7ff]/50" />
                  </div>
                )}

                {/* 1st Place */}
                {podium[1] && (
                  <div className="flex flex-col items-center -mb-2">
                    <div className="text-yellow-400 text-3xl mb-1 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">🥇</div>
                    <div className="relative mb-2">
                      <div className="w-24 h-24 rounded-full border-[3px] border-yellow-400 overflow-hidden relative shadow-[0_0_25px_rgba(250,204,21,0.4)]">
                        <Image src={podium[1].avatar} alt="" fill className="object-cover" />
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[11px] font-black px-3 py-0.5 rounded-full shadow-lg">1ST</span>
                    </div>
                    <p className="text-white font-bold text-lg mt-1 text-center truncate w-28">{podium[1].name}</p>
                    <p className="text-[#ff59e3] text-4xl font-black">{podium[1].pts.toLocaleString()}</p>
                    <p className="text-muted-foreground text-xs font-bold tracking-widest">PTS</p>
                    <div className="w-32 h-40 bg-gradient-to-t from-transparent to-yellow-400/20 rounded-t-xl mt-3 border-t-[3px] border-yellow-400/60" />
                  </div>
                )}

                {/* 3rd Place */}
                {podium[2] && (
                  <div className="flex flex-col items-center">
                    <div className="text-amber-600 text-3xl mb-1 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]">🥉</div>
                    <div className="relative mb-2">
                      <div className="w-20 h-20 rounded-full border-2 border-[#ff59e3]/60 overflow-hidden relative shadow-[0_0_15px_rgba(255,89,227,0.3)]">
                        <Image src={podium[2].avatar} alt="" fill className="object-cover" />
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#ff59e3] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">3RD</span>
                    </div>
                    <p className="text-white font-semibold text-base mt-1 text-center truncate w-24">{podium[2].name}</p>
                    <p className="text-[#ff59e3] text-2xl font-bold">{podium[2].pts.toLocaleString()}</p>
                    <p className="text-muted-foreground text-xs font-bold tracking-widest">PTS</p>
                    <div className="w-24 h-20 bg-gradient-to-t from-transparent to-[#ff59e3]/20 rounded-t-xl mt-3 border-t-[3px] border-[#ff59e3]/50" />
                  </div>
                )}
              </div>
            </div>

            {/* Roomies Standings */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="space-y-2.5">
                {runnersUp.map((m) => (
                  <div key={m.rank} className="flex items-center gap-4 py-2.5 border-b border-border/50 last:border-0 transition-all">
                    <span className="text-muted-foreground text-base font-bold w-6">{m.rank}</span>
                    <div className="w-10 h-10 rounded-full overflow-hidden relative border border-border">
                      <Image src={m.avatar} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-base tracking-tight">{m.name}</p>
                      {m.rank > 5 && <p className="text-muted-foreground text-[11px] font-medium tracking-wide italic">{m.status}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-[#99f7ff] font-black text-xl">{m.pts.toLocaleString()}</p>
                      <p className="text-muted-foreground text-[10px] font-bold">PTS</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column – Chore Mastery */}
          <div className="col-span-2 min-h-0 overflow-hidden">
            <div className="bg-card rounded-xl border border-border p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <BarChart2 className="w-4 h-4 text-[#99f7ff]" />
                <h2 className="text-sm font-bold text-white tracking-widest uppercase">Chore Mastery</h2>
              </div>
              <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                {choreMastery.map((c, i) => (
                  <div key={i} className="bg-background/50 rounded-xl p-4 border border-border shrink-0 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <c.icon className="w-5 h-5" style={{ color: c.accent }} />
                        <span className="text-white font-black text-xs tracking-wider uppercase">{c.name}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Top Performer (King) */}
                      <div className="flex items-center justify-between bg-white/5 rounded-lg p-2 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">👑</span>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Master</p>
                            <p className="text-[#ff59e3] font-black text-sm leading-tight uppercase italic">{c.topHolder}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-white leading-none">{c.topCount}</p>
                          <p className="text-[8px] text-muted-foreground font-bold">DONE</p>
                        </div>
                      </div>

                      {/* Bottom Performer (Clown) */}
                      <div className="flex items-center justify-between bg-black/20 rounded-lg p-2 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💩</span>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Slacking</p>
                            <p className="text-muted-foreground font-bold text-sm leading-tight uppercase">{c.bottomHolder}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-muted-foreground leading-none">{c.bottomCount}</p>
                          <p className="text-[8px] text-muted-foreground font-bold">DONE</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}