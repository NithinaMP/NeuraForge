import { useState } from 'react'

function CopyBtn({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }
  return (
    <button className="btn-ghost" onClick={copy}>
      {done ? '✓ Copied' : label}
    </button>
  )
}

function Section({ accentColor, code, title, children, actions }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Top stripe */}
      <div style={{ height: 3, background: accentColor }} />
      <div style={{ padding: '16px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="font-m" style={{ fontSize: 10, color: accentColor, letterSpacing: '0.12em' }}>{code}</span>
            <span className="font-d" style={{ fontSize: 14, fontWeight: 600, color: '#dde4f0' }}>{title}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>{actions}</div>
        </div>
        {children}
      </div>
    </div>
  )
}

function FactChip({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8, padding: '10px 14px',
    }}>
      <div style={{ fontSize: 10, color: '#4a5a7a', marginBottom: 4, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
      <div className="font-d" style={{ fontSize: 20, fontWeight: 700, color: color || '#dde4f0' }}>{value}</div>
    </div>
  )
}

function MobilePreview({ posts }) {
  const lines = posts.split('\n').filter(l => l.trim())
  return (
    <div className="phone-frame" style={{ marginTop: 12 }}>
      <div style={{ fontFamily: 'Instrument Sans', fontSize: 12 }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 8,
            padding: '10px 12px', marginBottom: 8, color: '#b0bfd8', lineHeight: 1.5
          }}>
            {line.replace(/^POST \d+:\s*/, '')}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CampaignPreview({ drafts, factSheet, totalAttempts, confidence }) {
  const [mobileView, setMobileView] = useState(false)

  const exportKit = () => {
    const content = [
      '═══════════════════════════════════════',
      '  SENTINEL ASSEMBLY — CAMPAIGN KIT',
      `  Generated: ${new Date().toLocaleString()}`,
      `  Attempts: ${totalAttempts}  |  Confidence: ${confidence}%`,
      '═══════════════════════════════════════\n',
      '── BLOG POST ─────────────────────────\n',
      drafts.blog,
      '\n── SOCIAL THREAD ─────────────────────\n',
      drafts.social,
      '\n── EMAIL CAMPAIGN ────────────────────\n',
      drafts.email,
    ].join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'sentinel-campaign-kit.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Approval Banner */}
      <div className="approved-badge">
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,255,136,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#00ff88', fontSize: 18 }}>✓</span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="font-d" style={{ fontWeight: 700, color: '#00ff88', fontSize: 14, letterSpacing: '0.05em' }}>
            CAMPAIGN APPROVED — HALLUCINATION FREE
          </div>
          <div className="font-m" style={{ fontSize: 11, color: '#4a5a7a', marginTop: 2 }}>
            {totalAttempts} agent loop{totalAttempts > 1 ? 's' : ''} completed · {confidence}% prosecution confidence · All claims verified against source
          </div>
        </div>
        <button className="btn-ghost" onClick={exportKit}>↓ Export Kit</button>
      </div>

      {/* Stats row */}
      {factSheet && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <FactChip label="Features" value={factSheet.core_features?.length || 0} color="#0099ff" />
          <FactChip label="Verified Facts" value={factSheet.technical_specs?.length || 0} color="#00ff88" />
          <FactChip label="Warnings" value={factSheet.ambiguity_warnings?.length || 0} color="#ffaa00" />
          <FactChip label="Confidence" value={`${confidence}%`} color="#00ff88" />
        </div>
      )}

      {/* Blog */}
      <Section
        accentColor="#0099ff"
        code="OUTPUT-01"
        title="Blog Post · 500 words"
        actions={<CopyBtn text={drafts.blog} />}
      >
        <div className="content-block">{drafts.blog}</div>
      </Section>

      {/* Social */}
      <Section
        accentColor="#ffaa00"
        code="OUTPUT-02"
        title="Social Media Thread · 5 posts"
        actions={
          <>
            <button
              className="btn-ghost"
              onClick={() => setMobileView(!mobileView)}
              style={mobileView ? { color: '#ffaa00', borderColor: 'rgba(255,170,0,0.3)' } : {}}
            >
              {mobileView ? '🖥 Desktop' : '📱 Mobile'}
            </button>
            <CopyBtn text={drafts.social} />
          </>
        }
      >
        {mobileView
          ? <MobilePreview posts={drafts.social} />
          : <div className="content-block">{drafts.social}</div>
        }
      </Section>

      {/* Email */}
      <Section
        accentColor="#b066ff"
        code="OUTPUT-03"
        title="Email Campaign"
        actions={<CopyBtn text={drafts.email} />}
      >
        <div className="content-block">{drafts.email}</div>
      </Section>

    </div>
  )
}