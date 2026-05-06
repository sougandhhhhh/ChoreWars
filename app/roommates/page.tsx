"use client"
import { useState } from "react"

import { Sidebar } from "@/components/dashboard/sidebar"
import { SyncButton } from "@/components/SyncButton"
import { Bot, ArrowRight, AlertTriangle, Trash2, Droplets, Home as HomeIcon, Utensils, Bath, TrendingUp, X, Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import { OPERATIVES } from "@/data/operatives"
import useAuthStore from "@/stores/useAuthStore"
import { useChoreStore } from "@/stores/useChoreStore"

const CHORE_LIST = [
  { id: "waste",    label: "Waste", icon: Trash2,   color: "text-[#ff59e3]" },
  { id: "water",    label: "Water Can", icon: Droplets, color: "text-[#99f7ff]" },
  { id: "house",    label: "House Cleaning", icon: HomeIcon, color: "text-[#ff59e3]" },
  { id: "kitchen",  label: "Kitchen Cleaning", icon: Utensils, color: "text-[#99f7ff]" },
  { id: "bathroom", label: "Bathroom", icon: Bath,     color: "text-[#ff59e3]" },
]

const allRoommatesData = [
  { profileId: "sanjjay" },
  { profileId: "sougandh" },
  { profileId: "chris" },
  { profileId: "haady" },
  { profileId: "kichu" },
]

const rankBorder = (rank: number) =>
  rank === 1 ? "border-[#ff59e3]" : rank === 2 ? "border-[#99f7ff]" : rank === 3 ? "border-[#ff59e3]" : "border-white/20"

const rankBadge = (rank: number) =>
  rank === 1
    ? "bg-[#99f7ff] text-black"
    : rank === 2
    ? "bg-[#99f7ff] text-black"
    : rank === 3
    ? "bg-[#ff59e3] text-white"
    : "bg-white/20 text-white"

const PEOPLE = ["sanjjay", "sougandh", "chris", "haady", "kichu"]

export default function RoommatesPage() {
  const { profileOverrides = {}, currentUser } = useAuthStore()
  const { completionStats, history } = useChoreStore()
  const [selectedLog, setSelectedLog] = useState<{ pid: string, cid: string } | null>(null)

  const getProfile = (id: string) => {
    const base = OPERATIVES.find(op => op.profileId === id) || OPERATIVES[0];
    const safeOverrides = profileOverrides || {};
    const overrides = safeOverrides[id] || {};
    return {
      ...base,
      profileId: id,
      name: overrides.name || base.name,
      codename: overrides.codename || base.codename,
    };
  };

  const getRank = (cid: string, pid: string) => {
    const scores = PEOPLE.map(id => {
      const count = history.filter(h => {
        const isOwner = h.loggerId === id || h.helperIds?.includes(id);
        if (cid === "extra") {
          return isOwner && h.choreId === "reward" && (h as any).category === "extra";
        }
        return isOwner && h.choreId === cid;
      }).length;
      return { id, count };
    }).sort((a, b) => b.count - a.count);
    const rankIndex = scores.findIndex(s => s.id === pid);
    return rankIndex + 1;
  };

  const roomiesMembers = allRoommatesData
    .filter(m => m.profileId !== currentUser?.profileId)
    .map(m => {
      const profile = getProfile(m.profileId);
      const stats: any = {};
      let total = 0;
      CHORE_LIST.forEach(c => {
        const count = history.filter(h => {
          const isOwner = h.loggerId === m.profileId || h.helperIds?.includes(m.profileId);
          if (c.id === "extra") {
            return isOwner && h.choreId === "reward" && (h as any).category === "extra";
          }
          return isOwner && h.choreId === c.id;
        }).length;
        stats[c.id] = { count, rank: getRank(c.id, m.profileId) };
        total += count;
      });
      return {
        ...m,
        name: profile.name,
        codename: profile.codename,
        avatar: profile.animeImage || profile.image,
        imgStyle: profile.imgStyle,
        stats,
        total
      };
    })
    .sort((a, b) => b.total - a.total);

  const activeLogs = selectedLog 
    ? history.filter(h => 
        (selectedLog.cid === "all" ? true : (h.choreId === selectedLog.cid || (h as any).category === selectedLog.cid)) && 
        (h.loggerId === selectedLog.pid || (h.helperIds && h.helperIds.includes(selectedLog.pid)))
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];
  const selectedProfile = selectedLog ? getProfile(selectedLog.pid) : null;
  const selectedChore = selectedLog 
    ? (selectedLog.cid === "all" 
        ? { label: "ALL CHORE", icon: Clock, color: "text-[#99f7ff]", id: "all" }
        : CHORE_LIST.find(c => c.id === selectedLog.cid) || { label: "EXTRA CHORE", icon: TrendingUp, color: "text-[#99f7ff]", id: "extra" }) 
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activePage="roommates" />

      <main className="flex-1 ml-64 flex flex-col overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 shrink-0">
          <div>
            <h1 className="text-5xl font-black text-[#ff59e3] italic tracking-tight">THE ROOMIES</h1>
            <p className="text-muted-foreground mt-1.5 max-w-lg text-sm">
              Current standings and active profiles for the household.<br />
              Dominance is temporary, chores are forever.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SyncButton />
            <button className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors">
              <Bot className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1 min-h-0">
          {/* Roomies Member Cards */}
          {roomiesMembers.map((m) => (
            <div key={m.profileId} className="bg-card rounded-xl border border-border p-4 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden relative">
                    <Image
                      src={m.avatar}
                      alt={m.name}
                      fill
                      className="object-cover"
                      style={m.imgStyle}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{m.name}</h3>
                  <p className="text-[10px] text-muted-foreground tracking-wider">{m.codename}</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {CHORE_LIST.map(c => {
                  const Icon = c.icon;
                  const s = m.stats[c.id];
                  return (
                    <button 
                      key={c.id} 
                      onClick={() => setSelectedLog({ pid: m.profileId, cid: c.id })}
                      className="flex flex-col items-center gap-1.5 bg-background/40 rounded-xl py-3 border border-white/5 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon className={`w-4 h-4 ${c.color}`} />
                      </div>
                      <span className="text-[13px] font-black text-white group-hover:text-[#99f7ff] transition-colors">#{s.rank}</span>
                    </button>
                  )
                })}
              </div>

              <div 
                onClick={() => setSelectedLog({ pid: m.profileId, cid: "extra" })}
                className="flex items-center justify-between p-2 rounded-lg bg-[#99f7ff]/5 border border-[#99f7ff]/10 mb-4 hover:bg-[#99f7ff]/10 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-[#99f7ff]" />
                  <span className="text-[9px] font-black text-[#99f7ff] uppercase tracking-wider">Extra Chores</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">#{getRank("extra", m.profileId)}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedLog({ pid: m.profileId, cid: "all" })}
                className="mt-auto w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg py-2 text-xs font-semibold tracking-wider transition-colors uppercase"
              >
                View Logs
              </button>
            </div>
          ))}
        </div>

        {/* Log Modal */}
        {selectedLog && selectedProfile && selectedChore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <div className="bg-[#131313] border border-[#99f7ff]/30 shadow-[0_0_50px_rgba(153,247,255,0.15)] rounded-2xl w-full max-w-xl flex flex-col overflow-hidden max-h-[80vh]">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-[#99f7ff] overflow-hidden relative shadow-[0_0_15px_rgba(153,247,255,0.2)]">
                    <Image src={selectedProfile.animeImage || selectedProfile.image} alt="" fill className="object-cover" style={selectedProfile.imgStyle} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                    <selectedChore.icon className={`w-4 h-4 ${selectedChore.color}`} />
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                      {selectedChore.id === "all" ? "ALL CHORES" : (selectedChore.id === "extra" ? "EXTRA CHORES" : selectedChore.label)} LOGS
                    </h2>
                    </div>
                    <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase mt-0.5">{selectedProfile.name} • CODENAME: {selectedProfile.codename}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-6 flex flex-col min-h-0">
                <div className="flex gap-4 mb-8">
                  <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Total Completions</span>
                    <span className="text-3xl font-black text-[#99f7ff]">
                      {selectedChore.id === "all" 
                        ? Object.values(completionStats).reduce((sum, choreData) => sum + (choreData[selectedLog.pid]?.count || 0), 0)
                        : (completionStats[selectedChore.id]?.[selectedLog.pid]?.count || 0)}
                    </span>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Current Rank</span>
                    <span className="text-3xl font-black text-[#ff59e3]">#{getRank(selectedChore.id, selectedLog.pid)}</span>
                  </div>
                </div>

                <div className="flex flex-col min-h-0 flex-1">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2 flex-shrink-0">
                    <Clock className="w-3 h-3" /> CHRONOLOGICAL DOSSIER
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                  
                  {activeLogs.length > 0 || (completionStats[selectedChore.id]?.[selectedLog.pid]?.count || 0) > 0 ? (
                    <>
                      {activeLogs.map((log, i) => {
                        // Gather all participants EXCEPT the one whose dossier we're viewing
                        const otherParticipants: string[] = [];
                        if (log.loggerId !== selectedLog.pid) {
                          otherParticipants.push(log.loggerId);
                        }
                        if (log.helperIds) {
                          log.helperIds.forEach(hid => {
                            if (hid !== selectedLog.pid) {
                              otherParticipants.push(hid);
                            }
                          });
                        }

                        return (
                          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-[#99f7ff]/30 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {selectedChore.id === "all" && (
                                  <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                                    {(() => {
                                      const c = [...CHORE_LIST, 
                                        { id: "extra", icon: TrendingUp, color: "text-[#99f7ff]" },
                                        { id: "reward", icon: Star, color: "text-[#50fa7b]" },
                                        { id: "reward-failed", icon: X, color: "text-[#ff716c]" }
                                      ].find(cx => cx.id === log.choreId);
                                      const Icon = c?.icon || TrendingUp;
                                      return <Icon className={`w-4 h-4 ${c?.color}`} />;
                                    })()}
                                  </div>
                                )}
                                <div className="flex flex-col gap-1">
                                   <span className="text-xs font-black text-white uppercase tracking-wide">
                                    {log.customName || (log.choreId === "extra" ? "Extra Chore" : (new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })))}
                                    {log.pointsEarned !== undefined && log.pointsEarned > 0 && (
                                      <span className="text-[#50fa7b] ml-2">+{log.pointsEarned} PTS</span>
                                    )}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-bold tracking-widest">
                                    {log.customName || log.choreId === "extra" ? 
                                      new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " • " + new Date(log.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) :
                                      new Date(log.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                                    }
                                  </span>
                                </div>
                              </div>
                            
                              {otherParticipants.length > 0 && (
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                  <Users className="w-3 h-3 text-[#99f7ff]" />
                                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">{otherParticipants.length > 1 ? "Partners:" : "Partner:"}</span>
                                  <span className="text-[10px] font-black text-white uppercase flex gap-2">
                                    {otherParticipants.map((pid, idx) => (
                                      <span key={pid}>
                                        {getProfile(pid).name}{idx < otherParticipants.length - 1 ? "," : ""}
                                      </span>
                                    ))}
                                  </span>
                                </div>
                              )}
                            </div>

                            {log.notes && (
                              <div className="mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                                  "{log.notes}"
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {(selectedChore.id !== "all" && (completionStats[selectedChore.id]?.[selectedLog.pid]?.count || 0) > activeLogs.length) && (
                        <div className="space-y-3">
                          {completionStats[selectedChore.id]?.[selectedLog.pid]?.lastDone && (
                            <div className="bg-[#99f7ff]/10 border border-[#99f7ff]/30 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(153,247,255,0.05)]">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-black text-[#99f7ff] uppercase tracking-wide">Last Known Activity</span>
                                <span className="text-[10px] text-white font-black tracking-widest uppercase">
                                  {new Date(completionStats[selectedChore.id]?.[selectedLog.pid]?.lastDone!).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} • {new Date(completionStats[selectedChore.id]?.[selectedLog.pid]?.lastDone!).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <div className="bg-[#99f7ff]/20 px-2 py-1 rounded text-[8px] font-black text-[#99f7ff] uppercase">Verified</div>
                            </div>
                          )}
                          
                          {(completionStats[selectedChore.id]?.[selectedLog.pid]?.count || 0) - activeLogs.length > (completionStats[selectedChore.id]?.[selectedLog.pid]?.lastDone ? 1 : 0) && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between opacity-60">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-black text-white/60 uppercase tracking-wide">Prior History</span>
                                <span className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase italic">Detailed logs unavailable for these records</span>
                              </div>
                              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                                <Clock className="w-3 h-3 text-white/40" />
                                <span className="text-[10px] font-black text-white/60">{(completionStats[selectedChore.id]?.[selectedLog.pid]?.count || 0) - activeLogs.length - (completionStats[selectedChore.id]?.[selectedLog.pid]?.lastDone ? 1 : 0)} RECORDS</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-30">
                      <AlertTriangle className="w-8 h-8 mb-2" />
                      <p className="text-xs font-black uppercase tracking-widest text-center">No classified logs found<br/>for this operative.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  )
}
