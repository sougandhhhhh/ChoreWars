'use client'

import { useEffect } from 'react'
import { useChoreStore } from '../stores/useChoreStore'
import { supabase } from '../lib/supabase'

export function SyncManager() {
  const { hasSynced, isSyncing, syncWithSupabase, loadFromSupabase } = useChoreStore()

  useEffect(() => {
    async function sync() {
      // 1. Initial migration/load
      if (!hasSynced && !isSyncing) {
        console.log('SyncManager: Starting initial migration...')
        await syncWithSupabase()
      } else if (hasSynced && !isSyncing) {
        console.log('SyncManager: Pulling latest data from live site...')
        await loadFromSupabase()
      }
    }

    // Initial sync
    sync();

    // Listen for visibility changes (especially useful for mobile)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('App became visible, triggering sync...');
        sync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Setup Realtime Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chore_logs' },
        () => {
          console.log('Realtime update received!');
          sync();
        }
      )
      .subscribe();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, [hasSynced, isSyncing, syncWithSupabase, loadFromSupabase])

  if (isSyncing) {
    return (
      <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 animate-pulse">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
        <span className="text-sm font-medium">Syncing with Live Site...</span>
      </div>
    )
  }

  return null
}
