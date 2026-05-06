import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { uploadLocalDataToSupabase } from '../lib/sync'

const PEOPLE = ["sanjjay", "sougandh", "chris", "haady", "kichu"]

interface ChoreStat {
  count: number;
  points?: number;
  lastDone: string | null;
}

const getInitialStats = () => {
  const stats: Record<string, Record<string, ChoreStat>> = {};
  ["waste", "water", "house", "kitchen", "bathroom"].forEach(cid => {
    stats[cid] = {};
    PEOPLE.forEach(pid => {
      stats[cid][pid] = { count: 0, lastDone: null };
    });
  });
  return stats;
};

const getInitialWarnings = (): Warning[] => {
  return [];
};

const getInitialRewardPolls = (): RewardPoll[] => {
  return [];
};

const getComparableTime = (val: string | number | null) => {
  if (val === null) return -Infinity;
  if (typeof val === 'string') return new Date(val).getTime();
  // Simulated time (numbers) rank after all real timestamps
  return 1e15 + (val as number);
};

const sortMembers = (members: string[], stats: Record<string, ChoreStat>) => {
  return [...members].sort((a, b) => {
    const sA = stats[a] || { count: 0, lastDone: null };
    const sB = stats[b] || { count: 0, lastDone: null };

    if (sA.count !== sB.count) return sA.count - sB.count;

    const vA = getComparableTime(sA.lastDone);
    const vB = getComparableTime(sB.lastDone);
    return vA - vB;
  });
};

const projectQueue = (cid: string, stats: Record<string, Record<string, ChoreStat>>, length = 15) => {
  const sim = JSON.parse(JSON.stringify(stats[cid] || {}));
  PEOPLE.forEach(p => { if (!sim[p]) sim[p] = { count: 0, lastDone: null }; });

  const result: string[] = [];
  let simTime = 1;

  for (let i = 0; i < length; i++) {
    const sorted = sortMembers(PEOPLE, sim);
    const next = sorted[0];
    result.push(next);
    sim[next].count += 1;
    sim[next].lastDone = simTime++;
  }
  return result;
};

const projectWaste = (stats: Record<string, Record<string, ChoreStat>>, length = 8) => {
  const sim = JSON.parse(JSON.stringify(stats["waste"] || {}));
  PEOPLE.forEach(p => { if (!sim[p]) sim[p] = { count: 0, lastDone: null }; });

  const result: string[][] = [];
  let simTime = 1;

  for (let i = 0; i < length; i++) {
    const sorted = sortMembers(PEOPLE, sim);
    const pair = [sorted[0], sorted[1]];
    result.push(pair);
    pair.forEach(p => {
      sim[p].count += 1;
      sim[p].lastDone = simTime++;
    });
  }
  return result;
};

interface ChoreLog {
  timestamp: string;
  choreId: string;
  loggerId: string;
  helperIds?: string[];
  notes?: string;
  customName?: string;
  category?: string;
  pointsEarned?: number;
}

interface Warning {
  id: string;
  targetPid: string;
  choreId: string;
  issuedBy: string;
  issuedAt: string;
  completed: boolean;
  penaltyApplied: boolean;
}

interface RewardPoll {
  id: string;
  choreId: string;
  choreName: string;
  choreDate: string;
  choreType: string;
  choreHelpers: string[];
  requestedBy: string;
  requestedPoints: number;
  votes: Record<string, number>;
  status: "pending" | "completed";
}

interface ChoreStore {
  completionStats: Record<string, Record<string, ChoreStat>>;
  history: ChoreLog[];
  warnings: Warning[];
  rewardPolls: RewardPoll[];
  choreQueues: {
    waste: string[][];
    water: string[];
    house: string[];
    kitchen: string[];
    bathroom: string[];
  };
  logChore: (choreId: string, loggerId: string, helperIds?: string[], notes?: string, customName?: string, pointsEarned?: number) => void;
  issueWarning: (targetPid: string, choreId: string, issuedBy: string) => void;
  completeWarning: (warningId: string) => void;
  applyPenalty: (warningId: string) => void;
  createRewardPoll: (choreId: string, choreName: string, choreDate: string, choreType: string, choreHelpers: string[], requestedBy: string, requestedPoints: number) => void;
  completeRewardPoll: (pollId: string) => void;
  voteOnRewardPoll: (pollId: string, voterPid: string, vote: number) => void;
  refreshPolls: () => void;
  resetQueues: () => void;
  isSyncing: boolean;
  hasSynced: boolean;
  syncWithSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
}

export const useChoreStore = create<ChoreStore>()(
  persist(
    (set, get) => ({
      completionStats: getInitialStats(),
      history: [],
      warnings: [],
      rewardPolls: [],
      choreQueues: {
        waste:    projectWaste(getInitialStats()),
        water:    projectQueue("water", getInitialStats()),
        house:    projectQueue("house", getInitialStats()),
        kitchen:  projectQueue("kitchen", getInitialStats()),
        bathroom: projectQueue("bathroom", getInitialStats()),
      },
      isSyncing: false,
      hasSynced: false,

      syncWithSupabase: async () => {
        const state = get();
        if (state.isSyncing) return;

        set({ isSyncing: true });
        try {
          const success = await uploadLocalDataToSupabase(state);
          if (success) {
            set({ hasSynced: true });
          }
        } catch (error) {
          console.error('Sync failed:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      loadFromSupabase: async () => {
        set({ isSyncing: true });
        try {
          const { data: logs } = await supabase.from('chore_logs').select('*').order('created_at', { ascending: false });
          const { data: profiles } = await supabase.from('profiles').select('*');
          const { data: warnings } = await supabase.from('warnings').select('*');
          const { data: polls } = await supabase.from('reward_polls').select('*');

          if (!logs || !profiles) {
            set({ isSyncing: false });
            return;
          }

          // Reconstruct completionStats from logs
          const newStats = getInitialStats();
          logs.forEach(log => {
            const cid = log.chore_id;
            const pid = log.user_id;
            const helperIds = log.helper_ids || [];
            
            if (!newStats[cid]) newStats[cid] = {};
            
            // 1. Credit the main logger
            if (!newStats[cid][pid]) newStats[cid][pid] = { count: 0, points: 0, lastDone: null };
            
            // ONLY increment count for actual chores, not point rewards
            if (cid !== 'reward' && cid !== 'reward-failed') {
              newStats[cid][pid].count += 1;
            }
            
            newStats[cid][pid].points += (log.points_earned || 0);
            if (!newStats[cid][pid].lastDone || new Date(log.created_at) > new Date(newStats[cid][pid].lastDone)) {
              newStats[cid][pid].lastDone = log.created_at;
            }

            // 2. Credit all helpers (Counts only)
            helperIds.forEach((hid: string) => {
              if (!newStats[cid][hid]) newStats[cid][hid] = { count: 0, points: 0, lastDone: null };
              
              if (cid !== 'reward' && cid !== 'reward-failed') {
                newStats[cid][hid].count += 1;
              }
              
              if (!newStats[cid][hid].lastDone || new Date(log.created_at) > new Date(newStats[cid][hid].lastDone)) {
                newStats[cid][hid].lastDone = log.created_at;
              }
            });
          });

          // Map history
          const newHistory = logs.map(l => ({
            timestamp: l.created_at,
            choreId: l.chore_id,
            loggerId: l.user_id,
            helperIds: l.helper_ids,
            notes: l.notes,
            pointsEarned: l.points_earned
          }));

          set({ 
            completionStats: newStats, 
            history: newHistory,
            warnings: (warnings || []).map(w => ({
              id: w.id,
              targetPid: w.target_user_id,
              choreId: w.chore_id,
              issuedBy: w.issued_by,
              issuedAt: w.issued_at,
              completed: w.completed,
              penaltyApplied: w.penalty_applied
            })),
            rewardPolls: (polls || []).map(p => ({
              id: p.id,
              choreId: p.chore_id,
              choreName: p.chore_name,
              choreDate: p.created_at,
              choreType: 'extra',
              choreHelpers: [],
              requestedBy: p.requested_by,
              requestedPoints: p.requested_points,
              votes: p.votes,
              status: p.status
            })),
            choreQueues: {
              waste:    projectWaste(newStats),
              water:    projectQueue("water", newStats),
              house:    projectQueue("house", newStats),
              kitchen:  projectQueue("kitchen", newStats),
              bathroom: projectQueue("bathroom", newStats),
            },
            isSyncing: false,
            hasSynced: true
          });
        } catch (e) {
          console.error('Failed to load from Supabase:', e);
          set({ isSyncing: false });
        }
      },
      logChore: (cid, loggerId, helperIds = [], notes, customName, pointsEarned, skipCount = false) => {
        const state = get();
        const now = new Date().toISOString();

        // 1. Instant Local Update
        set((state) => {
          const newStats = JSON.parse(JSON.stringify(state.completionStats));
          if (!newStats[cid]) newStats[cid] = {};

          if (!skipCount) {
            // Credit the main logger
            const oldLogger = newStats[cid][loggerId] || { count: 0, points: 0, lastDone: null };
            newStats[cid][loggerId] = { 
              count: oldLogger.count + 1, 
              points: (oldLogger.points || 0) + (pointsEarned || 0),
              lastDone: now 
            };

            // Credit all helpers
            helperIds.forEach(hid => {
              const oldHelper = newStats[cid][hid] || { count: 0, points: 0, lastDone: null };
              newStats[cid][hid] = { 
                count: oldHelper.count + 1, 
                points: oldHelper.points || 0, // Helpers usually don't get bonus points unless specified
                lastDone: now 
              };
            });
          }

          const historyEntry: ChoreLog = {
            timestamp: now,
            choreId: cid,
            loggerId,
            helperIds,
            notes,
            customName,
            pointsEarned
          };

          // Clear any active warnings for this chore for the people involved
          const affectedPids = [loggerId, ...helperIds];
          const updatedWarnings = state.warnings.map(w => {
            if (w.choreId === cid && affectedPids.includes(w.targetPid) && !w.completed) {
              return { ...w, completed: true };
            }
            return w;
          });

          return { 
            completionStats: newStats, 
            history: [historyEntry, ...state.history],
            warnings: updatedWarnings,
            choreQueues: {
              waste:    projectWaste(newStats),
              water:    projectQueue("water", newStats),
              house:    projectQueue("house", newStats),
              kitchen:  projectQueue("kitchen", newStats),
              bathroom: projectQueue("bathroom", newStats),
            } 
          };
        });

        // Background sync to Supabase if connected
        const canSync = typeof window !== 'undefined' && 
                        process.env.NEXT_PUBLIC_SUPABASE_URL && 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (canSync) {
          supabase.from('chore_logs').insert([{
            created_at: now,
            chore_id: cid,
            user_id: loggerId,
            helper_ids: helperIds,
            notes: notes || '',
            points_earned: pointsEarned || 0
          }]).then(({ error }) => {
            if (error) console.error('Supabase logging failed:', error);
          });

          // Also update profile points in background
          if (pointsEarned) {
             supabase.rpc('increment_points', { user_id: loggerId, amount: pointsEarned });
             // helper points update would need a similar RPC or loop
          }
        }
      },
      resetQueues: () => {
        const stats = getInitialStats();
        set({ 
          completionStats: stats,
          history: [],
          warnings: getInitialWarnings(),
          rewardPolls: getInitialRewardPolls(),
          choreQueues: {
            waste:    projectWaste(stats),
            water:    projectQueue("water", stats),
            house:    projectQueue("house", stats),
            kitchen:  projectQueue("kitchen", stats),
            bathroom: projectQueue("bathroom", stats),
          }
        });
      },

      issueWarning: (targetPid, choreId, issuedBy) => {
        const warning: Warning = {
          id: `warning-${Date.now()}`,
          targetPid,
          choreId,
          issuedBy,
          issuedAt: new Date().toISOString(),
          completed: false,
          penaltyApplied: false,
        };
        set((state) => ({
          warnings: [...state.warnings, warning],
        }));
      },

      completeWarning: (warningId) => {
        set((state) => ({
          warnings: state.warnings.map((warning) =>
            warning.id === warningId ? { ...warning, completed: true } : warning
          ),
        }));
      },

      refreshPolls: () => {
        set((state) => {
          let hasChanges = false;
          let newStats = { ...state.completionStats };
          let newHistory = [...state.history];
          
          const updatedPolls = state.rewardPolls.map(poll => {
            const participants = [poll.requestedBy, ...poll.choreHelpers];
            const eligibleVoters = PEOPLE.filter(pid => !participants.includes(pid));
            
            // Check if this is a completed poll that was missed (like "dwd")
            const isMissed = poll.status === 'completed' && !newHistory.some(h => 
              h.choreId === 'reward' && h.notes?.includes(poll.choreName) && h.loggerId === poll.requestedBy
            );

            if (poll.status !== 'pending' && !isMissed) return poll;

            const votedCount = Object.keys(poll.votes).length;
            const supportingVotes = Object.values(poll.votes).filter(v => v >= poll.requestedPoints).length;
            
            const voterPoolSize = eligibleVoters.length;
            // Threshold logic: Need roughly 66% support from eligible voters
            const winThreshold = voterPoolSize >= 3 ? Math.ceil(voterPoolSize * 0.66) : voterPoolSize;

            if (votedCount >= voterPoolSize || supportingVotes >= winThreshold || isMissed) {
              hasChanges = true;
              const won = isMissed ? true : supportingVotes >= winThreshold;
              
              if (won) {
                // Award points to all participants
                participants.forEach(pid => {
                  const cid = poll.choreId || 'extra';
                  if (!newStats[cid]) newStats[cid] = {};
                  const old = newStats[cid][pid] || { count: 0, points: 0, lastDone: null };
                  newStats[cid][pid] = {
                    count: old.count,
                    points: (old.points || 0) + poll.requestedPoints,
                    lastDone: old.lastDone || new Date().toISOString()
                  };
                });

                // Log result (Recent Activity)
                newHistory = [{
                  timestamp: new Date().toISOString(),
                  choreId: 'reward',
                  category: poll.choreId,
                  loggerId: poll.requestedBy,
                  helperIds: poll.choreHelpers,
                  notes: `WON REWARD POLL: +${poll.requestedPoints} points for "${poll.choreName}"`,
                  customName: `Reward: ${poll.choreName}`,
                  pointsEarned: poll.requestedPoints
                }, ...newHistory];
              } else {
                // Log failure
                newHistory = [{
                  timestamp: new Date().toISOString(),
                  choreId: 'reward-failed',
                  category: poll.choreId,
                  loggerId: poll.requestedBy,
                  helperIds: poll.choreHelpers,
                  notes: `REWARD POLL FAILED: "${poll.choreName}"`,
                  customName: `Failed: ${poll.choreName}`,
                  pointsEarned: 0
                }, ...newHistory];
              }
              
              return { ...poll, status: 'completed' as const };
            }
            return poll;
          });

          if (!hasChanges) return state;

          return { 
            rewardPolls: updatedPolls,
            completionStats: newStats,
            history: newHistory
          };
        });
      },

      applyPenalty: (warningId) => {
        set((state) => ({
          warnings: state.warnings.map((warning) =>
            warning.id === warningId ? { ...warning, penaltyApplied: true } : warning
          ),
        }));
      },

      createRewardPoll: (choreId, choreName, choreDate, choreType, choreHelpers, requestedBy, requestedPoints) => {
        const poll: RewardPoll = {
          id: `poll-${Date.now()}`,
          choreId,
          choreName,
          choreDate,
          choreType,
          choreHelpers,
          requestedBy,
          requestedPoints,
          votes: {},
          status: "pending",
        };
        set((state) => ({
          rewardPolls: [...state.rewardPolls, poll],
        }));
      },

      completeRewardPoll: (pollId) => {
        set((state) => ({
          rewardPolls: state.rewardPolls.map((poll) =>
            poll.id === pollId ? { ...poll, status: "completed" } : poll
          ),
        }));
      },

      voteOnRewardPoll: (pollId, voterPid, vote) => {
        set((state) => {
          const pollIndex = state.rewardPolls.findIndex(p => p.id === pollId);
          if (pollIndex === -1) return state;

          const poll = state.rewardPolls[pollIndex];
          const participants = [poll.requestedBy.toLowerCase(), ...(poll.choreHelpers || []).map(h => h.toLowerCase())];
          
          // Guard: Participants cannot vote
          if (participants.includes(voterPid.toLowerCase())) return state;

          const updatedPolls = [...state.rewardPolls];
          updatedPolls[pollIndex] = { 
            ...poll, 
            votes: { ...poll.votes, [voterPid]: vote } 
          };
          
          const currentPoll = updatedPolls[pollIndex];
          const eligibleVoters = PEOPLE.filter(pid => !participants.includes(pid));
          
          const votedCount = Object.keys(currentPoll.votes).length;
          const supportingVotes = Object.values(currentPoll.votes).filter(v => v >= currentPoll.requestedPoints).length;
          
          const voterPoolSize = eligibleVoters.length;
          // Threshold logic: Need roughly 66% support from eligible voters
          const winThreshold = voterPoolSize >= 3 ? Math.ceil(voterPoolSize * 0.66) : voterPoolSize;
          
          if (votedCount >= voterPoolSize || supportingVotes >= winThreshold) {
            const won = supportingVotes >= winThreshold;
            currentPoll.status = 'completed';
            
            let newStats = JSON.parse(JSON.stringify(state.completionStats));
            let newHistory = [...state.history];
            const cid = currentPoll.choreId || 'extra';
            
            if (won) {
              // Award points to ALL participants
              participants.forEach(pid => {
                if (!newStats[cid]) newStats[cid] = {};
                if (!newStats[cid][pid]) {
                  newStats[cid][pid] = { count: 0, points: 0, lastDone: null };
                }
                const old = newStats[cid][pid];
                newStats[cid][pid] = {
                  count: old.count || 0,
                  points: (old.points || 0) + currentPoll.requestedPoints,
                  lastDone: old.lastDone || new Date().toISOString()
                };
              });

              // Log result
              newHistory = [{
                timestamp: new Date().toISOString(),
                choreId: 'reward',
                category: cid,
                loggerId: currentPoll.requestedBy,
                helperIds: currentPoll.choreHelpers,
                notes: `WON REWARD POLL: +${currentPoll.requestedPoints} points for "${currentPoll.choreName}"`,
                customName: `Reward: ${currentPoll.choreName}`,
                pointsEarned: currentPoll.requestedPoints
              }, ...newHistory];
            } else {
              // Log failure
              newHistory = [{
                timestamp: new Date().toISOString(),
                choreId: 'reward-failed',
                category: cid,
                loggerId: currentPoll.requestedBy,
                helperIds: currentPoll.choreHelpers,
                notes: `REWARD POLL FAILED: "${currentPoll.choreName}" (no points awarded)`,
                customName: `Failed: ${currentPoll.choreName}`,
                pointsEarned: 0
              }, ...newHistory];
            }

            return {
              rewardPolls: updatedPolls,
              history: newHistory,
              completionStats: newStats,
            };
          }

          return {
            rewardPolls: updatedPolls
          };
        });
      },
    }),
    {
      name: 'chore-wars-state',
      version: 3,
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => !['isSyncing', 'hasSynced'].includes(key))
      ),
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          // Keep old stats if they exist, otherwise use initial
          const oldStats = persistedState.completionStats || getInitialStats();
          return {
            ...persistedState,
            completionStats: oldStats,
            choreQueues: persistedState.choreQueues || {
              waste:    projectWaste(oldStats),
              water:    projectQueue("water", oldStats),
              house:    projectQueue("house", oldStats),
              kitchen:  projectQueue("kitchen", oldStats),
              bathroom: projectQueue("bathroom", oldStats),
            },
            warnings: persistedState.warnings || getInitialWarnings(),
            rewardPolls: persistedState.rewardPolls || getInitialRewardPolls(),
          };
        }
        return persistedState;
      },
    }
  )
)
