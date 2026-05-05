import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PROFILES } from '../data/profiles';
import { DEFAULT_CHORES } from '../data/chores';
import { BADGE_DEFINITIONS } from '../data/badges';
import { isToday, differenceInDays, differenceInHours } from 'date-fns';

const useGameStore = create(
  persist(
    (set, get) => ({
      // --- State ---
      profiles: DEFAULT_PROFILES,
      chores: DEFAULT_CHORES,
      completions: [],
      challenges: [],
      weeklyReset: new Date().toISOString(),
      activeProfile: null,
      darkMode: true,
      auctionChore: null,
      auctionClaimedBy: null,

      // --- Profile Actions ---
      setActiveProfile: (profileId) => set({ activeProfile: profileId }),

      updateMood: (profileId, mood) => set((state) => ({
        profiles: state.profiles.map(p =>
          p.id === profileId ? { ...p, mood, moodTimestamp: new Date().toISOString() } : p
        ),
      })),

      // --- Chore Actions ---
      completeChore: (choreId, profileId, note = '') => {
        const state = get();
        const chore = state.chores.find(c => c.id === choreId);
        if (!chore) return;

        // Check cooldown
        if (chore.lastDoneBy === profileId && chore.lastDoneAt) {
          const hoursSince = differenceInHours(new Date(), new Date(chore.lastDoneAt));
          if (hoursSince < chore.cooldownHours) return;
        }

        // Calculate bonus
        const profile = state.profiles.find(p => p.id === profileId);
        const streakBonus = profile.streak >= 3 ? Math.floor(chore.points * 0.1) : 0;
        const totalPoints = chore.points + streakBonus;

        const completion = {
          choreId,
          profileId,
          timestamp: new Date().toISOString(),
          note,
          bonusApplied: streakBonus,
          pointsEarned: totalPoints,
        };

        set((state) => {
          // Update chore
          const updatedChores = state.chores.map(c =>
            c.id === choreId
              ? { ...c, lastDoneBy: profileId, lastDoneAt: new Date().toISOString() }
              : c
          );

          // Update profile
          const updatedProfiles = state.profiles.map(p => {
            if (p.id !== profileId) return p;
            const lastActive = p.lastActive;
            let newStreak = p.streak;
            if (lastActive) {
              const daysSince = differenceInDays(new Date(), new Date(lastActive));
              if (daysSince === 1) newStreak += 1;
              else if (daysSince > 1) newStreak = 1;
            } else {
              newStreak = 1;
            }
            return {
              ...p,
              totalPoints: p.totalPoints + totalPoints,
              weeklyPoints: p.weeklyPoints + totalPoints,
              streak: newStreak,
              lastActive: new Date().toISOString(),
            };
          });

          const newCompletions = [...state.completions, completion];

          // Check badges
          const finalProfiles = updatedProfiles.map(p => {
            if (p.id !== profileId) return p;
            const newBadges = [...p.badges];
            BADGE_DEFINITIONS.forEach(badge => {
              if (!newBadges.includes(badge.id) && badge.check(newCompletions, profileId, updatedProfiles)) {
                newBadges.push(badge.id);
              }
            });
            return { ...p, badges: newBadges };
          });

          return {
            chores: updatedChores,
            profiles: finalProfiles,
            completions: newCompletions,
          };
        });

        return { totalPoints, streakBonus };
      },

      // --- Challenge Actions ---
      createChallenge: (challengerId, challengeeId, choreIds) => set((state) => ({
        challenges: [...state.challenges, {
          id: Date.now().toString(),
          challengerId,
          challengeeId,
          choreIds,
          status: 'active',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          challengerProgress: 0,
          challengeeProgress: 0,
          createdAt: new Date().toISOString(),
        }],
      })),

      updateChallengeProgress: (challengeId) => set((state) => {
        const challenge = state.challenges.find(c => c.id === challengeId);
        if (!challenge || challenge.status !== 'active') return state;

        const challengerDone = state.completions.filter(
          c => c.profileId === challenge.challengerId &&
            challenge.choreIds.includes(c.choreId) &&
            new Date(c.timestamp) > new Date(challenge.createdAt)
        ).length;

        const challengeeDone = state.completions.filter(
          c => c.profileId === challenge.challengeeId &&
            challenge.choreIds.includes(c.choreId) &&
            new Date(c.timestamp) > new Date(challenge.createdAt)
        ).length;

        let status = 'active';
        let winnerId = null;
        if (challengerDone >= 3) { status = 'completed'; winnerId = challenge.challengerId; }
        else if (challengeeDone >= 3) { status = 'completed'; winnerId = challenge.challengeeId; }

        const updatedChallenges = state.challenges.map(c =>
          c.id === challengeId
            ? { ...c, challengerProgress: challengerDone, challengeeProgress: challengeeDone, status, winnerId }
            : c
        );

        // Award bonus points to winner
        let updatedProfiles = state.profiles;
        if (winnerId) {
          updatedProfiles = state.profiles.map(p =>
            p.id === winnerId ? { ...p, totalPoints: p.totalPoints + 50, weeklyPoints: p.weeklyPoints + 50 } : p
          );
        }

        return { challenges: updatedChallenges, profiles: updatedProfiles };
      }),

      // --- Weekly Reset ---
      checkWeeklyReset: () => {
        const state = get();
        const lastReset = new Date(state.weeklyReset);
        const daysSince = differenceInDays(new Date(), lastReset);
        if (daysSince >= 7) {
          const champion = [...state.profiles].sort((a, b) => b.weeklyPoints - a.weeklyPoints)[0];
          set({
            profiles: state.profiles.map(p => ({ ...p, weeklyPoints: 0 })),
            weeklyReset: new Date().toISOString(),
          });
          return champion;
        }
        return null;
      },

      // --- Auction ---
      startAuction: () => {
        const hardChores = [
          { id: 'deep-clean-bathroom', name: 'Deep Clean Bathroom', points: 100, icon: '🏆', zone: 'Bathroom' },
          { id: 'full-house-clean', name: 'Full House Deep Clean', points: 120, icon: '🏠', zone: 'Common Areas' },
          { id: 'organize-kitchen', name: 'Organize Entire Kitchen', points: 80, icon: '🍳', zone: 'Kitchen' },
        ];
        const randomChore = hardChores[Math.floor(Math.random() * hardChores.length)];
        set({ auctionChore: randomChore, auctionClaimedBy: null });
      },

      claimAuction: (profileId) => set((state) => {
        if (state.auctionClaimedBy) return state;
        return {
          auctionClaimedBy: profileId,
          profiles: state.profiles.map(p =>
            p.id === profileId
              ? { ...p, totalPoints: p.totalPoints + state.auctionChore.points, weeklyPoints: p.weeklyPoints + state.auctionChore.points }
              : p
          ),
        };
      }),

      // --- Penalties ---
      applyPenalties: () => set((state) => {
        const now = new Date();
        const updatedProfiles = state.profiles.map(p => {
          if (p.lastActive) {
            const days = differenceInDays(now, new Date(p.lastActive));
            if (days >= 3) {
              return { ...p, totalPoints: Math.max(0, p.totalPoints - 10), weeklyPoints: Math.max(0, p.weeklyPoints - 10) };
            }
          }
          return p;
        });
        return { profiles: updatedProfiles };
      }),

      // --- Dark Mode ---
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // --- Helpers ---
      getRankedProfiles: () => {
        return [...get().profiles].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
      },

      getOverdueChores: () => {
        const state = get();
        return state.chores.filter(chore => {
          if (!chore.lastDoneAt) return true;
          const hoursSince = differenceInHours(new Date(), new Date(chore.lastDoneAt));
          const thresholds = { daily: 28, 'every-2-days': 60, weekly: 180, 'as-needed': 720 };
          return hoursSince > (thresholds[chore.frequency] || 48);
        });
      },

      getProfileCompletions: (profileId) => {
        return get().completions.filter(c => c.profileId === profileId);
      },

      getVibeScore: (profileId) => {
        const profile = get().profiles.find(p => p.id === profileId);
        if (!profile) return 0;
        const streakScore = Math.min(profile.streak * 10, 30);
        const pointsScore = Math.min(profile.weeklyPoints / 5, 40);
        const badgeScore = Math.min(profile.badges.length * 5, 30);
        return Math.round(streakScore + pointsScore + badgeScore);
      },

      // --- Seed Demo Data ---
      seedDemoData: () => {
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const profiles = get().profiles;
        const chores = get().chores;
        const completions = [];

        const pointsMap = {};
        profiles.forEach(p => { pointsMap[p.id] = { total: 0, weekly: 0 }; });

        // Generate demo completions for the past 2 weeks
        for (let d = 13; d >= 0; d--) {
          profiles.forEach((profile, idx) => {
            const numChores = Math.floor(Math.random() * 3) + (idx < 3 ? 1 : 0);
            for (let c = 0; c < numChores; c++) {
              const chore = chores[Math.floor(Math.random() * chores.length)];
              const timestamp = new Date(now - d * day + Math.random() * 12 * 60 * 60 * 1000);
              const pts = chore.points;
              completions.push({
                choreId: chore.id,
                profileId: profile.id,
                timestamp: timestamp.toISOString(),
                note: '',
                bonusApplied: 0,
                pointsEarned: pts,
              });
              pointsMap[profile.id].total += pts;
              if (d < 7) pointsMap[profile.id].weekly += pts;
            }
          });
        }

        const updatedProfiles = profiles.map((p, i) => ({
          ...p,
          totalPoints: pointsMap[p.id].total,
          weeklyPoints: pointsMap[p.id].weekly,
          streak: Math.floor(Math.random() * 8) + 1,
          lastActive: new Date(now - Math.random() * 2 * day).toISOString(),
          badges: i === 0 ? ['on-fire', 'dish-destroyer'] : i === 1 ? ['night-owl'] : i === 2 ? ['weekend-warrior'] : [],
        }));

        set({ profiles: updatedProfiles, completions });
      },
    }),
    {
      name: 'chorewars-storage',
    }
  )
);

export default useGameStore;
