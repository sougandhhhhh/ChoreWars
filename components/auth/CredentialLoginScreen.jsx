import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import Icon from '../ui/Icon';

export default function CredentialLoginScreen({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [focusedField, setFocusedField] = useState(null);
  const usernameRef = useRef(null);
  const login = useAuthStore((s) => s.login);
  const lockoutUntil = useAuthStore((s) => s.lockoutUntil);

  useEffect(() => { usernameRef.current?.focus(); }, []);

  useEffect(() => {
    if (!lockoutUntil) { setLockoutTimer(0); return; }
    const iv = setInterval(() => {
      const r = Math.max(0, Math.ceil((new Date(lockoutUntil) - new Date()) / 1000));
      setLockoutTimer(r);
      if (r <= 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [lockoutUntil]);

  const isLocked = lockoutTimer > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    if (!username.trim() || !password.trim()) { setError('Both fields are required.'); return; }
    setIsLoading(true); setError('');
    await new Promise((r) => setTimeout(r, 600));
    const result = login(username, password);
    setIsLoading(false);
    if (result.success) { onLogin(result.profileId); }
    else { setError(result.error); setPassword(''); }
  };

  return (
    <div style={{position:'relative',minHeight:'100vh',width:'100%',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',fontFamily:'"Manrope",sans-serif',color:'#ffffff'}} className="dynamic-bg">
      {/* Background Elements */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        <div className="mesh-line" style={{top:'25%',transform:'rotate(-12deg) scale(1.5)'}}></div>
        <div className="mesh-line" style={{top:'50%',transform:'rotate(6deg) scale(1.5)'}}></div>
        <div className="mesh-line" style={{top:'75%',transform:'rotate(-3deg) scale(1.5)'}}></div>
        <div style={{position:'absolute',top:'10%',left:'15%',width:'256px',height:'256px',borderRadius:'50%',filter:'blur(120px)',background:'rgba(153,247,255,0.1)'}}></div>
        <div style={{position:'absolute',bottom:'15%',right:'10%',width:'384px',height:'384px',borderRadius:'50%',filter:'blur(140px)',background:'rgba(255,89,227,0.1)'}}></div>
        <div className="mesh-particle" style={{top:'33%',left:'25%',opacity:0.4}}></div>
        <div className="mesh-particle" style={{top:'50%',left:'60%',opacity:0.6}}></div>
        <div className="mesh-particle" style={{top:'66%',left:'15%',opacity:0.3}}></div>
        <div className="mesh-particle" style={{top:'20%',left:'80%',opacity:0.5}}></div>
        <div className="mesh-particle" style={{top:'85%',left:'45%',opacity:0.25}}></div>
      </div>

      <main style={{position:'relative',zIndex:10,width:'100%',maxWidth:'440px',padding:'0 24px'}}>

        {/* Back to Landing */}
        <div style={{marginBottom:'32px',display:'flex',justifyContent:'flex-start'}}>
          <button type="button" onClick={onBack} style={{display:'flex',alignItems:'center',gap:'8px',color:'#adaaaa',background:'none',border:'none',cursor:'pointer',transition:'color 0.3s'}} onMouseEnter={(e)=>e.currentTarget.style.color='#99f7ff'} onMouseLeave={(e)=>e.currentTarget.style.color='#adaaaa'}>
            <Icon name="arrow_back" size={20} />
            <span style={{fontFamily:'"Space Grotesk",sans-serif',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.1em'}}>Back</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="glass-card" style={{borderRadius:'2rem',padding:'32px'}}>

          {/* Branding Section */}
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'40px'}}>
            <div style={{marginBottom:'8px'}}>
              <h1 className="neon-logo-shadow" style={{fontFamily:'"Space Grotesk",sans-serif',fontSize:'clamp(48px,5vw,56px)',fontWeight:900,fontStyle:'italic',letterSpacing:'-0.05em',color:'#ffffff',lineHeight:1,textAlign:'center',width:'100%',transform:'translateX(-8px)'}}>
                CHOREWARS
              </h1>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{height:'1px',width:'32px',background:'rgba(153,247,255,0.3)'}}></div>
              <p style={{fontFamily:'"Space Grotesk",sans-serif',color:'#99f7ff',letterSpacing:'0.2em',fontSize:'12px',textTransform:'uppercase',fontWeight:500,margin:0}}>Welcome Operative</p>
              <div style={{height:'1px',width:'32px',background:'rgba(153,247,255,0.3)'}}></div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit}>
            <div style={{display:'flex',flexDirection:'column',gap:'24px'}}>
              {/* Operative ID Field */}
              <div>
                <label style={{display:'block',marginBottom:'8px',paddingLeft:'4px'}}>
                  <span style={{fontFamily:'"Space Grotesk",sans-serif',fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.1em',color:'#adaaaa'}}>Credential Alpha</span>
                </label>
                <div style={{position:'relative'}}>
                  <input
                    ref={usernameRef}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLocked || isLoading}
                    placeholder="OPERATIVE ID"
                    type="text"
                    style={{width:'100%',height:'56px',padding:'0 20px',fontSize:'14px',color:'#ffffff',background:'#201f1f',border:'none',borderRadius:'0.75rem',fontFamily:'"Space Grotesk",sans-serif',letterSpacing:'0.05em',outline:'none'}}
                  />
                  <div style={{position:'absolute',right:'16px',top:'50%',transform:'translateY(-50%)',color: focusedField === 'username' ? '#99f7ff' : '#494847',transition:'color 0.3s'}}>
                    <Icon name="fingerprint" size={24} />
                  </div>
                </div>
              </div>

              {/* Access Key Field */}
              <div>
                <label style={{display:'block',marginBottom:'8px',paddingLeft:'4px'}}>
                  <span style={{fontFamily:'"Space Grotesk",sans-serif',fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.1em',color:'#adaaaa'}}>Credential Omega</span>
                </label>
                <div style={{position:'relative'}}>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLocked || isLoading}
                    placeholder="ACCESS KEY"
                    type="password"
                    style={{width:'100%',height:'56px',padding:'0 20px',fontSize:'14px',color:'#ffffff',background:'#201f1f',border:'none',borderRadius:'0.75rem',fontFamily:'"Space Grotesk",sans-serif',letterSpacing:'0.05em',outline:'none'}}
                  />
                  <div style={{position:'absolute',right:'16px',top:'50%',transform:'translateY(-50%)',color: focusedField === 'password' ? '#ff59e3' : '#494847',transition:'color 0.3s'}}>
                    <Icon name="terminal" size={24} />
                  </div>
                </div>
              </div>

              {/* Error / Lockout */}
              {(error || isLocked) && (
                <div style={{display:'flex',alignItems:'center',gap:'8px',paddingLeft:'4px',color:'#ff716c',fontSize:'12px',fontFamily:'"Space Grotesk",sans-serif'}}>
                  <Icon name="error" size={16} />
                  <span>{isLocked ? `Locked — Try again in ${lockoutTimer}s` : error}</span>
                </div>
              )}

              {/* Action Button */}
              <div style={{paddingTop:'16px'}}>
                <button
                  type="submit"
                  disabled={isLocked || isLoading}
                  className="pulse-glow"
                  style={{width:'100%',height:'64px',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',background:'#00f1fe',color:'#005f64',fontFamily:'"Space Grotesk",sans-serif',fontWeight:800,fontSize:'18px',textTransform:'uppercase',letterSpacing:'0.1em',borderRadius:'0.75rem',border:'none',cursor:'pointer',transition:'all 0.3s',opacity: (isLocked || isLoading) ? 0.5 : 1}}
                >
                  {isLoading ? (
                    <span>Initiating...</span>
                  ) : isLocked ? (
                    <span>Locked ({lockoutTimer}s)</span>
                  ) : (
                    <>
                      <span>Infiltrate</span>
                      <Icon name="bolt" size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Reset Password */}
          <div style={{marginTop:'24px',textAlign:'center'}}>
            <button type="button" style={{background:'none',border:'none',cursor:'pointer',fontFamily:'"Space Grotesk",sans-serif',fontSize:'12px',color:'#adaaaa',textTransform:'uppercase',letterSpacing:'0.1em',transition:'color 0.3s'}} onMouseEnter={(e)=>e.target.style.color='#99f7ff'} onMouseLeave={(e)=>e.target.style.color='#adaaaa'}>
              Reset Password
            </button>
          </div>
        </div>

        {/* Footer Meta */}
        <div style={{marginTop:'32px',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#00f1fe',animation:'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></div>
            <span style={{fontFamily:'"Space Grotesk",sans-serif',fontSize:'10px',color:'#adaaaa',textTransform:'uppercase',letterSpacing:'0.1em'}}>Mainframe Online</span>
          </div>
          <div style={{display:'flex',gap:'16px'}}>
            <span style={{fontFamily:'"Space Grotesk",sans-serif',fontSize:'10px',color:'#777575',textTransform:'uppercase',cursor:'pointer'}}>v2.5.0</span>
            <span style={{fontFamily:'"Space Grotesk",sans-serif',fontSize:'10px',color:'#777575',textTransform:'uppercase',cursor:'pointer'}}>Privacy</span>
          </div>
        </div>
      </main>

      {/* Dynamic Ambient Decorative Element */}
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'800px',height:'800px',border:'1px solid rgba(153,247,255,0.05)',borderRadius:'50%',pointerEvents:'none'}}></div>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%) scale(1.25)',width:'600px',height:'600px',border:'1px solid rgba(255,89,227,0.05)',borderRadius:'50%',pointerEvents:'none'}}></div>
    </div>
  );
}
