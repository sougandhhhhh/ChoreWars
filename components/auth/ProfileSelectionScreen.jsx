"use client";

import React, { useState } from 'react';
import Icon from '../ui/Icon';
import useAuthStore from '../../stores/useAuthStore';

import { OPERATIVES } from '../../data/operatives';

const CYAN = { border: 'rgba(0,241,254,0.3)', borderHover: 'rgba(0,241,254,0.6)', shadow: 'rgba(0,241,254,0.2)', shadowHover: 'rgba(0,241,254,0.5)', text: '#99f7ff', tag: '#00f1fe' };
const MAGENTA = { border: 'rgba(255,89,227,0.3)', borderHover: 'rgba(255,89,227,0.6)', shadow: 'rgba(255,89,227,0.2)', shadowHover: 'rgba(255,89,227,0.5)', text: '#ff59e3', tag: '#ff59e3' };

export default function ProfileSelectionScreen({ onSelect, onBack }) {
  const [hoveredId, setHoveredId] = useState(null);
  const { profileOverrides = {} } = useAuthStore();

  return (
    <div style={{
      background: '#0e0e0e',
      backgroundImage: 'linear-gradient(to right, rgba(0,241,254,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,241,254,0.05) 1px, transparent 1px)',
      backgroundSize: '50px 50px',
      color: '#ffffff',
      fontFamily: '"Manrope",sans-serif',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '80px 24px 60px',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto',
    }}>
      {/* Ambient Glows */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{width:'800px',height:'400px',background:'rgba(153,247,255,0.1)',borderRadius:'50%',filter:'blur(120px)',position:'absolute',mixBlendMode:'screen',transform:'translateY(-80px)'}}></div>
        <div style={{width:'600px',height:'300px',background:'rgba(255,89,227,0.1)',borderRadius:'50%',filter:'blur(100px)',position:'absolute',mixBlendMode:'screen',transform:'translateY(128px)'}}></div>
      </div>

      {/* Back Button */}
      <div style={{position:'absolute',top:'24px',left:'24px',zIndex:20}}>
        <button type="button" onClick={onBack} style={{display:'flex',alignItems:'center',gap:'8px',color:'#adaaaa',background:'none',border:'none',cursor:'pointer',transition:'color 0.3s'}} onMouseEnter={(e)=>e.currentTarget.style.color='#99f7ff'} onMouseLeave={(e)=>e.currentTarget.style.color='#adaaaa'}>
          <Icon name="arrow_back" size={20} />
          <span style={{fontFamily:'"Space Grotesk",sans-serif',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.1em'}}>Back</span>
        </button>
      </div>

      {/* Header */}
      <div style={{textAlign:'center',marginBottom:'48px',zIndex:10,position:'relative'}}>
        <h1 style={{
          fontFamily:'"Space Grotesk",sans-serif',
          fontSize:'clamp(28px,6vw,60px)',
          fontWeight:700,
          letterSpacing:'-0.02em',
          textTransform:'uppercase',
          background:'linear-gradient(to right, #00f1fe, #ff59e3)',
          WebkitBackgroundClip:'text',
          WebkitTextFillColor:'transparent',
          filter:'drop-shadow(0 0 20px rgba(0,241,254,0.4))',
          lineHeight: 1.1
        }}>
          Who is entering the grid?
        </h1>
        <p style={{
          fontFamily:'"Space Grotesk",sans-serif',
          color:'#00f1fe',
          fontSize:'clamp(12px,1.5vw,18px)',
          marginTop:'12px',
          letterSpacing:'0.2em',
          textTransform:'uppercase',
          filter:'drop-shadow(0 0 10px rgba(0,241,254,0.3))',
        }}>
          Select your operative to continue
        </p>
      </div>

      {/* Avatar Cards */}
      <div style={{display:'flex',flexWrap:'wrap',gap:'24px',justifyContent:'center',alignItems:'stretch',zIndex:10,width:'100%',maxWidth:'1280px',padding:'0'}}>
        {OPERATIVES.map((baseOp) => {
          const safeOverrides = profileOverrides || {};
          const overrides = safeOverrides[baseOp.profileId] || {};
          const op = { ...baseOp, name: overrides.name || baseOp.name, codename: overrides.codename || baseOp.codename };
          const palette = op.color === 'cyan' ? CYAN : MAGENTA;
          const isHovered = hoveredId === op.profileId;
          return (
            <button
              key={op.profileId}
              className="pulse-card"
              onClick={() => onSelect(op.profileId)}
              onMouseEnter={() => setHoveredId(op.profileId)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                borderRadius:'16px',
                padding:'20px',
                width:'clamp(140px, 40vw, 192px)',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                cursor:'pointer',
                position:'relative',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${isHovered ? palette.borderHover : 'transparent'}`,
                transition: 'all 0.3s'
              }}
            >
              {/* Avatar Circle */}
              <div style={{
                width:'clamp(80px, 20vw, 128px)',
                height:'clamp(80px, 20vw, 128px)',
                borderRadius:'50%',
                marginBottom:'16px',
                overflow:'hidden',
                border:`2px solid ${isHovered ? palette.borderHover : palette.border}`,
                position:'relative',
                boxShadow: isHovered ? `0 0 25px ${palette.shadowHover}` : `0 0 15px ${palette.shadow}`,
                transition:'all 0.3s',
              }}>
                <img
                  alt={op.name}
                  src={op.image}
                  style={{
                    width:'100%',
                    height:'100%',
                    objectFit:'cover',
                    objectPosition:'center',
                    filter: isHovered ? 'saturate(1)' : 'saturate(0.5)',
                    transition:'all 0.3s',
                    ...op.imgStyle,
                  }}
                />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(38,38,38,0.5), transparent)',opacity:0.5}}></div>
              </div>

              {/* Name */}
              <h2 style={{
                fontFamily:'"Space Grotesk",sans-serif',
                fontSize:'clamp(18px, 4vw, 24px)',
                fontWeight:700,
                color: isHovered ? palette.text : '#ffffff',
                letterSpacing:'0.05em',
                marginBottom:'4px',
                transition:'all 0.3s',
                filter: isHovered ? `drop-shadow(0 0 8px ${palette.shadow})` : 'none',
              }}>
                {op.name}
              </h2>

              {/* Codename Tag */}
              <span style={{
                fontFamily:'"Space Grotesk",sans-serif',
                fontSize:'clamp(10px, 2vw, 12px)',
                color: palette.tag,
                letterSpacing:'0.15em',
                textTransform:'uppercase',
                padding:'4px 10px',
                background:'rgba(0,0,0,0.8)',
                borderRadius:'9999px',
                border:`1px solid ${palette.border}`,
                boxShadow: isHovered ? `0 0 10px ${palette.shadow}` : `0 0 10px ${palette.shadow.replace('0.2','0.1')}`,
                transition:'all 0.3s',
                whiteSpace:'nowrap',
              }}>
                {op.codename}
              </span>
            </button>
          );
        })}
      </div>

      {/* Motivational Quote */}
      <div style={{marginTop:'48px',zIndex:10, padding: '0 24px'}}>
        <p style={{
          fontFamily:'"Space Grotesk",sans-serif',
          fontSize:'clamp(12px,1.8vw,20px)',
          fontWeight:600,
          textTransform:'uppercase',
          letterSpacing:'0.15em',
          color:'#ffffff',
          filter:'drop-shadow(0 0 10px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(0,0,0,0.6))',
          textAlign:'center',
          maxWidth:'800px',
          opacity: 0.8,
          lineHeight: 1.5,
          whiteSpace: 'nowrap'
        }}>
          "IF YOU DON'T TAKE RISKS, <span style={{color:'#00f1fe', textShadow:'0 0 10px rgba(0,241,254,0.5)'}}>YOU CAN'T CREATE A FUTURE.</span>"
        </p>
      </div>
    </div>
  );
}
