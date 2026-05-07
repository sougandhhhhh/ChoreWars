'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ArrowRight, RefreshCcw, X, Mail } from 'lucide-react'

interface OTPModalProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend?: () => Promise<void>;
  onCancel: () => void;
  title?: string;
}

export function OTPModal({ email, onVerify, onResend, onCancel, title = "VERIFY IDENTITY" }: OTPModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async () => {
    const code = otp.join('')
    if (code.length !== 6) return
    setIsVerifying(true)
    try {
      await onVerify(code)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!canResend || !onResend) return
    setTimer(60)
    setCanResend(false)
    await onResend()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#131313] border border-[#99f7ff] shadow-[0_0_50px_rgba(153,247,255,0.2)] rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
      >
        {/* Background Gradients */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <button onClick={onCancel} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-[#99f7ff]" />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-black text-[#99f7ff] tracking-widest uppercase mb-2">{title}</h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Mail className="w-4 h-4" />
              <span>OTP sent to: </span>
              <span className="text-white font-mono">{email.replace(/(.{2})(.*)(?=@)/, (m, p1, p2) => p1 + "*".repeat(p2.length))}</span>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold bg-[#1a1a1a] border border-white/10 rounded-xl focus:border-[#99f7ff] focus:ring-1 focus:ring-[#99f7ff] outline-none transition-all"
              />
            ))}
          </div>

          <div className="w-full flex flex-col gap-4">
            <button
              onClick={handleSubmit}
              disabled={isVerifying || otp.join('').length !== 6}
              className="w-full h-14 bg-[#00f1fe] text-[#005f64] font-black tracking-widest rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
            >
              {isVerifying ? "VERIFYING..." : "CONFIRM ACCESS"}
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleResend}
              disabled={!canResend}
              className="text-xs font-bold tracking-widest text-muted-foreground hover:text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCcw className={`w-3 h-3 ${!canResend ? 'animate-spin' : ''}`} />
              {canResend ? "RESEND CODE" : `RESEND IN ${timer}S`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
