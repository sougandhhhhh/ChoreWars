"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { SyncButton } from "@/components/SyncButton"
import { Bot, Trash2, Droplets, Home as HomeIcon, Utensils, Bath, CheckCircle2, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MessageSquare, Calendar, Clock, Users, PlusCircle, Star, Vote } from "lucide-react"
import Image from "next/image"
import { OPERATIVES } from "@/data/operatives"
import useAuthStore from "@/stores/useAuthStore"
import { useChoreStore, RewardPoll } from "@/stores/useChoreStore"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const CHORES = [
  { id: "waste",    name: "WASTE",            icon: Trash2,   accent: "#ff59e3", isTeam: true,  limit: 8 },
  { id: "water",    name: "WATER CAN",        icon: Droplets, accent: "#99f7ff", isTeam: false, limit: 15 },
  { id: "house",    name: "HOUSE CLEANING",   icon: HomeIcon, accent: "#ff59e3", isTeam: false, limit: 15 },
  { id: "kitchen",  name: "KITCHEN CLEANING", icon: Utensils, accent: "#99f7ff", isTeam: false, limit: 15 },
  { id: "bathroom", name: "BATHROOM",         icon: Bath,     accent: "#ff59e3", isTeam: false, limit: 15 },
]

// No longer needed here as they are in the store
const PEOPLE = ["sanjjay", "sougandh", "chris", "haady", "kichu"]

// ─── Chennai time (IST = UTC+5:30) ───
function getChennaiNow() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const ist = new Date(utc + 5.5 * 3600000)
  return ist
}

function formatChennaiTime(d: Date) {
  let h = d.getHours()
  const m = d.getMinutes()
  const period = h >= 12 ? "PM" : "AM"
  h = h % 12 || 12
  return { hour: String(h).padStart(2, "0"), minute: String(m).padStart(2, "0"), period }
}

// ─── Mini Calendar ───
function MiniCalendar({ value, onChange, accent }: { value: Date | null; onChange: (d: Date) => void; accent: string }) {
  const today = getChennaiNow()
  const [viewYear, setViewYear] = useState(value ? value.getFullYear() : today.getFullYear())
  const [viewMonth, setViewMonth] = useState(value ? value.getMonth() : today.getMonth())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
  const DAYS = ["S","M","T","W","T","F","S"]

  const prevM = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1) } else setViewMonth(m=>m-1) }
  const nextM = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1) } else setViewMonth(m=>m+1) }

  const cells: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth},(_,i)=>i+1)]

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-3 shadow-2xl w-[220px]">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevM} className="p-0.5 rounded hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-black text-white tracking-widest">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextM} className="p-0.5 rounded hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d,i) => <div key={i} className="text-center text-[8px] font-black text-muted-foreground/60 py-0.5">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {day ? (
              <button
                onClick={() => onChange(new Date(viewYear, viewMonth, day))}
                className={`w-full h-full rounded text-[9px] font-bold transition-all ${
                  value && value.getDate()===day && value.getMonth()===viewMonth && value.getFullYear()===viewYear
                    ? "text-black font-black shadow-lg"
                    : today.getDate()===day && today.getMonth()===viewMonth && today.getFullYear()===viewYear
                    ? "border text-white/80 hover:text-white"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
                style={
                  value && value.getDate()===day && value.getMonth()===viewMonth && value.getFullYear()===viewYear
                    ? { background: accent }
                    : today.getDate()===day && today.getMonth()===viewMonth && today.getFullYear()===viewYear
                    ? { borderColor: `${accent}60` }
                    : {}
                }
              >{day}</button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mini Time Picker ───
function MiniTimePicker({ hour, minute, period, onHourChange, onMinuteChange, onPeriodChange, accent }: {
  hour: string; minute: string; period: string
  onHourChange: (v:string)=>void; onMinuteChange: (v:string)=>void; onPeriodChange: (v:string)=>void
  accent: string
}) {
  const hours = Array.from({length:12},(_,i)=>String(i+1).padStart(2,"0"))
  const minutes = Array.from({length:60},(_,i)=>String(i).padStart(2,"0"))
  const displayHour = hour || "12"
  const displayMinute = minute || "00"
  const hIdx = hours.indexOf(displayHour)
  const mIdx = minutes.indexOf(displayMinute)
  const scrollH = (dir: -1 | 1) => onHourChange(hours[(hIdx + dir + 12) % 12])
  const scrollM = (dir: -1 | 1) => onMinuteChange(minutes[(mIdx + dir + 60) % 60])

  const Col = ({ label, val, onUp, onDown }: { label:string; val:string; onUp:()=>void; onDown:()=>void }) => (
    <div className="flex flex-col items-center">
      <span className="text-[8px] font-black text-muted-foreground tracking-widest mb-1">{label}</span>
      <button onClick={onUp} className="p-0.5 text-muted-foreground hover:text-white transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
      <div className="w-10 h-8 flex items-center justify-center rounded text-sm font-black" style={{ color: accent, background: `${accent}15`, border: `1px solid ${accent}30` }}>
        {val}
      </div>
      <button onClick={onDown} className="p-0.5 text-muted-foreground hover:text-white transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
    </div>
  )

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-3 shadow-2xl">
      <div className="flex items-center gap-3 justify-center">
        <Col label="HH" val={displayHour} onUp={()=>scrollH(1)} onDown={()=>scrollH(-1)} />
        <span className="text-lg font-black text-white/30 mt-3">:</span>
        <Col label="MM" val={displayMinute} onUp={()=>scrollM(1)} onDown={()=>scrollM(-1)} />
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black text-muted-foreground tracking-widest mb-1">AM/PM</span>
          <div className="flex flex-col gap-1 mt-1">
            {["AM","PM"].map(p => (
              <button key={p} onClick={() => onPeriodChange(p)}
                className="w-10 h-[15px] rounded text-[9px] font-black transition-all"
                style={(period || "AM")===p
                  ? { background: accent, color: "#000" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.05)" }
                }>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───
import { useUIStore } from "@/stores/useUIStore"
import { Menu } from "lucide-react"

export default function ChoresPage() {
  const { profileOverrides = {}, currentUser } = useAuthStore()
  const { toggleSidebar } = useUIStore()

  const getProfile = (id: string) => {
    const base = OPERATIVES.find(op => op.profileId === id) || OPERATIVES[0];
    const overrides = profileOverrides[id] || {};
    return {
      ...base,
      name: overrides.name || base.name,
      codename: overrides.codename || base.codename,
    };
  };
  const { choreQueues, logChore, completionStats, createRewardPoll, issueWarning, toggleChat } = useChoreStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [claimModal, setClaimModal] = useState<{ choreId: string; choreName: string; accent: string; isTeam?: boolean } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [hour, setHour] = useState("")
  const [minute, setMinute] = useState("")
  const [period, setPeriod] = useState("")
  const [claimFeedback, setClaimFeedback] = useState("")
  const [helpers, setHelpers] = useState<string[]>([])
  const [extraModal, setExtraModal] = useState(false)
  const [customChoreName, setCustomChoreName] = useState("")
  const [requestedPoints, setRequestedPoints] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [showCal, setShowCal] = useState(false)
  const [showTime, setShowTime] = useState(false)
  const calRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const [countdown, setCountdown] = useState(0)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const resetModalState = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setSelectedDate(null)
    setHour("")
    setMinute("")
    setPeriod("")
    setClaimFeedback("")
    setHelpers([])
    setRequestedPoints(null)
    setSubmitted(false)
    setShowCal(false)
    setShowTime(false)
    setIsCountingDown(false)
    setCountdown(0)
  }

  const openClaimModal = (payload: { choreId: string; choreName: string; accent: string; isTeam?: boolean }) => {
    resetModalState()
    setExtraModal(false)
    setClaimModal(payload)
  }

  const openExtraModal = () => {
    resetModalState()
    setClaimModal(null)
    setExtraModal(true)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setShowCal(false)
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) setShowTime(false)
    }
    document.addEventListener("mousedown", handler)
    return () => {
      document.removeEventListener("mousedown", handler)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const claimId = searchParams.get("claim")
    if (!claimId || claimModal) return
    const chore = CHORES.find(c => c.id === claimId)
    if (!chore) return

    openClaimModal({ choreId: chore.id, choreName: chore.name, accent: chore.accent, isTeam: chore.isTeam })
    router.replace("/chores")
  }, [searchParams, claimModal, router])

  useEffect(() => {
    if (isCountingDown && countdown === 0 && !submitted) {
      executeLog()
    }
  }, [isCountingDown, countdown, submitted])


  const setToday = () => { setSelectedDate(getChennaiNow()); setShowCal(false) }
  const setNow = () => {
    const t = formatChennaiTime(getChennaiNow())
    setHour(t.hour); setMinute(t.minute); setPeriod(t.period)
    setShowTime(false)
  }

  const toggleHelper = (pid: string) => {
    setHelpers(prev => prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid])
  }

  const executeLog = () => {
    if (!currentUser) return;
    
    const cid = claimModal?.choreId || (extraModal ? "extra" : null);
    if (cid && currentUser) {
      const finalNote = extraModal ? (claimFeedback ? `POLLING: ${claimFeedback}` : "Initiated Reward Poll") : claimFeedback;
      logChore(cid, currentUser.profileId, helpers, finalNote, customChoreName, undefined);
      
      // Create reward poll for extra chores
      if (extraModal && customChoreName && requestedPoints) {
        const choreDate = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        createRewardPoll("extra", customChoreName, choreDate, "extra", helpers, currentUser.profileId, requestedPoints);
      }
    }

    setSubmitted(true)
    setTimeout(() => {
      setClaimModal(null); setExtraModal(false); setCustomChoreName("")
      setSelectedDate(null); setHour(""); setMinute(""); setPeriod("")
      setClaimFeedback(""); setHelpers([]); setRequestedPoints(null); setSubmitted(false)
      setShowCal(false); setShowTime(false)
      setIsCountingDown(false)
      setCountdown(0)
    }, 1800)
  }

  const handleClaim = () => {
    if (!currentUser) return;
    setIsCountingDown(true)
    setCountdown(5)
    
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleRevoke = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsCountingDown(false)
    setCountdown(0)
  }

  const closeModal = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setClaimModal(null); setExtraModal(false); setCustomChoreName("")
    setSelectedDate(null); setHour(""); setMinute(""); setPeriod("")
    setClaimFeedback(""); setHelpers([]); setSubmitted(false)
    setShowCal(false); setShowTime(false)
    setIsCountingDown(false)
    setCountdown(0)
  }

  const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage="chores" />

      <main className="flex-1 lg:ml-64 flex flex-col p-4 md:p-6">
        <div className="flex items-center justify-between mb-5 shrink-0 gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button 
              onClick={toggleSidebar}
              className="p-2 mt-1 rounded-lg bg-secondary hover:bg-muted transition-colors lg:hidden shrink-0"
            >
              <Menu className="w-6 h-6 text-muted-foreground" />
            </button>
            <div className="min-w-0">
              <h1 className="text-3xl md:text-5xl font-black text-[#ff59e3] italic tracking-tight uppercase truncate">Chore Queue</h1>
              <p className="text-muted-foreground mt-1 text-sm truncate">Fair rotation. No excuses.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={openExtraModal} className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border border-[#99f7ff]/30 bg-[#99f7ff]/10 text-[#99f7ff] font-black text-[10px] md:text-xs uppercase tracking-wider hover:bg-[#99f7ff]/20 transition-all">
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline">Extra Chores</span>
              <span className="xs:hidden">Extra</span>
            </button>
            <SyncButton />
            <button 
              onClick={toggleChat}
              className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
            >
              <Bot className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 flex-1">
          {CHORES.map((chore) => {
            const queue = (choreQueues as any)[chore.id]
            const Icon = chore.icon
            return (
              <div key={chore.id} className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
                <div className="p-4 pb-3 border-b border-border shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-5 h-5" style={{ color: chore.accent }} />
                    <h2 className="text-xs font-black text-white tracking-wider uppercase">{chore.name}</h2>
                  </div>
                </div>
                <div className="flex-1 p-3 space-y-2 custom-scrollbar">
                  {chore.isTeam ? (
                    (queue as string[][]).map((pair, idx) => (
                      <div key={idx} className={`rounded-lg p-2 border transition-all ${idx===0 ? "bg-gradient-to-r from-[#ff59e3]/15 to-transparent border-[#ff59e3]/40 shadow-[0_0_15px_rgba(255,89,227,0.1)]" : "bg-background/40 border-white/5 hover:border-white/10"}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {idx===0 && <span className="text-xs">👉</span>}
                          <span className={`text-[8px] font-black tracking-wider uppercase ${idx===0?"text-[#ff59e3]":"text-muted-foreground"}`}>{idx===0?"NEXT DUO":`DUO #${idx+1}`}</span>
                        </div>
                        <div className="flex gap-2">
                          {Array.isArray(pair) && pair.map(pid => { 
                            const p=getProfile(pid);
                            return (
                              <div key={pid} className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-7 h-7 rounded-full border border-white/20 overflow-hidden relative shrink-0"><Image src={p.animeImage||p.image} alt={p.name} fill className="object-cover" style={p.imgStyle}/></div>
                                <span className={`text-xs font-bold uppercase truncate ${idx===0?"text-white":"text-muted-foreground"}`}>{p.name}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    (queue as string[]).map((pid, idx) => {
                      const p = getProfile(pid)
                      const isNext = idx === 0
                      return (
                        <div key={idx} className={`flex items-center gap-2.5 rounded-lg p-2 border transition-all ${isNext?"bg-gradient-to-r from-[#ff59e3]/15 to-transparent border-[#ff59e3]/40 shadow-[0_0_15px_rgba(255,89,227,0.1)]":"bg-background/40 border-white/5 hover:border-white/10"}`}>
                          <div className="flex items-center gap-1 shrink-0">
                            {isNext && <span className="text-xs">👉</span>}
                            <span className={`text-[8px] font-black tracking-wider w-8 ${isNext?"text-[#ff59e3]":"text-muted-foreground"}`}>
                              {isNext ? "NEXT" : `#${idx + 1}`}
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-full border-2 overflow-hidden relative shrink-0" style={{borderColor:isNext?chore.accent:"rgba(255,255,255,0.1)"}}>
                            <Image src={p.animeImage||p.image} alt={p.name} fill className="object-cover" style={p.imgStyle}/>
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`text-xs font-bold uppercase truncate ${isNext?"text-white":"text-muted-foreground"}`}>
                              {p.name}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="p-3 pt-2 border-t border-border shrink-0">
                  <button
                    onClick={() => openClaimModal({ choreId: chore.id, choreName: chore.name, accent: chore.accent, isTeam: chore.isTeam })}
                    className="w-full py-2.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all duration-200 border"
                    style={{ background:`${chore.accent}15`, borderColor:`${chore.accent}50`, color:chore.accent }}
                  >♨️ MARK AS DONE</button>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* ─── Claim Modal ─── */}
      {claimModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
            style={{ boxShadow:`0 0 60px ${claimModal.accent}15` }}>
            <div className="h-0.5 w-full" style={{ background:`linear-gradient(90deg, transparent, ${claimModal.accent}, transparent)` }} />
            <div className="p-5">
              <button onClick={closeModal} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
              {submitted ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-wide uppercase mb-1">Logged! 🎉</h3>
                  <p className="text-muted-foreground text-sm">Chore claim recorded.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-base font-black text-white tracking-wide uppercase mb-0.5">
                    Mark Done: <span style={{ color: claimModal.accent }}>{claimModal.choreName}</span>
                  </h3>
                  <p className="text-muted-foreground text-xs mb-4 tracking-wide text-glow">Log your completion details.</p>
                  <div className="space-y-3 pointer-events-none opacity-50" style={!isCountingDown ? { pointerEvents: "auto", opacity: 1 } : {}}>
                    <div ref={calRef} className="relative">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Date</span>
                        <button onClick={setToday} className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full border" style={{ color: claimModal.accent, borderColor:`${claimModal.accent}40`, background:`${claimModal.accent}10` }}>Today</button>
                      </div>
                      <button onClick={() => { setShowCal(v=>!v); setShowTime(false) }} className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm text-white bg-[#0a0a0a]" style={{ borderColor: showCal ? `${claimModal.accent}60` : "rgba(255,255,255,0.08)" }}>
                        <span className="font-bold">{selectedDate ? formatDate(selectedDate) : "Pick a date..."}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      {showCal && <div className="absolute left-0 bottom-full mb-1 z-50 md:top-full md:bottom-auto md:mt-1"><MiniCalendar value={selectedDate} onChange={d=>{setSelectedDate(d);setShowCal(false)}} accent={claimModal.accent} /></div>}
                    </div>
                    <div ref={timeRef} className="relative">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Time</span>
                        <button onClick={setNow} className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full border" style={{ color: claimModal.accent, borderColor:`${claimModal.accent}40`, background:`${claimModal.accent}10` }}>Now</button>
                      </div>
                      <button onClick={() => { setShowTime(v=>!v); setShowCal(false) }} className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm text-white bg-[#0a0a0a]" style={{ borderColor: showTime ? `${claimModal.accent}60` : "rgba(255,255,255,0.08)" }}>
                        <span className="font-bold">{hour ? `${hour}:${minute} ${period}` : "Pick a time..."}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      {showTime && <div className="absolute left-0 bottom-full mb-1 z-50 md:top-full md:bottom-auto md:mt-1"><MiniTimePicker hour={hour} minute={minute} period={period} onHourChange={setHour} onMinuteChange={setMinute} onPeriodChange={setPeriod} accent={claimModal.accent} /></div>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 text-glow">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Helpers</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-[#0a0a0a] border border-white/5">
                        {PEOPLE.filter(pid => pid !== currentUser?.profileId).map(pid => {
                          const p = getProfile(pid); const isSelected = helpers.includes(pid)
                          return (
                            <button key={pid} onClick={() => toggleHelper(pid)} className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all ${isSelected ? "text-white" : "text-muted-foreground/30"}`} style={{ borderColor: isSelected ? claimModal.accent : "transparent", background: isSelected ? `${claimModal.accent}15` : "transparent" }}>
                              <div className={`w-4 h-4 rounded-full border border-white/10 overflow-hidden relative ${isSelected ? "" : "grayscale opacity-40"}`}><Image src={p.animeImage||p.image} alt={p.name} fill className="object-cover" style={p.imgStyle}/></div>
                              <span className="text-[9px] font-black uppercase tracking-wider">{p.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Notes</span>
                      </div>
                      <textarea value={claimFeedback} onChange={e=>setClaimFeedback(e.target.value)} placeholder="Optional details..." rows={2} className="w-full bg-[#0a0a0a] border border-white/8 rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none" />
                    </div>
                  </div>
                  <div className="flex gap-2.5 mt-4">
                    {!isCountingDown ? (
                      <>
                        <button onClick={closeModal} className="flex-1 py-2 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors text-xs uppercase tracking-wider">Cancel</button>
                        <button onClick={handleClaim} disabled={!selectedDate || !hour} className="flex-1 py-2 rounded-xl font-black tracking-wider transition-all text-xs uppercase disabled:opacity-30" style={{ background:`${claimModal.accent}20`, border:`1px solid ${claimModal.accent}50`, color:claimModal.accent }}>Submit</button>
                      </>
                    ) : (
                      <button onClick={handleRevoke} className="w-full py-2.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-500 font-black text-xs uppercase tracking-[0.2em] animate-pulse">
                        REVOKE SUBMISSION ({countdown}S)
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Extra Chore Modal ─── */}
      {extraModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden" style={{ boxShadow:`0 0 60px #99f7ff15` }}>
            <div className="h-0.5 w-full" style={{ background:`linear-gradient(90deg, transparent, #99f7ff, transparent)` }} />
            <div className="p-5">
              <button onClick={closeModal} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"><X className="w-4 h-4" /></button>
              {submitted ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-4"><CheckCircle2 className="w-8 h-8 text-green-400" /></div>
                  <h3 className="text-xl font-black text-white tracking-wide uppercase mb-1">Logged! 🎉</h3>
                  <p className="text-muted-foreground text-sm">Extra chore recorded.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-base font-black text-white tracking-wide uppercase mb-0.5">Log <span className="text-[#99f7ff]">Extra Chore</span></h3>
                  <p className="text-muted-foreground text-xs mb-4 tracking-wide text-glow">Enter details for a custom task.</p>
                  <div className="space-y-3 pointer-events-none opacity-50" style={!isCountingDown ? { pointerEvents: "auto", opacity: 1 } : {}}>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5"><PlusCircle className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Chore Name</span></div>
                      <input type="text" value={customChoreName} onChange={e=>setCustomChoreName(e.target.value)} placeholder="e.g. Car wash..." className="w-full bg-[#0a0a0a] border border-white/8 rounded-lg px-3 py-2 text-sm text-white focus:outline-none font-bold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5"><Star className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Request Reward Points</span></div>
                      <div className="flex gap-2">
                        {[25, 50, 75].map(points => (
                          <button
                            key={points}
                            onClick={() => setRequestedPoints(points)}
                            className={`flex-1 py-2 rounded-lg border transition-all text-xs font-black uppercase tracking-wider ${
                              requestedPoints === points
                                ? "text-white"
                                : "text-muted-foreground/30 hover:text-white"
                            }`}
                            style={{
                              borderColor: requestedPoints === points ? "#99f7ff" : "transparent",
                              background: requestedPoints === points ? "#99f7ff15" : "transparent"
                            }}
                          >
                            {points} pts
                          </button>
                        ))}
                      </div>
                    </div>
                    <div ref={calRef} className="relative">
                      <div className="flex items-center gap-2 mb-1.5"><Calendar className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Date</span><button onClick={setToday} className="ml-auto text-[8px] text-[#99f7ff] uppercase font-black px-2 py-0.5 rounded-full border border-[#99f7ff]/40 bg-[#99f7ff]/10">Today</button></div>
                      <button onClick={() => { setShowCal(v=>!v); setShowTime(false) }} className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm text-white bg-[#0a0a0a]" style={{ borderColor: showCal ? "#99f7ff60" : "rgba(255,255,255,0.08)" }}>
                        <span className="font-bold">{selectedDate ? formatDate(selectedDate) : "Pick a date..."}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      {showCal && <div className="absolute left-0 bottom-full mb-1 z-50 md:top-full md:bottom-auto md:mt-1"><MiniCalendar value={selectedDate} onChange={d=>{setSelectedDate(d);setShowCal(false)}} accent="#99f7ff" /></div>}
                    </div>
                    <div ref={timeRef} className="relative">
                      <div className="flex items-center gap-2 mb-1.5"><Clock className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Time</span><button onClick={setNow} className="ml-auto text-[8px] text-[#99f7ff] uppercase font-black px-2 py-0.5 rounded-full border border-[#99f7ff]/40 bg-[#99f7ff]/10">Now</button></div>
                      <button onClick={() => { setShowTime(v=>!v); setShowCal(false) }} className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm text-white bg-[#0a0a0a]" style={{ borderColor: showTime ? "#99f7ff60" : "rgba(255,255,255,0.08)" }}>
                        <span className="font-bold">{hour ? `${hour}:${minute} ${period}` : "Pick a time..."}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      {showTime && <div className="absolute left-0 bottom-full mb-1 z-50 md:top-full md:bottom-auto md:mt-1"><MiniTimePicker hour={hour} minute={minute} period={period} onHourChange={setHour} onMinuteChange={setMinute} onPeriodChange={setPeriod} accent="#99f7ff" /></div>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 text-glow"><Users className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Helpers</span></div>
                      <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-[#0a0a0a] border border-white/5">
                        {PEOPLE.filter(pid => pid !== currentUser?.profileId).map(pid => {
                          const p = getProfile(pid); const isSelected = helpers.includes(pid)
                          return (
                            <button key={pid} onClick={() => toggleHelper(pid)} className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all ${isSelected ? "text-white" : "text-muted-foreground/30"}`} style={{ borderColor: isSelected ? "#99f7ff" : "transparent", background: isSelected ? "#99f7ff15" : "transparent" }}>
                              <div className={`w-4 h-4 rounded-full border border-white/10 overflow-hidden relative ${isSelected ? "" : "grayscale opacity-40"}`}><Image src={p.animeImage||p.image} alt={p.name} fill className="object-cover" style={p.imgStyle}/></div>
                              <span className="text-[9px] font-black uppercase tracking-wider">{p.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5"><MessageSquare className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Notes</span></div>
                      <textarea value={claimFeedback} onChange={e=>setClaimFeedback(e.target.value)} placeholder="Additional details..." rows={2} className="w-full bg-[#0a0a0a] border border-white/8 rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none" />
                    </div>
                  </div>
                  <div className="flex gap-2.5 mt-5">
                    {!isCountingDown ? (
                      <>
                        <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors text-xs uppercase tracking-wider">Cancel</button>
                        <button onClick={handleClaim} disabled={!customChoreName || !selectedDate || !hour || !requestedPoints} className="flex-1 py-2.5 rounded-xl font-black tracking-wider transition-all text-xs uppercase disabled:opacity-30 shadow-[0_0_20px_rgba(153,247,255,0.1)]" style={{ background:`#99f7ff20`, border:`1px solid #99f7ff50`, color:"#99f7ff" }}>Log Extra</button>
                      </>
                    ) : (
                      <button onClick={handleRevoke} className="w-full py-2.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-500 font-black text-xs uppercase tracking-[0.2em] animate-pulse">
                        REVOKE SUBMISSION ({countdown}S)
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
