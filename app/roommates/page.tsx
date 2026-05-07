"use client"
import { useState, useEffect } from "react"

import { Sidebar } from "@/components/dashboard/sidebar"
import { SyncButton } from "@/components/SyncButton"
import { Bot, Vote, ArrowRight, AlertTriangle, Trash2, Droplets, Home as HomeIcon, Utensils, Bath, TrendingUp, X, Clock, Users, Star } from "lucide-react"
import RewardPollingStation, { PollItem } from '@/src/components/RewardPollingStation';
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

const PEOPLE = ["sanjjay", "sougandh", "chris", "haady", "kichu"]

export default function RoommatesPage() {
  const { profileOverrides = {}, currentUser } = useAuthStore()
  const { completionStats, history, rewardPolls, voteOnRewardPoll, toggleChat, refreshPolls } = useChoreStore()
  const [selectedLog, setSelectedLog] = useState<{ pid: string, cid: string } | null>(null)
  const [selectedPoll, setSelectedPoll] = useState<any | null>(null)
  const [confirmVote, setConfirmVote] = useState<{ poll: any, points: number } | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)

  // Properly refresh polls on mount and when they change
  useEffect(() => {
    refreshPolls();
  }, [rewardPolls.length]);
  
  const handleVoteAction = (points: number) => {
    if (!confirmVote) return;
    voteOnRewardPoll(confirmVote.poll.id, currentUser?.profileId || "", points);
    setConfirmVote(null);
    setSelectedPoll(null);
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
  };

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
    ? history.filter(h => {
        const matchesChore = selectedLog.cid === "all" ? true : (h.choreId === selectedLog.cid || (h as any).category === selectedLog.cid);
        const isReward = selectedLog.cid === "extra" && (h.choreId === "reward" || h.choreId === "reward-failed");
        return (matchesChore || isReward) && 
               (h.loggerId === selectedLog.pid || (h.helperIds && h.helperIds.includes(selectedLog.pid)));
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];

  const selectedProfile = selectedLog ? getProfile(selectedLog.pid) : null;
  const selectedChore = selectedLog 
    ? (selectedLog.cid === "all" 
        ? { label: "ALL CHORES", icon: Clock, color: "text-[#99f7ff]", id: "all" }
        : CHORE_LIST.find(c => c.id === selectedLog.cid) || { label: "EXTRA CHORE", icon: TrendingUp, color: "text-[#99f7ff]", id: "extra" }) 
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activePage="roommates" />

      <main className="flex-1 ml-64 flex flex-col overflow-hidden p-6">
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
            <button onClick={toggleChat} className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors">
              <Bot className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1 min-h-0">
          {roomiesMembers.map((m) => {
            const hasActivePoll = rewardPolls.some(p => p.status === "pending" && (p.requestedBy === m.profileId || (p.choreHelpers || []).includes(m.profileId)));
            return (
              <div key={m.profileId} className="bg-card rounded-xl border border-border p-4 flex flex-col relative overflow-hidden">
                {hasActivePoll && (
                  <div className="absolute top-0 right-0 bg-[#f1fa8c] text-black text-[8px] font-black px-2 py-0.5 rounded-bl uppercase tracking-tighter animate-pulse z-10">
                    ACTIVE POLL
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden relative">
                      <Image src={m.avatar} alt={m.name} fill className="object-cover" style={m.imgStyle} />
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
                      <button key={c.id} onClick={() => setSelectedLog({ pid: m.profileId, cid: c.id })} className="flex flex-col items-center gap-1.5 bg-background/40 rounded-xl py-3 border border-white/5 hover:border-white/20 transition-all group">
                        <Icon className={`w-4 h-4 ${c.color}`} />
                        <span className="text-[13px] font-black text-white group-hover:text-[#99f7ff] transition-colors">#{s.rank}</span>
                      </button>
                    )
                  })}
                </div>

                <div onClick={() => setSelectedLog({ pid: m.profileId, cid: "extra" })} className="flex items-center justify-between p-2 rounded-lg bg-[#99f7ff]/5 border border-[#99f7ff]/10 mb-4 hover:bg-[#99f7ff]/10 cursor-pointer transition-all">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-[#99f7ff]" />
                    <span className="text-[9px] font-black text-[#99f7ff] uppercase tracking-wider">Extra Chores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">#{getRank("extra", m.profileId)}</span>
                  </div>
                </div>

                <button onClick={() => setSelectedLog({ pid: m.profileId, cid: "all" })} className="mt-auto w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg py-2 text-xs font-semibold tracking-wider transition-colors uppercase">
                  View Logs
                </button>
              </div>
            );
          })}
        </div>

        {selectedLog && selectedProfile && selectedChore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <div className="bg-[#131313] border border-[#99f7ff]/30 shadow-[0_0_50px_rgba(153,247,255,0.15)] rounded-2xl w-full max-w-xl flex flex-col overflow-hidden max-h-[80vh]">
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
                <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6 text-white" /></button>
              </div>

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
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2 flex-shrink-0"><Clock className="w-3 h-3" /> CHRONOLOGICAL DOSSIER</h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                    {activeLogs.length > 0 ? activeLogs.map((log, i) => {
                      const otherParticipants: string[] = [];
                      if (log.loggerId !== selectedLog.pid) otherParticipants.push(log.loggerId);
                      if (log.helperIds) log.helperIds.forEach(hid => { if (hid !== selectedLog.pid) otherParticipants.push(hid); });
                      return (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-[#99f7ff]/30 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {selectedChore.id === "all" && (
                                <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                                  {(() => {
                                    const c = [...CHORE_LIST, { id: "extra", icon: TrendingUp, color: "text-[#99f7ff]" }, { id: "reward", icon: Star, color: "text-[#50fa7b]" }, { id: "reward-failed", icon: X, color: "text-[#ff716c]" }].find(cx => cx.id === log.choreId);
                                    const Icon = c?.icon || TrendingUp; return <Icon className={`w-4 h-4 ${c?.color}`} />;
                                  })()}
                                </div>
                              )}
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-black text-white uppercase tracking-wide">{log.customName || (log.choreId === "extra" ? "Extra Chore" : (new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })))} {log.pointsEarned !== undefined && log.pointsEarned > 0 && <span className="text-[#50fa7b] ml-2">+{log.pointsEarned} PTS</span>}</span>
                                <span className="text-[10px] text-muted-foreground font-bold tracking-widest">{log.customName || log.choreId === "extra" ? new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " • " + new Date(log.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : new Date(log.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            </div>
                            {otherParticipants.length > 0 && (
                              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                <Users className="w-3 h-3 text-[#99f7ff]" /><span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">{otherParticipants.length > 1 ? "Partners:" : "Partner:"}</span>
                                <span className="text-[10px] font-black text-white uppercase flex gap-2">{otherParticipants.map((pid, idx) => (<span key={pid}>{getProfile(pid).name}{idx < otherParticipants.length - 1 ? "," : ""}</span>))}</span>
                              </div>
                            )}
                          </div>
                          {log.notes && <div className="mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/5"><p className="text-[11px] text-muted-foreground italic leading-relaxed">"{log.notes}"</p></div>}
                        </div>
                      );
                    }) : (
                      <div className="flex flex-col items-center justify-center py-10 opacity-30"><AlertTriangle className="w-8 h-8 mb-2" /><p className="text-xs font-black uppercase tracking-widest text-center">No classified logs found<br/>for this operative.</p></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Voting Modals */}
      {selectedPoll && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0e0e0e] border border-white/10 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-2xl font-black text-white">Reward Vote Details</h3>
                <p className="text-sm text-muted-foreground mt-1">Review the request and cast your vote for the reward.</p>
              </div>
              <button onClick={() => setSelectedPoll(null)} className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-white">Close</button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
              <div className="rounded-2xl bg-[#111] border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Participants</p>
                <p className="text-white font-bold">{getProfile(selectedPoll.requestedBy).name}{selectedPoll.choreHelpers && selectedPoll.choreHelpers.length > 0 && <span className="text-muted-foreground font-medium"> + {selectedPoll.choreHelpers.map((h: string) => getProfile(h).name).join(", ")}</span>}</p>
                <p className="text-muted-foreground text-sm mt-1">Requested {selectedPoll.requestedPoints} points each</p>
              </div>
              <div className="rounded-2xl bg-[#111] border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Chore</p>
                <p className="text-white font-bold">{selectedPoll.choreName}</p>
                <p className="text-muted-foreground text-sm mt-1">{selectedPoll.choreType} • {new Date(selectedPoll.choreDate).toLocaleDateString()}</p>
              </div>
            </div>
            {(() => {
              const currentVotes = Object.values(selectedPoll.votes) as number[];
              const participants = [selectedPoll.requestedBy, ...selectedPoll.choreHelpers];
              const eligibleVoters = PEOPLE.filter(p => !participants.includes(p));
              const totalVoters = eligibleVoters.length;
              const winThreshold = totalVoters >= 3 ? Math.ceil(totalVoters * 0.66) : totalVoters;
              const supportingVotes = currentVotes.filter(v => v >= selectedPoll.requestedPoints).length;
              const remainingVotes = totalVoters - currentVotes.length;
              const neededToWin = Math.max(0, winThreshold - supportingVotes);
              const canStillWin = remainingVotes >= neededToWin;
              return (
                <div className="rounded-2xl bg-[#111] border border-white/10 p-4 mb-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Poll Analytics</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-black/50 p-2.5 rounded-lg border border-white/5"><span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Win Condition</span><span className="text-xs font-black text-white">{winThreshold} / {totalVoters} votes &ge; {selectedPoll.requestedPoints}</span></div>
                    <div className="flex justify-between items-center bg-black/50 p-2.5 rounded-lg border border-white/5"><span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Supporting Votes</span><span className="text-xs font-black text-[#50fa7b]">{supportingVotes}</span></div>
                    <div className="flex justify-between items-center bg-black/50 p-2.5 rounded-lg border border-white/5"><span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Votes Needed to Win</span><span className={canStillWin && neededToWin > 0 ? 'text-xs font-black text-yellow-400' : neededToWin === 0 ? 'text-xs font-black text-green-400' : 'text-xs font-black text-red-400'}>{canStillWin && neededToWin > 0 ? neededToWin : neededToWin === 0 ? 'Won' : 'Failed'}</span></div>
                  </div>
                </div>
              );
            })()}
            <div className="rounded-2xl bg-[#111] border border-white/10 p-4 mb-6">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Current results</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedPoll.votes).length > 0 ? Object.entries(selectedPoll.votes).map(([voterId, vote]: [string, any]) => (
                  <span key={voterId} className="rounded-full bg-background border border-white/5 px-3 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5"><span className="opacity-70">{getProfile(voterId).name}:</span><span className={vote >= selectedPoll.requestedPoints ? "text-[#50fa7b]" : "text-[#ff716c]"}>{vote === 0 ? "NOTA" : vote}</span></span>
                )) : <span className="text-sm text-muted-foreground">No votes yet</span>}
              </div>
            </div>
            {selectedPoll.status === 'completed' ? (
              <div className="text-center py-6 bg-white/5 rounded-2xl border border-white/10"><p className="text-lg font-black text-white uppercase italic tracking-widest">Poll Closed</p><p className="text-sm text-muted-foreground mt-2">The results have been finalized and published.</p></div>
            ) : (selectedPoll.requestedBy.toLowerCase() === (currentUser?.profileId || "").toLowerCase() || (selectedPoll.choreHelpers || []).some((h: string) => h.toLowerCase() === (currentUser?.profileId || "").toLowerCase())) ? (
              <div className="text-center py-6 bg-[#f1fa8c]/5 rounded-2xl border border-[#f1fa8c]/20"><p className="text-sm font-bold text-[#f1fa8c] uppercase tracking-wider">You are a participant</p><p className="text-xs text-muted-foreground mt-2">Wait for your roommates to finish voting. You can track progress above.</p></div>
            ) : selectedPoll.votes[currentUser?.profileId || ""] !== undefined ? (
              <div className="text-center py-6 bg-green-500/5 rounded-2xl border border-green-500/20"><p className="text-sm font-bold text-green-500 uppercase tracking-wider">You have already voted</p><p className="text-xs text-muted-foreground mt-2">Your choice: <span className="font-bold text-white">{selectedPoll.votes[currentUser?.profileId || ""] === 0 ? "NOT DESERVED" : selectedPoll.votes[currentUser?.profileId || ""] + " PTS"}</span></p></div>
            ) : (
              <div>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-4 gap-3">
                    <button onClick={() => setConfirmVote({ poll: selectedPoll, points: 0 })} className="rounded-2xl border border-white/10 bg-[#ff716c]/10 py-3 flex flex-col items-center justify-center text-[#ff716c] hover:bg-[#ff716c]/20 transition"><X className="w-5 h-5 mb-1" /><span className="text-[10px] font-black uppercase">NO</span></button>
                    {[25, 50, 75].map((points) => (
                      <button key={points} onClick={() => setConfirmVote({ poll: selectedPoll, points })} className="rounded-2xl border border-white/10 bg-[#f1fa8c]/10 py-3 flex flex-col items-center justify-center text-sm font-black uppercase tracking-[0.1em] text-[#f1fa8c] hover:bg-[#f1fa8c]/15 transition"><span className="text-lg">{points}</span><span className="text-[8px]">PTS</span></button>
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground mt-4 text-center italic">Once you vote, your choice is finalized. The requester needs community support to win the reward.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmVote && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0e0e0e] border border-[#f1fa8c]/30 p-8 text-center shadow-[0_0_50px_rgba(241,250,140,0.1)]">
            <div className="w-20 h-20 rounded-full bg-[#f1fa8c]/10 border border-[#f1fa8c]/20 flex items-center justify-center mx-auto mb-6"><Vote className="w-10 h-10 text-[#f1fa8c]" /></div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-wider mb-2">Confirm Your Vote</h3>
            <p className="text-muted-foreground mb-8">Are you sure you want to award <span className="text-white font-bold">{confirmVote.points === 0 ? "0" : confirmVote.points} points</span> to <span className="text-white font-bold"> {getProfile(confirmVote.poll.requestedBy).name}</span> for "{confirmVote.poll.choreName}"?</p>
            <div className="flex gap-3"><button onClick={() => setConfirmVote(null)} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-white/5 transition">Cancel</button><button onClick={() => handleVoteAction(confirmVote.points)} className="flex-1 py-4 rounded-2xl bg-[#f1fa8c] text-black font-black uppercase tracking-widest text-xs hover:bg-[#f1fa8c]/90 transition shadow-[0_0_20px_rgba(241,250,140,0.2)]">Confirm Vote</button></div>
          </div>
        </div>
      )}

      {showThankYou && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[80] bg-[#50fa7b] text-black px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(80,250,123,0.3)] flex items-center gap-3 animate-bounce">
          <Star className="w-4 h-4 fill-black" />Vote Recorded Successfully
        </div>
      )}
    </div>
  )
}
