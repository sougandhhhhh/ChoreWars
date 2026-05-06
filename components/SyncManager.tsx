'use client'

import { useEffect } from 'react'
import { useChoreStore } from '../stores/useChoreStore'
import { supabase } from '../lib/supabase'

export function SyncManager() {
  const { hasSynced, isSyncing, syncWithSupabase, loadFromSupabase } = useChoreStore()

  useEffect(() => {
    async function initSync() {
      // 1. Initial migration/load
      if (!hasSynced && !isSyncing) {
        console.log('SyncManager: Starting initial migration...')
        await syncWithSupabase()
      } else if (hasSynced && !isSyncing) {
        console.log('SyncManager: Pulling latest data from live site...')
        await loadFromSupabase()
      }
    }

    initSync()

    // 2. Real-time Subscription
    // This listens for any changes in Supabase and tells our app to refresh instantly
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('Live Update Received:', payload)
          loadFromSupabase() // Refresh the local store with fresh data
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
