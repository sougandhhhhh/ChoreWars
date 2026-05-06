'use client'

import { useEffect } from 'react'
import { useChoreStore } from '../stores/useChoreStore'
import { supabase } from '../lib/supabase'

export function SyncManager() {
  const { syncWithSupabase, loadFromSupabase, isSyncing } = useChoreStore()

  useEffect(() => {
    // 1. Initial Load/Migration
    syncWithSupabase()

    // 2. Refresh function
    const refresh = () => {
      console.log('SyncManager: Refreshing data...')
      loadFromSupabase()
    }

    // 3. Visibility Listener (Mobile fix)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // 4. Realtime Listener (Broadcast fix)
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          console.log('Realtime event detected!')
          refresh()
        }
      )
      .subscribe()

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      supabase.removeChannel(channel)
    }
  }, [syncWithSupabase, loadFromSupabase])

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
