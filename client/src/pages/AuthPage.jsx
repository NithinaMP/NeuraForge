import { useState, useEffect } from 'react';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);

  // Auto-generate strong password when user is in register mode and types name or email
  useEffect(() => {
    if (mode === 'register' && (name.trim() || email.trim())) {
      if (!password || password.length < 8) {   // Only generate if field is empty or too short
        const newPassword = generateStrongPassword();
        setPass(newPassword);
        setShowGenerated(true);
      }
    } else {
      setShowGenerated(false);
    }
  }, [mode, name, email]);   // Trigger when name or email changes

  function generateStrongPassword(length = 16) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  const validate = () => {
    if (mode === 'register' && !name.trim()) return 'Full name is required.';
    if (!email.includes('@')) return 'Enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(mode === 'login' ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'login'
            ? { email: email.trim().toLowerCase(), password }
            : { name: name.trim(), email: email.trim().toLowerCase(), password }
        ),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');

      localStorage.setItem('s_token', data.token);
      localStorage.setItem('s_user', JSON.stringify(data.user));
      onAuth(data.user, data.token);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    setMode('login');
    setEmail('demo@sentinel.ai');
    setPass('demo123');
    setName('Demo Agent');
    setError('');
    setShowGenerated(false);
  };

  return (
    <div className="full-page">
      {/* Your existing corner brackets and brand section remain the same */}
      <div style={{ position: 'fixed', top: 22, left: 22, width: 30, height: 30, borderTop: '1px solid rgba(0,255,136,0.2)', borderLeft: '1px solid rgba(0,255,136,0.2)' }} />
      <div style={{ position: 'fixed', top: 22, right: 22, width: 30, height: 30, borderTop: '1px solid rgba(0,255,136,0.2)', borderRight: '1px solid rgba(0,255,136,0.2)' }} />
      <div style={{ position: 'fixed', bottom: 22, left: 22, width: 30, height: 30, borderBottom: '1px solid rgba(0,255,136,0.2)', borderLeft: '1px solid rgba(0,255,136,0.2)' }} />
      <div style={{ position: 'fixed', bottom: 22, right: 22, width: 30, height: 30, borderBottom: '1px solid rgba(0,255,136,0.2)', borderRight: '1px solid rgba(0,255,136,0.2)' }} />

      <div className="anim-up" style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 18 }}>
          <div className="dot dot-green" />
          <span className="font-m" style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '0.22em' }}>
            SENTINEL ASSEMBLY · v2.0
          </span>
          <div className="dot dot-green" />
        </div>
        <h1 className="font-d" style={{ fontSize: 'clamp(44px,9vw,72px)', fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.025em', color: '#fff' }}>
          SENTINEL
        </h1>
        <h1 className="font-d" style={{ fontSize: 'clamp(44px,9vw,72px)', fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.025em', color: 'var(--green)', marginBottom: 20 }}>
          ASSEMBLY
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>
          Self-governing AI content governance engine.<br />
          Three agents. One truth.
        </p>
      </div>

      <div className="card anim-up-1" style={{ width: '100%', maxWidth: 400, padding: 28 }}>
        <div className="tabs" style={{ marginBottom: 24 }}>
          <button className={`tab-item ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setShowGenerated(false); setPass(''); }}>
            Sign In
          </button>
          <button className={`tab-item ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); setShowGenerated(false); }}>
            Create Account
          </button>
        </div>

        {mode === 'register' && (
          <div style={{ marginBottom: 14 }}>
            <label className="label">Full Name</label>
            <input className="input" placeholder="Your full name" value={name}
              onChange={e => setName(e.target.value)} autoComplete="name" />
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label className="label">Email Address</label>
          <input className="input" type="email" placeholder="you@company.com" value={email}
            onChange={e => setEmail(e.target.value)} autoComplete="email" />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Password</label>
          <input className="input" type="password"
            placeholder="Strong password will appear automatically"
            value={password} 
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} 
            autoComplete="new-password" />
        </div>

        {/* Auto-generated password display */}
        {showGenerated && mode === 'register' && password && (
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            background: 'rgba(0, 255, 136, 0.08)', 
            border: '1px solid rgba(0,255,136,0.4)', 
            borderRadius: 8 
          }}>
            <div style={{ color: 'var(--green)', fontSize: 13, marginBottom: 6 }}>
              ✅ Strong password auto-generated for you:
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#fff', wordBreak: 'break-all' }}>
              {password}
            </div>
            <small style={{ color: 'var(--text-2)' }}>You can edit it or use as-is.</small>
          </div>
        )}

        {error && (
          <div className="form-error" style={{ marginBottom: 14 }}>
            <span>⚠</span> {error}
          </div>
        )}

        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? <>Processing...</> : mode === 'login' ? '→ Access Sentinel' : '→ Create Account'}
        </button>

        <div className="divider">
          <span className="divider-text">OR</span>
        </div>

        <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={loadDemo}>
          Load demo credentials
        </button>
      </div>

      {/* <div className="anim-up-2" style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['3-Agent Pipeline', 'JWT Secured', 'Mission History', 'Free AI Tier'].map(t => (
          <span key={t} className="chip chip-dim">{t}</span>
        ))}
      </div> */}

      {/* Creative Footer Badges */}
<div className="anim-up-2" style={{ 
  display: 'flex', 
  gap: 10, 
  marginTop: 40, 
  flexWrap: 'wrap', 
  justifyContent: 'center' 
}}>
  {[
    "Three Minds, One Truth",
    "Vault-Locked Security",
    "Living Archive",
    "Unlimited Free Runs"
  ].map((text, i) => (
    <span 
      key={i} 
      className="chip chip-dim" 
      style={{ 
        fontSize: 11.5, 
        padding: '8px 16px',
        letterSpacing: '0.04em',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      {text}
    </span>
  ))}
</div>
    </div>
  );
}










// import { useState } from 'react'

// export default function AuthPage({ onAuth }) {
//   const [mode, setMode]       = useState('login')
//   const [name, setName]       = useState('')
//   const [email, setEmail]     = useState('')
//   const [password, setPass]   = useState('')
//   const [error, setError]     = useState('')
//   const [loading, setLoading] = useState(false)

//   const validate = () => {
//     if (mode === 'register' && !name.trim()) return 'Full name is required.'
//     if (!email.includes('@')) return 'Enter a valid email address.'
//     if (password.length < 6) return 'Password must be at least 6 characters.'
//     return null
//   }

//   const submit = async () => {
//     const err = validate()
//     if (err) { setError(err); return }
//     setError('')
//     setLoading(true)
//     try {
//       // const res = await fetch(mode === 'login' ? '/api/auth/login' : '/api/auth/register', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify(
//       //     mode === 'login'
//       //       ? { email: email.trim().toLowerCase(), password }
//       //       : { name: name.trim(), email: email.trim().toLowerCase(), password }
//       //   ),
//       // })
//       // Ensure this part matches your backend logic exactly
// const res = await fetch(mode === 'login' ? 'http://localhost:3001/api/auth/login' : 'http://localhost:3001/api/auth/register', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(
//     mode === 'login'
//       ? { email: email.trim().toLowerCase(), password }
//       : { username: name.trim(), password } // Changed 'name' to 'username' to match database.js
//   ),
// })
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error || 'Something went wrong.')
//       localStorage.setItem('s_token', data.token)
//       localStorage.setItem('s_user', JSON.stringify(data.user))
//       onAuth(data.user, data.token)
//     } catch (e) {
//       setError(e.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const loadDemo = () => {
//     setEmail('demo@sentinel.ai')
//     setPass('demo123')
//     setName('Demo Agent')
//     setError('')
//   }

//   return (
//     <div className="full-page">
//       {/* Corner brackets */}
//       <div style={{ position: 'fixed', top: 22, left: 22, width: 30, height: 30, borderTop: '1px solid rgba(0,255,136,0.2)', borderLeft: '1px solid rgba(0,255,136,0.2)' }} />
//       <div style={{ position: 'fixed', top: 22, right: 22, width: 30, height: 30, borderTop: '1px solid rgba(0,255,136,0.2)', borderRight: '1px solid rgba(0,255,136,0.2)' }} />
//       <div style={{ position: 'fixed', bottom: 22, left: 22, width: 30, height: 30, borderBottom: '1px solid rgba(0,255,136,0.2)', borderLeft: '1px solid rgba(0,255,136,0.2)' }} />
//       <div style={{ position: 'fixed', bottom: 22, right: 22, width: 30, height: 30, borderBottom: '1px solid rgba(0,255,136,0.2)', borderRight: '1px solid rgba(0,255,136,0.2)' }} />

//       {/* Brand */}
//       <div className="anim-up" style={{ textAlign: 'center', marginBottom: 44 }}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 18 }}>
//           <div className="dot dot-green" />
//           <span className="font-m" style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '0.22em' }}>
//             SENTINEL ASSEMBLY · v2.0
//           </span>
//           <div className="dot dot-green" />
//         </div>
//         <h1 className="font-d" style={{ fontSize: 'clamp(44px,9vw,72px)', fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.025em', color: '#fff' }}>
//           SENTINEL
//         </h1>
//         <h1 className="font-d" style={{ fontSize: 'clamp(44px,9vw,72px)', fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.025em', color: 'var(--green)', marginBottom: 20 }}>
//           ASSEMBLY
//         </h1>
//         <p style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>
//           Self-governing AI content governance engine.<br />
//           Three agents. One truth.
//         </p>
//       </div>

//       {/* Auth Card */}
//       <div className="card anim-up-1" style={{ width: '100%', maxWidth: 400, padding: 28 }}>
//         {/* Mode toggle */}
//         <div className="tabs" style={{ marginBottom: 24 }}>
//           <button className={`tab-item ${mode === 'login' ? 'active' : ''}`}
//             onClick={() => { setMode('login'); setError('') }}>
//             Sign In
//           </button>
//           <button className={`tab-item ${mode === 'register' ? 'active' : ''}`}
//             onClick={() => { setMode('register'); setError('') }}>
//             Create Account
//           </button>
//         </div>

//         {/* Fields */}
//         {mode === 'register' && (
//           <div style={{ marginBottom: 14 }}>
//             <label className="label">Full Name</label>
//             <input className="input" placeholder="Your full name" value={name}
//               onChange={e => setName(e.target.value)} autoComplete="name" />
//           </div>
//         )}

//         <div style={{ marginBottom: 14 }}>
//           <label className="label">Email Address</label>
//           <input className="input" type="email" placeholder="you@company.com" value={email}
//             onChange={e => setEmail(e.target.value)} autoComplete="email" />
//         </div>

//         <div style={{ marginBottom: 20 }}>
//           <label className="label">Password</label>
//           <input className="input" type="password"
//             placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
//             value={password} onChange={e => setPass(e.target.value)}
//             onKeyDown={e => e.key === 'Enter' && submit()} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
//         </div>

//         {error && (
//           <div className="form-error" style={{ marginBottom: 14 }}>
//             <span>⚠</span> {error}
//           </div>
//         )}

//         <button className="btn-primary" onClick={submit} disabled={loading}>
//           {loading
//             ? <><div className="spinner" style={{ color: '#02040a' }} /> Processing...</>
//             : mode === 'login' ? '→ Access Sentinel' : '→ Create Account'
//           }
//         </button>

//         <div className="divider">
//           <span className="divider-text">OR</span>
//         </div>

//         <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={loadDemo}>
//           Load demo credentials
//         </button>
//       </div>

//       {/* Footer badges */}
//       <div className="anim-up-2" style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
//         {['3-Agent Pipeline', 'JWT Secured', 'Mission History', 'Free AI Tier'].map(t => (
//           <span key={t} className="chip chip-dim">{t}</span>
//         ))}
//       </div>
//     </div>
//   )
// }











// // import { useState } from 'react'

// // export default function AuthPage({ onAuth }) {
// //   const [mode, setMode]       = useState('login')
// //   const [name, setName]       = useState('')
// //   const [email, setEmail]     = useState('')
// //   const [password, setPass]   = useState('')
// //   const [error, setError]     = useState('')
// //   const [loading, setLoading] = useState(false)

// //   // ── Validation Logic ────────────────────────────────
// //   const validate = () => {
// //     // Mode-specific checks
// //     if (mode === 'register') {
// //       if (!name || name.trim().length < 2) return 'Full name is required.'
// //     }
    
// //     // Global checks
// //     if (!email || !email.includes('@')) return 'Enter a valid email address.'
// //     if (!password || password.length < 6) return 'Password must be at least 6 characters.'
    
// //     return null
// //   }

// //   // ── Submit Handshake ────────────────────────────────
// //   const submit = async () => {
// //     const validationError = validate()
// //     if (validationError) {
// //       setError(validationError)
// //       return
// //     }

// //     setError('')
// //     setLoading(true)

// //     try {
// //       const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      
// //       // We use relative paths. Vite Proxy will handle the localhost:3001 bridge.
// //       const res = await fetch(endpoint, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(
// //           mode === 'login'
// //             ? { 
// //                 email: email.trim().toLowerCase(), 
// //                 password: password 
// //               }
// //             : { 
// //                 name: name.trim(), 
// //                 email: email.trim().toLowerCase(), 
// //                 password: password 
// //               }
// //         ),
// //       })

// //       const data = await res.json()

// //       if (!res.ok) {
// //         throw new Error(data.error || 'Identity verification failed.')
// //       }

// //       // Vault Storage
// //       localStorage.setItem('s_token', data.token)
// //       localStorage.setItem('s_user', JSON.stringify(data.user))
      
// //       // Grant Access
// //       onAuth(data.user, data.token)

// //     } catch (e) {
// //       setError(e.message)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   // ── Demo Credential Injector ────────────────────────
// //   const loadDemo = () => {
// //     setMode('login') // Switch to login for demo
// //     setEmail('demo@sentinel.ai')
// //     setPass('demo123')
// //     setName('Demo Agent')
// //     setError('')
// //   }
  


// //   // return (
// //   //   <div className="full-page">
// //   //     {/* Corner Brackets */}
// //   //     <div className="bracket-tl" />
// //   //     <div className="bracket-tr" />
// //   //     <div className="bracket-bl" />
// //   //     <div className="bracket-br" />

// //   //     {/* Brand Header */}
// //   //     <div className="anim-up" style={{ textAlign: 'center', marginBottom: 44 }}>
// //   //       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 18 }}>
// //   //         <div className="dot dot-green" />
// //   //         <span className="font-m" style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '0.22em' }}>
// //   //           SENTINEL ASSEMBLY · v2.0
// //   //         </span>
// //   //         <div className="dot dot-green" />
// //   //       </div>
// //   //       <h1 className="font-d brand-title">SENTINEL</h1>
// //   //       <h1 className="font-d brand-title green">ASSEMBLY</h1>
// //   //       <p className="brand-sub">
// //   //         Self-governing AI content governance engine.<br />
// //   //         Three agents. One truth.
// //   //       </p>
// //   //     </div>

// //   //     {/* Auth Card */}
// //   //     <div className="card anim-up-1 auth-card">
// //   //       {/* Mode toggle */}
// //   //       <div className="tabs" style={{ marginBottom: 24 }}>
// //   //         <button 
// //   //           className={`tab-item ${mode === 'login' ? 'active' : ''}`}
// //   //           onClick={() => { setMode('login'); setError('') }}>
// //   //           Sign In
// //   //         </button>
// //   //         <button 
// //   //           className={`tab-item ${mode === 'register' ? 'active' : ''}`}
// //   //           onClick={() => { setMode('register'); setError('') }}>
// //   //           Create Account
// //   //         </button>
// //   //       </div>

// //   //       {/* Dynamic Fields */}
// //   //       <div className="form-container">
// //   //         {mode === 'register' && (
// //   //           <div className="field-group">
// //   //             <label className="label">Full Name</label>
// //   //             <input 
// //   //               className="input" 
// //   //               placeholder="Ex: Adithya Ganesh" 
// //   //               value={name}
// //   //               onChange={e => setName(e.target.value)} 
// //   //               autoComplete="name" 
// //   //             />
// //   //           </div>
// //   //         )}

// //   //         <div className="field-group">
// //   //           <label className="label">Email Address</label>
// //   //           <input 
// //   //             className="input" 
// //   //             type="email" 
// //   //             placeholder="agent@sentinel.ai" 
// //   //             value={email}
// //   //             onChange={e => setEmail(e.target.value)} 
// //   //             autoComplete="email" 
// //   //           />
// //   //         </div>

// //   //         <div className="field-group">
// //   //           <label className="label">Password</label>
// //   //           <input 
// //   //             className="input" 
// //   //             type="password"
// //   //             placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
// //   //             value={password} 
// //   //             onChange={e => setPass(e.target.value)}
// //   //             onKeyDown={e => e.key === 'Enter' && submit()} 
// //   //             autoComplete={mode === 'login' ? 'current-password' : 'new-password'} 
// //   //           />
// //   //         </div>
// //   //       </div>

// //   //       {error && (
// //   //         <div className="form-error">
// //   //           <span>⚠</span> {error}
// //   //         </div>
// //   //       )}

// //   //       <button className="btn-primary" onClick={submit} disabled={loading}>
// //   //         {loading
// //   //           ? <><div className="spinner" /> Processing...</>
// //   //           : mode === 'login' ? '→ Access Sentinel' : '→ Create Account'
// //   //         }
// //   //       </button>

// //   //       <div className="divider">
// //   //         <span className="divider-text">OR</span>
// //   //       </div>

// //   //       <button className="btn-ghost demo-btn" onClick={loadDemo}>
// //   //         Load demo credentials
// //   //       </button>
// //   //     </div>

// //   //     {/* Global Metadata */}
// //   //     <div className="anim-up-2 chip-container">
// //   //       {['3-Agent Pipeline', 'JWT Secured', 'MySQL Vault', 'Vite/ESM'].map(t => (
// //   //         <span key={t} className="chip chip-dim">{t}</span>
// //   //       ))}
// //   //     </div>
// //   //   </div>
// //   // )
// // }