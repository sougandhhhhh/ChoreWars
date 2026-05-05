import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

export default function LuminousButton(props) {
  const {
    label = "Get Started",
    icon,
    link = "",
    backgroundColor = "#0A0A0A",
    textColor = "#FFFFFF",
    glow = {},
    buttonStyle = {},
    paddingX = 32,
    paddingY = 16,
    hover = {},
    appear = {},
    font = {},
    onClick,
    style,
    className
  } = props;

  const {
    colors: glowColorCount = 3,
    colorA: glowColorA = "#7C5CFC",
    colorB: rawColorB = "#C084FC",
    colorC: rawColorC = "#F0ABFC",
    style: glowGradientStyle = "blobs",
    intensity: glowIntensity = 0.45,
    blur: glowBlur = 24,
    spread: glowSpread = 6,
    animation: glowAnimation = "breathe",
    speed: animationSpeed = 3,
    followMouse = false,
    followIntensity = 0.5
  } = glow || {};

  const glowColorB = glowColorCount >= 2 ? rawColorB : glowColorA;
  const glowColorC = glowColorCount >= 3 ? rawColorC : glowColorCount >= 2 ? rawColorB : glowColorA;

  const { outline = false, outlineWidth = 2, borderRadius = 99, glass = false } = buttonStyle || {};
  const { scale: hoverScale = 1.04, tapScale = 0.97, glowBoost = 1.8, shimmer = true, textGlow: showTextGlow = true, magnetic = false, magneticStrength = 0.3, magneticRadius = 150 } = hover || {};
  const { animation: appearAnimation = "none", duration: appearDuration = 0.5, delay: appearDelay = 0, staggerIndex = 0, staggerOffset = 0.1 } = appear || {};

  const isStatic = false;
  const isFixedWidth = style?.width === "100%";
  const isFixedHeight = style?.height === "100%";

  const [isHovered, setIsHovered] = useState(false);
  const [shimmerActive, setShimmerActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const btnRef = useRef(null);
  const shimmerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const followRadius = useMemo(() => (glowSpread + glowBlur) * 3, [glowSpread, glowBlur]);

  useEffect(() => {
    if (!followMouse || reducedMotion || typeof window === "undefined") return () => {};
    const onMove = (e) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(rect.width, rect.height) / 2 + followRadius;
      if (dist > maxDist) {
        setMouseOffset({ x: 0, y: 0 });
        return;
      }
      const falloff = 1 - Math.max(0, dist - Math.max(rect.width, rect.height) / 2) / followRadius;
      const maxShift = glowSpread + glowBlur * 0.5;
      setMouseOffset({
        x: (dx / (rect.width / 2)) * maxShift * followIntensity * falloff,
        y: (dy / (rect.height / 2)) * maxShift * followIntensity * falloff
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [followMouse, reducedMotion, glowSpread, glowBlur, followIntensity, followRadius]);

  useEffect(() => {
    if (!magnetic || reducedMotion || typeof window === "undefined") return () => {};
    const onMove = (e) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > magneticRadius) {
        setMagneticOffset((prev) => (prev.x === 0 && prev.y === 0 ? prev : { x: 0, y: 0 }));
        return;
      }
      const strength = (1 - dist / magneticRadius) * magneticStrength;
      setMagneticOffset({ x: dx * strength, y: dy * strength });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [magnetic, reducedMotion, magneticStrength, magneticRadius]);

  useEffect(() => {
    if (isHovered) {
      setShimmerActive(true);
      return () => {};
    }
    const el = shimmerRef.current;
    if (!el) {
      setShimmerActive(false);
      return () => {};
    }
    const onIteration = () => setShimmerActive(false);
    el.addEventListener("animationiteration", onIteration);
    return () => el.removeEventListener("animationiteration", onIteration);
  }, [isHovered]);

  const uid = useRef(`lb-${Math.random().toString(36).slice(2, 8)}`).current;
  const shimmyKf = `${uid}-shimmy`;
  const shimmerKf = `${uid}-shimmer`;
  const pulseKf = `${uid}-pulse`;
  const breatheKf = `${uid}-breathe`;
  const blobAKf = `${uid}-blobA`;
  const blobBKf = `${uid}-blobB`;
  const blobCKf = `${uid}-blobC`;

  const totalAppearDelay = appearDelay + staggerIndex * staggerOffset;
  const linearGradient = `linear-gradient(90deg, ${glowColorA}, color-mix(in oklch, ${glowColorA} 50%, ${glowColorB}) 25%, ${glowColorB} 50%, color-mix(in oklch, ${glowColorB} 50%, ${glowColorC}) 75%, ${glowColorC})`;
  const linearGradientReverse = `linear-gradient(270deg, ${glowColorA}, color-mix(in oklch, ${glowColorA} 50%, ${glowColorB}) 25%, ${glowColorB} 50%, color-mix(in oklch, ${glowColorB} 50%, ${glowColorC}) 75%, ${glowColorC})`;
  const isGlowNone = glowGradientStyle === "none";
  const isGlowSimple = glowGradientStyle === "simple";
  const isBlobs = glowGradientStyle === "blobs";
  const glowBackground = glowGradientStyle === "linear" ? linearGradient : glowGradientStyle === "linear-reverse" ? linearGradientReverse : "transparent";

  const simpleGlowShadow = `0 0 ${glowBlur}px ${glowSpread}px color-mix(in srgb, ${glowColorA} ${Math.round(glowIntensity * 80)}%, transparent)`;
  const fillBg = glass ? `color-mix(in srgb, ${backgroundColor} 60%, transparent)` : backgroundColor;
  const fillGradient = `linear-gradient(180deg, color-mix(in srgb, ${backgroundColor} 85%, rgba(255,255,255,0.15)) 0%, ${fillBg} 50%, color-mix(in srgb, ${fillBg} 95%, rgba(0,0,0,0.2)) 100%)`;

  const textGlowShadow = `0 0 ${glowBlur * 0.3}px ${glowColorA}, 0 0 ${glowBlur * 0.6}px color-mix(in srgb, ${glowColorB} 50%, transparent)`;
  const bleed = glowSpread * 2 + glowBlur;

  const handleClick = useCallback(() => {
    if (link && typeof document !== "undefined") {
      const a = Object.assign(document.createElement("a"), { href: link, target: "_blank", rel: "noopener noreferrer" });
      a.click();
    }
    onClick?.();
  }, [link, onClick]);

  const magneticTransform = magnetic && !reducedMotion && (magneticOffset.x !== 0 || magneticOffset.y !== 0) ? `translate(${magneticOffset.x}px, ${magneticOffset.y}px)` : undefined;

  const keyframesStyle = `
        .${uid}:focus-visible { outline: 2px solid ${glowColorA}; outline-offset: 4px; }
        @keyframes ${pulseKf} {
            0%, 100% { filter: blur(${outline ? glowBlur * 1.2 : glowBlur}px) brightness(1); }
            50% { filter: blur(${outline ? glowBlur * 1.2 : glowBlur}px) brightness(1.15); }
        }
        @keyframes ${breatheKf} {
            0%, 100% { filter: blur(${outline ? glowBlur * 1.2 : glowBlur}px) brightness(1); transform: scale(1); }
            50% { filter: blur(${outline ? glowBlur * 1.2 : glowBlur}px) brightness(1.2); transform: scale(1.06); }
        }
        @keyframes ${shimmyKf} {
            0%, 100% { transform: translateX(0%); }
            25% { transform: translateX(4%); }
            75% { transform: translateX(-4%); }
        }
        @keyframes ${blobAKf} {
            0% { transform: translate(-25%, -15%) scale(1) rotate(0deg); }
            25% { transform: translate(30%, -25%) scale(1.15) rotate(15deg); }
            50% { transform: translate(15%, 30%) scale(0.9) rotate(-10deg); }
            75% { transform: translate(-35%, 10%) scale(1.1) rotate(8deg); }
            100% { transform: translate(-25%, -15%) scale(1) rotate(0deg); }
        }
        @keyframes ${blobBKf} {
            0% { transform: translate(20%, 20%) scale(1.05) rotate(0deg); }
            25% { transform: translate(-30%, -10%) scale(0.85) rotate(-12deg); }
            50% { transform: translate(-15%, -30%) scale(1.15) rotate(18deg); }
            75% { transform: translate(35%, -20%) scale(1) rotate(-5deg); }
            100% { transform: translate(20%, 20%) scale(1.05) rotate(0deg); }
        }
        @keyframes ${blobCKf} {
            0% { transform: translate(0%, -20%) scale(0.95) rotate(0deg); }
            25% { transform: translate(-20%, 25%) scale(1.1) rotate(20deg); }
            50% { transform: translate(25%, 15%) scale(1.05) rotate(-15deg); }
            75% { transform: translate(-10%, -30%) scale(0.9) rotate(10deg); }
            100% { transform: translate(0%, -20%) scale(0.95) rotate(0deg); }
        }
        @keyframes ${shimmerKf} {
            0% { transform: translateX(-100%) skewX(-12deg) scaleY(1.1); opacity: 0; }
            3% { opacity: 1; }
            35% { opacity: 1; }
            40% { transform: translateX(400%) skewX(-12deg) scaleY(1.1); opacity: 0; }
            100% { transform: translateX(400%) skewX(-12deg) scaleY(1.1); opacity: 0; }
        }
    `;

  const glowContainerStyle = {
    position: "absolute",
    inset: -bleed,
    pointerEvents: "none",
    isolation: "isolate",
    zIndex: 0,
    transform: followMouse && !reducedMotion ? `translate(${mouseOffset.x}px, ${mouseOffset.y}px)` : undefined,
    transition: followMouse ? "transform 0.25s ease-out" : undefined
  };

  const innerContent = (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframesStyle }} />
      {!isGlowNone && !isGlowSimple && (
        <motion.div
          style={glowContainerStyle}
          initial={reducedMotion || appearAnimation === "none" ? undefined : { opacity: 0, ...(appearAnimation === "fade-scale" ? { scale: 0.85 } : {}), ...(appearAnimation === "fade-up" ? { y: 20 } : {}), ...(appearAnimation === "fade-down" ? { y: -20 } : {}) }}
          animate={reducedMotion || appearAnimation === "none" ? undefined : { opacity: 1, ...(appearAnimation === "fade-scale" ? { scale: 1 } : {}), ...(appearAnimation === "fade-up" || appearAnimation === "fade-down" ? { y: 0 } : {}) }}
          transition={{
            opacity: { duration: appearDuration * 1.2, delay: totalAppearDelay, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: appearDuration * 1.5, delay: totalAppearDelay, ease: [0.16, 1, 0.3, 1] },
            y: { duration: appearDuration * 1.2, delay: totalAppearDelay, ease: [0.16, 1, 0.3, 1] }
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: outline ? bleed * 0.3 : bleed * 0.4,
              borderRadius: outline ? borderRadius + glowSpread * 2 : borderRadius + glowSpread,
              overflow: "hidden",
              filter: `blur(${outline ? glowBlur * 1.2 : glowBlur}px)`,
              animation: !reducedMotion && glowAnimation !== "none" ? (glowAnimation === "breathe" ? `${breatheKf} ${animationSpeed * 1.5}s ease-in-out infinite` : `${pulseKf} ${animationSpeed * 1.5}s ease-in-out infinite`) : "none"
            }}
            initial={false}
            animate={{
              opacity: isHovered ? Math.min(glowIntensity * glowBoost, 1) : outline ? glowIntensity * 0.5 : glowIntensity,
              scale: isHovered ? 1 : 0.85
            }}
            transition={{
              opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            }}
          >
            {!isBlobs && <div style={{ position: "absolute", inset: "-5% 0", background: glowBackground, animation: !reducedMotion ? `${shimmyKf} ${animationSpeed * 2}s ease-in-out infinite` : "none" }} />}
            {isBlobs && (
              <>
                <div style={{ position: "absolute", width: "90%", height: "140%", left: "5%", top: "-20%", borderRadius: "45% 55% 50% 50%", background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${glowColorA} 0%, color-mix(in srgb, ${glowColorA} 40%, transparent) 50%, transparent 80%)`, mixBlendMode: "screen", animation: !reducedMotion ? `${blobAKf} ${animationSpeed * 2.5}s ease-in-out infinite` : "none" }} />
                <div style={{ position: "absolute", width: "85%", height: "130%", left: "10%", top: "-15%", borderRadius: "55% 45% 48% 52%", background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${glowColorB} 0%, color-mix(in srgb, ${glowColorB} 40%, transparent) 50%, transparent 80%)`, mixBlendMode: "screen", animation: !reducedMotion ? `${blobBKf} ${animationSpeed * 3}s ease-in-out infinite` : "none" }} />
                <div style={{ position: "absolute", width: "80%", height: "120%", left: "15%", top: "-10%", borderRadius: "50% 50% 55% 45%", background: `radial-gradient(ellipse 60% 65% at 50% 50%, ${glowColorC} 0%, color-mix(in srgb, ${glowColorC} 40%, transparent) 50%, transparent 80%)`, mixBlendMode: "screen", animation: !reducedMotion ? `${blobCKf} ${animationSpeed * 3.5}s ease-in-out infinite` : "none" }} />
              </>
            )}
          </motion.div>
        </motion.div>
      )}

      {outline && !isGlowNone && !isGlowSimple && (
        <div style={{ position: "absolute", inset: 0, borderRadius, overflow: "hidden", pointerEvents: "none", zIndex: 2, padding: outlineWidth, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude" }}>
          {!isBlobs && <div style={{ position: "absolute", inset: "-5% 0", background: glowBackground, animation: !reducedMotion ? `${shimmyKf} ${animationSpeed * 2}s ease-in-out infinite` : "none" }} />}
          {isBlobs && (
            <>
              <div style={{ position: "absolute", width: "90%", height: "140%", left: "5%", top: "-20%", borderRadius: "45% 55% 50% 50%", background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${glowColorA} 0%, color-mix(in srgb, ${glowColorA} 40%, transparent) 50%, transparent 80%)`, mixBlendMode: "screen", animation: !reducedMotion ? `${blobAKf} ${animationSpeed * 2.5}s ease-in-out infinite` : "none" }} />
              <div style={{ position: "absolute", width: "85%", height: "130%", left: "10%", top: "-15%", borderRadius: "55% 45% 48% 52%", background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${glowColorB} 0%, color-mix(in srgb, ${glowColorB} 40%, transparent) 50%, transparent 80%)`, mixBlendMode: "screen", animation: !reducedMotion ? `${blobBKf} ${animationSpeed * 3}s ease-in-out infinite` : "none" }} />
              <div style={{ position: "absolute", width: "80%", height: "120%", left: "15%", top: "-10%", borderRadius: "50% 50% 55% 45%", background: `radial-gradient(ellipse 60% 65% at 50% 50%, ${glowColorC} 0%, color-mix(in srgb, ${glowColorC} 40%, transparent) 50%, transparent 80%)`, mixBlendMode: "screen", animation: !reducedMotion ? `${blobCKf} ${animationSpeed * 3.5}s ease-in-out infinite` : "none" }} />
            </>
          )}
        </div>
      )}

      <div style={{ position: "absolute", inset: 0, borderRadius, background: fillGradient, zIndex: 1, pointerEvents: "none", boxShadow: isGlowSimple ? `${simpleGlowShadow}, inset 0 1px 0 0 rgba(255,255,255,0.07), inset 0 -1px 0 0 rgba(0,0,0,0.15)` : `inset 0 1px 0 0 rgba(255,255,255,0.07), inset 0 -1px 0 0 rgba(0,0,0,0.15)`, transition: isGlowSimple ? "box-shadow 0.4s ease" : undefined, ...(glass ? { backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" } : {}) }} />
      <div style={{ position: "absolute", top: 0, left: borderRadius * 0.3, right: borderRadius * 0.3, height: 1, background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 70%, transparent)`, borderRadius: 1, zIndex: 4, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius, opacity: 0.035, mixBlendMode: "overlay", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px 128px", zIndex: 2, pointerEvents: "none" }} />
      
      {shimmer && !reducedMotion && (
        <div style={{ position: "absolute", inset: 0, borderRadius, overflow: "hidden", pointerEvents: "none", zIndex: 3 }}>
          <div ref={shimmerRef} style={{ position: "absolute", top: "-15%", left: 0, width: "35%", height: "130%", background: "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.03) 60%, transparent 100%)", animation: shimmerActive ? `${shimmerKf} 3.5s ease-in-out infinite` : "none", opacity: 0, pointerEvents: "none" }} />
        </div>
      )}

      <span style={{ position: "relative", zIndex: 5, display: 'flex', alignItems: 'center', gap: '8px', textShadow: isHovered && showTextGlow ? textGlowShadow : `0 1px 2px rgba(0,0,0,0.3)`, transition: reducedMotion ? "none" : "text-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)", filter: isHovered ? "brightness(1.08)" : "brightness(1)" }}>
        {icon && icon}
        {label}
      </span>
    </>
  );

  const buttonBaseStyle = { position: "relative", backgroundColor: "transparent", color: textColor, border: "none", borderRadius, padding: `${paddingY}px ${paddingX}px`, cursor: "pointer", overflow: "visible", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", ...font, willChange: "transform", backfaceVisibility: "hidden" };
  const wrapperStyle = { ...style, display: "inline-flex", width: "100%", backgroundColor: "transparent", ...(magnetic && !reducedMotion ? { transform: magneticTransform, transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)", willChange: "transform" } : {}) };

  return (
    <div className={className} style={wrapperStyle}>
      <motion.button type="button" ref={btnRef} className={uid} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={buttonBaseStyle} onClick={handleClick} whileHover={reducedMotion ? undefined : { scale: hoverScale }} whileTap={reducedMotion ? undefined : { scale: tapScale }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
        {innerContent}
      </motion.button>
    </div>
  );
}
