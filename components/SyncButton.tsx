'use client'

import { RefreshCw } from 'lucide-react'
import { useChoreStore } from '@/stores/useChoreStore'
import toast from 'react-hot-toast'
import { useState } from 'react'

export function SyncButton() {
  const { loadFromSupabase, isSyncing } = useChoreStore()
  const [isRotating, setIsRotating] = useState(false)

  const handleSync = async () => {
    setIsRotating(true)
    try {
      await loadFromSupabase()
      toast.success('Cloud data synced!')
    } catch (error) {
      toast.error('Sync failed')
    } finally {
      setTimeout(() => setIsRotating(false), 500)
    }
  }

  return (
    <button 
      onClick={handleSync}
      disabled={isSyncing}
      className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors group relative"
      title="Force Cloud Sync"
    >
      <RefreshCw className={`w-5 h-5 text-muted-foreground transition-transform duration-500 ${isRotating || isSyncing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
    </button>
  )
}
