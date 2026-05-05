import React, { useState, useMemo, useCallback, startTransition, MouseEvent, TouchEvent } from "react";

interface GlassyButtonProps {
  label?: string;
  icon?: React.ReactNode;
  background?: string;
  hoverBackground?: string;
  textColor?: string;
  borderRadius?: number;
  blur?: number;
  lightDirection?: "top-left" | "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left";
  shadowHoverColor?: string;
  shadowHoverIntensity?: number;
  fontSize?: string;
  style?: React.CSSProperties;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseDown?: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: (e: MouseEvent<HTMLDivElement>) => void;
}

export default function GlassyButton(props: GlassyButtonProps) {
  const {
    label,
    icon,
    background = "rgba(26,25,25,0.4)",
    hoverBackground = "rgba(255,255,255,0.1)",
    textColor = "#000000",
    borderRadius = 16,
    blur = 16,
    lightDirection = "top-left",
    shadowHoverColor = "rgba(0,0,0,0.2)",
    shadowHoverIntensity = 1,
    fontSize,
    style,
    onClick,
    onMouseDown,
    onMouseUp,
  } = props;

  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  // Light direction mapping
  const lightMap = {
    "top-left": { angle: 135, x: "10%", y: "10%" },
    "top": { angle: 180, x: "50%", y: "8%" },
    "top-right": { angle: 225, x: "90%", y: "10%" },
    "right": { angle: 270, x: "92%", y: "50%" },
    "bottom-right": { angle: 315, x: "90%", y: "90%" },
    "bottom": { angle: 0, x: "50%", y: "92%" },
    "bottom-left": { angle: 45, x: "10%", y: "90%" },
    "left": { angle: 90, x: "8%", y: "50%" }
  };
  const { angle, x, y } = lightMap[lightDirection] || lightMap["top-left"];

  const handleMouseMove = useCallback((e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX: number, clientY: number;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const mx = (clientX - rect.left) / rect.width;
    const my = (clientY - rect.top) / rect.height;
    startTransition(() => setMouse({
      x: Math.max(0, Math.min(1, mx)),
      y: Math.max(0, Math.min(1, my))
    }));
  }, []);

  const highlightStyle = useMemo(() => {
    const dx = mouse.x - 0.5;
    const dy = mouse.y - 0.5;
    const offsetX = dx * (hovered ? 28 : 16);
    const offsetY = dy * (hovered ? 28 : 16);
    return {
      position: "absolute" as const,
      left: `calc(${x} + ${offsetX}px)`,
      top: `calc(${y} + ${offsetY + (hovered ? -4 : 0)}px)`,
      width: hovered ? "74%" : "60%",
      height: hovered ? "42%" : "30%",
      background: hovered
        ? "linear-gradient(120deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.18) 100%)"
        : "linear-gradient(120deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 100%)",
      borderRadius: "50%",
      filter: `blur(${hovered ? 22 : 14}px)`,
      opacity: hovered ? 0.82 : 0.5,
      pointerEvents: "none" as const,
      transform: `translate(-50%, -50%) scale(${hovered ? 1.13 : 1})` + (hovered ? " translateY(-2.5px)" : ""),
      transition: "all 0.32s cubic-bezier(.4,0,.2,1)",
      zIndex: 2
    };
  }, [x, y, hovered, mouse]);

  const reflectionStyle = useMemo(() => {
    const dx = mouse.x - 0.5;
    const dy = mouse.y - 0.5;
    const offsetX = dx * (hovered ? 16 : 8);
    const offsetY = dy * (hovered ? 16 : 8);
    return {
      position: "absolute" as const,
      left: `calc(${x} + ${offsetX}px)`,
      top: `calc(${y} + ${offsetY}px)`,
      width: hovered ? "38%" : "30%",
      height: hovered ? "18%" : "14%",
      background: "linear-gradient(120deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 100%)",
      borderRadius: "50%",
      filter: `blur(${hovered ? 10 : 7}px)`,
      opacity: hovered ? 0.45 : 0.28,
      pointerEvents: "none" as const,
      transform: `translate(-50%, -50%) scale(${hovered ? 1.12 : 1})` + (hovered ? " translateY(-1px)" : ""),
      transition: "all 0.32s cubic-bezier(.4,0,.2,1)",
      zIndex: 1
    };
  }, [x, y, hovered, mouse]);

  const glassStyle = useMemo(() => ({
    position: "relative" as const,
    width: "100%",
    height: "100%",
    borderRadius,
    background: `linear-gradient(${angle}deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%), ${hovered ? hoverBackground : background}`,
    boxShadow: hovered
      ? `0 18px ${48 * shadowHoverIntensity}px 0 ${shadowHoverColor}, 0 6px 24px 0 rgba(0,0,0,0.12)`
      : "0 6px 18px 0 rgba(0,0,0,0.10)",
    backdropFilter: `blur(${blur}px) saturate(1.2)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(1.2)`,
    border: "1.5px solid rgba(255,255,255,0.22)",
    boxSizing: "border-box" as const,
    overflow: "hidden" as const,
    cursor: "pointer",
    transition: "box-shadow 0.32s cubic-bezier(.4,0,.2,1), background 0.32s cubic-bezier(.4,0,.2,1), transform 0.32s cubic-bezier(.4,0,.2,1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: hovered ? "scale(1.02)" : "none",
    ...style
  }), [angle, background, borderRadius, blur, hovered, style, hoverBackground, shadowHoverColor, shadowHoverIntensity]);

  return (
    <div
      style={glassStyle}
      role="button"
      tabIndex={0}
      aria-label={label}
      onMouseEnter={() => startTransition(() => setHovered(true))}
      onMouseLeave={() => {
        startTransition(() => setMouse({ x: 0.5, y: 0.5 }));
        startTransition(() => setHovered(false));
      }}
      onFocus={() => startTransition(() => setHovered(true))}
      onBlur={() => startTransition(() => setHovered(false))}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onClick={onClick}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.95)';
        if (onMouseDown) onMouseDown(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = hovered ? 'scale(1.02)' : 'none';
        if (onMouseUp) onMouseUp(e);
      }}
    >
      <div style={highlightStyle} />
      <div style={reflectionStyle} />
      
      <div style={{ zIndex: 3, userSelect: "none", color: hovered ? "#fff" : textColor, transition: "color 0.22s cubic-bezier(.4,0,.2,1)", display: "flex", alignItems: "center", gap: "8px" }}>
        {icon && icon}
        {label && <span style={{ fontSize: fontSize || (icon ? '18px' : '24px'), fontFamily: icon ? '"Space Grotesk", sans-serif' : '"JetBrains Mono", monospace', fontWeight: icon ? 600 : 'normal' }}>{label}</span>}
      </div>

      <div style={{
        pointerEvents: "none",
        position: "absolute",
        inset: 0,
        borderRadius,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "inset 0 1.5px 8px 0 rgba(255,255,255,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.06)",
        zIndex: 4
      }} />
    </div>
  );
}
