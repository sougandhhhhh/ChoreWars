'use client'

import { CloudSync } from 'lucide-react'
import { useChoreStore } from '@/stores/useChoreStore'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function FloatingSyncButton() {
  const { loadFromSupabase, isSyncing } = useChoreStore()
  const [isRotating, setIsRotating] = useState(false)

  const handleSync = async () => {
    setIsRotating(true)
    try {
      await loadFromSupabase()
      toast.success('Cloud data synced!', {
        style: {
          background: '#0e0e0e',
          color: '#99f7ff',
          border: '1px solid rgba(153, 247, 255, 0.2)',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }
      })
    } catch (error) {
      toast.error('Sync failed')
    } finally {
      setTimeout(() => setIsRotating(false), 800)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] group">
      <div className="absolute inset-0 bg-[#99f7ff]/20 rounded-full blur-xl group-hover:bg-[#99f7ff]/40 transition-all duration-500 opacity-0 group-hover:opacity-100" />
      <button 
        onClick={handleSync}
        disabled={isSyncing}
        className={`relative flex items-center justify-center w-12 h-12 rounded-full bg-background border border-[#99f7ff]/30 shadow-[0_0_15px_rgba(153,247,255,0.15)] hover:shadow-[0_0_25px_rgba(153,247,255,0.4)] hover:border-[#99f7ff]/60 transition-all duration-300 ${isSyncing ? 'cursor-not-allowed' : 'cursor-pointer active:scale-90'}`}
        title="Sync Cloud Data"
      >
        <CloudSync 
          className={`w-6 h-6 text-[#99f7ff] transition-all duration-700 ${
            isRotating || isSyncing 
              ? 'animate-spin drop-shadow-[0_0_10px_rgba(153,247,255,0.8)]' 
              : 'opacity-60 group-hover:opacity-100'
          }`} 
          strokeWidth={1.5}
        />
        
        {/* Syncing indicator dot */}
        {(isRotating || isSyncing) && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        )}
      </button>
    </div>
  )
}
