import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { USER_CREDENTIALS } from '../data/credentials';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // --- State ---
      isAuthenticated: false,
      currentUser: null, // { username, profileId, displayName, avatar }
      loginAttempts: 0,
      lockoutUntil: null,

      // --- Actions ---
      login: (username, password) => {
        const state = get();

        // Check lockout
        if (state.lockoutUntil && new Date() < new Date(state.lockoutUntil)) {
          const remaining = Math.ceil(
            (new Date(state.lockoutUntil) - new Date()) / 1000
          );
          return {
            success: false,
            error: `Too many attempts. Try again in ${remaining}s`,
          };
        }

        // Find matching credentials (case-insensitive username)
        const match = USER_CREDENTIALS.find(
          (cred) =>
            cred.username.toLowerCase() === username.toLowerCase().trim() &&
            cred.password === password
        );

        if (match) {
          set({
            isAuthenticated: true,
            currentUser: {
              username: match.username,
              profileId: match.profileId,
              displayName: match.displayName,
              avatar: match.avatar,
            },
            loginAttempts: 0,
            lockoutUntil: null,
          });
          return { success: true, profileId: match.profileId };
        }

        // Failed login
        const newAttempts = state.loginAttempts + 1;
        const lockout = newAttempts >= 5
          ? new Date(Date.now() + 30 * 1000).toISOString() // 30s lockout
          : null;

        set({
          loginAttempts: newAttempts,
          lockoutUntil: lockout,
        });

        if (newAttempts >= 5) {
          return {
            success: false,
            error: 'Account locked for 30 seconds. Too many failed attempts.',
          };
        }

        return {
          success: false,
          error: `Invalid username or password. ${5 - newAttempts} attempts remaining.`,
        };
      },

      logout: () =>
        set({
          isAuthenticated: false,
          currentUser: null,
          loginAttempts: 0,
          lockoutUntil: null,
        }),

      updateProfile: (updates) => {
        set((state) => {
          const profileId = state.currentUser?.profileId;
          if (!profileId) return state;

          const safeOverrides = state.profileOverrides || {};
          const currentOverrides = safeOverrides[profileId] || {};
          const newOverrides = { ...currentOverrides, ...updates };

          // Sync to Supabase
          import('../lib/supabase').then(({ supabase }) => {
            supabase.from('profiles').update({
              display_name: updates.name,
              codename: updates.codename,
              email: updates.email,
              phone: updates.phone
            }).eq('id', profileId).then(({ error }) => {
              if (error) console.error('Error syncing profile to Supabase:', error);
            });
          });

          return {
            currentUser: { ...state.currentUser, displayName: updates.name || state.currentUser.displayName },
            profileOverrides: {
              ...safeOverrides,
              [profileId]: newOverrides
            }
          };
        });
      },
    }),
    {
      name: 'chorewars-auth',
    }
  )
);

export default useAuthStore;
