import { useState, useRef, useCallback } from 'react'
import UploadArea from './components/UploadArea'
import AgentChat from './components/AgentChat'
import CampaignPreview from './components/CampaignPreview'
import { Brain, Zap, Shield, RotateCcw, AlertCircle } from 'lucide-react'

const PHASE_LABELS = {
  archivist: 'Phase 1 — Fact Extraction',
  ghostwriter: 'Phase 2 — Content Drafting',
  prosecutor: 'Phase 3 — Quality Audit',
}

export default function App() {
  const [stage, setStage] = useState('upload') // upload | running | done | error
  const [logs, setLogs] = useState([])
  const [currentPhase, setCurrentPhase] = useState(null)
  const [attempts, setAttempts] = useState(1)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [phaseLabel, setPhaseLabel] = useState('')
  const abortRef = useRef(null)

  const addLog = useCallback((entry) => {
    setLogs(prev => [...prev, { ...entry, time: new Date().toLocaleTimeString() }])
  }, [])

  const handleStart = async ({ type, file, text }) => {
    setStage('running')
    setLogs([])
    setResult(null)
    setError(null)
    setAttempts(1)

    const formData = new FormData()
    if (type === 'file') {
      formData.append('document', file)
    } else {
      formData.append('text', text)
    }

    try {
      const response = await fetch('/api/run-pipeline', {
        method: 'POST',
        body: type === 'file' ? formData : (() => { const f = new FormData(); f.append('text', text); return f })(),
      })

      if (!response.ok) throw new Error(`Server error: ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            handleEvent(event)
          } catch {}
        }
      }
    } catch (err) {
      setError(err.message)
      setStage('error')
    }
  }

  const handleEvent = (event) => {
    switch (event.type) {
      case 'pipeline_start':
        addLog({ agent: 'system', status: 'thinking', message: event.message })
        break

      case 'phase':
        setCurrentPhase(event.phase)
        setPhaseLabel(PHASE_LABELS[event.phase] || '')
        addLog({ agent: 'system', status: 'phase', message: event.message })
        break

      case 'log':
        addLog(event)
        break

      case 'factsheet':
        addLog({ agent: 'archivist', status: 'approved', message: `Fact-Sheet locked. ${event.data?.core_features?.length || 0} facts verified.` })
        break

      case 'rejected':
        setAttempts(event.attempt + 1)
        addLog({ agent: 'prosecutor', status: 'rejected', message: `REJECTED — ${event.correctionNote}` })
        break

      case 'approved':
        addLog({ agent: 'prosecutor', status: 'approved', message: event.message })
        break

      case 'complete':
        setResult(event)
        setStage('done')
        setCurrentPhase(null)
        break

      case 'error':
        setError(event.message)
        setStage('error')
        break
    }
  }

  const handleReset = () => {
    setStage('upload')
    setLogs([])
    setResult(null)
    setError(null)
    setCurrentPhase(null)
    setAttempts(1)
  }

  if (stage === 'upload') {
    return <UploadArea onStart={handleStart} isRunning={false} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-sentinel-border px-6 py-4 flex items-center justify-between bg-sentinel-panel/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-white font-bold text-lg">
            Sentinel <span className="text-sentinel-accent">Assembly</span>
          </h1>
          <div className="h-4 w-px bg-sentinel-border" />
          {currentPhase && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sentinel-accent animate-pulse" />
              <span className="font-display text-sentinel-accent text-xs">{phaseLabel}</span>
            </div>
          )}
          {stage === 'done' && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sentinel-green" />
              <span className="font-display text-sentinel-green text-xs">PIPELINE COMPLETE</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {attempts > 1 && (
            <span className="font-display text-xs text-sentinel-red border border-sentinel-red/30 px-3 py-1 rounded-full">
              Loop #{attempts}
            </span>
          )}
          <button onClick={handleReset} className="btn-ghost flex items-center gap-2 text-xs">
            <RotateCcw size={12} />
            New Campaign
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>

        {/* Left: Agent Room */}
        <div className="w-96 flex-shrink-0 border-r border-sentinel-border p-5 overflow-y-auto bg-sentinel-panel/40">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-display text-xs text-slate-500 uppercase tracking-widest">Agent Room</span>
            {stage === 'running' && <div className="w-1.5 h-1.5 rounded-full bg-sentinel-accent animate-pulse" />}
          </div>
          <AgentChat logs={logs} currentPhase={currentPhase} attempts={attempts} />
        </div>

        {/* Right: Campaign Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          {stage === 'running' && !result && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              {/* Animated agent icons */}
              <div className="relative">
                <div className="flex gap-6">
                  {[
                    { icon: Brain, color: 'text-sentinel-accent', active: currentPhase === 'archivist' },
                    { icon: Zap, color: 'text-sentinel-yellow', active: currentPhase === 'ghostwriter' },
                    { icon: Shield, color: 'text-sentinel-red', active: currentPhase === 'prosecutor' },
                  ].map(({ icon: Icon, color, active }, i) => (
                    <div
                      key={i}
                      className={`w-16 h-16 rounded-2xl sentinel-card flex items-center justify-center transition-all duration-500 ${
                        active ? `${color} scale-110 animate-glow` : 'text-slate-600 scale-100'
                      }`}
                    >
                      <Icon size={28} />
                    </div>
                  ))}
                </div>
                {/* Connecting lines */}
                <div className="absolute top-1/2 left-16 right-16 h-px bg-gradient-to-r from-sentinel-accent/40 via-sentinel-yellow/40 to-sentinel-red/40 -translate-y-1/2 -z-10" />
              </div>
              <div>
                <p className="font-display text-white text-lg mb-2">{phaseLabel || 'Initializing...'}</p>
                <p className="text-slate-500 text-sm font-body">Agents are collaborating in real-time</p>
                <p className="text-slate-600 text-xs font-display mt-2">Watch the Agent Room for live updates →</p>
              </div>
            </div>
          )}

          {stage === 'error' && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <AlertCircle size={48} className="text-sentinel-red" />
              <div className="text-center">
                <p className="font-display text-sentinel-red text-lg mb-2">Pipeline Error</p>
                <p className="text-slate-400 text-sm max-w-md">{error}</p>
                <p className="text-slate-600 text-xs mt-2 font-display">Make sure your GEMINI_API_KEY is set in /server/.env</p>
              </div>
              <button onClick={handleReset} className="btn-primary mt-4">Try Again</button>
            </div>
          )}

          {result && (
            <CampaignPreview
              drafts={result.drafts}
              factSheet={result.factSheet}
              totalAttempts={result.totalAttempts}
              confidence={result.confidence || 95}
            />
          )}
        </div>
      </div>
    </div>
  )
}