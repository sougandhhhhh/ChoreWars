'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, User, Sparkles, Loader2, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChoreStore } from '@/stores/useChoreStore'
import useAuthStore from '@/stores/useAuthStore'
import { OPERATIVES } from '@/data/operatives'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIChatbot() {
  const { isChatOpen, toggleChat, completionStats, history, rewardPolls, warnings } = useChoreStore()
  const { currentUser } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Sup! I\'m your ChoreWars AI assistant. Ask me anything about the house data or point standings!' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          context: {
            operatives: OPERATIVES,
            completionStats,
            history: history.slice(0, 50), // Send last 50 entries
            rewardPolls,
            warnings,
            currentUser: currentUser?.profileId
          }
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch (error) {
      console.error('Chat Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to connect to my brain. Check console or API key.' }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isChatOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-24 right-6 z-[100] w-80 sm:w-96 h-[500px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-secondary/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-white">Chore Assistant</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Online</p>
                </div>
                <span className="text-[8px] text-white/20 font-mono">v2.1.0-CWOS</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleChat}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button 
              onClick={toggleChat}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                m.role === 'user' 
                  ? 'bg-pink-500/10 border border-pink-500/20 text-white rounded-tr-none' 
                  : 'bg-secondary border border-border text-muted-foreground rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary border border-border rounded-2xl rounded-tl-none p-3">
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about chore data..."
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-pink-500/50 transition-colors"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
          <p className="text-[8px] text-center text-muted-foreground uppercase tracking-widest mt-2 font-bold opacity-50">
            Powered by Gemini AI
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
