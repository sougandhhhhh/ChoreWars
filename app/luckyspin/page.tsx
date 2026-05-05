"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { OPERATIVES } from "@/data/operatives"
import { Dices, Check, X, Skull, Bot } from "lucide-react"
import Image from "next/image"

// Slice colors following the cyberpunk theme
const SLICE_COLORS = [
  { fill: "rgba(153, 247, 255, 0.15)", stroke: "#99f7ff", text: "#99f7ff" }, // Cyan
  { fill: "rgba(255, 89, 227, 0.15)", stroke: "#ff59e3", text: "#ff59e3" }, // Magenta
  { fill: "rgba(250, 204, 21, 0.15)", stroke: "#facc15", text: "#facc15" }, // Yellow
  { fill: "rgba(192, 132, 252, 0.15)", stroke: "#c084fc", text: "#c084fc" }, // Purple
  { fill: "rgba(56, 189, 248, 0.15)", stroke: "#38bdf8", text: "#38bdf8" }, // Light Blue
  { fill: "rgba(74, 222, 128, 0.15)", stroke: "#4ade80", text: "#4ade80" }, // Green
]

export default function LuckySpinPage() {
  const [participants, setParticipants] = useState(
    OPERATIVES.slice(0, 5).map(op => ({
      id: op.profileId,
      name: op.name,
      avatar: op.animeImage || op.image,
      active: true
    }))
  )
  
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)

  const activeParticipants = participants.filter(p => p.active)
  const numSlices = activeParticipants.length
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const currentDeflection = useRef(0);
  const previousPegDist = useRef(-360);

  useEffect(() => {
    let animationFrameId: number;
    let isActive = true;

    const updatePointer = () => {
      if (!isActive) return;

      if (wheelRef.current && pointerRef.current) {
        const style = window.getComputedStyle(wheelRef.current);
        const transform = style.transform;
        
        let normalizedRotation = 0;
        if (transform && transform !== 'none') {
          const values = transform.split('(')[1].split(')')[0].split(',');
          const a = parseFloat(values[0]);
          const b = parseFloat(values[1]);
          const currentRotation = Math.round(Math.atan2(b, a) * (180 / Math.PI));
          normalizedRotation = (currentRotation + 360) % 360;
        }

        const anglePerSlice = 360 / numSlices;
        let approachingPegDist = -360;
        
        for (let i = 0; i < numSlices; i++) {
          const pegAngle = (i * anglePerSlice + normalizedRotation) % 360;
          let dist = pegAngle - 270;
          if (dist >= 0) dist -= 360;
          
          if (dist > approachingPegDist) {
            approachingPegDist = dist;
          }
        }

        let targetDeflection = 0;
        const interactionAngle = Math.min(20, anglePerSlice / 2);
        
        if (approachingPegDist > -interactionAngle) {
          const ratio = (interactionAngle + approachingPegDist) / interactionAngle;
          targetDeflection = ratio * -35; 
        }

        if (!isSpinning) {
           targetDeflection = 0;
        }

        previousPegDist.current = approachingPegDist;

        if (targetDeflection < currentDeflection.current) {
          currentDeflection.current = targetDeflection;
        } else {
          currentDeflection.current += (targetDeflection - currentDeflection.current) * 0.4;
          if (Math.abs(currentDeflection.current) < 0.1) currentDeflection.current = 0;
        }

        pointerRef.current.style.transform = `rotate(${currentDeflection.current}deg)`;
      }
      
      if (isSpinning || Math.abs(currentDeflection.current) > 0.1) {
        animationFrameId = requestAnimationFrame(updatePointer);
      }
    };

    if (isSpinning || Math.abs(currentDeflection.current) > 0.1) {
      animationFrameId = requestAnimationFrame(updatePointer);
    }

    return () => {
      isActive = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isSpinning, numSlices]);

  const toggleParticipant = (id: string) => {
    if (isSpinning) return;
    setParticipants(prev => {
      const next = prev.map(p => p.id === id ? { ...p, active: !p.active } : p);
      // Ensure at least 2 participants remain active
      if (next.filter(p => p.active).length < 2) return prev;
      return next;
    })
    setWinner(null); // Reset winner if options change
  }

  const spinWheel = () => {
    if (isSpinning || numSlices < 2) return;
    
    setIsSpinning(true);
    setWinner(null);

    // 1. Pick a totally random winner index using cryptographically secure randomness
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const winningIndex = randomBuffer[0] % numSlices;
    
    // 2. Calculate angles
    const sliceAngle = 360 / numSlices;
    const sliceCenter = (winningIndex * sliceAngle) + (sliceAngle / 2);
    
    // 3. Add random jitter within the slice so it doesn't land exactly in the center every time
    // Using a second random value for jitter
    window.crypto.getRandomValues(randomBuffer);
    const jitterFactor = (randomBuffer[0] / 0xFFFFFFFF) * 2 - 1; // Normalized to -1 to 1
    const maxJitter = (sliceAngle / 2) * 0.8;
    const jitter = jitterFactor * maxJitter;
    
    // 4. Calculate required rotation
    const targetRotation = 270 - sliceCenter + jitter;
    
    // 5. Add random number of full extra spins (between 5 and 10) for a "dice throw" feel
    window.crypto.getRandomValues(randomBuffer);
    const extraSpinsCount = 5 + (randomBuffer[0] % 6); // 5, 6, 7, 8, 9, or 10
    const extraSpins = 360 * extraSpinsCount; 
    
    // Ensure we always rotate forward from current position
    const currentMod = rotation % 360;
    const offsetToTarget = (targetRotation - currentMod + 360) % 360;
    const newRotation = rotation + offsetToTarget + extraSpins;

    setRotation(newRotation);

    // Wait for CSS transition to finish (4s) before declaring winner
    setTimeout(() => {
      setWinner(activeParticipants[winningIndex].name);
      setIsSpinning(false);
    }, 4000);
  }

  // SVG drawing helpers
  const createSlicePath = (index: number, total: number, radius: number) => {
    const anglePerSlice = 360 / total;
    const startAngle = (index * anglePerSlice) * (Math.PI / 180);
    const endAngle = ((index + 1) * anglePerSlice) * (Math.PI / 180);
    
    const x1 = 200 + radius * Math.cos(startAngle);
    const y1 = 200 + radius * Math.sin(startAngle);
    const x2 = 200 + radius * Math.cos(endAngle);
    const y2 = 200 + radius * Math.sin(endAngle);

    // If there's only 1 active (shouldn't happen due to logic, but just in case), draw a circle
    if (total === 1) {
      return `M 200,200 m -${radius},0 a ${radius},${radius} 0 1,0 ${radius*2},0 a ${radius},${radius} 0 1,0 -${radius*2},0`;
    }

    const largeArcFlag = anglePerSlice > 180 ? 1 : 0;

    return `M 200,200 L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
  };

  const getTextPosition = (index: number, total: number, radius: number) => {
    const anglePerSlice = 360 / total;
    const midAngle = (index * anglePerSlice + anglePerSlice / 2) * (Math.PI / 180);
    
    // Place text closer to edge
    const textRadius = radius * 0.7;
    return {
      x: 200 + textRadius * Math.cos(midAngle),
      y: 200 + textRadius * Math.sin(midAngle),
      angle: (index * anglePerSlice + anglePerSlice / 2)
    };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activePage="luckyspin" />

      <main className="flex-1 ml-64 flex overflow-hidden p-8 relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(153,247,255,0.05)_0%,transparent_60%)] pointer-events-none" />
        
        {/* Header */}
        <div className="absolute top-8 right-8 z-20">
          <button className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors">
            <Bot className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="relative z-10 flex w-full h-full gap-8 max-w-6xl mx-auto items-center">
          
          {/* LEFT PANEL: Controls */}
          <div className="w-[300px] flex flex-col h-full pb-8 pt-0 -mt-3">
            <h1 className="text-5xl font-black text-[#ff59e3] italic tracking-tight mb-2">
              UNLUCKY SPIN
            </h1>
            <p className="text-muted-foreground text-xs tracking-wider mb-5 mt-1 uppercase">
              Configure targets. Initiate spin. Accept fate.
            </p>

            <div className="bg-black/40 rounded-xl p-5 border border-white/10 flex-1 flex flex-col">
              <h2 className="text-sm text-white font-bold tracking-widest mb-4">TARGETS IN POOL</h2>
              
              <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {participants.map((p, idx) => {
                  const color = SLICE_COLORS[idx % SLICE_COLORS.length];
                  return (
                    <button 
                      key={p.id}
                      onClick={() => toggleParticipant(p.id)}
                      disabled={isSpinning}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        p.active 
                          ? 'bg-white/5 border-white/20 hover:border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                          : 'bg-black/50 border-white/5 opacity-40 hover:opacity-70'
                      } ${isSpinning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`relative w-10 h-10 rounded-full border-2 overflow-hidden ${p.active ? 'border-[#99f7ff] shadow-[0_0_10px_rgba(0,242,255,0.5)]' : 'border-gray-600 grayscale'}`}>
                          <Image src={p.avatar} alt={p.name} fill className="object-cover" />
                        </div>
                        <span className={`text-lg font-black tracking-widest ${p.active ? 'text-white' : 'text-muted-foreground line-through'}`}>
                          {p.name.toUpperCase()}
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${p.active ? 'bg-[#ff59e3]/20 text-[#ff59e3]' : 'bg-white/5 text-muted-foreground'}`}>
                        {p.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: The Wheel */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            
            {/* Pointer Assembly (12 o'clock) */}
            <div className="absolute z-20 flex flex-col items-center drop-shadow-[0_0_20px_rgba(255,113,108,1)]" style={{ top: '-15px' }}>
              <div 
                ref={pointerRef}
                className="relative flex flex-col items-center origin-[50%_16px]" 
                style={{ height: '85px', width: '30px' }}
              >
                {/* Pointer Arm */}
                <div 
                  className="absolute top-0 w-6 h-[80px] bg-gradient-to-b from-[#ff716c] to-[#ff59e3]" 
                  style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 50% 100%, 0% 20%)' }}
                ></div>
                {/* Pivot Joint / Screw */}
                <div className="absolute top-2 w-4 h-4 rounded-full bg-[#1c1b1b] border-2 border-[#ff716c] shadow-[inset_0_0_4px_rgba(0,0,0,0.8)] z-10 flex items-center justify-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#ff59e3]"></div>
                </div>
              </div>
            </div>

            {/* Wheel Container */}
            <div className="relative w-[500px] h-[500px]">
              {/* Outer decorative rings */}
              <div className="absolute inset-[-25px] rounded-full border-8 border-[#0a0a0a] shadow-[0_0_80px_rgba(255,113,108,0.15)]" />
              <div className="absolute inset-[-15px] rounded-full border-2 border-[#ff716c]/40 shadow-[0_0_30px_rgba(255,113,108,0.4)]" />
              <div className="absolute inset-[-5px] rounded-full border-4 border-dashed border-[#ff59e3]/40 animate-[spin_40s_linear_infinite_reverse]" />
              
              {/* SVG Wheel */}
              <div
                ref={wheelRef}
                className="absolute inset-0 w-full h-full rounded-full drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                style={{ 
                  transform: `rotate(${rotation}deg)`, 
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none'
                }}
              >
                <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  {activeParticipants.map((p, i) => {
                    const anglePerSlice = 360 / numSlices;
                    const midAngle = (i * anglePerSlice + anglePerSlice / 2) * (Math.PI / 180);
                    const logoRadiusDist = 150; // Moved logos further out
                    const cx = 200 + logoRadiusDist * Math.cos(midAngle);
                    const cy = 200 + logoRadiusDist * Math.sin(midAngle);
                    return (
                      <clipPath key={`clip-logo-${p.id}`} id={`clip-logo-${p.id}`}>
                        <circle cx={cx} cy={cy} r="32" />
                      </clipPath>
                    );
                  })}
                </defs>

                <circle cx="200" cy="200" r="198" fill="#0e0e0e" stroke="#1c1b1b" strokeWidth="6" />
                
                {activeParticipants.map((p, i) => {
                  const color = SLICE_COLORS[i % SLICE_COLORS.length];
                  const textPos = getTextPosition(i, numSlices, 120); // Moved names further in
                  
                  const anglePerSlice = 360 / numSlices;
                  const midAngle = (i * anglePerSlice + anglePerSlice / 2) * (Math.PI / 180);
                  const logoRadiusDist = 150;
                  const logoX = 200 + logoRadiusDist * Math.cos(midAngle);
                  const logoY = 200 + logoRadiusDist * Math.sin(midAngle);
                  
                  return (
                    <g key={p.id}>
                      <path 
                        d={createSlicePath(i, numSlices, 198)} 
                        fill={color.fill} 
                        stroke={color.stroke} 
                        strokeWidth="2"
                        className="transition-all duration-300"
                      />

                      {/* Small Round Logo - Outer position */}
                      <g className="transition-all duration-300">
                        <circle 
                          cx={logoX} 
                          cy={logoY} 
                          r="36" 
                          fill="#0a0a0a" 
                          stroke={color.stroke} 
                          strokeWidth="2" 
                          className="shadow-[0_0_20px_rgba(0,0,0,0.6)]"
                        />
                        <image
                          href={p.avatar}
                          x={logoX - 32}
                          y={logoY - 32}
                          width="64"
                          height="64"
                          clipPath={`url(#clip-logo-${p.id})`}
                          preserveAspectRatio="xMidYMid slice"
                        />
                      </g>

                      {/* Name - Inner position ("under" the logo) */}
                      <text 
                        x={textPos.x} 
                        y={textPos.y} 
                        fill={color.text}
                        fontSize="12"
                        fontWeight="900"
                        fontFamily="Arial, sans-serif"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        letterSpacing="1.5"
                        style={{
                          textShadow: `0 0 8px ${color.stroke}`,
                          // Rotate text to face outwards radially
                          transform: `rotate(${textPos.angle + 90 > 180 && textPos.angle + 90 < 360 ? textPos.angle - 90 : textPos.angle + 90}deg)`,
                          transformOrigin: `${textPos.x}px ${textPos.y}px`
                        }}
                      >
                        {p.name.toUpperCase()}
                      </text>
                    </g>
                  )
                })}
                
                {/* Center Hub with Rolling Dice */}
                <circle cx="200" cy="200" r="45" fill="#0a0a0a" stroke="#1c1b1b" strokeWidth="8" className="shadow-[0_0_30px_rgba(0,0,0,1)]" />
                <circle cx="200" cy="200" r="35" fill="#1c1b1b" stroke="#ff716c" strokeWidth="4" className="shadow-[0_0_25px_rgba(255,113,108,0.8)]" />
                
                {/* Dice Icon in center */}
                <g className={`${isSpinning ? 'animate-[spin_0.5s_linear_infinite]' : ''}`}>
                  <foreignObject x="180" y="180" width="40" height="40">
                    <div className="w-full h-full flex items-center justify-center">
                      <Dices className={`w-8 h-8 ${isSpinning ? 'text-white animate-pulse' : 'text-[#ff716c]'}`} />
                    </div>
                  </foreignObject>
                </g>
                
                <circle cx="200" cy="200" r="4" fill="#ffffff" className={isSpinning ? 'opacity-0' : 'opacity-100'} />
              </svg>
            </div>
            </div>

            {/* Spin Button */}
            <button 
              onClick={spinWheel}
              disabled={isSpinning || numSlices < 2}
              className={`mt-16 px-16 py-5 rounded-2xl font-black text-2xl tracking-[0.3em] transition-all duration-300 flex items-center gap-4 relative overflow-hidden group ${
                isSpinning || numSlices < 2
                  ? 'bg-white/5 text-muted-foreground border border-white/10 cursor-not-allowed'
                  : 'bg-[#ff716c]/10 text-[#ff716c] border-2 border-[#ff716c] hover:bg-[#ff716c]/20 hover:scale-110 hover:shadow-[0_0_40px_rgba(255,113,108,0.6)] cursor-pointer'
              }`}
            >
              {!isSpinning && numSlices >= 2 && (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,113,108,0.1)_10px,rgba(255,113,108,0.1)_20px)]" />
              )}
              {!isSpinning && numSlices >= 2 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff716c]/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              )}
              <Dices className={`w-8 h-8 ${isSpinning ? 'animate-[bounce_0.3s_infinite]' : ''}`} />
              <span className="relative z-10">{isSpinning ? 'ROLLING FATE...' : 'ROLL FOR FATE'}</span>
            </button>

            {/* Winner Announcement Modal */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg transition-all duration-700 z-50 ${
              winner && !isSpinning ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-50 pointer-events-none'
            }`}>
              <div className="bg-[#0e0e0e]/95 backdrop-blur-xl border-4 border-[#ff716c] p-8 rounded-3xl shadow-[0_0_80px_rgba(255,113,108,0.4)] text-center relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ff716c] via-[#ff59e3] to-[#ff716c] animate-pulse" />
                
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[#ff716c] blur-xl opacity-40 rounded-full animate-pulse" />
                  <Skull className="w-20 h-20 text-[#ff716c] drop-shadow-[0_0_15px_rgba(255,113,108,0.8)] relative z-10" />
                </div>
                
                <h3 className="text-lg font-bold text-[#ff716c] tracking-[0.3em] mb-2 uppercase animate-pulse">
                  UNLUCKY TARGET ACQUIRED
                </h3>
                
                {winner && (
                  <>
                    <div className="relative w-28 h-28 rounded-full border-4 border-[#ff716c] overflow-hidden my-4 shadow-[0_0_30px_rgba(255,113,108,0.6)]">
                      <Image 
                        src={participants.find(p => p.name === winner)?.avatar || ""} 
                        alt={winner} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ff716c] to-white tracking-widest mb-8 text-glow uppercase">
                      {winner}
                    </p>
                  </>
                )}
                
                <button 
                  onClick={() => setWinner(null)}
                  className="px-10 py-4 bg-[#ff716c]/20 hover:bg-[#ff716c]/40 text-[#ff716c] hover:text-white border-2 border-[#ff716c]/50 rounded-xl tracking-widest text-sm font-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,113,108,0.5)] w-full"
                >
                  ACCEPT FATE
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
