"use client"
// Trigger re-compile

import RewardPollingStation, { PollItem } from '../src/components/RewardPollingStation';
import { Bot, AlertTriangle, Clock, TrendingUp, Vote, X, Star } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { OPERATIVES } from "@/data/operatives"
import useAuthStore from "@/stores/useAuthStore"
import { useState, useEffect } from "react"
import { useChoreStore } from "@/stores/useChoreStore"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { SyncButton } from "@/components/SyncButton"

const CHORE_TYPES = [
  { id: "waste", label: "Waste", icon: "🗑️", color: "text-[#ff59e3]" },
  { id: "water", label: "Water Can", icon: "💧", color: "text-[#99f7ff]" },
  { id: "kitchen", label: "Kitchen Cleaning", icon: "🍳", color: "text-[#ffb86c]" },
  { id: "bathroom", label: "Bathroom", icon: "🚿", color: "text-[#8be9fd]" },
  { id: "house", label: "House Cleaning", icon: "🏠", color: "text-[#50fa7b]" },
  { id: "extra", label: "Extra Chore", icon: "⭐", color: "text-[#f1fa8c]" },
]

interface Warning {
  id: string
  targetPid: string
  choreId: string
  issuedBy: string
  issuedAt: string
  completed: boolean
  penaltyApplied: boolean
}

interface RewardPoll {
  id: string
  choreId: string
  choreName: string
  choreDate: string
  choreType: string
  choreHelpers: string[]
  requestedBy: string
  requestedPoints: number
  votes: Record<string, number>
  status: "pending" | "completed"
}

export default function Home() {
  const { currentUser: user, profileOverrides = {} } = useAuthStore()
  const { completionStats, history, warnings, rewardPolls, voteOnRewardPoll, choreQueues, issueWarning, completeWarning, logChore, toggleChat } = useChoreStore()
  const pid = user?.profileId || ""

  // Get user profile
  const getProfile = (id: string) => {
    const base = OPERATIVES.find(op => op.profileId === id) || OPERATIVES[0];
    const overrides = profileOverrides[id] || {};
    return {
      ...base,
      name: overrides.name || base.name,
      codename: overrides.codename || base.codename,
    };
  };

  const router = useRouter()
  const [recentChores, setRecentChores] = useState<any[]>([])
  const [selectedPoll, setSelectedPoll] = useState<RewardPoll | null>(null)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [confirmVote, setConfirmVote] = useState<{ poll: RewardPoll, points: number } | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)

  const [showWarnDialog, setShowWarnDialog] = useState(false)
  const [warnTarget, setWarnTarget] = useState<{personId: string, choreId: string} | null>(null)

  const activeWarnings = warnings.filter(w => w.targetPid === pid && !w.completed && !w.penaltyApplied)

  useEffect(() => {
    if (activeWarnings.length > 0) {
      // Check if we've shown it this session
      if (!sessionStorage.getItem('hasSeenWarningModal')) {
        setShowWarningModal(true)
        sessionStorage.setItem('hasSeenWarningModal', 'true')
      }
    }
  }, [activeWarnings.length])
  
  // Proactively complete polls that meet the threshold
  const { rewardPolls: _allPolls, refreshPolls } = useChoreStore()
  useEffect(() => {
    refreshPolls();
  }, [refreshPolls]);
  const pendingPolls = rewardPolls.filter(poll => poll.status === "pending")
  
  // Map RewardPoll to PollItem
  const pollItems: PollItem[] = pendingPolls.map(poll => {
    const isParticipant = poll.requestedBy.toLowerCase() === pid.toLowerCase() || 
                          (poll.choreHelpers || []).some(h => h.toLowerCase() === pid.toLowerCase());
    return {
      id: poll.id,
      title: poll.choreName,
      short: `${poll.requestedPoints} pts`,
      details: `Requested by ${getProfile(poll.requestedBy).name}. Points: ${poll.requestedPoints}. Status: ${poll.status}`,
      status: poll.status,
      hasVoted: poll.votes[pid] !== undefined || 
                poll.requestedBy.toLowerCase() === pid.toLowerCase() || 
                (poll.choreHelpers || []).some(h => h.toLowerCase() === pid.toLowerCase()),
      isParticipant
    };
  });

  const maxVotes = Math.max(OPERATIVES.length - 1, 1)



  // Get recent chores from roommates
  useEffect(() => {
    const recent = history
      .filter(log => (log.loggerId !== pid || log.choreId === 'reward' || log.choreId === 'reward-failed') && new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
    
    setRecentChores(recent);
  }, [history, pid]);



  const handleVote = (pollId: string, vote: number) => {
    voteOnRewardPoll(pollId, pid, vote);
  };

  const handleConfirmVote = () => {
    if (confirmVote) {
      voteOnRewardPoll(confirmVote.poll.id, pid, confirmVote.points);
      setConfirmVote(null);
      setSelectedPoll(null);
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);
    }
  };

  const getChoreIcon = (choreId: string) => {
    if (choreId === 'reward') return "🏆";
    if (choreId === 'reward-failed') return "❌";
    const chore = CHORE_TYPES.find(c => c.id === choreId);
    return chore?.icon || "📝";
  };

  const getChoreLabel = (choreId: string) => {
    if (choreId === 'reward') return 'Reward Points';
    if (choreId === 'reward-failed') return 'Reward Request';
    const chore = CHORE_TYPES.find(c => c.id === choreId);
    return chore?.label || "Chore";
  };

  const upcomingChores = CHORE_TYPES.filter(c => c.id !== "extra").reduce((acc, chore) => {
    const queue = (choreQueues as any)?.[chore.id];
    if (!queue || queue.length === 0) return acc;
    const nextPeople: string[] = chore.id === "waste" ? queue[0] : [queue[0]];
    const items = nextPeople.map(personId => {
      const profile = getProfile(personId);
      const isOwnChore = personId === pid;
      const hasUserWarned = warnings.some(w => w.issuedBy === pid && w.targetPid === personId && w.choreId === chore.id && !w.completed);
      return (
        <div key={chore.id + '-' + personId} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-base">{chore.icon}</span>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{isOwnChore ? "My Chore" : profile.name}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">{chore.label}</p>
            </div>
          </div>
          {isOwnChore ? (
            <button
              onClick={() => router.push('/chores?claim=' + chore.id)}
              className="shrink-0 px-2.5 py-1 rounded bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-wider border border-green-500/30 hover:bg-green-500/20 transition-colors"
            >
              mark as done
            </button>
          ) : hasUserWarned ? (
            <span className="shrink-0 px-2.5 py-1 rounded bg-gray-500/10 text-gray-500 text-[9px] font-black uppercase tracking-wider border border-gray-500/30">
              warning done
            </span>
          ) : (
            <button
              onClick={() => {
                setWarnTarget({ personId, choreId: chore.id });
                setShowWarnDialog(true);
              }}
              className="shrink-0 px-2.5 py-1 rounded bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-wider border border-red-500/30 hover:bg-red-500/20 transition-colors"
            >
              Warn
            </button>
          )}
        </div>
      );
    }).filter(item => item !== null);
    return acc.concat(items);
  }, [] as any[]).sort((a, b) => {
    const aOwn = a.key?.toString().endsWith('-' + pid) ? 1 : 0;
    const bOwn = b.key?.toString().endsWith('-' + pid) ? 1 : 0;
    return bOwn - aOwn;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activePage="home" />

<main className="flex-1 ml-64 flex flex-col overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 shrink-0">
          <div className="flex-1">
            <h1 className="text-5xl font-black text-[#ff59e3] italic tracking-tight uppercase">
              Welcome, {getProfile(pid).name}!
            </h1>
          </div>
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

        <div className="flex flex-col gap-5 flex-1 min-h-0">
          <div className="grid grid-cols-2 gap-5 flex-1 min-h-0">
            {/* Left Column */}
            <div className="flex flex-col gap-5 min-h-0">
              {/* Warning Box */}
              <div className={activeWarnings.length > 0 
                ? "rounded-xl p-5 flex flex-col overflow-hidden transition-all duration-1000 h-[210px] bg-red-500/10 border-2 border-red-500 shadow-lg animate-pulse" 
                : "rounded-xl p-5 flex flex-col overflow-hidden transition-all duration-1000 h-[210px] bg-card border border-pink-500/25"
              }>
                <div className="flex items-center gap-2 mb-4 shrink-0">
                  <AlertTriangle className={activeWarnings.length > 0 ? "w-6 h-6 text-red-500" : "w-6 h-6 text-pink-500"} />
                  <h2 className={activeWarnings.length > 0 ? "text-2xl font-black uppercase tracking-tight text-red-500" : "text-2xl font-black uppercase tracking-tight text-white"}>
                    Warnings
                  </h2>
                  {activeWarnings.length > 0 && (
                    <span className="bg-[#ff0000] text-white text-xs font-bold px-2.5 py-1 rounded-full animate-bounce">
                      {activeWarnings.length} ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                  {activeWarnings.length > 0 ? (
                    activeWarnings.map((warning, index) => {
                      const chore = getChoreLabel(warning.choreId);
                      const timeLeft = 24 - Math.floor((Date.now() - new Date(warning.issuedAt).getTime()) / (1000 * 60 * 60));
                      return (
                        <div key={index} className="p-2.5 bg-red-500/10 rounded-lg border border-red-500/20 flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{chore}</p>
                            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{timeLeft}h left</p>
                          </div>
                          <button 
                            onClick={() => router.push('/chores?claim=' + warning.choreId)} 
                            className="shrink-0 px-3 py-1.5 rounded bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-wider border border-green-500/30 hover:bg-green-500/20 transition-colors"
                          >
                            mark as done
                          </button>
                        </div>
                      );
                    })
                   ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-30">
                      <AlertTriangle className="w-10 h-10 mb-3" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">No Active Warnings For You</p>
                    </div>
                   )}
                </div>
              </div>

              {/* Quick Warn Box */}
              <div className="rounded-xl p-5 flex flex-col overflow-hidden transition-all duration-1000 flex-1 bg-card border border-white/10">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 font-bold shrink-0">Upcoming Chores (Quick Warn)</p>
                <div className="flex-1 overflow-hidden space-y-2 pr-1">
                  {upcomingChores}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 min-h-0">
              {/* Recent Activity - short */}
               <div className="bg-card rounded-xl border border-[#99f7ff]/25 p-5 flex flex-col flex-1 h-[460px] overflow-hidden">
                <div className="flex items-center gap-2 mb-4 shrink-0">
                  <Clock className="w-5 h-5 text-[#99f7ff]" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">Recent Activity</h2>
                </div>
                <div className="space-y-3 flex-1 overflow-hidden">
                  {recentChores.length > 0 ? (
                    recentChores.map((log, index) => {
                      const logger = getProfile(log.loggerId);
                      const chore = getChoreLabel(log.choreId);
                      return (
                        <div key={index} className="flex items-center gap-4 px-4 py-3 bg-background/50 rounded-lg border border-white/5 h-[59px]">
                          <div className="w-10 h-10 rounded-full bg-[#99f7ff]/10 flex items-center justify-center shrink-0">
                            <span className="text-xl">{getChoreIcon(log.choreId)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-[13px] truncate leading-tight">
                                {log.choreId === 'reward' ? (
                                  <span className="text-[#50fa7b]">
                                    Result: {[logger.name, ...(log.helperIds || []).map((hid: string) => getProfile(hid).name)].join(", ")} WON reward poll
                                  </span>
                                ) : log.choreId === 'reward-failed' ? (
                                  <span className="text-[#ff716c]">
                                    Result: {[logger.name, ...(log.helperIds || []).map((hid: string) => getProfile(hid).name)].join(", ")} LOST reward poll
                                  </span>
                                ) : (
                                  <>
                                    <span className="font-black">{logger.name}</span> completed {chore}
                                  </>
                                )}
                                {log?.pointsEarned !== undefined && log.pointsEarned > 0 && (
                                  <span className="text-green-400 font-bold ml-1"> (+{log.pointsEarned} pts)</span>
                                )}
                              </p>
                            <p className="text-muted-foreground text-[11px] font-medium truncate uppercase tracking-widest mt-0.5">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs uppercase tracking-widest font-black">No recent activity from roommates</p>
                    </div>
                  )}
                </div>
              </div>

               <div className="bg-card rounded-xl border border-[#f1fa8c]/25 p-5 flex flex-col h-[165px] overflow-hidden">
                <div className="flex items-center gap-2 mb-4 shrink-0">
                  <Vote className="w-5 h-5 text-[#f1fa8c]" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">Reward Polling Station</h2>
                </div>
                <div className="flex-1 overflow-hidden">
                  {pollItems.length > 0 ? (
                    <RewardPollingStation 
                      items={pollItems} 
                      onVote={(item) => {
                        const originalPoll = rewardPolls.find(p => p.id === item.id);
                        if (originalPoll) setSelectedPoll(originalPoll);
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-30">
                      <Vote className="w-10 h-10 mb-3" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">No Active Polling Right Now</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>



      {selectedPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
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
                <p className="text-white font-bold">
                  {getProfile(selectedPoll.requestedBy).name}
                  {selectedPoll.choreHelpers && selectedPoll.choreHelpers.length > 0 && (
                    <span className="text-muted-foreground font-medium"> + {selectedPoll.choreHelpers.map(h => getProfile(h).name).join(", ")}</span>
                  )}
                </p>
                <p className="text-muted-foreground text-sm mt-1">Requested {selectedPoll.requestedPoints} points each</p>
              </div>
              <div className="rounded-2xl bg-[#111] border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Chore</p>
                <p className="text-white font-bold">{selectedPoll.choreName}</p>
                <p className="text-muted-foreground text-sm mt-1">{selectedPoll.choreType} • {new Date(selectedPoll.choreDate).toLocaleDateString()}</p>
              </div>
            </div>

            {(() => {
              const currentVotes = Object.values(selectedPoll.votes);
              const participants = [selectedPoll.requestedBy, ...selectedPoll.choreHelpers];
              const eligibleVoters = OPERATIVES.filter(op => !participants.includes(op.profileId));
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
                    <div className="flex justify-between items-center bg-black/50 p-2.5 rounded-lg border border-white/5">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Win Condition</span>
                      <span className="text-xs font-black text-white">{winThreshold} / {totalVoters} votes &ge; {selectedPoll.requestedPoints}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/50 p-2.5 rounded-lg border border-white/5">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Supporting Votes</span>
                      <span className="text-xs font-black text-[#50fa7b]">{supportingVotes}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/50 p-2.5 rounded-lg border border-white/5">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Votes Needed to Win</span>
                      <span className={canStillWin && neededToWin > 0 ? 'text-xs font-black text-yellow-400' : neededToWin === 0 ? 'text-xs font-black text-green-400' : 'text-xs font-black text-red-400'}>
                        {canStillWin && neededToWin > 0 ? neededToWin : neededToWin === 0 ? 'Won' : 'Failed'}
                      </span>
                    </div>
                  </div>
                  {!canStillWin && (
                    <p className="text-[10px] text-[#ff716c] font-bold mt-3 text-center uppercase tracking-widest">Mathematically impossible to win.</p>
                  )}
                  {canStillWin && neededToWin === 0 && (
                    <p className="text-[10px] text-[#50fa7b] font-bold mt-3 text-center uppercase tracking-widest">Request has enough votes to win!</p>
                  )}
                </div>
              );
            })()}

            <div className="rounded-2xl bg-[#111] border border-white/10 p-4 mb-6">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Current results</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedPoll.votes).length > 0 ? (
                  Object.entries(selectedPoll.votes).map(([voterId, vote]) => (
                    <span key={voterId} className="rounded-full bg-background border border-white/5 px-3 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="opacity-70">{getProfile(voterId).name}:</span>
                      <span className={vote >= selectedPoll.requestedPoints ? "text-[#50fa7b]" : "text-[#ff716c]"}>{vote === 0 ? "NOTA" : vote}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No votes yet</span>
                )}
              </div>
            </div>

            {selectedPoll.status === 'completed' ? (
              <div className="text-center py-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-lg font-black text-white uppercase italic tracking-widest">Poll Closed</p>
                <p className="text-sm text-muted-foreground mt-2">The results have been finalized and published.</p>
              </div>
            ) : (selectedPoll.requestedBy.toLowerCase() === pid.toLowerCase() || (selectedPoll.choreHelpers || []).some(h => h.toLowerCase() === pid.toLowerCase())) ? (
              <div className="text-center py-6 bg-[#f1fa8c]/5 rounded-2xl border border-[#f1fa8c]/20">
                <p className="text-sm font-bold text-[#f1fa8c] uppercase tracking-wider">You are a participant</p>
                <p className="text-xs text-muted-foreground mt-2">Wait for your roommates to finish voting. You can track progress above.</p>
              </div>
            ) : selectedPoll.votes[pid] !== undefined ? (
              <div className="text-center py-6 bg-green-500/5 rounded-2xl border border-green-500/20">
                <p className="text-sm font-bold text-green-500 uppercase tracking-wider">You have already voted</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Your choice: <span className="font-bold text-white">{selectedPoll.votes[pid] === 0 ? "NOT DESERVED" : selectedPoll.votes[pid] + " PTS"}</span>
                </p>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      onClick={() => setConfirmVote({ poll: selectedPoll, points: 0 })}
                      className="rounded-2xl border border-white/10 bg-[#ff716c]/10 py-3 flex flex-col items-center justify-center text-[#ff716c] hover:bg-[#ff716c]/20 transition"
                    >
                      <X className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-black uppercase">NO</span>
                    </button>
                    {[25, 50, 75].map((points) => (
                      <button
                        key={points}
                        onClick={() => setConfirmVote({ poll: selectedPoll, points })}
                        className="rounded-2xl border border-white/10 bg-[#f1fa8c]/10 py-3 flex flex-col items-center justify-center text-sm font-black uppercase tracking-[0.1em] text-[#f1fa8c] hover:bg-[#f1fa8c]/15 transition"
                      >
                        <span className="text-lg">{points}</span>
                        <span className="text-[8px]">PTS</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setConfirmVote({ poll: selectedPoll, points: selectedPoll.requestedPoints })}
                    className="rounded-2xl border border-green-500/30 bg-green-500/10 py-4 text-sm font-black uppercase tracking-[0.2em] text-green-500 hover:bg-green-500/20 transition shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                  >
                    YES, FULL {selectedPoll.requestedPoints} POINTS
                  </button>
                </div>

                <div className="text-[10px] text-muted-foreground mt-4 text-center italic">
                  Once you vote, your choice is finalized. The requester needs community support to win the reward.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Vote Modal */}
    {confirmVote && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="bg-[#0e0e0e] border border-[#f1fa8c]/30 rounded-xl p-8 shadow-[0_0_40px_rgba(241,250,140,0.2)] max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Confirm Your Vote</h3>
          <p className="text-muted-foreground text-center mb-6">
            Are you sure you want to vote <strong className="text-[#f1fa8c]">{confirmVote.points} points</strong> for this reward request?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmVote(null)}
              className="flex-1 py-3 rounded-lg border border-white/10 text-white font-bold tracking-wider hover:bg-white/5 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirmVote}
              className="flex-1 py-3 rounded-lg bg-[#f1fa8c]/20 text-[#f1fa8c] border border-[#f1fa8c]/50 font-bold tracking-wider hover:bg-[#f1fa8c]/30 transition-colors shadow-[0_0_15px_rgba(241,250,140,0.3)]"
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Thank You Modal */}
    {showThankYou && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[#f1fa8c]/10 border border-[#f1fa8c]/50 rounded-xl p-8 shadow-[0_0_50px_rgba(241,250,140,0.4)] max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#f1fa8c]/20 flex items-center justify-center mb-4">
              <Vote className="w-8 h-8 text-[#f1fa8c]" />
            </div>
            <h3 className="text-2xl font-black text-white text-center tracking-wide mb-2">Thank You!</h3>
            <p className="text-[#f1fa8c] font-medium text-center">Your vote has been recorded.</p>
          </div>
        </div>
      </div>
    )}

    {/* Warn Confirmation Dialog */}
    <AlertDialog open={showWarnDialog} onOpenChange={setShowWarnDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Issue Warning</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to issue a warning for this chore?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (warnTarget) {
                issueWarning(warnTarget.personId, warnTarget.choreId, pid);
                setShowWarnDialog(false);
                setWarnTarget(null);
              }
            }}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  </div>
  )
}
