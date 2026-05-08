import React from 'react';
import Icon from '../ui/Icon';
import LetterGlitch from '../effects/LetterGlitch';
import MagneticGlowButton from '../effects/MagneticGlowButton';

export default function LandingScreen({ onChooseCredentials, onChoosePasscode }) {
  return (
    <div style={{background:'#0e0e0e',color:'#ffffff',fontFamily:'"Space Grotesk",sans-serif',overflow:'hidden',height:'100vh',width:'100vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative'}}>

      {/* Glitch Background */}
      <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0}}>
        <LetterGlitch
          glitchColors={['#0a4f52','#00f1fe','#ff59e3']}
          glitchSpeed={50}
          centerVignette={false}
          outerVignette={true}
          smooth={true}
          density={0.04}
        />
      </div>

      {/* Main Content */}
      <main style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'100%',maxWidth:'1024px',padding:'40px 24px',textAlign:'center',minHeight:'100vh'}}>

        {/* Hero Title */}
        <div style={{marginBottom:'24px',position:'relative'}}>
          <h1
            className="title-neon-layered"
            data-text="CHOREWARS"
            style={{
              fontFamily:'"Orbitron",sans-serif',
              fontWeight:900,
              fontSize:'clamp(48px,12vw,136px)',
              lineHeight:1,
              letterSpacing:'-0.05em',
            }}
          >
            CHOREWARS
          </h1>
        </div>

        {/* Tagline */}
        <div style={{marginBottom:'48px'}}>
          <MagneticGlowButton
            glowColor="#00f1fe"
            glowColor2="#ff59e3"
            outerGlowColor="rgba(0,241,254,0.1)"
            innerColor="rgba(0,0,0,0.75)"
            borderWidth={2}
            radius={8}
            spotlightSize={200}
            showOuterGlow={false}
          >
            <p style={{fontFamily:'"Space Grotesk",sans-serif',fontSize:'clamp(12px,2vw,22px)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.4em',color:'#ffffff',margin:0,filter:'drop-shadow(0 0 10px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(0,0,0,0.6))', padding: '8px 16px', lineHeight: 1.4, whiteSpace: 'nowrap'}}>
              GAMIFY YOUR HOUSEHOLD. <span style={{color:'#ff59e3'}}>CONQUER YOUR CHORES.</span>
            </p>
          </MagneticGlowButton>
        </div>

        {/* CTA Buttons */}
        <div style={{display:'flex',flexDirection:'row',gap:'16px',alignItems:'center',justifyContent:'center',width:'100%',maxWidth:'672px',flexWrap:'wrap'}}>
          {/* Login by Passcode */}
          <MagneticGlowButton
            onClick={onChoosePasscode}
            glowColor="#00f1fe"
            outerGlowColor="rgba(0,241,254,0.2)"
            innerColor="rgba(0,0,0,0.75)"
            borderWidth={2}
            radius={6}
            spotlightSize={180}
            style={{flex:'1 1 280px'}}
          >
            <div style={{display:'flex',alignItems:'center',gap:'12px',fontFamily:'"Space Grotesk",sans-serif',fontWeight:700,fontSize:'clamp(14px,1.3vw,20px)',letterSpacing:'0.1em',textTransform:'uppercase',color:'#99f7ff'}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>LOGIN BY PASSCODE</span>
            </div>
          </MagneticGlowButton>

          {/* Login by Credentials */}
          <MagneticGlowButton
            onClick={onChooseCredentials}
            glowColor="#ff59e3"
            outerGlowColor="rgba(255,89,227,0.2)"
            innerColor="rgba(0,0,0,0.75)"
            borderWidth={2}
            radius={6}
            spotlightSize={180}
            style={{flex:'1 1 280px'}}
          >
            <div style={{display:'flex',alignItems:'center',gap:'12px',fontFamily:'"Space Grotesk",sans-serif',fontWeight:700,fontSize:'clamp(14px,1.3vw,20px)',letterSpacing:'0.1em',textTransform:'uppercase',color:'#ff59e3'}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="10" r="3" />
                <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
              </svg>
              <span>LOGIN BY CREDENTIALS</span>
            </div>
          </MagneticGlowButton>
        </div>
      </main>

      {/* Footer Text */}
      <footer style={{position:'fixed',bottom:0,width:'100%',zIndex:20,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 24px',fontFamily:'"Space Grotesk",sans-serif',fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.05em',color:'#adaaaa',background: 'transparent'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#99f7ff',boxShadow:'0 0 8px rgba(153,247,255,0.8)',animation:'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',display:'inline-block'}}></span>
          <span>SERVER: <span style={{color:'#99f7ff',fontWeight:700}}>ONLINE</span></span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <div>
            <span>VERSION: <span style={{color:'#ffffff'}}>v2.5.0</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
