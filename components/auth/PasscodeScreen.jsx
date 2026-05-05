import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { OPERATIVES } from '../../data/operatives';
import useAuthStore from '../../stores/useAuthStore';
import GlassyButton from './GlassyButton';
import { motion, AnimatePresence } from 'framer-motion';

export default function PasscodeScreen({ profileId, onSuccess, onBack }) {
  const [passcode, setPasscode] = useState('');
  const [showError, setShowError] = useState(false);
  const [validPasscode, setValidPasscode] = useState('2255');
  
  const { profileOverrides = {} } = useAuthStore()
  const baseProfile = OPERATIVES.find(op => op.profileId === profileId);
  const safeOverrides = profileOverrides || {};
  const overrides = safeOverrides[profileId] || {};
  const profile = baseProfile ? { ...baseProfile, name: overrides.name || baseProfile.name, codename: overrides.codename || baseProfile.codename } : null;
  const colorKey = profile?.color === 'magenta' ? 'magenta' : 'cyan';

  useEffect(() => {
    fetch('/api/passcodes')
      .then(res => res.json())
      .then(data => {
        if (data[profileId]) {
          setValidPasscode(data[profileId]);
        }
      })
      .catch(console.error);
  }, [profileId]);
  
  const handleNumClick = (num) => {
    if (passcode.length < 4) {
      setPasscode(prev => prev + num);
    }
  };
  
  const handleBackspace = () => {
    setPasscode(prev => prev.slice(0, -1));
  };
  
  const handleSubmit = () => {
    if (passcode === validPasscode) {
      onSuccess();
    } else {
      setShowError(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showError) {
        if (e.key === 'Enter' || e.key === 'Escape') {
          setShowError(false);
          setPasscode('');
        }
        return;
      }
      
      if (/^[0-9]$/.test(e.key)) {
        if (passcode.length < 4) {
          setPasscode(prev => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setPasscode(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (passcode === validPasscode) {
          onSuccess();
        } else {
          setShowError(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [passcode, showError, onSuccess, validPasscode]);

  const getDotStyle = (index) => {
    const isFilled = index < passcode.length;
    if (isFilled) {
      if (colorKey === 'magenta') {
        return { backgroundColor: '#ff59e3', boxShadow: '0 0 8px #ff59e3', border: 'none' };
      }
      return { backgroundColor: '#99f7ff', boxShadow: '0 0 8px #99f7ff', border: 'none' };
    }
    return { backgroundColor: '#262626', border: '1px solid #494847', boxShadow: 'none' };
  };

  if (!profile) return null;

  return (
    <div style={{
      backgroundColor: '#0e0e0e',
      backgroundImage: 'linear-gradient(to right, rgba(0,241,254,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,241,254,0.05) 1px, transparent 1px)',
      backgroundSize: '50px 50px',
      color: '#ffffff',
      minHeight: '100vh',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      fontFamily: '"Manrope", sans-serif'
    }}>
      
      {/* Back Button */}
      <div style={{position:'absolute',top:'32px',left:'32px',zIndex:20}}>
        <button type="button" onClick={onBack} style={{display:'flex',alignItems:'center',gap:'8px',color:'#adaaaa',background:'none',border:'none',cursor:'pointer',transition:'color 0.3s'}} onMouseEnter={(e)=>e.currentTarget.style.color='#99f7ff'} onMouseLeave={(e)=>e.currentTarget.style.color='#adaaaa'}>
          <Icon name="arrow_back" size={20} />
          <span style={{fontFamily:'"Space Grotesk",sans-serif',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.1em'}}>Back</span>
        </button>
      </div>

      <main style={{width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px'}}>
        
        <header style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'}}>
          <div style={{position: 'relative'}} className="group">
            {/* Ambient Profile Glow */}
            <div style={{
              position: 'absolute', inset: '-4px', 
              background: colorKey === 'magenta' ? 'linear-gradient(to top right, #ff59e3, #00f1fe)' : 'linear-gradient(to top right, #00f1fe, #ff59e3)', 
              borderRadius: '9999px', filter: 'blur(16px)', opacity: 0.4, transition: 'opacity 0.5s'
            }}></div>
            
            <div style={{
              position: 'relative', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden',
              border: colorKey === 'magenta' ? '2px solid rgba(255,89,227,0.3)' : '2px solid rgba(0,241,254,0.3)'
            }}>
              <img 
                alt={profile.name} 
                src={profile.image} 
                style={{width: '100%', height: '100%', objectFit: 'cover', ...profile.imgStyle}} 
              />
            </div>
          </div>
          
          <div style={{textAlign: 'center'}}>
            <h1 style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '30px', fontWeight: 700, letterSpacing: '0.4em',
              color: colorKey === 'magenta' ? '#ff59e3' : '#00f1fe',
              textShadow: colorKey === 'magenta' ? '0 0 10px rgba(255,89,227,0.5)' : '0 0 10px rgba(0,241,254,0.5)',
              textTransform: 'uppercase',
              marginLeft: '0.4em'
            }}>
              {profile.name}
            </h1>
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
              color: colorKey === 'magenta' ? '#ff59e3' : '#00f1fe',
              marginTop: '8px', opacity: 0.8
            }}>
              SECURE ACCESS PROTOCOL
            </p>
          </div>
        </header>

        <section style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '24px'}}>
          {/* Passcode Dots */}
          <div style={{display: 'flex', justifyContent: 'center', gap: '16px'}}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{
                width: '12px', height: '12px', borderRadius: '50%', transition: 'all 0.2s ease',
                ...getDotStyle(i)
              }}></div>
            ))}
          </div>

          {/* Keypad Grid */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%', padding: '0 8px'}}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <GlassyButton 
                key={num} 
                onClick={() => handleNumClick(num.toString())}
                label={num.toString()}
                textColor={colorKey === 'magenta' ? '#ff59e3' : '#00f1fe'}
                hoverBackground={colorKey === 'magenta' ? 'rgba(255,89,227,0.15)' : 'rgba(0,241,254,0.15)'}
                shadowHoverColor={colorKey === 'magenta' ? 'rgba(255,89,227,0.4)' : 'rgba(0,241,254,0.4)'}
                background="rgba(26,25,25,0.4)"
                style={{ aspectRatio: '1/1', border: colorKey === 'magenta' ? '1px solid rgba(255,89,227,0.15)' : '1px solid rgba(153,247,255,0.15)' }}
              />
            ))}
            
            {/* Backspace */}
            <GlassyButton 
              onClick={handleBackspace}
              icon={<Icon name="backspace" size={32} />}
              textColor={colorKey === 'magenta' ? '#ff59e3' : '#ff59e3'}
              hoverBackground="rgba(255,89,227,0.15)"
              shadowHoverColor="rgba(255,89,227,0.4)"
              background="rgba(26,25,25,0.4)"
              style={{ aspectRatio: '1/1', border: '1px solid rgba(255,89,227,0.15)' }}
            />
            
            {/* 0 */}
            <GlassyButton 
              onClick={() => handleNumClick('0')}
              label="0"
              textColor={colorKey === 'magenta' ? '#ff59e3' : '#00f1fe'}
              hoverBackground={colorKey === 'magenta' ? 'rgba(255,89,227,0.15)' : 'rgba(0,241,254,0.15)'}
              shadowHoverColor={colorKey === 'magenta' ? 'rgba(255,89,227,0.4)' : 'rgba(0,241,254,0.4)'}
              background="rgba(26,25,25,0.4)"
              style={{ aspectRatio: '1/1', border: colorKey === 'magenta' ? '1px solid rgba(255,89,227,0.15)' : '1px solid rgba(153,247,255,0.15)' }}
            />
            
            {/* Submit / Thumbprint */}
            <GlassyButton 
              onClick={handleSubmit}
              icon={<Icon name="fingerprint" size={40} />}
              textColor={colorKey === 'magenta' ? '#00f1fe' : '#00f1fe'}
              hoverBackground="rgba(0,241,254,0.15)"
              shadowHoverColor="rgba(0,241,254,0.4)"
              background="rgba(26,25,25,0.4)"
              style={{ aspectRatio: '1/1', border: '1px solid rgba(0,241,254,0.15)' }}
            />
            
          </div>
        </section>
      </main>

      {/* Error Modal */}
      <AnimatePresence>
        {showError && (
          <div style={{position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)'}}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: '#131313',
                border: '1px solid #ff716c',
                boxShadow: '0 0 30px rgba(255, 113, 108, 0.4)',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
                maxWidth: '320px',
                textAlign: 'center'
              }}
            >
              <div style={{color: '#ff716c'}}>
                <Icon name="warning" size={48} />
              </div>
              <div>
                <h2 style={{fontFamily: '"Space Grotesk", sans-serif', fontSize: '24px', fontWeight: 700, color: '#ff716c', letterSpacing: '0.1em'}}>ACCESS DENIED</h2>
                <p style={{fontFamily: '"Manrope", sans-serif', color: '#adaaaa', marginTop: '8px'}}>Invalid passcode entered for {profile.name}.</p>
              </div>
              <button
                onClick={() => { setShowError(false); setPasscode(''); }}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 113, 108, 0.1)',
                  border: '1px solid #ff716c',
                  color: '#ff716c',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 113, 108, 0.2)' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 113, 108, 0.1)' }}
              >
                Retry
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
