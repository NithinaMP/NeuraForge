import { useState, useCallback } from 'react'
import UploadArea from './components/UploadArea'
import AgentChat from './components/AgentChat'
import CampaignPreview from './components/CampaignPreview'

const PHASES = {
  archivist:   { label: 'PHASE 1 — FACT EXTRACTION',   pct: 25 },
  ghostwriter: { label: 'PHASE 2 — CONTENT SYNTHESIS',  pct: 60 },
  prosecutor:  { label: 'PHASE 3 — PROSECUTION AUDIT',  pct: 85 },
}

export default function App() {
  const [stage, setStage] = useState('upload')   // upload | running | done | error
  const [logs, setLogs] = useState([])
  const [phase, setPhase] = useState(null)
  const [attempts, setAttempts] = useState(1)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const addLog = useCallback(entry => {
    setLogs(prev => [...prev, entry])
  }, [])

  const handleEvent = useCallback(event => {
    switch (event.type) {
      case 'pipeline_start':
        addLog({ agent: 'system', status: 'phase', message: event.message })
        setProgress(5)
        break
      case 'phase':
        setPhase(event.phase)
        setProgress(PHASES[event.phase]?.pct || 50)
        addLog({ agent: 'system', status: 'phase', message: event.message })
        break
      case 'log':
        addLog(event)
        break
      case 'factsheet':
        addLog({ agent: 'archivist', status: 'approved', message: `Fact-Sheet locked. ${event.data?.core_features?.length || 0} features, ${event.data?.technical_specs?.length || 0} specs extracted.` })
        break
      case 'rejected':
        setAttempts(event.attempt + 1)
        addLog({ agent: 'prosecutor', status: 'rejected', message: `REJECTED — ${event.correctionNote}` })
        break
      case 'approved':
        addLog({ agent: 'prosecutor', status: 'approved', message: event.message })
        setProgress(95)
        break
      case 'complete':
        setResult(event)
        setStage('done')
        setPhase(null)
        setProgress(100)
        break
      case 'error':
        setError(event.message)
        setStage('error')
        break
    }
  }, [addLog])

  const handleStart = async ({ type, file, text }) => {
    setStage('running')
    setLogs([])
    setResult(null)
    setError(null)
    setAttempts(1)
    setProgress(2)

    const fd = new FormData()
    if (type === 'file') fd.append('document', file)
    else fd.append('text', text)

    try {
      const res = await fetch('/api/run-pipeline', { method: 'POST', body: fd })
      if (!res.ok) throw new Error(`Server error: ${res.status}. Make sure the server is running on port 3001.`)

      const reader = res.body.getReader()
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
      setError(err.message)
      setStage('error')
    }
  }

  const reset = () => {
    setStage('upload'); setLogs([]); setResult(null)
    setError(null); setPhase(null); setAttempts(1); setProgress(0)
  }

  // ── Upload screen ──────────────────────
  if (stage === 'upload') return <UploadArea onStart={handleStart} />

  // ── Running / Done / Error ─────────────
  const phaseInfo = phase ? PHASES[phase] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Top Bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="font-d" style={{ fontWeight: 800, fontSize: 16, letterSpacing: '0.05em' }}>
            SENTINEL <span style={{ color: '#00ff88' }}>ASSEMBLY</span>
          </span>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          {phase && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="dot warn" />
              <span className="font-m" style={{ fontSize: 11, color: '#ffaa00', letterSpacing: '0.1em' }}>
                {phaseInfo?.label}
              </span>
            </div>
          )}
          {stage === 'done' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="dot green" />
              <span className="font-m" style={{ fontSize: 11, color: '#00ff88', letterSpacing: '0.1em' }}>MISSION COMPLETE</span>
            </div>
          )}
          {stage === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="dot red" />
              <span className="font-m" style={{ fontSize: 11, color: '#ff2d55', letterSpacing: '0.1em' }}>PIPELINE FAILURE</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {attempts > 1 && (
            <span className="chip chip-red">Loop #{attempts}</span>
          )}
          <span className="chip chip-dim font-m" style={{ fontSize: 10 }}>
            {logs.length} events
          </span>
          <button className="btn-ghost" onClick={reset}>↺ New Mission</button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar" style={{ borderRadius: 0 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left — Agent Room */}
        <div style={{
          width: 340, flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(7,13,26,0.6)',
          padding: '20px 16px',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div className="font-m" style={{ fontSize: 10, color: '#2a3a5a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            ◈ Agent Operations Room
          </div>
          <AgentChat logs={logs} currentPhase={phase} attempts={attempts} />
        </div>

        {/* Right — Output */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* Running state (no result yet) */}
          {stage === 'running' && !result && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 32 }}>
              {/* Animated orbs */}
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                {[
                  { color: '#0099ff', active: phase === 'archivist' },
                  { color: '#ffaa00', active: phase === 'ghostwriter' },
                  { color: '#ff2d55', active: phase === 'prosecutor' },
                ].map((orb, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: orb.active ? `${orb.color}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${orb.active ? orb.color + '60' : 'rgba(255,255,255,0.07)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.5s',
                      transform: orb.active ? 'scale(1.1)' : 'scale(1)',
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: orb.active ? orb.color : 'rgba(255,255,255,0.1)',
                        boxShadow: orb.active ? `0 0 16px ${orb.color}` : 'none',
                        transition: 'all 0.5s',
                        animation: orb.active ? 'pulse 1s ease-in-out infinite' : 'none',
                      }} />
                    </div>
                    {orb.active && (
                      <div style={{
                        position: 'absolute', inset: -6, borderRadius: '50%',
                        border: `1px solid ${orb.color}40`,
                        animation: 'ringOut 1.5s ease-out infinite',
                      }} />
                    )}
                    {i < 2 && (
                      <div style={{ position: 'absolute', top: '50%', left: '100%', width: 24, height: 1, background: 'rgba(255,255,255,0.07)', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div className="font-d" style={{ fontSize: 18, fontWeight: 700, color: '#dde4f0', marginBottom: 8 }}>
                  {phaseInfo?.label || 'Initializing...'}
                </div>
                <div style={{ fontSize: 13, color: '#4a5a7a' }}>
                  Agents are collaborating in real-time
                </div>
                <div className="font-m" style={{ fontSize: 11, color: '#2a3a5a', marginTop: 8 }}>
                  ← Watch the Agent Room for live updates
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {stage === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>⚠</div>
              <div>
                <div className="font-d" style={{ color: '#ff2d55', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>PIPELINE FAILURE</div>
                <div style={{ color: '#5a6a8a', fontSize: 14, maxWidth: 440, lineHeight: 1.6 }}>{error}</div>
                <div className="font-m" style={{ color: '#2a3a5a', fontSize: 11, marginTop: 12 }}>
                  → Verify GEMINI_API_KEY is set in server/.env<br />
                  → Confirm server is running: node index.js in /server
                </div>
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }} onClick={reset}>Retry Mission</button>
            </div>
          )}

          {/* Done state */}
          {result && (
            <CampaignPreview
              drafts={result.drafts}
              factSheet={result.factSheet}
              totalAttempts={result.totalAttempts}
              confidence={result.confidence || 97}
            />
          )}
        </div>
      </div>
    </div>
  )
}