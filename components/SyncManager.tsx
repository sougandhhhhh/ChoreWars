'use client'

import { useEffect } from 'react'
import { useChoreStore } from '../stores/useChoreStore'
import { supabase } from '../lib/supabase'

export function SyncManager() {
  const { syncWithSupabase, loadFromSupabase } = useChoreStore()

  useEffect(() => {
    // 1. Initial Load & Push Latest
    console.log('SyncManager: Initializing...')
    
    const initializeSync = async () => {
      try {
        await syncWithSupabase()
        await loadFromSupabase()
        console.log('SyncManager: Initial sync complete')
      } catch (e) {
        console.error('SyncManager: Initialization failed', e)
      }
    }

    initializeSync()

    // 2. Visibility & Focus Listeners (Ensures sync when switching back to tab)
    const refreshIfPossible = () => {
      if (document.visibilityState === 'visible') {
        console.log('SyncManager: Tab visible, refreshing...')
        loadFromSupabase()
      }
    }

    window.addEventListener('focus', refreshIfPossible)
    document.addEventListener('visibilitychange', refreshIfPossible)

    // 3. Realtime Listener
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('SyncManager: Realtime update received', payload)
          loadFromSupabase()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('focus', refreshIfPossible)
      document.removeEventListener('visibilitychange', refreshIfPossible)
      supabase.removeChannel(channel)
    }
  }, [syncWithSupabase, loadFromSupabase])

  // Removed visual syncing indicator as per user request
  return null
}

