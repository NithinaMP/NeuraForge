import { useState, useCallback, useEffect } from 'react'
import AuthPage      from './pages/AuthPage.jsx'
import UploadArea    from './components/UploadArea.jsx'
import AgentChat     from './components/AgentChat.jsx'
import CampaignPreview from './components/CampaignPreview.jsx'

// Phase → progress %
const PHASE_PROGRESS = { archivist: 22, ghostwriter: 58, prosecutor: 82 }
const PHASE_LABEL    = {
  archivist:   'PHASE 1 — FACT EXTRACTION',
  ghostwriter: 'PHASE 2 — CONTENT SYNTHESIS',
  prosecutor:  'PHASE 3 — PROSECUTION AUDIT',
}

export default function App() {
  // ── Auth ────────────────────────────────────────────
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem('s_user')) } catch { return null } })
  const [token, setToken] = useState(() => localStorage.getItem('s_token') || '')

  // ── Pipeline state ──────────────────────────────────
  const [stage,    setStage]    = useState('upload')  // upload | running | done | error
  const [logs,     setLogs]     = useState([])
  const [phase,    setPhase]    = useState(null)
  const [progress, setProgress] = useState(0)
  const [attempts, setAttempts] = useState(1)
  const [result,   setResult]   = useState(null)
  const [errMsg,   setErrMsg]   = useState('')
  const [persona,  setPersona]  = useState('professional')

  const addLog = useCallback(entry => setLogs(prev => [...prev, entry]), [])

  const handleEvent = useCallback(ev => {
    switch (ev.type) {
      case 'pipeline_start':
        addLog({ agent: 'system', status: 'phase', message: ev.message })
        setProgress(4)
        break
      case 'phase':
        setPhase(ev.phase)
        setProgress(PHASE_PROGRESS[ev.phase] || 50)
        addLog({ agent: 'system', status: 'phase', message: ev.message })
        break
      case 'log':
        addLog(ev)
        break
      case 'factsheet':
        addLog({ agent: 'archivist', status: 'approved', message: `Fact-Sheet locked — ${ev.data?.core_features?.length || 0} features, ${ev.data?.technical_specs?.length || 0} specs extracted.` })
        break
      case 'rejected':
        setAttempts(ev.attempt + 1)
        addLog({ agent: 'prosecutor', status: 'rejected', message: `REJECTED — ${ev.correctionNote}` })
        break
      case 'approved':
        addLog({ agent: 'prosecutor', status: 'approved', message: ev.message })
        setProgress(96)
        break
      case 'complete':
        setResult(ev)
        setStage('done')
        setPhase(null)
        setProgress(100)
        break
      case 'error':
        setErrMsg(ev.message)
        setStage('error')
        break
      default: break
    }
  }, [addLog])

  // ── Start pipeline ──────────────────────────────────
  const handleStart = async ({ type, text, file, personality }) => {
    setStage('running')
    setLogs([])
    setResult(null)
    setErrMsg('')
    setAttempts(1)
    setProgress(2)
    setPhase(null)
    setPersona(personality)

    const fd = new FormData()
    fd.append('personality', personality)
    if (type === 'file' && file) fd.append('document', file)
    else fd.append('text', text)

    try {
      const res = await fetch('/api/run-pipeline', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Server error ${res.status}`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try { handleEvent(JSON.parse(line.slice(6))) } catch {}
        }
      }
    } catch (err) {
      setErrMsg(err.message)
      setStage('error')
    }
  }

  // ── Auth handlers ───────────────────────────────────
  const onAuth = (u, t) => { setUser(u); setToken(t) }

  const onLogout = () => {
    localStorage.removeItem('s_token')
    localStorage.removeItem('s_user')
    setUser(null); setToken('')
    setStage('upload'); setLogs([]); setResult(null)
  }

  const reset = () => {
    setStage('upload'); setLogs([]); setResult(null)
    setErrMsg(''); setPhase(null); setAttempts(1); setProgress(0)
  }

  // ── Not logged in ───────────────────────────────────
  if (!user || !token) return <AuthPage onAuth={onAuth} />

  // ── Upload screen ───────────────────────────────────
  if (stage === 'upload') {
    return (
      <UploadArea
        onStart={handleStart}
        user={user}
        token={token}
        onLogout={onLogout}
      />
    )
  }

  // ── Pipeline / done / error ─────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Top bar */}
      <div className="app-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="font-d" style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.04em', color: '#fff' }}>
            SENTINEL <span style={{ color: 'var(--green)' }}>ASSEMBLY</span>
          </span>
          <div style={{ width: 1, height: 18, background: 'var(--border-hi)' }} />
          {phase && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="dot dot-amber" />
              <span className="font-m" style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: '0.1em' }}>
                {PHASE_LABEL[phase]}
              </span>
            </div>
          )}
          {stage === 'done' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="dot dot-green" />
              <span className="font-m" style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '0.1em' }}>MISSION COMPLETE</span>
            </div>
          )}
          {stage === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="dot dot-red" />
              <span className="font-m" style={{ fontSize: 10, color: 'var(--red)', letterSpacing: '0.1em' }}>PIPELINE FAILURE</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {attempts > 1 && <span className="chip chip-red">Loop #{attempts}</span>}
          <span className="chip chip-dim font-m" style={{ fontSize: 9 }}>{logs.length} events</span>
          <button className="btn-ghost" onClick={reset}>↺ New Mission</button>
          <button className="btn-ghost" onClick={onLogout}>logout</button>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Shell */}
      <div className="app-shell">

        {/* Left — Agent Room */}
        <div className="sidebar">
          <div className="sidebar-inner">
            <div className="section-label">◈ Agent Operations Room</div>
            <AgentChat logs={logs} currentPhase={phase} attempts={attempts} />
          </div>
        </div>

        {/* Right — Output */}
        <div className="main-content">

          {/* Running, no result yet */}
          {stage === 'running' && !result && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 36 }}>
              {/* Animated agent orbs */}
              <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                {[
                  { color: 'var(--blue)',  active: phase === 'archivist'   },
                  { color: 'var(--amber)', active: phase === 'ghostwriter' },
                  { color: 'var(--red)',   active: phase === 'prosecutor'  },
                ].map((orb, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: orb.active ? `${orb.color}15` : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${orb.active ? orb.color + '55' : 'rgba(255,255,255,0.07)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.5s',
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: orb.active ? orb.color : 'rgba(255,255,255,0.08)',
                        boxShadow: orb.active ? `0 0 14px ${orb.color}` : 'none',
                        transition: 'all 0.5s',
                      }} />
                    </div>
                    {orb.active && (
                      <div className="orb-ring" style={{ color: orb.color }} />
                    )}
                    {i < 2 && (
                      <div style={{ position: 'absolute', top: '50%', left: '100%', width: 28, height: 1, background: 'rgba(255,255,255,0.06)', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div className="font-d" style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  {PHASE_LABEL[phase] || 'Initializing agents...'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  Agents collaborating in real-time
                </div>
                <div className="font-m" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 10, letterSpacing: '0.08em' }}>
                  ← Watch the Agent Operations Room for live updates
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {stage === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,51,85,0.1)', border: '1px solid rgba(255,51,85,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚠</div>
              <div>
                <div className="font-d" style={{ color: 'var(--red)', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>PIPELINE FAILURE</div>
                <div style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 460, lineHeight: 1.65 }}>{errMsg}</div>
                <div className="font-m" style={{ color: 'var(--text-3)', fontSize: 10, marginTop: 14, lineHeight: 1.9 }}>
                  → Verify OPENROUTER_API_KEY in server/.env<br />
                  → Confirm server is running: node index.js in /server<br />
                  → Check http://localhost:3001/api/health
                </div>
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }} onClick={reset}>
                ↺ Retry Mission
              </button>
            </div>
          )}

          {/* Done — show results */}
          {result && (
            <CampaignPreview
              drafts={result.drafts}
              factSheet={result.factSheet}
              auditTrail={result.auditTrail}
              totalAttempts={result.totalAttempts}
              confidence={result.confidence || 95}
              personality={persona}
            />
          )}

        </div>
      </div>
    </div>
  )
}























// // import { useState, useCallback, useEffect, useRef } from 'react'
// // import UploadArea from './components/UploadArea'
// // import AgentChat from './components/AgentChat'
// // import CampaignPreview from './components/CampaignPreview'

// // const PHASES = {
// //   archivist:   { label: 'PHASE 1 — FACT EXTRACTION',   pct: 25, color: '#0099ff' },
// //   ghostwriter: { label: 'PHASE 2 — CONTENT SYNTHESIS',  pct: 60, color: '#ffaa00' },
// //   prosecutor:  { label: 'PHASE 3 — PROSECUTION AUDIT',  pct: 85, color: '#ff2d55' },
// // }

// // export default function App() {
// //   const [stage, setStage] = useState('upload') 
// //   const [logs, setLogs] = useState([])
// //   const [phase, setPhase] = useState(null)
// //   const [attempts, setAttempts] = useState(1)
// //   const [result, setResult] = useState(null)
// //   const [error, setError] = useState(null)
// //   const [progress, setProgress] = useState(0)
  
// //   // High-End Feature: Terminal Auto-scroll
// //   const addLog = useCallback(entry => {
// //     setLogs(prev => [...prev, { ...entry, id: Date.now(), timestamp: new Date().toLocaleTimeString() }])
// //   }, [])

// //   const handleEvent = useCallback(event => {
// //     if (!event) return;
    
// //     switch (event.type) {
// //       case 'pipeline_start':
// //         addLog({ agent: 'system', status: 'phase', message: 'Core Engine Online. Initializing Assembly...' })
// //         setProgress(5)
// //         break
// //       case 'phase':
// //         setPhase(event.phase)
// //         setProgress(PHASES[event.phase]?.pct || 50)
// //         addLog({ agent: 'system', status: 'phase', message: `DIRECTIVE: ${PHASES[event.phase]?.label}` })
// //         break
// //       case 'log':
// //         addLog(event)
// //         break
// //       case 'factsheet':
// //         addLog({ agent: 'archivist', status: 'approved', message: `FACT-SHEET SEALED: ${event.data?.core_features?.length || 0} features validated.` })
// //         break
// //       case 'rejected':
// //         setAttempts(event.attempt + 1)
// //         addLog({ agent: 'prosecutor', status: 'rejected', message: `INTEGRITY BREACH: ${event.correctionNote}` })
// //         break
// //       case 'approved':
// //         addLog({ agent: 'prosecutor', status: 'approved', message: `COMPLIANCE VERIFIED: ${event.message}` })
// //         setProgress(95)
// //         break
// //       case 'complete':
// //         setResult(event)
// //         setStage('done')
// //         setPhase(null)
// //         setProgress(100)
// //         break
// //       case 'error':
// //         throw new Error(event.message) // Caught by the try-catch block
// //     }
// //   }, [addLog])

// //   const handleStart = async ({ type, file, text }) => {
// //     setStage('running')
// //     setLogs([])
// //     setResult(null)
// //     setError(null)
// //     setAttempts(1)
// //     setProgress(2)

// //     const fd = new FormData()
// //     if (type === 'file') fd.append('document', file)
// //     else fd.append('text', text)

// //     try {
// //       // PRO TIP: Use a full URL for local hackathon testing to avoid Proxy issues
// //       const res = await fetch('http://localhost:3001/api/run-pipeline', { 
// //         method: 'POST', 
// //         body: fd 
// //       })

// //       if (!res.ok) throw new Error(`Link Failure [${res.status}]: Assembly Server Unreachable.`)

// //       const reader = res.body.getReader()
// //       const decoder = new TextDecoder()
// //       let buffer = '' // Professional Stream Buffer

// //       while (true) {
// //         const { done, value } = await reader.read()
// //         if (done) break
        
// //         buffer += decoder.decode(value, { stream: true })
// //         const lines = buffer.split('\n\n') // SSE standard is double newline
// //         buffer = lines.pop() // Keep unfinished chunk in buffer

// //         for (const line of lines) {
// //           if (!line.trim().startsWith('data: ')) continue
// //           try {
// //             const data = JSON.parse(line.replace('data: ', '').trim())
// //             handleEvent(data)
// //           } catch (e) {
// //             console.error("Stream Parsing Error", e)
// //           }
// //         }
// //       }
// //     } catch (err) {
// //       setError(err.message)
// //       setStage('error')
// //     }
// //   }

// //   const reset = () => {
// //     setStage('upload'); setLogs([]); setResult(null)
// //     setError(null); setPhase(null); setAttempts(1); setProgress(0)
// //   }

// //   if (stage === 'upload') return <UploadArea onStart={handleStart} />

// //   const currentPhaseInfo = phase ? PHASES[phase] : null

// //   return (
// //     <div className="sentinel-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#050a14', color: '#fff' }}>
      
// //       {/* Top Bar with "Heartbeat" Status */}
// //       <div className="topbar" style={{ padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,255,136,0.1)' }}>
// //         <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
// //           <div className="brand" style={{ fontWeight: 900, letterSpacing: '2px', fontSize: 18 }}>
// //             SENTINEL <span style={{ color: '#00ff88' }}>ASSEMBLY</span>
// //           </div>
// //           <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.1)' }} />
          
// //           <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
// //             <div className={`dot ${stage === 'running' ? 'pulse-green' : stage === 'error' ? 'red' : 'green'}`} />
// //             <span className="font-m" style={{ fontSize: 10, letterSpacing: '2px', color: stage === 'error' ? '#ff2d55' : '#00ff88' }}>
// //                {stage === 'running' ? currentPhaseInfo?.label || 'INITIALIZING...' : stage.toUpperCase()}
// //             </span>
// //           </div>
// //         </div>

// //         <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
// //             {attempts > 1 && <div className="retry-badge">RE-PROCESSING LOOP {attempts}</div>}
// //             <button className="btn-secondary" onClick={reset}>TERMINATE MISSION</button>
// //         </div>
// //       </div>

// //       {/* Ultra-Thin Progress Tracker */}
// //       <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', width: '100%' }}>
// //         <div style={{ 
// //           height: '100%', 
// //           width: `${progress}%`, 
// //           background: 'linear-gradient(90deg, #00ff88, #0099ff)', 
// //           transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
// //           boxShadow: '0 0 10px #00ff88'
// //         }} />
// //       </div>

// //       <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
// //         {/* Left: Tactical Agent Logs */}
// //         <aside style={{ width: 380, borderRight: '1px solid rgba(255,255,255,0.05)', background: '#070d1a', display: 'flex', flexDirection: 'column' }}>
// //           <div style={{ padding: 15, fontSize: 10, color: '#4a5a7a', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
// //              ◈ AGENT DEPLOYMENT FEED
// //           </div>
// //           <AgentChat logs={logs} currentPhase={phase} />
// //         </aside>

// //         {/* Right: Output Visualization */}
// //         <section style={{ flex: 1, position: 'relative', overflowY: 'auto', padding: 40, background: 'radial-gradient(circle at center, #0a1628 0%, #050a14 100%)' }}>
// //           {stage === 'running' && !result && (
// //             <div className="loader-container">
// //                {/* Use your CSS Orbs here */}
// //                <div className="scanning-line" />
// //                <h2 className="loading-text">ASSEMBLING INTELLIGENCE...</h2>
// //             </div>
// //           )}

// //           {stage === 'error' && (
// //              <div className="error-card">
// //                 <h1 style={{ color: '#ff2d55' }}>SYSTEM CRITICAL</h1>
// //                 <p>{error}</p>
// //                 <button className="btn-primary" onClick={reset}>REBOOT SYSTEM</button>
// //              </div>
// //           )}

// //           {result && (
// //             <CampaignPreview 
// //               drafts={result.drafts} 
// //               factSheet={result.factSheet} 
// //               confidence={result.confidence}
// //             />
// //           )}
// //         </section>
// //       </main>

// //       <style>{`
// //         @keyframes pulse-green {
// //           0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7); }
// //           70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(0, 255, 136, 0); }
// //           100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
// //         }
// //         .pulse-green { animation: pulse-green 2s infinite; background: #00ff88; width: 8px; height: 8px; border-radius: 50%; }
// //         .retry-badge { background: rgba(255, 170, 0, 0.1); color: #ffaa00; border: 1px solid #ffaa00; padding: 4px 10px; font-size: 10px; border-radius: 4px; }
// //         .scanning-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(0, 255, 136, 0.2); animation: scan 3s linear infinite; }
// //         @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
// //       `}</style>
// //     </div>
// //   )
// // }









// import { useState, useCallback, useEffect } from 'react'
// import AuthPage      from './pages/AuthPage.jsx'
// import UploadArea    from './components/UploadArea.jsx'
// import AgentChat     from './components/AgentChat.jsx'
// import CampaignPreview from './components/CampaignPreview.jsx'

// // Phase → progress %
// const PHASE_PROGRESS = { archivist: 22, ghostwriter: 58, prosecutor: 82 }
// const PHASE_LABEL    = {
//   archivist:   'PHASE 1 — FACT EXTRACTION',
//   ghostwriter: 'PHASE 2 — CONTENT SYNTHESIS',
//   prosecutor:  'PHASE 3 — PROSECUTION AUDIT',
// }

// export default function App() {
//   // ── Auth ────────────────────────────────────────────
//   const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem('s_user')) } catch { return null } })
//   const [token, setToken] = useState(() => localStorage.getItem('s_token') || '')

//   // ── Pipeline state ──────────────────────────────────
//   const [stage,    setStage]    = useState('upload')  // upload | running | done | error
//   const [logs,     setLogs]     = useState([])
//   const [phase,    setPhase]    = useState(null)
//   const [progress, setProgress] = useState(0)
//   const [attempts, setAttempts] = useState(1)
//   const [result,   setResult]   = useState(null)
//   const [errMsg,   setErrMsg]   = useState('')
//   const [persona,  setPersona]  = useState('professional')

//   const addLog = useCallback(entry => setLogs(prev => [...prev, entry]), [])

//   const handleEvent = useCallback(ev => {
//     switch (ev.type) {
//       case 'pipeline_start':
//         addLog({ agent: 'system', status: 'phase', message: ev.message })
//         setProgress(4)
//         break
//       case 'phase':
//         setPhase(ev.phase)
//         setProgress(PHASE_PROGRESS[ev.phase] || 50)
//         addLog({ agent: 'system', status: 'phase', message: ev.message })
//         break
//       case 'log':
//         addLog(ev)
//         break
//       case 'factsheet':
//         addLog({ agent: 'archivist', status: 'approved', message: `Fact-Sheet locked — ${ev.data?.core_features?.length || 0} features, ${ev.data?.technical_specs?.length || 0} specs extracted.` })
//         break
//       case 'rejected':
//         setAttempts(ev.attempt + 1)
//         addLog({ agent: 'prosecutor', status: 'rejected', message: `REJECTED — ${ev.correctionNote}` })
//         break
//       case 'approved':
//         addLog({ agent: 'prosecutor', status: 'approved', message: ev.message })
//         setProgress(96)
//         break
//       case 'complete':
//         setResult(ev)
//         setStage('done')
//         setPhase(null)
//         setProgress(100)
//         break
//       case 'error':
//         setErrMsg(ev.message)
//         setStage('error')
//         break
//       default: break
//     }
//   }, [addLog])

//   // ── Start pipeline ──────────────────────────────────
//   const handleStart = async ({ type, text, file, personality }) => {
//     setStage('running')
//     setLogs([])
//     setResult(null)
//     setErrMsg('')
//     setAttempts(1)
//     setProgress(2)
//     setPhase(null)
//     setPersona(personality)

//     const fd = new FormData()
//     fd.append('personality', personality)
//     if (type === 'file' && file) fd.append('document', file)
//     else fd.append('text', text)

//     try {
//       const res = await fetch('/api/run-pipeline', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       })

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}))
//         throw new Error(data.error || `Server error ${res.status}`)
//       }

//       const reader  = res.body.getReader()
//       const decoder = new TextDecoder()

//       while (true) {
//         const { done, value } = await reader.read()
//         if (done) break
//         const chunk = decoder.decode(value)
//         for (const line of chunk.split('\n')) {
//           if (!line.startsWith('data: ')) continue
//           try { handleEvent(JSON.parse(line.slice(6))) } catch {}
//         }
//       }
//     } catch (err) {
//       setErrMsg(err.message)
//       setStage('error')
//     }
//   }

//   // ── Auth handlers ───────────────────────────────────
//   const onAuth = (u, t) => { setUser(u); setToken(t) }

//   const onLogout = () => {
//     localStorage.removeItem('s_token')
//     localStorage.removeItem('s_user')
//     setUser(null); setToken('')
//     setStage('upload'); setLogs([]); setResult(null)
//   }

//   const reset = () => {
//     setStage('upload'); setLogs([]); setResult(null)
//     setErrMsg(''); setPhase(null); setAttempts(1); setProgress(0)
//   }

//   // ── Not logged in ───────────────────────────────────
//   if (!user || !token) return <AuthPage onAuth={onAuth} />

//   // ── Upload screen ───────────────────────────────────
//   if (stage === 'upload') {
//     return (
//       <UploadArea
//         onStart={handleStart}
//         user={user}
//         token={token}
//         onLogout={onLogout}
//       />
//     )
//   }

//   // ── Pipeline / done / error ─────────────────────────
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

//       {/* Top bar */}
//       <div className="app-topbar">
//         <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
//           <span className="font-d" style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.04em', color: '#fff' }}>
//             SENTINEL <span style={{ color: 'var(--green)' }}>ASSEMBLY</span>
//           </span>
//           <div style={{ width: 1, height: 18, background: 'var(--border-hi)' }} />
//           {phase && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <div className="dot dot-amber" />
//               <span className="font-m" style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: '0.1em' }}>
//                 {PHASE_LABEL[phase]}
//               </span>
//             </div>
//           )}
//           {stage === 'done' && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <div className="dot dot-green" />
//               <span className="font-m" style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '0.1em' }}>MISSION COMPLETE</span>
//             </div>
//           )}
//           {stage === 'error' && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <div className="dot dot-red" />
//               <span className="font-m" style={{ fontSize: 10, color: 'var(--red)', letterSpacing: '0.1em' }}>PIPELINE FAILURE</span>
//             </div>
//           )}
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//           {attempts > 1 && <span className="chip chip-red">Loop #{attempts}</span>}
//           <span className="chip chip-dim font-m" style={{ fontSize: 9 }}>{logs.length} events</span>
//           <button className="btn-ghost" onClick={reset}>↺ New Mission</button>
//           <button className="btn-ghost" onClick={onLogout}>logout</button>
//         </div>
//       </div>

//       {/* Progress */}
//       <div className="progress-track">
//         <div className="progress-fill" style={{ width: `${progress}%` }} />
//       </div>

//       {/* Shell */}
//       <div className="app-shell">

//         {/* Left — Agent Room */}
//         <div className="sidebar">
//           <div className="sidebar-inner">
//             <div className="section-label">◈ Agent Operations Room</div>
//             <AgentChat logs={logs} currentPhase={phase} attempts={attempts} />
//           </div>
//         </div>

//         {/* Right — Output */}
//         <div className="main-content">

//           {/* Running, no result yet */}
//           {stage === 'running' && !result && (
//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 36 }}>
//               {/* Animated agent orbs */}
//               <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
//                 {[
//                   { color: 'var(--blue)',  active: phase === 'archivist'   },
//                   { color: 'var(--amber)', active: phase === 'ghostwriter' },
//                   { color: 'var(--red)',   active: phase === 'prosecutor'  },
//                 ].map((orb, i) => (
//                   <div key={i} style={{ position: 'relative' }}>
//                     <div style={{
//                       width: 60, height: 60, borderRadius: '50%',
//                       background: orb.active ? `${orb.color}15` : 'rgba(255,255,255,0.025)',
//                       border: `1px solid ${orb.active ? orb.color + '55' : 'rgba(255,255,255,0.07)'}`,
//                       display: 'flex', alignItems: 'center', justifyContent: 'center',
//                       transition: 'all 0.5s',
//                     }}>
//                       <div style={{
//                         width: 18, height: 18, borderRadius: '50%',
//                         background: orb.active ? orb.color : 'rgba(255,255,255,0.08)',
//                         boxShadow: orb.active ? `0 0 14px ${orb.color}` : 'none',
//                         transition: 'all 0.5s',
//                       }} />
//                     </div>
//                     {orb.active && (
//                       <div className="orb-ring" style={{ color: orb.color }} />
//                     )}
//                     {i < 2 && (
//                       <div style={{ position: 'absolute', top: '50%', left: '100%', width: 28, height: 1, background: 'rgba(255,255,255,0.06)', transform: 'translateY(-50%)' }} />
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div style={{ textAlign: 'center' }}>
//                 <div className="font-d" style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
//                   {PHASE_LABEL[phase] || 'Initializing agents...'}
//                 </div>
//                 <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
//                   Agents collaborating in real-time
//                 </div>
//                 <div className="font-m" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 10, letterSpacing: '0.08em' }}>
//                   ← Watch the Agent Operations Room for live updates
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Error state */}
//           {stage === 'error' && (
//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, textAlign: 'center' }}>
//               <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,51,85,0.1)', border: '1px solid rgba(255,51,85,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚠</div>
//               <div>
//                 <div className="font-d" style={{ color: 'var(--red)', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>PIPELINE FAILURE</div>
//                 <div style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 460, lineHeight: 1.65 }}>{errMsg}</div>
//                 <div className="font-m" style={{ color: 'var(--text-3)', fontSize: 10, marginTop: 14, lineHeight: 1.9 }}>
//                   → Verify OPENROUTER_API_KEY in server/.env<br />
//                   → Confirm server is running: node index.js in /server<br />
//                   → Check http://localhost:3001/api/health
//                 </div>
//               </div>
//               <button className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }} onClick={reset}>
//                 ↺ Retry Mission
//               </button>
//             </div>
//           )}

//           {/* Done — show results */}
//           {result && (
//             <CampaignPreview
//               drafts={result.drafts}
//               factSheet={result.factSheet}
//               auditTrail={result.auditTrail}
//               totalAttempts={result.totalAttempts}
//               confidence={result.confidence || 95}
//               personality={persona}
//             />
//           )}

//         </div>
//       </div>
//     </div>
//   )
// }