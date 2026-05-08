"use client"

import { useState } from "react"

import Link from "next/link"
import { Home, BarChart3, ClipboardList, Users, User, LogOut, Dices, AlertTriangle } from "lucide-react"
import useAuthStore from "@/stores/useAuthStore"
import { OPERATIVES } from "@/data/operatives"

interface SidebarProps {
  activePage?: "home" | "chores" | "leaderboard" | "roommates" | "luckyspin" | "profile"
}

const navItems = [
  { id: "home",        label: "Home",        icon: Home,         href: "/"            },
  { id: "chores",      label: "Chores",      icon: ClipboardList,href: "/chores"      },
  { id: "leaderboard", label: "Leaderboard", icon: BarChart3,    href: "/leaderboard" },
  { id: "roommates",   label: "Roommates",   icon: Users,        href: "/roommates"   },
  { id: "luckyspin",   label: "Unlucky Spin",icon: Dices,        href: "/luckyspin"   },
  { id: "profile",     label: "Profile",     icon: User,         href: "/profile"     },
]

import { useUIStore } from "@/stores/useUIStore"
import { Menu, X as CloseIcon } from "lucide-react"

export function Sidebar({ activePage = "home" }: SidebarProps) {
  const { currentUser } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isSidebarOpen, setSidebarOpen } = useUIStore()
  
  // Get profile data from OPERATIVES
  const profile = OPERATIVES.find(op => 
    op.profileId === currentUser?.profileId || 
    op.name.toLowerCase() === currentUser?.username?.toLowerCase()
  ) || OPERATIVES[0];

  const displayName = currentUser?.displayName || profile.name;
  const avatarUrl = profile.animeImage || profile.image;
  const avatarStyle = profile.imgStyle;

  return (
    <>
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <nav className={`fixed left-0 top-0 h-screen flex flex-col py-5 px-5 z-50 bg-[#0e0e0e]/95 backdrop-blur-2xl w-64 border-r border-white/5 shadow-[10px_0_30px_-15px_rgba(0,242,255,0.12)] transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

      {/* Close button for mobile */}
      <button 
        onClick={() => setSidebarOpen(false)}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white lg:hidden z-20"
      >
        <CloseIcon className="w-5 h-5" />
      </button>

      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:12px_12px]" />

      {/* ── LOGO ── */}
      <div className="flex flex-col items-center mb-5 relative z-10 select-none">
        <h1 className="text-3xl font-black tracking-wider leading-none sidebar-glitch" style={{ fontFamily: 'Audiowide, sans-serif', letterSpacing: '0.05em' }}>
          <span className="text-[#99f7ff]">CHORE</span>
          <span className="text-[#ff59e3]">WARS</span>
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-[#99f7ff] via-[#ff59e3] to-[#99f7ff] mt-2 opacity-60" />
      </div>

      {/* ── AVATAR ── */}
      <div className="flex flex-col items-center mb-3 relative z-10">
        <div className="relative rounded-xl overflow-hidden border-2 border-[#99f7ff]/70 shadow-[0_0_20px_rgba(0,242,255,0.3)] bg-gradient-to-b from-[#99f7ff]/10 via-black to-[#ff59e3]/10 group w-52 h-52">
          {/* Energy shards */}
          <div className="energy-shard absolute w-1.5 h-3 bottom-0 left-1/4" style={{ animationDelay: "0s" }} />
          <div className="energy-shard absolute w-1 h-2.5 bottom-0 right-1/3" style={{ animationDelay: "0.6s" }} />
          <div className="energy-shard absolute w-2 h-4 bottom-0 left-2/3" style={{ animationDelay: "1.3s" }} />

          <img
            alt={`${displayName} Avatar`}
            className="w-full h-full object-cover object-top neon-pulse group-hover:scale-105 transition-transform duration-700"
            src={avatarUrl}
            style={avatarStyle}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0e0e0e]/70 pointer-events-none" />

          {/* Corner accents */}
          <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#99f7ff]" />
          <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#ff59e3]" />
          <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#99f7ff]" />
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#ff59e3]" />
        </div>

        {/* Name */}
        <h2 className="text-xl font-black text-white tracking-[0.18em] mt-2.5 uppercase text-glow" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          {displayName}
        </h2>
        <div className="h-px w-12 bg-[#99f7ff]/30 mt-1.5" />
      </div>

      {/* ── NAV ── */}
      <ul className="flex flex-col gap-1 relative z-10 mt-[2px]">
        {navItems.map((item, index) => {
          const isActive = activePage === item.id
          const isMagenta = index % 2 !== 0
          const Icon = item.icon

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                className={`nav-btn flex items-center gap-3 py-2.5 px-3 rounded-lg tracking-tight border-l-4 ${
                  isActive
                    ? isMagenta
                      ? "text-[#ff59e3] bg-[#1c1b1b] border-[#ff59e3] shadow-[0_0_12px_rgba(255,89,227,0.15)] translate-x-0.5 nav-active-magenta"
                      : "text-[#99f7ff] bg-[#1c1b1b] border-[#99f7ff] shadow-[0_0_12px_rgba(0,242,255,0.15)] translate-x-0.5 nav-active-cyan"
                    : `text-[#adaaaa] border-transparent ${
                        isMagenta
                          ? "hover:text-[#ff59e3] hover:bg-[#1c1b1b] hover:border-[#ff59e3]"
                          : "hover:text-[#99f7ff] hover:bg-[#1c1b1b] hover:border-[#99f7ff]"
                      } hover:translate-x-0.5`
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-medium text-sm">{item.label.toUpperCase()}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Spacer to push logout to bottom */}
      <div className="flex-1" />

      {/* ── LOGOUT ── */}
      <div className="relative z-10 pt-3 border-t border-white/5">
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
          className="flex items-center gap-3 py-2.5 px-3 rounded-lg tracking-tight text-[#ff716c] hover:bg-[#1c1b1b] hover:translate-x-0.5 transition-all duration-200 border-l-4 border-transparent hover:border-[#ff716c] w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-medium text-sm">LOG OUT</span>
        </button>
      </div>


      {/* ── ANIMATIONS ── */}
      <style jsx>{`
        @keyframes neonPulse {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(0,242,255,0.35)) brightness(1); }
          50%       { filter: drop-shadow(0 0 14px rgba(0,242,255,0.7)) brightness(1.15); }
        }
        .neon-pulse { animation: neonPulse 3s ease-in-out infinite; }

        @keyframes energyShards {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          50%  { opacity: 0.8; }
          100% { transform: translateY(-80px) rotate(360deg); opacity: 0; }
        }
        .energy-shard {
          background: linear-gradient(135deg, rgba(0,242,255,0.7), rgba(255,89,227,0.7));
          clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
          animation: energyShards 2s infinite linear;
        }

        @keyframes textGlowMulti {
          0%, 100% { text-shadow: 0 0 8px rgba(0,242,255,0.7), 0 0 16px rgba(0,242,255,0.4); }
          50%       { text-shadow: 0 0 12px rgba(0,242,255,0.9), 0 0 22px rgba(255,89,227,0.6); }
        }
        .text-glow { animation: textGlowMulti 2.5s ease-in-out infinite; }

        @keyframes glitchScan {
          0%, 94%, 100% { transform: skew(0deg); text-shadow: 0 0 6px rgba(0,242,255,0.5); }
          96% { transform: skew(-8deg); text-shadow: 2px 0 0 rgba(255,89,227,0.8), -2px 0 0 rgba(0,242,255,0.8); }
          98% { transform: skew(8deg);  text-shadow: -2px 0 0 rgba(255,89,227,0.8), 2px 0 0 rgba(0,242,255,0.8); }
        }
        .sidebar-glitch { animation: glitchScan 5s infinite; }

        /* Nav button base transition */
        .nav-btn {
          transition: transform 0.2s ease, background-color 0.2s ease,
                      color 0.2s ease, border-color 0.2s ease,
                      box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        /* Ripple sweep on hover */
        .nav-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(153,247,255,0.07) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.35s ease;
        }
        .nav-btn:hover::after { transform: translateX(100%); }

        /* Active cyan glow pulse */
        @keyframes activeGlowCyan {
          0%, 100% { box-shadow: 0 0 8px rgba(0,242,255,0.15); }
          50%       { box-shadow: 0 0 18px rgba(0,242,255,0.35); }
        }
        .nav-active-cyan { animation: activeGlowCyan 2.5s ease-in-out infinite; }

        /* Active magenta glow pulse */
        @keyframes activeGlowMagenta {
          0%, 100% { box-shadow: 0 0 8px rgba(255,89,227,0.15); }
          50%       { box-shadow: 0 0 18px rgba(255,89,227,0.35); }
        }
        .nav-active-magenta { animation: activeGlowMagenta 2.5s ease-in-out infinite; }
      `}</style>
      </nav>

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2 tracking-wide">CONFIRM LOGOUT</h3>
            <p className="text-muted-foreground text-sm mb-6">Are you sure you want to log out of your session?</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-white font-bold tracking-wider hover:bg-white/5 transition-colors text-sm"
              >
                CANCEL
              </button>
              <button 
                onClick={() => {
                  useAuthStore.getState().logout();
                  window.location.href = "/login";
                }}
                className="flex-1 py-2.5 rounded-lg bg-[#ff716c]/20 border border-[#ff716c]/50 text-[#ff716c] font-bold tracking-wider hover:bg-[#ff716c]/30 hover:border-[#ff716c] transition-all text-sm shadow-[0_0_15px_rgba(255,113,108,0.2)] hover:shadow-[0_0_20px_rgba(255,113,108,0.4)]"
              >
                LOG OUT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
