import { useState, useRef } from 'react'

const SAMPLE_TEXT = `Product: NovaSpark AI Writing Assistant v2.0
Launch Date: May 15, 2026
Price: $29/month (Pro), $99/month (Team), Free tier available

Core Features:
- Real-time grammar and style suggestions powered by GPT-4o
- Supports 27 languages with native-level tone adaptation
- Plagiarism detection across 50 billion web pages
- One-click export to Google Docs, Notion, and Microsoft Word
- Team collaboration with tracked changes and version history

Technical Specs:
- Response time: under 200ms average
- Uptime SLA: 99.9%
- Data encryption: AES-256 at rest and in transit
- API rate limit: 1000 requests/hour on Pro plan

Target Audience: Content marketers, SaaS companies, indie bloggers, and enterprise teams.

Value Proposition: NovaSpark cuts content creation time by 70% while ensuring brand voice consistency — verified across 10,000 beta users.`

export default function UploadArea({ onStart }) {
  const [mode, setMode] = useState('text')
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const canGo = (mode === 'text' && text.trim().length > 40) || (mode === 'file' && file)

  const go = () => {
    if (mode === 'text') onStart({ type: 'text', text })
    else onStart({ type: 'file', file })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      {/* Corner decorations */}
      <div style={{ position: 'fixed', top: 24, left: 24, width: 40, height: 40, borderTop: '1px solid rgba(0,255,136,0.3)', borderLeft: '1px solid rgba(0,255,136,0.3)' }} />
      <div style={{ position: 'fixed', top: 24, right: 24, width: 40, height: 40, borderTop: '1px solid rgba(0,255,136,0.3)', borderRight: '1px solid rgba(0,255,136,0.3)' }} />
      <div style={{ position: 'fixed', bottom: 24, left: 24, width: 40, height: 40, borderBottom: '1px solid rgba(0,255,136,0.3)', borderLeft: '1px solid rgba(0,255,136,0.3)' }} />
      <div style={{ position: 'fixed', bottom: 24, right: 24, width: 40, height: 40, borderBottom: '1px solid rgba(0,255,136,0.3)', borderRight: '1px solid rgba(0,255,136,0.3)' }} />

      {/* System tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48, animation: 'slideUp 0.4s ease forwards' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
        <span className="font-m" style={{ fontSize: 11, color: '#00ff88', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Sentinel Assembly · v2.1 · All systems nominal
        </span>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', maxWidth: 640, marginBottom: 56, animation: 'slideUp 0.5s 0.1s ease both' }}>
        <h1 className="font-d" style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.02em', color: '#fff', marginBottom: 8 }}>
          SENTINEL
        </h1>
        <h1 className="font-d" style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.02em', color: '#00ff88', marginBottom: 28 }}>
          ASSEMBLY
        </h1>
        <p style={{ fontSize: 16, color: '#5a6a8a', lineHeight: 1.6, fontWeight: 300 }}>
          A self-correcting AI governance engine.<br />
          Three agents argue, audit, and approve — until the output is <span style={{ color: '#dde4f0' }}>legally defensible.</span>
        </p>
      </div>

      {/* Agent cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 56, animation: 'slideUp 0.5s 0.2s ease both' }}>
        {[
          { code: 'AGT-01', name: 'The Archivist', role: 'Fact Extraction', color: '#0099ff', icon: '◈' },
          { code: 'AGT-02', name: 'The Ghostwriter', role: 'Content Synthesis', color: '#ffaa00', icon: '◉' },
          { code: 'AGT-03', name: 'The Prosecutor', role: 'Hallucination Audit', color: '#ff2d55', icon: '◎' },
        ].map(a => (
          <div key={a.code} className="card" style={{ padding: '16px 20px', minWidth: 160, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: a.color, opacity: 0.6 }} />
            <div className="font-m" style={{ fontSize: 10, color: a.color, letterSpacing: '0.15em', marginBottom: 8, opacity: 0.7 }}>{a.code}</div>
            <div style={{ fontSize: 22, marginBottom: 6, color: a.color }}>{a.icon}</div>
            <div className="font-d" style={{ fontSize: 13, fontWeight: 600, color: '#dde4f0', marginBottom: 2 }}>{a.name}</div>
            <div style={{ fontSize: 11, color: '#4a5a7a' }}>{a.role}</div>
          </div>
        ))}
      </div>

      {/* Upload card */}
      <div className="card" style={{ width: '100%', maxWidth: 580, padding: 28, animation: 'slideUp 0.5s 0.3s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span className="font-m" style={{ fontSize: 11, color: '#4a5a7a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Mission Input
          </span>
          <div className="tab-row" style={{ width: 'auto' }}>
            <button className={`tab ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>Paste Text</button>
            <button className={`tab ${mode === 'file' ? 'active' : ''}`} onClick={() => setMode('file')}>Upload File</button>
          </div>
        </div>

        {mode === 'text' ? (
          <>
            <textarea
              className="source-input font-m"
              placeholder="Paste your product document, feature spec, press release, or any source text here..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button
              style={{ marginTop: 8, padding: '7px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, color: '#4a5a7a', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}
              onClick={() => setText(SAMPLE_TEXT)}
              onMouseEnter={e => { e.target.style.color = '#00ff88'; e.target.style.borderColor = 'rgba(0,255,136,0.3)' }}
              onMouseLeave={e => { e.target.style.color = '#4a5a7a'; e.target.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              ↓ Load sample document to test
            </button>
          </>
        ) : (
          <div
            className={`drop-zone ${dragging ? 'over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md" hidden onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                <div className="font-m" style={{ color: '#00ff88', fontSize: 13 }}>{file.name}</div>
                <div style={{ color: '#4a5a7a', fontSize: 11, marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB · Ready to process</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }}>⬆</div>
                <div style={{ color: '#4a5a7a', fontSize: 14 }}>Drop PDF or TXT file here</div>
                <div style={{ color: '#2a3a5a', fontSize: 12, marginTop: 4 }}>or click to browse</div>
              </>
            )}
          </div>
        )}

        <button className="btn-primary" style={{ marginTop: 20 }} disabled={!canGo} onClick={go}>
          ⚡ ACTIVATE SENTINEL ASSEMBLY
        </button>

        <div className="font-m" style={{ textAlign: 'center', fontSize: 10, color: '#2a3a5a', marginTop: 12, letterSpacing: '0.1em' }}>
          GEMINI 1.5 FLASH · 3-AGENT PIPELINE · SELF-CORRECTING LOOP · 100% FREE
        </div>
      </div>
    </div>
  )
}