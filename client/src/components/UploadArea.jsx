// import { useState, useRef } from 'react';

// const PERSONAS = [
//   { id: 'professional', icon: '◈', name: 'Corporate Executive', desc: 'Formal · data-driven · authoritative' },
//   { id: 'hype',         icon: '◉', name: 'Hype Beast',          desc: 'Energetic · viral · FOMO-driven' },
//   { id: 'minimalist',   icon: '◎', name: 'The Minimalist',      desc: 'Clean · concise · zero fluff' },
// ];

// const SAMPLE = `Product: NovaSpark AI Writing Assistant v2.0
// Launch Date: May 15, 2026
// Pricing: Free tier | Pro $29/month | Team $99/month

// Core Features:
// - Real-time grammar and style suggestions powered by GPT-4o
// - Supports 27 languages with native-level tone adaptation
// - Plagiarism detection across 50 billion web pages
// - One-click export: Google Docs, Notion, Microsoft Word
// - Team collaboration: tracked changes, version history, comments

// Technical Specs:
// - Response time: under 200ms (average)
// - Uptime SLA: 99.9%
// - Data encryption: AES-256 at rest and in transit
// - API rate limit: 1,000 requests/hour (Pro plan)

// Target Audience: Content marketers, SaaS companies, indie bloggers, enterprise writing teams.

// Value Proposition: NovaSpark reduces content creation time by 70% while guaranteeing brand voice consistency — proven across 10,000+ beta users in a 6-month trial.`;

// export default function UploadArea({ onStart, user, token, onLogout, onViewMission }) {
//   const [mode,        setMode]      = useState('text');
//   const [text,        setText]      = useState('');
//   const [file,        setFile]      = useState(null);
//   const [drag,        setDrag]      = useState(false);
//   const [persona,     setPersona]   = useState('professional');
//   const [showHistory, setHistory]   = useState(false);
//   const [missions,    setMissions]  = useState([]);
//   const [loadingH,    setLoadingH]  = useState(false);
//   const fileRef = useRef();

//   const canStart = (mode === 'text' && text.trim().length > 40) || (mode === 'file' && file);

//   const fetchHistory = async () => {
//     if (!showHistory) {
//       setLoadingH(true);
//       try {
//         const res = await fetch('/api/missions', { 
//           headers: { Authorization: `Bearer ${token}` } 
//         });
//         const data = await res.json();
//         setMissions(Array.isArray(data) ? data : []);
//       } catch (e) {
//         console.error(e);
//         setMissions([]);
//       }
//       setLoadingH(false);
//     }
//     setHistory(h => !h);
//   };

//   const openMission = (id) => {
//     onViewMission(id);
//     setHistory(false); // Close drawer after opening detail
//   };

//   return (
//     <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

//       {/* History Drawer */}
//       <div style={{
//         width: showHistory ? 320 : 0,
//         flexShrink: 0,
//         overflow: 'hidden',
//         transition: 'width 0.35s cubic-bezier(0.23,1,0.32,1)',
//         borderRight: '1px solid var(--border)',
//         background: 'rgba(7,13,26,0.95)',
//         display: 'flex',
//         flexDirection: 'column',
//       }}>
//         <div style={{ minWidth: 320, padding: '20px 18px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
//             <span className="section-label" style={{ margin: 0, fontSize: 13 }}>MISSION HISTORY</span>
//             <button className="btn-icon" onClick={() => setHistory(false)}>✕</button>
//           </div>

//           <div style={{ flex: 1, overflowY: 'auto' }}>
//             {loadingH ? (
//               <div style={{ textAlign: 'center', paddingTop: 60 }}>
//                 <div className="spinner" style={{ color: 'var(--green)' }} />
//               </div>
//             ) : missions.length === 0 ? (
//               <div className="font-m" style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', paddingTop: 60, lineHeight: 1.8 }}>
//                 No missions yet.<br />Complete your first pipeline to see history here.
//               </div>
//             ) : (
//               missions.map(m => (
//                 <div
//                   key={m.id}
//                   className="history-item"
//                   onClick={() => openMission(m.id)}
//                   style={{ cursor: 'pointer', transition: 'all 0.2s' }}
//                   onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,136,0.08)'}
//                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//                 >
//                   <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
//                     <div className="dot dot-green" style={{ marginTop: 4 }} />
//                     <span className="font-d" style={{ 
//                       fontSize: 13.5, 
//                       fontWeight: 600, 
//                       color: '#fff', 
//                       lineHeight: 1.35,
//                       flex: 1 
//                     }}>
//                       {m.title?.length > 55 ? m.title.slice(0, 55) + '…' : m.title}
//                     </span>
//                   </div>

//                   <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
//                     <span className="chip chip-dim" style={{ fontSize: 9.5 }}>{m.personality || 'professional'}</span>
//                     <span className="chip chip-dim" style={{ fontSize: 9.5 }}>
//                       {m.total_attempts} loop{m.total_attempts > 1 ? 's' : ''}
//                     </span>
//                     <span className="chip chip-green" style={{ fontSize: 9.5 }}>{m.confidence}%</span>
//                     <span className="chip chip-dim" style={{ fontSize: 9.5 }}>
//                       {new Date(m.created_at).toLocaleDateString('en-IN')}
//                     </span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Main Upload Area */}
//       <div style={{
//         flex: 1,
//         overflowY: 'auto',
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'flex-start', // CHANGE: was 'center'
//         padding: '80px 24px',         // CHANGE: added more top padding (80px)
//         position: 'relative',
//         background: '#050a14'
//       }}>

//         {/* Top Right Controls */}
//         <div style={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 12, alignItems: 'center', zIndex: 10 }}>
//           <button className="btn-ghost" onClick={fetchHistory}>
//             {showHistory ? '✕ Close History' : '◫ Mission History'}
//           </button>
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 10,
//             padding: '8px 16px',
//             border: '1px solid var(--border-hi)',
//             borderRadius: 8,
//             background: 'rgba(255,255,255,0.02)'
//           }}>
//             <div className="dot dot-green" />
//             <span className="font-m" style={{ fontSize: 12, color: 'var(--text-2)' }}>{user?.name || 'Agent'}</span>
//             <button 
//               onClick={onLogout} 
//               style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 11, cursor: 'pointer' }}
//             >
//               logout
//             </button>
//           </div>
//         </div>

//         {/* Brand Hero
//         <div className="anim-up" style={{ textAlign: 'center', maxWidth: 580, marginBottom: 48 }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
//             <div className="dot dot-green" />
//             <span className="font-m" style={{ fontSize: 11, color: 'var(--green)', letterSpacing: '0.25em' }}>
//               SELF-CORRECTING • TRUSTED • AUTONOMOUS
//             </span>
//             <div className="dot dot-green" />
//           </div>
//           <h1 className="font-d" style={{ fontSize: 'clamp(48px, 8vw, 72px)', fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.03em', color: '#fff' }}>
//             SENTINEL
//           </h1>
//           <h1 className="font-d" style={{ fontSize: 'clamp(48px, 8vw, 72px)', fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.03em', color: 'var(--green)', marginBottom: 20 }}>
//             ASSEMBLY
//           </h1>
//           <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.65 }}>
//             Three agents argue, audit, and approve.<br />
//             Until the output is 100% hallucination-free.
//           </p>
//         </div> */}

//         {/* Brand Hero - Fixed & Full Visibility */}
// <div className="anim-up" style={{ 
//   textAlign: 'center', 
//   maxWidth: 680, 
//   marginBottom: 52,
//   paddingTop: 20   // Added breathing room at top
// }}>
//   <div style={{ 
//     display: 'flex', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     gap: 10, 
//     marginBottom: 18 
//   }}>
//     <div className="dot dot-green" />
//     <span className="font-m" style={{ 
//       fontSize: 11.5, 
//       color: 'var(--green)', 
//       letterSpacing: '0.28em' 
//     }}>
//       AUTONOMOUS • ADVERSARIAL • TRUSTED
//     </span>
//     <div className="dot dot-green" />
//   </div>

//   {/* SENTINEL - Smaller and better spaced */}
//   <h1 className="font-d" style={{ 
//     fontSize: 'clamp(42px, 7.5vw, 68px)', 
//     fontWeight: 800, 
//     lineHeight: 0.88, 
//     letterSpacing: '-0.035em', 
//     color: '#fff',
//     marginBottom: 6,
//     whiteSpace: 'nowrap'
//   }}>
//     SENTINEL
//   </h1>

//   {/* ASSEMBLY - Bright green, slightly larger */}
//   <h1 className="font-d" style={{ 
//     fontSize: 'clamp(52px, 9vw, 82px)', 
//     fontWeight: 800, 
//     lineHeight: 0.85, 
//     letterSpacing: '-0.04em', 
//     color: 'var(--green)',
//     marginBottom: 24
//   }}>
//     ASSEMBLY
//   </h1>

//   <p style={{ 
//     fontSize: 16.5, 
//     color: 'var(--text-2)', 
//     fontWeight: 300, 
//     lineHeight: 1.65,
//     maxWidth: 520,
//     margin: '0 auto'
//   }}>
//     Three agents argue, audit, and approve your content<br />
//     until the output is 100% hallucination-free and brand-safe.
//   </p>
// </div>

//         {/* Personality Selector */}
//         <div className="anim-up-1" style={{ width: '100%', maxWidth: 580, marginBottom: 24 }}>
//           <div className="section-label">GHOSTWRITER PERSONALITY</div>
//           <div style={{ display: 'flex', gap: 10 }}>
//             {PERSONAS.map(p => (
//               <div
//                 key={p.id}
//                 className={`persona-card ${persona === p.id ? 'selected' : ''}`}
//                 onClick={() => setPersona(p.id)}
//               >
//                 <div style={{ fontSize: 24, marginBottom: 8, color: persona === p.id ? 'var(--green)' : 'var(--text-3)' }}>{p.icon}</div>
//                 <div className="font-d" style={{ fontSize: 13.5, fontWeight: 600, color: persona === p.id ? '#fff' : 'var(--text)' }}>{p.name}</div>
//                 <div className="font-m" style={{ fontSize: 10, color: persona === p.id ? 'var(--text-2)' : 'var(--text-3)', lineHeight: 1.5 }}>{p.desc}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Input Card */}
//         <div className="card anim-up-2" style={{ width: '100%', maxWidth: 580, padding: 28 }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
//             <span className="section-label" style={{ margin: 0 }}>MISSION INPUT</span>
//             <div className="tabs" style={{ width: 'auto' }}>
//               <button className={`tab-item ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>Paste Text</button>
//               <button className={`tab-item ${mode === 'file' ? 'active' : ''}`} onClick={() => setMode('file')}>Upload File</button>
//             </div>
//           </div>

//           {mode === 'text' ? (
//             <>
//               <textarea
//                 className="textarea"
//                 placeholder="Paste your product document, technical spec, press release, or any source text here..."
//                 value={text}
//                 onChange={e => setText(e.target.value)}
//                 style={{ minHeight: 180 }}
//               />
//               <button
//                 onClick={() => setText(SAMPLE)}
//                 style={{
//                   marginTop: 10,
//                   width: '100%',
//                   padding: '10px',
//                   background: 'transparent',
//                   border: '1px solid var(--border)',
//                   borderRadius: 8,
//                   color: 'var(--text-3)',
//                   fontSize: 11,
//                   cursor: 'pointer',
//                   transition: 'all 0.2s'
//                 }}
//                 onMouseEnter={e => { e.target.style.color = '#0f0'; e.target.style.borderColor = 'rgba(0,255,136,0.4)'; }}
//                 onMouseLeave={e => { e.target.style.color = 'var(--text-3)'; e.target.style.borderColor = 'var(--border)'; }}
//               >
//                 ↓ LOAD SAMPLE DOCUMENT
//               </button>
//             </>
//           ) : (
//             <div
//               className={`drop-zone ${drag ? 'drag-over' : ''}`}
//               onDragOver={e => { e.preventDefault(); setDrag(true); }}
//               onDragLeave={() => setDrag(false)}
//               onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
//               onClick={() => fileRef.current.click()}
//             >
//               <input ref={fileRef} type="file" accept=".txt,.md" hidden onChange={e => setFile(e.target.files[0])} />
//               {file ? (
//                 <>
//                   <div style={{ fontSize: 42, marginBottom: 12 }}>📄</div>
//                   <div className="font-m" style={{ color: '#0f0', fontSize: 14 }}>{file.name}</div>
//                   <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 6 }}>
//                     {(file.size / 1024).toFixed(1)} KB • Ready to process
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div style={{ fontSize: 42, marginBottom: 12, opacity: 0.3 }}>⬆</div>
//                   <div style={{ color: 'var(--text-2)', fontSize: 15 }}>Drop .txt or .md file here</div>
//                   <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 6 }}>or click to browse</div>
//                 </>
//               )}
//             </div>
//           )}

//           <button
//             className="btn-primary"
//             style={{ marginTop: 24, width: '100%' }}
//             disabled={!canStart}
//             onClick={() => onStart({ type: mode, text, file, personality: persona })}
//           >
//             ⚡ ACTIVATE SENTINEL ASSEMBLY
//           </button>

//           {/* <div className="font-m" style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-3)', marginTop: 16, letterSpacing: '0.1em' }}>
//             3-AGENT PIPELINE • SELF-CORRECTING • AUTO-SAVED TO HISTORY
//           </div> */}
//           {/* Creative Footer Badges */}
// <div className="anim-up-2" style={{ 
//   display: 'flex', 
//   gap: 10, 
//   marginTop: 40, 
//   flexWrap: 'wrap', 
//   justifyContent: 'center' 
// }}>
//   {[
//     "Three Minds, One Truth",
//     "Vault-Locked Security",
//     "Living Archive",
//     "Unlimited Free Runs"
//   ].map((text, i) => (
//     <span 
//       key={i} 
//       className="chip chip-dim" 
//       style={{ 
//         fontSize: 11.5, 
//         padding: '8px 16px',
//         letterSpacing: '0.04em',
//         background: 'rgba(255,255,255,0.03)',
//         border: '1px solid rgba(255,255,255,0.08)'
//       }}
//     >
//       {text}
//     </span>
//   ))}
// </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState, useRef } from 'react';

const PERSONAS = [
  { id: 'professional', icon: '◈', name: 'Corporate Executive', desc: 'Formal · data-driven · authoritative' },
  { id: 'hype',         icon: '◉', name: 'Hype Beast',          desc: 'Energetic · viral · FOMO-driven' },
  { id: 'minimalist',   icon: '◎', name: 'The Minimalist',      desc: 'Clean · concise · zero fluff' },
];

const SAMPLE = `Product: NovaSpark AI Writing Assistant v2.0
Launch Date: May 15, 2026
Pricing: Free tier | Pro $29/month | Team $99/month

Core Features:
- Real-time grammar and style suggestions powered by GPT-4o
- Supports 27 languages with native-level tone adaptation
- Plagiarism detection across 50 billion web pages
- One-click export: Google Docs, Notion, Microsoft Word
- Team collaboration: tracked changes, version history, comments

Technical Specs:
- Response time: under 200ms (average)
- Uptime SLA: 99.9%
- Data encryption: AES-256 at rest and in transit
- API rate limit: 1,000 requests/hour (Pro plan)

Target Audience: Content marketers, SaaS companies, indie bloggers, enterprise writing teams.

Value Proposition: NovaSpark reduces content creation time by 70% while guaranteeing brand voice consistency — proven across 10,000+ beta users in a 6-month trial.`;

export default function UploadArea({ onStart, user, token, onLogout, onViewMission }) {
  const [mode,        setMode]      = useState('text');
  const [text,        setText]      = useState('');
  const [file,        setFile]      = useState(null);
  const [drag,        setDrag]      = useState(false);
  const [persona,     setPersona]   = useState('professional');
  const [showHistory, setHistory]   = useState(false);
  const [missions,    setMissions]  = useState([]);
  const [loadingH,    setLoadingH]  = useState(false);
  const fileRef = useRef();

  const canStart = (mode === 'text' && text.trim().length > 40) || (mode === 'file' && file);

  const fetchHistory = async () => {
    if (!showHistory) {
      setLoadingH(true);
      try {
        const res = await fetch('/api/missions', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const data = await res.json();
        setMissions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setMissions([]);
      }
      setLoadingH(false);
    }
    setHistory(h => !h);
  };

  const openMission = (id) => {
    onViewMission(id);
    setHistory(false); 
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* History Drawer */}
      <div style={{
        width: showHistory ? 320 : 0,
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 0.35s cubic-bezier(0.23,1,0.32,1)',
        borderRight: '1px solid var(--border)',
        background: 'rgba(7,13,26,0.95)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ minWidth: 320, padding: '20px 18px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span className="section-label" style={{ margin: 0, fontSize: 13 }}>MISSION HISTORY</span>
            <button className="btn-icon" onClick={() => setHistory(false)}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingH ? (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <div className="spinner" style={{ color: 'var(--green)' }} />
              </div>
            ) : missions.length === 0 ? (
              <div className="font-m" style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', paddingTop: 60, lineHeight: 1.8 }}>
                No missions yet.<br />Complete your first pipeline to see history here.
              </div>
            ) : (
              missions.map(m => (
                <div
                  key={m.id}
                  className="history-item"
                  onClick={() => openMission(m.id)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,136,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <div className="dot dot-green" style={{ marginTop: 4 }} />
                    <span className="font-d" style={{ 
                      fontSize: 13.5, 
                      fontWeight: 600, 
                      color: '#fff', 
                      lineHeight: 1.35,
                      flex: 1 
                    }}>
                      {m.title?.length > 55 ? m.title.slice(0, 55) + '…' : m.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="chip chip-dim" style={{ fontSize: 9.5 }}>{m.personality || 'professional'}</span>
                    <span className="chip chip-dim" style={{ fontSize: 9.5 }}>
                      {m.total_attempts} loop{m.total_attempts > 1 ? 's' : ''}
                    </span>
                    <span className="chip chip-green" style={{ fontSize: 9.5 }}>{m.confidence}%</span>
                    <span className="chip chip-dim" style={{ fontSize: 9.5 }}>
                      {new Date(m.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Upload Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start', // Fixed Cut-off
        padding: '110px 24px 60px',  // Added Top Buffer
        position: 'relative',
        background: '#050a14'
      }}>

        {/* Top Right Controls */}
        <div style={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 12, alignItems: 'center', zIndex: 10 }}>
          <button className="btn-ghost" onClick={fetchHistory}>
            {showHistory ? '✕ Close History' : '◫ Mission History'}
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            border: '1px solid var(--border-hi)',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.02)'
          }}>
            <div className="dot dot-green" />
            <span className="font-m" style={{ fontSize: 12, color: 'var(--text-2)' }}>{user?.name || 'Agent'}</span>
            <button 
              onClick={onLogout} 
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 11, cursor: 'pointer' }}
            >
              logout
            </button>
          </div>
        </div>

        {/* Brand Hero - Fixed & Full Visibility */}
<div className="anim-up" style={{ 
  textAlign: 'center', 
  maxWidth: 680, 
  marginBottom: 52,
  paddingTop: 20 
}}>
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    marginBottom: 18 
  }}>
    <div className="dot dot-green" />
    <span className="font-m" style={{ 
      fontSize: 11.5, 
      color: 'var(--green)', 
      letterSpacing: '0.28em' 
    }}>
      AUTONOMOUS • ADVERSARIAL • TRUSTED
    </span>
    <div className="dot dot-green" />
  </div>

  <h1 className="font-d" style={{ 
    fontSize: 'clamp(42px, 7.5vw, 68px)', 
    fontWeight: 800, 
    lineHeight: 0.88, 
    letterSpacing: '-0.035em', 
    color: '#fff',
    marginBottom: 6,
    whiteSpace: 'nowrap'
  }}>
    SENTINEL
  </h1>

  <h1 className="font-d" style={{ 
    fontSize: 'clamp(52px, 9vw, 82px)', 
    fontWeight: 800, 
    lineHeight: 0.85, 
    letterSpacing: '-0.04em', 
    color: 'var(--green)',
    marginBottom: 24
  }}>
    ASSEMBLY
  </h1>

  <p style={{ 
    fontSize: 16.5, 
    color: 'var(--text-2)', 
    fontWeight: 300, 
    lineHeight: 1.65,
    maxWidth: 520,
    margin: '0 auto'
  }}>
    Three agents argue, audit, and approve your content<br />
    until the output is 100% hallucination-free and brand-safe.
  </p>
</div>

        {/* Personality Selector */}
        <div className="anim-up-1" style={{ width: '100%', maxWidth: 580, marginBottom: 24 }}>
          <div className="section-label">GHOSTWRITER PERSONALITY</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {PERSONAS.map(p => (
              <div
                key={p.id}
                className={`persona-card ${persona === p.id ? 'selected' : ''}`}
                onClick={() => setPersona(p.id)}
              >
                <div style={{ fontSize: 24, marginBottom: 8, color: persona === p.id ? 'var(--green)' : 'var(--text-3)' }}>{p.icon}</div>
                <div className="font-d" style={{ fontSize: 13.5, fontWeight: 600, color: persona === p.id ? '#fff' : 'var(--text)' }}>{p.name}</div>
                <div className="font-m" style={{ fontSize: 10, color: persona === p.id ? 'var(--text-2)' : 'var(--text-3)', lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Card */}
        <div className="card anim-up-2" style={{ width: '100%', maxWidth: 580, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span className="section-label" style={{ margin: 0 }}>MISSION INPUT</span>
            <div className="tabs" style={{ width: 'auto' }}>
              <button className={`tab-item ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>Paste Text</button>
              <button className={`tab-item ${mode === 'file' ? 'active' : ''}`} onClick={() => setMode('file')}>Upload File</button>
            </div>
          </div>

          {mode === 'text' ? (
            <>
              <textarea
                className="textarea"
                placeholder="Paste your product document, technical spec, press release, or any source text here..."
                value={text}
                onChange={e => setText(e.target.value)}
                style={{ minHeight: 180 }}
              />
              <button
                onClick={() => setText(SAMPLE)}
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-3)',
                  fontSize: 11,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.target.style.color = '#0f0'; e.target.style.borderColor = 'rgba(0,255,136,0.4)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--text-3)'; e.target.style.borderColor = 'var(--border)'; }}
              >
                ↓ LOAD SAMPLE DOCUMENT
              </button>
            </>
          ) : (
            <div
              className={`drop-zone ${drag ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current.click()}
            >
              <input ref={fileRef} type="file" accept=".txt,.md" hidden onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <>
                  <div style={{ fontSize: 42, marginBottom: 12 }}>📄</div>
                  <div className="font-m" style={{ color: '#0f0', fontSize: 14 }}>{file.name}</div>
                  <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 6 }}>
                    {(file.size / 1024).toFixed(1)} KB • Ready to process
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 42, marginBottom: 12, opacity: 0.3 }}>⬆</div>
                  <div style={{ color: 'var(--text-2)', fontSize: 15 }}>Drop .txt or .md file here</div>
                  <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 6 }}>or click to browse</div>
                </>
              )}
            </div>
          )}

          <button
            className="btn-primary"
            style={{ marginTop: 24, width: '100%' }}
            disabled={!canStart}
            onClick={() => onStart({ type: mode, text, file, personality: persona })}
          >
            ⚡ ACTIVATE SENTINEL ASSEMBLY
          </button>

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
      </div>
    </div>
  );
}