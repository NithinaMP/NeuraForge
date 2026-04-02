import { useEffect, useRef } from 'react'
import { Brain, Zap, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const AGENT_CONFIG = {
  archivist: { icon: Brain, label: 'The Archivist', color: 'text-sentinel-accent', bg: 'bg-cyan-950/30' },
  ghostwriter: { icon: Zap, label: 'The Ghostwriter', color: 'text-sentinel-yellow', bg: 'bg-yellow-950/30' },
  prosecutor: { icon: Shield, label: 'The Prosecutor', color: 'text-sentinel-red', bg: 'bg-red-950/30' },
  system: { icon: Clock, label: 'System', color: 'text-slate-400', bg: 'bg-slate-900/30' },
}

const STATUS_STYLE = {
  thinking: 'log-thinking',
  approved: 'log-approved',
  rejected: 'log-rejected',
  warning: 'log-warning',
  phase: 'log-phase',
}

function LogEntry({ entry, index }) {
  const config = AGENT_CONFIG[entry.agent] || AGENT_CONFIG.system
  const Icon = config.icon
  const statusClass = STATUS_STYLE[entry.status] || 'log-thinking'

  return (
    <div className={`log-entry ${statusClass}`} style={{ animationDelay: `${index * 20}ms` }}>
      <div className="flex items-start gap-2">
        <Icon size={12} className={`${config.color} mt-0.5 flex-shrink-0`} />
        <div>
          <span className={`${config.color} font-bold mr-2`}>{config.label}</span>
          <span className="text-slate-300">{entry.message}</span>
        </div>
        {entry.status === 'approved' && <CheckCircle size={12} className="text-sentinel-green ml-auto flex-shrink-0 mt-0.5" />}
        {entry.status === 'rejected' && <AlertTriangle size={12} className="text-sentinel-red ml-auto flex-shrink-0 mt-0.5" />}
      </div>
    </div>
  )
}

export default function AgentChat({ logs, currentPhase, attempts }) {
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const agentStatus = {
    archivist: currentPhase === 'archivist' ? 'active' : logs.some(l => l.agent === 'archivist' && l.status === 'approved') ? 'done' : 'idle',
    ghostwriter: currentPhase === 'ghostwriter' ? 'active' : 'idle',
    prosecutor: currentPhase === 'prosecutor' ? 'active' : 'idle',
  }

  return (
    <div className="h-full flex flex-col">
      {/* Agent Status Bar */}
      <div className="flex gap-3 mb-4 p-3 sentinel-card">
        {Object.entries(AGENT_CONFIG).filter(([k]) => k !== 'system').map(([key, config]) => {
          const Icon = config.icon
          const status = agentStatus[key]
          return (
            <div key={key} className="flex items-center gap-2 flex-1">
              <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}>
                <Icon size={14} className={config.color} />
                {status === 'active' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sentinel-accent rounded-full animate-pulse" />
                )}
                {status === 'done' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sentinel-green rounded-full" />
                )}
              </div>
              <div>
                <p className={`font-display text-xs ${config.color}`}>{config.label}</p>
                <p className="text-slate-600 text-xs">
                  {status === 'active' ? 'Working...' : status === 'done' ? 'Done' : 'Standby'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Attempt Counter */}
      {attempts > 1 && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-950/30 border border-sentinel-red/30 font-display text-xs text-sentinel-red flex items-center gap-2">
          <AlertTriangle size={12} />
          Correction loop active — Attempt {attempts}/3
        </div>
      )}

      {/* Live Log Feed */}
      <div className="flex-1 overflow-y-auto space-y-0 min-h-0">
        <div className="font-display text-xs text-slate-600 mb-3 flex items-center gap-2">
          <div className="flex-1 h-px bg-sentinel-border" />
          LIVE AGENT FEED
          <div className="flex-1 h-px bg-sentinel-border" />
        </div>

        {logs.length === 0 && (
          <div className="text-center text-slate-600 font-display text-xs pt-8">
            Waiting for pipeline to start...
          </div>
        )}

        {logs.map((entry, i) => (
          <LogEntry key={i} entry={entry} index={i} />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}