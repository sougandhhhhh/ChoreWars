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
      className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors relative"
      title="Force Cloud Sync"
    >
      <RefreshCw 
        className={`w-5 h-5 text-[#99f7ff] transition-all duration-500 ${
          isRotating || isSyncing 
            ? 'animate-spin drop-shadow-[0_0_8px_rgba(153,247,255,0.8)] opacity-100' 
            : 'opacity-40 hover:opacity-100'
        }`} 
        strokeWidth={2.5}
      />
    </button>
  )
}
