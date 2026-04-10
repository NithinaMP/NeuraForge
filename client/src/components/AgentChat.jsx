// // import { useEffect, useRef } from 'react'

// // const AGENTS = {
// //   archivist:   { label: 'ARCHIVIST',   code: 'AGT-01', color: '#0099ff' },
// //   ghostwriter: { label: 'GHOSTWRITER', code: 'AGT-02', color: '#ffaa00' },
// //   prosecutor:  { label: 'PROSECUTOR',  code: 'AGT-03', color: '#ff2d55' },
// //   system:      { label: 'SYSTEM',      code: 'SYS',    color: '#4a5a7a' },
// // }

// // const TYPE_CLASS = {
// //   thinking: 't',
// //   approved: 'a',
// //   rejected: 'r',
// //   warning:  'w',
// //   phase:    'p',
// // }

// // export default function AgentChat({ logs, currentPhase, attempts }) {
// //   const bottomRef = useRef()

// //   useEffect(() => {
// //     bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
// //   }, [logs])

// //   return (
// //     <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>

// //       {/* Agent Status Row */}
// //       <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
// //         {['archivist', 'ghostwriter', 'prosecutor'].map(key => {
// //           const ag = AGENTS[key]
// //           const isActive = currentPhase === key
// //           const isDone = !isActive && logs.some(l => l.agent === key && l.status === 'approved')
// //           return (
// //             <div key={key} style={{
// //               flex: 1,
// //               background: isActive ? `${ag.color}10` : 'rgba(255,255,255,0.02)',
// //               border: `1px solid ${isActive ? ag.color + '40' : 'rgba(255,255,255,0.06)'}`,
// //               borderRadius: 8,
// //               padding: '10px 10px',
// //               transition: 'all 0.4s',
// //             }}>
// //               <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
// //                 <div className={`dot ${isActive ? 'warn' : isDone ? 'green' : 'dim'}`} />
// //                 <span className="font-m" style={{ fontSize: 9, color: ag.color, letterSpacing: '0.1em' }}>{ag.code}</span>
// //               </div>
// //               <div className="font-d" style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#dde4f0' : '#4a5a7a' }}>{ag.label}</div>
// //               <div style={{ fontSize: 10, color: isActive ? ag.color : '#2a3a5a', marginTop: 2 }}>
// //                 {isActive ? 'ACTIVE' : isDone ? 'COMPLETE' : 'STANDBY'}
// //               </div>
// //             </div>
// //           )
// //         })}
// //       </div>

// //       {/* Loop counter */}
// //       {attempts > 1 && (
// //         <div style={{
// //           background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.25)',
// //           borderRadius: 6, padding: '8px 12px', marginBottom: 12,
// //           display: 'flex', alignItems: 'center', gap: 8
// //         }}>
// //           <div className="dot red" />
// //           <span className="font-m" style={{ fontSize: 11, color: '#ff6685' }}>
// //             CORRECTION LOOP — ATTEMPT {attempts} / 3
// //           </span>
// //         </div>
// //       )}

// //       {/* Log Feed */}
// //       <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
// //         <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
// //           <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
// //           <span className="font-m" style={{ fontSize: 10, color: '#2a3a5a', letterSpacing: '0.15em' }}>LIVE FEED</span>
// //           <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
// //         </div>

// //         {logs.length === 0 ? (
// //           <div className="font-m" style={{ textAlign: 'center', color: '#2a3a5a', fontSize: 11, paddingTop: 32 }}>
// //             Awaiting activation...
// //           </div>
// //         ) : (
// //           logs.map((entry, i) => {
// //             const ag = AGENTS[entry.agent] || AGENTS.system
// //             const cls = TYPE_CLASS[entry.status] || 't'
// //             return (
// //               <div key={i} className={`log-line ${cls}`} style={{ animationDelay: `${Math.min(i * 15, 200)}ms` }}>
// //                 <span style={{ color: ag.color, flexShrink: 0, fontWeight: 500 }}>[{ag.code}]</span>
// //                 <span style={{ wordBreak: 'break-word' }}>{entry.message}</span>
// //               </div>
// //             )
// //           })
// //         )}
// //         <div ref={bottomRef} />
// //       </div>
// //     </div>
// //   )
// // }

// import { useEffect, useRef } from 'react'

// const AGENTS = {
//   archivist:   { code: 'AGT-01', label: 'Archivist',   color: 'var(--blue)' },
//   ghostwriter: { code: 'AGT-02', label: 'Ghostwriter', color: 'var(--amber)' },
//   prosecutor:  { code: 'AGT-03', label: 'Prosecutor',  color: 'var(--red)' },
//   system:      { code: 'SYS',    label: 'System',      color: 'var(--text-2)' },
// }

// const LOG_CLASS = {
//   thinking: 'log-thinking',
//   approved: 'log-approved',
//   rejected: 'log-rejected',
//   warning:  'log-warning',
//   phase:    'log-phase',
// }

// export default function AgentChat({ logs, currentPhase, attempts }) {
//   const bottomRef = useRef()

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [logs])

//   return (
//     <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

//       {/* Agent status row */}
//       <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexShrink: 0 }}>
//         {['archivist', 'ghostwriter', 'prosecutor'].map(key => {
//           const ag = AGENTS[key]
//           const isActive = currentPhase === key
//           const isDone   = !isActive && logs.some(l => l.agent === key && l.status === 'approved')
//           return (
//             <div
//               key={key}
//               className={`agent-card ${isActive ? 'active' : isDone ? 'done' : ''}`}
//             >
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 5 }}>
//                 <div className={`dot ${isActive ? 'dot-amber' : isDone ? 'dot-green' : 'dot-dim'}`} />
//                 <span className="font-m" style={{ fontSize: 9, color: ag.color, letterSpacing: '0.1em' }}>{ag.code}</span>
//               </div>
//               <div className="font-d" style={{ fontSize: 10, fontWeight: 600, color: isActive ? 'var(--text)' : isDone ? 'var(--text-2)' : 'var(--text-3)' }}>
//                 {ag.label}
//               </div>
//               <div className="font-m" style={{ fontSize: 9, color: isActive ? ag.color : isDone ? 'var(--green)' : 'var(--text-3)', marginTop: 2 }}>
//                 {isActive ? 'ACTIVE' : isDone ? 'COMPLETE' : 'STANDBY'}
//               </div>
//             </div>
//           )
//         })}
//       </div>

//       {/* Loop warning */}
//       {attempts > 1 && (
//         <div style={{
//           background: 'rgba(255,51,85,0.07)', border: '1px solid rgba(255,51,85,0.2)',
//           borderRadius: 6, padding: '7px 11px', marginBottom: 10, flexShrink: 0,
//           display: 'flex', alignItems: 'center', gap: 8,
//         }}>
//           <div className="dot dot-red" />
//           <span className="font-m" style={{ fontSize: 10, color: '#ff7799' }}>
//             CORRECTION LOOP — ATTEMPT {attempts} / 3
//           </span>
//         </div>
//       )}

//       {/* Section label */}
//       <div className="section-label" style={{ flexShrink: 0 }}>Live Agent Feed</div>

//       {/* Log scroll area */}
//       <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
//         {logs.length === 0 && (
//           <div className="font-m" style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 10, paddingTop: 28, lineHeight: 1.8 }}>
//             Awaiting activation...<br />All agents on standby.
//           </div>
//         )}

//         {logs.map((entry, i) => {
//           const ag  = AGENTS[entry.agent] || AGENTS.system
//           const cls = LOG_CLASS[entry.status] || 'log-thinking'
//           return (
//             <div
//               key={i}
//               className={`log-entry ${cls}`}
//               style={{ animationDelay: `${Math.min(i * 12, 200)}ms` }}
//             >
//               <span style={{ color: ag.color, fontWeight: 500, flexShrink: 0 }}>[{ag.code}]</span>
//               <span style={{ wordBreak: 'break-word', flex: 1 }}>{entry.message}</span>
//             </div>
//           )
//         })}

//         <div ref={bottomRef} />
//       </div>
//     </div>
//   )
// }



import { useEffect, useRef } from 'react'

const AGENTS = {
  archivist:   { code: 'AGT-01', label: 'Archivist',   color: 'var(--blue)' },
  ghostwriter: { code: 'AGT-02', label: 'Ghostwriter', color: 'var(--amber)' },
  prosecutor:  { code: 'AGT-03', label: 'Prosecutor',  color: 'var(--red)' },
  system:      { code: 'SYS',    label: 'System',      color: 'var(--text-2)' },
}

const LOG_CLASS = {
  thinking: 'log-thinking',
  approved: 'log-approved',
  rejected: 'log-rejected',
  warning:  'log-warning',
  phase:    'log-phase',
}

export default function AgentChat({ logs, currentPhase, attempts }) {
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Agent status row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexShrink: 0 }}>
        {['archivist', 'ghostwriter', 'prosecutor'].map(key => {
          const ag = AGENTS[key]
          const isActive = currentPhase === key
          const isDone   = !isActive && logs.some(l => l.agent === key && l.status === 'approved')
          return (
            <div
              key={key}
              className={`agent-card ${isActive ? 'active' : isDone ? 'done' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 5 }}>
                <div className={`dot ${isActive ? 'dot-amber' : isDone ? 'dot-green' : 'dot-dim'}`} />
                <span className="font-m" style={{ fontSize: 9, color: ag.color, letterSpacing: '0.1em' }}>{ag.code}</span>
              </div>
              <div className="font-d" style={{ fontSize: 10, fontWeight: 600, color: isActive ? 'var(--text)' : isDone ? 'var(--text-2)' : 'var(--text-3)' }}>
                {ag.label}
              </div>
              <div className="font-m" style={{ fontSize: 9, color: isActive ? ag.color : isDone ? 'var(--green)' : 'var(--text-3)', marginTop: 2 }}>
                {isActive ? 'ACTIVE' : isDone ? 'COMPLETE' : 'STANDBY'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Loop warning */}
      {attempts > 1 && (
        <div style={{
          background: 'rgba(255,51,85,0.07)', border: '1px solid rgba(255,51,85,0.2)',
          borderRadius: 6, padding: '7px 11px', marginBottom: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div className="dot dot-red" />
          <span className="font-m" style={{ fontSize: 10, color: '#ff7799' }}>
            CORRECTION LOOP — ATTEMPT {attempts} / 3
          </span>
        </div>
      )}

      {/* Section label */}
      <div className="section-label" style={{ flexShrink: 0 }}>Live Agent Feed</div>

      {/* Log scroll area */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {logs.length === 0 && (
          <div className="font-m" style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 10, paddingTop: 28, lineHeight: 1.8 }}>
            Awaiting activation...<br />All agents on standby.
          </div>
        )}

        {logs.map((entry, i) => {
          const ag  = AGENTS[entry.agent] || AGENTS.system
          const cls = LOG_CLASS[entry.status] || 'log-thinking'
          return (
            <div
              key={i}
              className={`log-entry ${cls}`}
              style={{ animationDelay: `${Math.min(i * 12, 200)}ms` }}
            >
              <span style={{ color: ag.color, fontWeight: 500, flexShrink: 0 }}>[{ag.code}]</span>
              <span style={{ wordBreak: 'break-word', flex: 1 }}>{entry.message}</span>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}