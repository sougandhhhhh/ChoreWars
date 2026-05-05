import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

/**
 * MagneticGlowButton — Ported from Framer component.
 * Wraps children with a magnetic spotlight glow border that follows the cursor.
 *
 * Props:
 *   glowColor       — color of the spotlight glow (default: '#00f1fe')
 *   outerGlowColor  — outer box-shadow glow color
 *   innerColor      — inner fill background
 *   borderWidth     — thickness of the glow border (default: 1.5)
 *   radius          — border-radius (default: 6)
 *   spotlightSize   — radius of the cursor spotlight (default: 150)
 *   onClick         — click handler
 *   style           — extra styles for the outer wrapper
 *   children        — button content
 */
export default function MagneticGlowButton({
  glowColor = '#00f1fe',
  glowColor2 = null,
  outerGlowColor = 'rgba(0,240,255,0.25)',
  innerColor = 'rgba(0,0,0,0.7)',
  borderWidth = 1.5,
  radius = 6,
  spotlightSize = 150,
  showOuterGlow = true,
  onClick,
  style = {},
  children,
}) {
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handlePointerMove(e) {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const spotlightBg = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 100%)`;
  const spotlightBg2 = glowColor2
    ? useMotionTemplate`radial-gradient(${spotlightSize * 1.5}px circle at ${mouseX}px ${mouseY}px, ${glowColor2}, transparent 100%)`
    : null;

  return (
    <motion.div
      ref={buttonRef}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        position: 'relative',
        padding: borderWidth,
        borderRadius: radius,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: showOuterGlow
          ? `0 15px 35px 0 ${outerGlowColor}`
          : 'none',
        ...style,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Spotlight layer — follows cursor */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: spotlightBg,
          zIndex: 0,
        }}
      />
      {spotlightBg2 && (
        <motion.div
          animate={{ opacity: isHovered ? 0.7 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: spotlightBg2,
            zIndex: 0,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Inner content container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: innerColor,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: radius - borderWidth,
          border: '2px solid rgba(255,255,255,0.15)',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
