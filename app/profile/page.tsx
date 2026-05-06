"use client"

import GlassyButton from "@/components/auth/GlassyButton"
import { Sidebar } from "@/components/dashboard/sidebar"
import { SyncButton } from "@/components/SyncButton"
import { Pencil, RotateCcw, Calendar, Trash2, ShoppingCart, TrendingUp, Star, Home as HomeIcon, Camera, ChevronLeft, ChevronRight, Clock, Users, User, Mail, Phone, Lock, LogOut, Edit2, Droplets, Utensils, Bath, BarChart2, X, Sparkles } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import useAuthStore from "@/stores/useAuthStore"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { OPERATIVES } from "@/data/operatives"
import { useChoreStore } from "@/stores/useChoreStore"

const PEOPLE = ["sanjjay", "sougandh", "chris", "haady", "kichu"]

const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

const RANK_DATA: Record<string, { rank: string, medal: string, color: string }> = {
  sanjjay: { rank: "1ST", medal: "🏆", color: "text-yellow-400" },
  sougandh: { rank: "2ND", medal: "🥈", color: "text-[#adaaaa]" },
  chris: { rank: "3RD", medal: "🥉", color: "text-[#ff59e3]" },
  haady: { rank: "4TH", medal: "🎖️", color: "text-[#99f7ff]" },
  kichu: { rank: "5TH", medal: "🎖️", color: "text-white" }
};

const SkillDistribution = ({ stats }: { stats: any }) => {
  // Increased radius to 95 to fill the 200x200 box
  const getPoint = (angleDeg: number, value: number, radius: number = 95) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const statsValues = Object.values(stats) as number[];
    const maxStat = Math.max(...statsValues, 1);
    const r = (value / maxStat) * radius;
    return `${100 + r * Math.cos(angleRad)},${100 + r * Math.sin(angleRad)}`;
  };

  return (
    <div className="relative w-full flex items-center justify-center max-w-[180px] aspect-square">
      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        {/* Grids */}
        {[95, 70, 45, 20].map((r, i) => (
          <polygon 
            key={i}
            points={[0, 60, 120, 180, 240, 300].map(a => {
              const rad = (a - 90) * (Math.PI / 180);
              return `${100 + r * Math.cos(rad)},${100 + r * Math.sin(rad)}`;
            }).join(" ")}
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="1" 
          />
        ))}
        
        {/* Axises */}
        {[0, 60, 120, 180, 240, 300].map(a => {
          const rad = (a - 90) * (Math.PI / 180);
          return <line key={a} x1="100" y1="100" x2={100 + 95 * Math.cos(rad)} y2={100 + 95 * Math.sin(rad)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
        })}

        <polygon 
          points={`
            ${getPoint(0, stats.waste || 0)}
            ${getPoint(60, stats.water || 0)}
            ${getPoint(120, stats.kitchen || 0)}
            ${getPoint(180, stats.bathroom || 0)}
            ${getPoint(240, stats.house || 0)}
            ${getPoint(300, stats.extra || 0)}
          `} 
          fill="rgba(153,247,255,0.15)" 
          stroke="#99f7ff" 
          strokeWidth="3" 
          strokeLinejoin="round"
        />
      </svg>
      
      {/* Labels */}
      <span className="absolute top-[-25px] text-[8px] font-black text-[#99f7ff] tracking-widest text-center w-full uppercase">Waste</span>
      <span className="absolute top-[25%] right-[-30px] text-[8px] font-black text-[#99f7ff] tracking-widest uppercase">Water</span>
      <span className="absolute bottom-[20%] right-[-30px] text-[8px] font-black text-[#99f7ff] tracking-widest uppercase">Kitchen</span>
      <span className="absolute bottom-[-15px] text-[8px] font-black text-[#99f7ff] tracking-widest text-center w-full uppercase">Bathroom</span>
      <span className="absolute bottom-[20%] left-[-30px] text-[8px] font-black text-[#99f7ff] tracking-widest uppercase">House</span>
      <span className="absolute top-[25%] left-[-30px] text-[8px] font-black text-[#99f7ff] tracking-widest uppercase">Extra</span>
    </div>
  );
};

const CHORE_LIST = [
  { id: "waste", label: "Waste", icon: Trash2, color: "text-[#ff59e3]" },
  { id: "water", label: "Water Can", icon: Droplets, color: "text-[#99f7ff]" },
  { id: "kitchen", label: "Kitchen Cleaning", icon: Utensils, color: "text-[#ffb86c]" },
  { id: "bathroom", label: "Bathroom", icon: Bath, color: "text-[#8be9fd]" },
  { id: "house", label: "House Cleaning", icon: HomeIcon, color: "text-[#50fa7b]" },
  { id: "extra", label: "Extra Chore", icon: TrendingUp, color: "text-[#f1fa8c]" },
];

export default function ProfilePage() {
  const { currentUser: user, logout, updateProfile, profileOverrides = {} } = useAuthStore()
  const { completionStats, history } = useChoreStore()
  const router = useRouter()
  
  const pid = user?.profileId || ""
  const [selectedLog, setSelectedLog] = useState<{ pid: string, cid: string } | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const baseProfile = OPERATIVES.find(op => op.profileId === user?.profileId) || OPERATIVES[0]
  const safeOverrides = profileOverrides || {}
  const userOverride = safeOverrides[user?.profileId || ""] || {}
  const name = userOverride.name || user?.displayName || baseProfile.name
  const avatarSrc = baseProfile.animeImage || baseProfile.image
  const codename = userOverride.codename || baseProfile.codename
  const phone = userOverride.phone || ""
  const email = userOverride.email || user?.email || ""

  const currentRank = RANK_DATA[user?.profileId || "sanjjay"] || RANK_DATA["sanjjay"];

  const [currentDate, setCurrentDate] = useState(new Date(2026, new Date().getMonth(), 1))

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthName = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase()
  
  let firstDay = currentDate.getDay() - 1
  if (firstDay === -1) firstDay = 6 
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  // Get daily activities for the current month
  const getDailyActivities = () => {
    const activities: Record<number, { chores: string[], count: number }> = {};
    
    history.forEach(log => {
      if (log.loggerId === pid || log.helperIds?.includes(pid)) {
        // Exclude failed rewards and initial extra logs from calendar count to avoid double counting
        if (log.choreId === "reward-failed" || log.choreId === "extra") return;

        const logDate = new Date(log.timestamp);
        if (logDate.getFullYear() === currentDate.getFullYear() && 
            logDate.getMonth() === currentDate.getMonth()) {
          const day = logDate.getDate();
          if (!activities[day]) {
            activities[day] = { chores: [], count: 0 };
          }
          const effectiveCid = log.choreId === "reward" ? (log as any).category : log.choreId;
          activities[day].chores.push(effectiveCid);
          activities[day].count += 1;
        }
      }
    });
    
    return activities;
  };

  const dailyActivities = getDailyActivities();

  const getStat = (cid: string) => {
    return history.filter(h => {
      const isOwner = h.loggerId === pid || h.helperIds?.includes(pid);
      if (cid === "extra") {
        return isOwner && h.choreId === "reward" && (h as any).category === "extra";
      }
      return isOwner && h.choreId === cid;
    }).length;
  }

  const stats = {
    waste: getStat("waste"),
    water: getStat("water"),
    house: getStat("house"),
    kitchen: getStat("kitchen"),
    bathroom: getStat("bathroom"),
    extra: getStat("extra")
  }
  const totalLifetimeChores = Object.values(stats).reduce((a, b) => a + b, 0);
  
  const getProfile = (id: string) => {
    const base = OPERATIVES.find(op => op.profileId === id) || OPERATIVES[0];
    const safeOverrides = profileOverrides || {};
    const overrides = safeOverrides[id] || {};
    return {
      ...base,
      profileId: id,
      name: overrides.name || base.name,
      codename: overrides.codename || base.codename,
    };
  };

  const PEOPLE = ["sanjjay", "sougandh", "chris", "haady", "kichu"]
  const getRank = (cid: string, targetPid: string) => {
    const scores = PEOPLE.map(id => {
      return history.filter(h => {
        const isOwner = h.loggerId === id || h.helperIds?.includes(id);
        if (cid === "extra") {
          return isOwner && h.choreId === "reward" && (h as any).category === "extra";
        }
        return isOwner && h.choreId === cid;
      }).length;
    });
    
    const userScore = history.filter(h => {
      const isOwner = h.loggerId === targetPid || h.helperIds?.includes(targetPid);
      if (cid === "extra") {
        return isOwner && h.choreId === "reward" && (h as any).category === "extra";
      }
      return isOwner && h.choreId === cid;
    }).length;

    const uniqueScores = Array.from(new Set(scores)).sort((a, b) => b - a);
    return uniqueScores.indexOf(userScore) + 1;
  };
  
  const totalCompletions = CHORE_LIST.reduce((acc, c) => acc + getStat(c.id), 0);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isResetSuccess, setIsResetSuccess] = useState(false)
  const [newPasscode, setNewPasscode] = useState("")
  const [confirmPasscode, setConfirmPasscode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editCodename, setEditCodename] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editCountryCode, setEditCountryCode] = useState("+91")

  const COUNTRY_CODES = [
    { code: "+1", label: "US/CA (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+91", label: "IN (+91)" },
    { code: "+61", label: "AU (+61)" },
    { code: "+81", label: "JP (+81)" },
    { code: "+49", label: "DE (+49)" },
    { code: "+33", label: "FR (+33)" },
    { code: "+971", label: "AE (+971)" },
  ]

  const confirmInputRef = useRef<HTMLInputElement>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (editEmail.trim() && !emailRegex.test(editEmail.trim())) {
      toast.error("Please enter a valid email address.")
      return
    }

    const digitsOnly = editPhone.replace(/\D/g, "")
    if (digitsOnly.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.")
      return
    }

    const fullPhone = editPhone.trim() ? `${editCountryCode} ${editPhone.trim()}` : ""
    updateProfile({ 
      name: editName.trim(), 
      codename: editCodename.trim(), 
      phone: fullPhone,
      email: editEmail.trim()
    })
    toast.success("Profile updated!")
    setIsEditProfileModalOpen(false)
  }

  const handleResetPasscode = async () => {
    if (!newPasscode || newPasscode.length !== 4) {
      toast.error("Passcode must be exactly 4 digits.")
      return
    }
    if (newPasscode !== confirmPasscode) {
      toast.error("Passcodes do not match.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/passcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: user?.profileId,
          passcode: newPasscode
        })
      })

      if (res.ok) {
        toast.success("Passcode updated! Please login again.")
        setIsResetSuccess(true)
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update passcode.")
      }
    } catch (err) {
      toast.error("Error connecting to server.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activePage="profile" />

      <main className="flex-1 ml-64 flex flex-col overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{currentRank.medal}</div>
            <div className="flex flex-col">
              <span className={`text-xl font-black tracking-widest ${currentRank.color} leading-none mb-1`}>
                {currentRank.rank} PLACE
              </span>
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest leading-none">
                HOUSE RANKINGS
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <SyncButton />

          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 flex-1 min-h-0">
          <div className="bg-card rounded-xl border border-[#99f7ff]/25 p-5 relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 opacity-15">
              <Image src={avatarSrc} alt="Background" fill className="object-cover blur-sm" style={baseProfile.imgStyle} />
            </div>
            <div className="relative flex flex-col flex-1 min-h-0">
              <div className="relative flex items-center justify-between gap-6 mb-6 shrink-0 border-b border-white/10 pb-6">
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-full border-4 border-[#99f7ff] overflow-hidden relative shadow-[0_0_15px_rgba(153,247,255,0.3)]">
                    <Image src={avatarSrc} alt="Profile avatar" fill className="object-cover" style={baseProfile.imgStyle} />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-white uppercase tracking-wide">{name}</h2>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[#ff59e3] text-[10px] font-bold tracking-[0.2em] uppercase">{codename}</p>
                      {email && <p className="text-muted-foreground text-[10px] font-medium tracking-wider">{email}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0 relative right-[15px]">
                  <div className="flex flex-col gap-2.5">
                    <div className="w-[165px] h-[35px]">
                      <GlassyButton 
                        label="EDIT PROFILE"
                        icon={<Pencil className="w-3 h-3" />}
                        background="#99f7ff"
                        hoverBackground="#7ae8f0"
                        textColor="#000"
                        fontSize="11.5px"
                        borderRadius={8}
                        onClick={() => {
                          let parsedCode = "+91"
                          let parsedPhone = phone
                          for (const c of COUNTRY_CODES) {
                            if (phone.startsWith(c.code)) {
                              parsedCode = c.code
                              parsedPhone = phone.slice(c.code.length).trim()
                              break
                            }
                          }
                          setEditName(name)
                          setEditCodename(codename)
                          setEditCountryCode(parsedCode)
                          setEditPhone(parsedPhone)
                          setEditEmail(email)
                          setIsEditProfileModalOpen(true)
                        }}
                      />
                    </div>

                    <div className="w-[165px] h-[35px]">
                      <GlassyButton 
                        label="RESET PASSCODE"
                        icon={<Lock className="w-3 h-3" />}
                        background="rgba(0,0,0,0.4)"
                        hoverBackground="rgba(255,255,255,0.1)"
                        textColor="#fff"
                        fontSize="11.5px"
                        borderRadius={8}
                        onClick={() => {
                          setIsResetModalOpen(true)
                          setIsResetSuccess(false)
                          setNewPasscode("")
                          setConfirmPasscode("")
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 flex-1 min-h-0">
                <div className="flex gap-4 flex-[2.5] min-h-0">
                  <div className="flex-1 flex flex-col bg-black/40 rounded-xl p-4 border border-white/5 overflow-hidden">
                    <span className="text-sm text-white font-black tracking-widest uppercase mb-3 shrink-0">Chores Distribution</span>
                    <div className="flex flex-col gap-2 flex-1 overflow-y-hidden pr-1">
{CHORE_LIST.map(chore => (
                         <div key={chore.id} className="shrink-0">
                           <div className="flex justify-between text-[11px] font-black mb-1.5 tracking-wider">
                             <span className="text-white/90 uppercase">{chore.label}</span>
                             <span className={chore.color}>{stats[chore.id as keyof typeof stats]}</span>
                           </div>
                           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div 
                               className={`h-full rounded-full shadow-[0_0_5px_rgba(255,255,255,0.1)] transition-all duration-500`} 
                               style={{ 
                                 backgroundColor: chore.color === 'text-[#ff59e3]' ? '#ff59e3' : 
                                                 chore.color === 'text-[#99f7ff]' ? '#99f7ff' : 
                                                 chore.color === 'text-[#ffb86c]' ? '#ffb86c' : 
                                                 chore.color === 'text-[#8be9fd]' ? '#8be9fd' : 
                                                 chore.color === 'text-[#50fa7b]' ? '#50fa7b' : 
                                                 chore.color === 'text-[#f1fa8c]' ? '#f1fa8c' : 
                                                 '#99f7ff',
                                 width: `${totalLifetimeChores > 0 ? (stats[chore.id as keyof typeof stats] / totalLifetimeChores) * 100 : 0}%`
                               }}
                             ></div>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-start relative">
                    <span className="text-sm text-white font-black tracking-widest uppercase mb-4 self-start">Skill Distribution</span>
                    <div className="flex-1 flex items-center justify-center w-full">
                      <SkillDistribution stats={stats} />
                    </div>
                  </div>
                </div>

                {/* Personal Stats Box */}
                <div className="bg-background/40 rounded-xl border border-[#99f7ff]/20 p-3 flex flex-col shrink-0">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-[#99f7ff]" />
                      <h2 className="text-sm font-black text-white tracking-widest uppercase">Personal Stats</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 mb-3 shrink-0">
                    {CHORE_LIST.filter(c => c.id !== "extra").map(c => {
                      const Icon = c.icon;
                      const rank = getRank(c.id, pid);
                      return (
                        <button 
                          key={c.id} 
                          onClick={() => setSelectedLog({ pid, cid: c.id })}
                          className="flex flex-col items-center gap-1 bg-background/40 rounded-lg py-1.5 border border-white/5 hover:border-white/20 transition-all group"
                        >
                          <Icon className={`w-3.5 h-3.5 ${c.color}`} />
                          <span className="text-[10px] font-black text-white group-hover:text-[#99f7ff] transition-colors">#{rank}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2 shrink-0">
                    <button 
                      onClick={() => setSelectedLog({ pid, cid: "extra" })}
                      className="flex items-center justify-center gap-2 py-2 rounded-lg bg-[#99f7ff]/5 border border-[#99f7ff]/10 hover:bg-[#99f7ff]/10 transition-all group"
                    >
                      <TrendingUp className="w-3 h-3 text-[#99f7ff]" />
                      <span className="text-[10px] font-black text-[#99f7ff] uppercase tracking-wider text-center">EXTRA CHORES: #{getRank("extra", pid)}</span>
                    </button>

                    <button 
                      onClick={() => setSelectedLog({ pid, cid: "all" })} 
                      className="w-full bg-[#ff59e3]/10 hover:bg-[#ff59e3]/20 text-[#ff59e3] border border-[#ff59e3]/30 rounded-lg py-2 text-[10px] font-black tracking-[0.2em] transition-all uppercase"
                    >
                      ⚡ VIEW LOGS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Matrix */}
          <div className="bg-card rounded-xl border border-border p-5 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="w-5 h-5 text-[#ff59e3]" />
                <h2 className="text-base font-bold text-white uppercase tracking-tight">Activity Matrix</h2>
              </div>
              <div className="flex items-center gap-1 bg-background/50 rounded-lg px-2 py-1 border border-border">
                <button onClick={handlePrevMonth} className="text-muted-foreground hover:text-white transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] tracking-widest text-[#99f7ff] w-[100px] text-center font-bold uppercase">{monthName}</span>
                <button onClick={handleNextMonth} className="text-muted-foreground hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mt-4 flex-1 content-start overflow-y-auto custom-scrollbar pr-1">
              {weekDays.map((d) => <div key={d} className="text-center text-[10px] text-muted-foreground font-bold">{d}</div>)}
              {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
              {[...Array(daysInMonth)].map((_, i) => {
                const dayNum = i + 1;
                const activities = dailyActivities[dayNum];
                const hasActivities = activities && activities.count > 0;
                
                return (
                  <button 
                    key={dayNum} 
                    onClick={() => setSelectedDay(selectedDay === dayNum ? null : dayNum)}
                    className={`rounded-xl border flex flex-col items-center justify-center relative aspect-square transition-all hover:border-[#99f7ff]/50 ${hasActivities ? "border-[#99f7ff]/25 bg-[#99f7ff]/5 shadow-[inset_0_0_20px_rgba(153,247,255,0.05)] cursor-pointer" : "border-white/5 bg-white/2"}`}
                  >
                    <span className="text-[10px] absolute top-1.5 left-2 text-muted-foreground/60 font-bold">{dayNum}</span>
                    {hasActivities && (
                      activities.count === 1 ? (
                        (() => {
                          const Icon = CHORE_LIST.find(c => c.id === activities.chores[0])?.icon || Trash2;
                          return <Icon className="w-5 h-5 text-[#99f7ff] drop-shadow-[0_0_10px_rgba(153,247,255,0.3)]" />;
                        })()
                      ) : (
                        <span className="text-[#99f7ff] font-bold text-sm">+{activities.count}</span>
                      )
                    )}
                  </button>
                )
              })}
            </div>
            {selectedDay && dailyActivities[selectedDay] && (
              <div className="mt-4 p-3 bg-background/50 rounded-lg border border-[#99f7ff]/20 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#99f7ff] uppercase tracking-wider">
                    {monthName.split(' ')[0]} {selectedDay} Activities
                  </span>
                  <button 
                    onClick={() => setSelectedDay(null)}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {dailyActivities[selectedDay].chores.map((choreId: any, index: number) => {
                    const chore = CHORE_LIST.find(c => c.id === choreId);
                    if (!chore) return null;
                    const Icon = chore.icon;
                    return (
                      <div key={index} className="flex items-center gap-1 bg-[#99f7ff]/10 rounded px-2 py-1 border border-[#99f7ff]/20">
                        <Icon className="w-4 h-4 text-[#99f7ff]" />
                        <span className="text-xs font-bold text-[#99f7ff] uppercase">{chore.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals ... */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#131313] border border-[#00f1fe] shadow-[0_0_30px_rgba(0,241,254,0.3)] rounded-xl p-8 max-w-sm w-full flex flex-col gap-6">
            <h2 className="text-xl font-bold text-[#00f1fe] tracking-widest text-center">
              {isResetSuccess ? "PASSCODE UPDATED" : "RESET PASSCODE"}
            </h2>
            
            {isResetSuccess ? (
              <div className="flex flex-col items-center gap-6">
                <p className="text-sm text-center text-muted-foreground">
                  Your passcode has been successfully updated. You must log out to apply the changes.
                </p>
                <button 
                  onClick={() => {
                    const profileId = user?.profileId
                    logout()
                    router.push(`/login?view=passcode&profileId=${profileId}`)
                  }}
                  className="w-full py-3 rounded-lg bg-[#00f1fe] text-black hover:bg-[#00f1fe]/90 transition-colors uppercase tracking-widest text-xs font-bold"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">New Passcode</label>
                    <input 
                      type="password" 
                      maxLength={4}
                      value={newPasscode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setNewPasscode(val);
                        if (val.length === 4) {
                          confirmInputRef.current?.focus();
                        }
                      }}
                      className="w-full bg-black/50 border border-border rounded-lg p-3 text-white text-center tracking-[1em] focus:border-[#00f1fe] focus:outline-none transition-colors"
                      placeholder="••••"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">Re-enter Passcode</label>
                    <input 
                      ref={confirmInputRef}
                      type="password" 
                      maxLength={4}
                      value={confirmPasscode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setConfirmPasscode(val);
                        if (val.length === 4) {
                          saveButtonRef.current?.focus();
                        }
                      }}
                      className="w-full bg-black/50 border border-border rounded-lg p-3 text-white text-center tracking-[1em] focus:border-[#00f1fe] focus:outline-none transition-colors"
                      placeholder="••••"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => {
                      setIsResetModalOpen(false)
                      setNewPasscode("")
                      setConfirmPasscode("")
                    }}
                    className="flex-1 py-3 rounded-lg border border-border text-muted-foreground hover:text-white transition-colors uppercase tracking-widest text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    ref={saveButtonRef}
                    onClick={handleResetPasscode}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-lg bg-[#00f1fe] text-black hover:bg-[#00f1fe]/90 transition-colors uppercase tracking-widest text-xs font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#131313] border border-[#99f7ff] shadow-[0_0_30px_rgba(153,247,255,0.3)] rounded-xl p-8 max-w-md w-full flex flex-col gap-6">
            <h2 className="text-xl font-bold text-[#99f7ff] tracking-widest text-center">
              EDIT PROFILE
            </h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">Display Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-black/50 border border-border rounded-lg p-3 text-white focus:border-[#99f7ff] focus:outline-none transition-colors"
                  placeholder="Enter display name"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">Nickname (Codename)</label>
                <input 
                  type="text" 
                  value={editCodename}
                  onChange={(e) => setEditCodename(e.target.value)}
                  className="w-full bg-black/50 border border-border rounded-lg p-3 text-white focus:border-[#99f7ff] focus:outline-none transition-colors"
                  placeholder="e.g. JAGERMEISTER"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-black/50 border border-border rounded-lg p-3 text-white focus:border-[#99f7ff] focus:outline-none transition-colors"
                  placeholder="e.g. operative@chorewars.com"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">Phone Number</label>
                <div className="flex gap-2">
                  <select 
                    value={editCountryCode}
                    onChange={(e) => setEditCountryCode(e.target.value)}
                    className="w-[110px] bg-black/50 border border-border rounded-lg p-3 text-white text-xs"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input 
                    type="tel" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="flex-1 bg-black/50 border border-border rounded-lg p-3 text-white"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setIsEditProfileModalOpen(false)}
                className="flex-1 py-3 rounded-lg border border-border text-muted-foreground hover:text-white transition-colors uppercase tracking-widest text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                className="flex-1 py-3 rounded-lg bg-[#99f7ff] text-black hover:bg-[#99f7ff]/90 transition-colors uppercase tracking-widest text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-[#131313] border border-[#99f7ff]/30 shadow-[0_0_50px_rgba(153,247,255,0.15)] rounded-2xl w-full max-w-xl flex flex-col overflow-hidden max-h-[80vh]">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-[#99f7ff] overflow-hidden relative shadow-[0_0_15px_rgba(153,247,255,0.2)]">
                  <Image src={avatarSrc} alt="" fill className="object-cover" style={baseProfile.imgStyle} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      if (selectedLog.cid === "all") return <Clock className="w-4 h-4 text-[#99f7ff]" />;
                      const c = CHORE_LIST.find(cx => cx.id === selectedLog.cid);
                      const Icon = c?.icon || TrendingUp;
                      return <Icon className={`w-4 h-4 ${c?.color}`} />;
                    })()}
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                      {selectedLog.cid === "all" ? "ALL CHORES" : CHORE_LIST.find(c => c.id === selectedLog.cid)?.label} LOGS
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase mt-0.5">{name} • CODENAME: {codename}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1 p-6 flex flex-col min-h-0">
              <div className="flex gap-4 mb-8">
                <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Total Completions</span>
                  <span className="text-3xl font-black text-[#99f7ff]">
                    {selectedLog.cid === "all" 
                      ? CHORE_LIST.reduce((sum, c) => sum + getStat(c.id), 0)
                      : getStat(selectedLog.cid)}
                  </span>
                </div>
                <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Current Rank</span>
                  <span className="text-3xl font-black text-[#ff59e3]">#{getRank(selectedLog.cid, selectedLog.pid)}</span>
                </div>
              </div>

              <div className="flex flex-col min-h-0 flex-1">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2 flex-shrink-0">
                  <Clock className="w-3 h-3" /> CHRONOLOGICAL DOSSIER
                </h3>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                
                {(() => {
                  const activeLogs = history.filter(h => 
                    (selectedLog.cid === "all" ? true : (h.choreId === selectedLog.cid || (h as any).category === selectedLog.cid)) && 
                    (h.loggerId === selectedLog.pid || (h.helperIds && h.helperIds.includes(selectedLog.pid)))
                  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                  if (activeLogs.length > 0 || (selectedLog.cid !== "all" && (completionStats[selectedLog.cid]?.[selectedLog.pid]?.count || 0) > 0)) {
                    return (
                      <>
                        {activeLogs.map((log, i) => {
                          const otherParticipants: string[] = [];
                          if (log.loggerId !== selectedLog.pid) otherParticipants.push(log.loggerId);
                          if (log.helperIds) {
                            log.helperIds.forEach(hid => {
                              if (hid !== selectedLog.pid) otherParticipants.push(hid);
                            });
                          }

                          return (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-[#99f7ff]/30 transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {selectedLog.cid === "all" && (
                                    <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                                      {(() => {
                                        const c = CHORE_LIST.find(cx => cx.id === log.choreId);
                                        const Icon = c?.icon || TrendingUp;
                                        return <Icon className={`w-4 h-4 ${c?.color}`} />;
                                      })()}
                                    </div>
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs font-black text-white uppercase tracking-wide">
                                      {log.customName || (log.choreId === "extra" ? "Extra Chore" : (new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })))}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-bold tracking-widest">
                                      {log.customName || log.choreId === "extra" ? 
                                        new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " • " + new Date(log.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) :
                                        new Date(log.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                                      }
                                    </span>
                                  </div>
                                </div>
                                
                                {otherParticipants.length > 0 && (
                                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Users className="w-3 h-3 text-[#99f7ff]" />
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">{otherParticipants.length > 1 ? "Partners:" : "Partner:"}</span>
                                    <span className="text-[10px] font-black text-white uppercase flex gap-2">
                                      {otherParticipants.map((pid, idx) => (
                                        <span key={pid}>
                                          {getProfile(pid).name}{idx < otherParticipants.length - 1 ? "," : ""}
                                        </span>
                                      ))}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {log.pointsEarned !== undefined ? (
                                <div className="mt-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20 w-fit">
                                  <Star className={`w-3 h-3 ${log.pointsEarned > 0 ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                                  <span className={`text-[10px] font-black uppercase tracking-wider ${log.pointsEarned > 0 ? "text-yellow-400" : "text-muted-foreground"}`}>
                                    {log.pointsEarned > 0 ? `+${log.pointsEarned} REWARD POINTS` : "NO POINTS AWARDED"}
                                  </span>
                                </div>
                              ) : log.choreId === 'extra' ? (
                                <div className="mt-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-400/10 border border-blue-400/20 w-fit">
                                  <Clock className="w-3 h-3 text-blue-400" />
                                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                                    PENDING APPROVAL
                                  </span>
                                </div>
                              ) : null}

                              {log.notes && (
                                <div className="mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                                  <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                                    "{log.notes}"
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {selectedLog.cid !== "all" && (completionStats[selectedLog.cid]?.[selectedLog.pid]?.count || 0) > activeLogs.length && (
                          <div className="space-y-3">
                            {completionStats[selectedLog.cid]?.[selectedLog.pid]?.lastDone && (
                              <div className="bg-[#99f7ff]/10 border border-[#99f7ff]/30 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(153,247,255,0.05)]">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs font-black text-[#99f7ff] uppercase tracking-wide">Last Known Activity</span>
                                  <span className="text-[10px] text-white font-black tracking-widest uppercase">
                                    {new Date(completionStats[selectedLog.cid]?.[selectedLog.pid]?.lastDone!).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} • {new Date(completionStats[selectedLog.cid]?.[selectedLog.pid]?.lastDone!).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                <div className="bg-[#99f7ff]/20 px-2 py-1 rounded text-[8px] font-black text-[#99f7ff] uppercase">Verified</div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    );
                  }
                  return (
                    <div className="flex flex-col items-center justify-center py-10 opacity-30">
                      <Clock className="w-8 h-8 mb-2" />
                      <p className="text-xs font-black uppercase tracking-widest text-center">No classified logs found.</p>
                    </div>
                  );
                })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
