import { useState } from 'react'
import AuditTrail from './AuditTrail'

function CopyButton({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className="btn-ghost"
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000) }}
    >
      {done ? '✓ Copied' : label}
    </button>
  )
}

function OutputCard({ accentColor, code, title, content, children, extra }) {
  return (
    <div className="output-card">
      <div className="output-card-stripe" style={{ background: accentColor }} />
      <div className="output-card-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="font-m" style={{ fontSize: 10, color: accentColor, letterSpacing: '0.12em' }}>{code}</span>
          <span className="font-d" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {extra}
          <CopyButton text={content} />
        </div>
      </div>
      <div className="output-card-body">
        {children || <div className="content-block">{content}</div>}
      </div>
    </div>
  )
}

export default function CampaignPreview({ drafts, factSheet, auditTrail, totalAttempts, confidence, personality }) {
  const [mobile, setMobile] = useState(false)

  if (!drafts) return null

  // ── HELPER: Clean text for mobile rendering ──
  const getSocialPosts = () => {
    let raw = drafts.social || "";
    // If it's an array (Live mode), join it. If it's a string (History), use as is.
    if (Array.isArray(raw)) raw = raw.join('\n');
    // Remove JSON artifacts like [" or "] if they exist
    const clean = raw.replace(/[\[\]"]/g, '').trim();
    return clean.split('\n').filter(l => l.trim().length > 5);
  };

  const exportKit = () => {
    const kit = [
      '═══════════════════════════════════════════════════════',
      '  SENTINEL ASSEMBLY — APPROVED CAMPAIGN KIT',
      `  Generated   : ${new Date().toLocaleString()}`,
      `  Personality : ${personality || 'professional'}`,
      `  Loops       : ${totalAttempts}  |  Confidence: ${confidence}%`,
      '═══════════════════════════════════════════════════════\n',
      '━━ BLOG POST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
      drafts.blog,
      '\n━━ SOCIAL THREAD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
      drafts.social,
      '\n━━ EMAIL CAMPAIGN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
      drafts.email,
    ].join('\n')
    const blob = new Blob([kit], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `sentinel-kit-${Date.now()}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="anim-fade">

      {/* ── Approval banner ─────────────────────────── */}
      <div className="approval-banner">
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(0,255,136,0.12)',
          border: '1px solid rgba(0,255,136,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: 'var(--green)',
        }}>✓</div>
        <div style={{ flex: 1 }}>
          <div className="font-d" style={{ fontWeight: 700, color: 'var(--green)', fontSize: 14, letterSpacing: '0.04em' }}>
            CAMPAIGN APPROVED — HALLUCINATION FREE
          </div>
          <div className="font-m" style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>
            {totalAttempts} prosecution loop{totalAttempts > 1 ? 's' : ''} ·{' '}
            {confidence}% confidence ·{' '}
            <span style={{ color: 'var(--text-3)' }}>mission auto-saved to history</span>
          </div>
        </div>
        <button className="btn-ghost" onClick={exportKit}>↓ Export Kit</button>
      </div>

      {/* ── Fact-Sheet stats ─────────────────────────── */}
      {factSheet && (
        <div className="stat-grid">
          {[
            { label: 'Features',   val: factSheet.core_features?.length  || 0, color: 'var(--blue)'   },
            { label: 'Tech Specs', val: factSheet.technical_specs?.length || 0, color: 'var(--green)'  },
            { label: 'Warnings',   val: factSheet.ambiguity_warnings?.length || 0, color: 'var(--amber)'  },
            { label: 'Confidence', val: `${confidence}%`,                      color: 'var(--green)'  },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="font-m" style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
              <div className="font-d" style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Audit Trail ──────────────────────────────── */}
      <AuditTrail trail={auditTrail} />

      {/* ── Blog Post ────────────────────────────────── */}
      <OutputCard
        accentColor="var(--blue)"
        code="OUTPUT-01"
        title="Blog Post · 400 words"
        content={drafts.blog}
      />

      {/* ── Social Thread ────────────────────────────── */}
      <OutputCard
        accentColor="var(--amber)"
        code="OUTPUT-02"
        title="Social Media Thread · 5 posts"
        content={drafts.social}
        extra={
          <button
            className="btn-ghost"
            onClick={() => setMobile(m => !m)}
            style={mobile ? { color: 'var(--amber)', borderColor: 'rgba(255,170,0,0.3)' } : {}}
          >
            {mobile ? '🖥 Desktop' : '📱 Mobile'}
          </button>
        }
      >
        {mobile ? (
          <div className="phone-mockup">
            {getSocialPosts().map((postText, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 12px', marginBottom: 8,
                  fontSize: 12, color: '#a8bcd8', lineHeight: 1.55,
                  fontFamily: 'Instrument Sans, sans-serif',
                }}>
                  {postText.replace(/^POST \d+:\s*/i, '')}
                </div>
              ))}
          </div>
        ) : (
          <div className="content-block">{drafts.social}</div>
        )}
      </OutputCard>

      {/* ── Email Campaign ───────────────────────────── */}
      <OutputCard
        accentColor="var(--purple)"
        code="OUTPUT-03"
        title="Email Campaign"
        content={drafts.email}
      />

    </div>
  )
}
//very fixed version of the campaign preview page, with a lot of code removed for clarity and focus on the main features. The audit trail and fact sheet sections have been removed, and the copy button has been simplified. The export kit function now generates a plain text file instead of a markdown file, and the styling has been adjusted accordingly.

// import { useState } from 'react'
// import AuditTrail from './AuditTrail'

// function CopyButton({ text, label = 'Copy' }) {
//   const [done, setDone] = useState(false)
//   return (
//     <button
//       className="btn-ghost"
//       onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000) }}
//     >
//       {done ? '✓ Copied' : label}
//     </button>
//   )
// }

// function OutputCard({ accentColor, code, title, content, children, extra }) {
//   return (
//     <div className="output-card">
//       <div className="output-card-stripe" style={{ background: accentColor }} />
//       <div className="output-card-head">
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <span className="font-m" style={{ fontSize: 10, color: accentColor, letterSpacing: '0.12em' }}>{code}</span>
//           <span className="font-d" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
//         </div>
//         <div style={{ display: 'flex', gap: 6 }}>
//           {extra}
//           <CopyButton text={content} />
//         </div>
//       </div>
//       <div className="output-card-body">
//         {children || <div className="content-block">{content}</div>}
//       </div>
//     </div>
//   )
// }

// export default function CampaignPreview({ drafts, factSheet, auditTrail, totalAttempts, confidence, personality }) {
//   const [mobile, setMobile] = useState(false)

//   if (!drafts) return null

//   const exportKit = () => {
//     const kit = [
//       '═══════════════════════════════════════════════════════',
//       '  SENTINEL ASSEMBLY — APPROVED CAMPAIGN KIT',
//       `  Generated   : ${new Date().toLocaleString()}`,
//       `  Personality : ${personality || 'professional'}`,
//       `  Loops       : ${totalAttempts}  |  Confidence: ${confidence}%`,
//       '═══════════════════════════════════════════════════════\n',
//       '━━ BLOG POST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
//       drafts.blog,
//       '\n━━ SOCIAL THREAD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
//       drafts.social,
//       '\n━━ EMAIL CAMPAIGN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
//       drafts.email,
//     ].join('\n')
//     const blob = new Blob([kit], { type: 'text/plain' })
//     const url  = URL.createObjectURL(blob)
//     const a    = document.createElement('a')
//     a.href = url; a.download = `sentinel-kit-${Date.now()}.txt`; a.click()
//     URL.revokeObjectURL(url)
//   }

//   return (
//     <div className="anim-fade">

//       {/* ── Approval banner ─────────────────────────── */}
//       <div className="approval-banner">
//         <div style={{
//           width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
//           background: 'rgba(0,255,136,0.12)',
//           border: '1px solid rgba(0,255,136,0.25)',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           fontSize: 18, color: 'var(--green)',
//         }}>✓</div>
//         <div style={{ flex: 1 }}>
//           <div className="font-d" style={{ fontWeight: 700, color: 'var(--green)', fontSize: 14, letterSpacing: '0.04em' }}>
//             CAMPAIGN APPROVED — HALLUCINATION FREE
//           </div>
//           <div className="font-m" style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>
//             {totalAttempts} prosecution loop{totalAttempts > 1 ? 's' : ''} ·{' '}
//             {confidence}% confidence ·{' '}
//             <span style={{ color: 'var(--text-3)' }}>mission auto-saved to history</span>
//           </div>
//         </div>
//         <button className="btn-ghost" onClick={exportKit}>↓ Export Kit</button>
//       </div>

//       {/* ── Fact-Sheet stats ─────────────────────────── */}
//       {factSheet && (
//         <div className="stat-grid">
//           {[
//             { label: 'Features',   val: factSheet.core_features?.length  || 0, color: 'var(--blue)'   },
//             { label: 'Tech Specs', val: factSheet.technical_specs?.length || 0, color: 'var(--green)'  },
//             { label: 'Warnings',   val: factSheet.ambiguity_warnings?.length || 0, color: 'var(--amber)'  },
//             { label: 'Confidence', val: `${confidence}%`,                      color: 'var(--green)'  },
//           ].map(s => (
//             <div key={s.label} className="stat-card">
//               <div className="font-m" style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
//               <div className="font-d" style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Audit Trail ──────────────────────────────── */}
//       <AuditTrail trail={auditTrail} />

//       {/* ── Blog Post ────────────────────────────────── */}
//       <OutputCard
//         accentColor="var(--blue)"
//         code="OUTPUT-01"
//         title="Blog Post · 400 words"
//         content={drafts.blog}
//       />

//       {/* ── Social Thread ────────────────────────────── */}
//       <OutputCard
//         accentColor="var(--amber)"
//         code="OUTPUT-02"
//         title="Social Media Thread · 5 posts"
//         content={drafts.social}
//         extra={
//           <button
//             className="btn-ghost"
//             onClick={() => setMobile(m => !m)}
//             style={mobile ? { color: 'var(--amber)', borderColor: 'rgba(255,170,0,0.3)' } : {}}
//           >
//             {mobile ? '🖥 Desktop' : '📱 Mobile'}
//           </button>
//         }
//       >
//         {mobile ? (
//           <div className="phone-mockup">
//             {drafts.social
//               .split('\n')
//               .filter(l => l.trim())
//               .map((line, i) => (
//                 <div key={i} style={{
//                   background: 'rgba(255,255,255,0.04)',
//                   border: '1px solid var(--border)',
//                   borderRadius: 8, padding: '10px 12px', marginBottom: 8,
//                   fontSize: 12, color: '#a8bcd8', lineHeight: 1.55,
//                   fontFamily: 'Instrument Sans, sans-serif',
//                 }}>
//                   {line.replace(/^POST \d+:\s*/i, '')}
//                 </div>
//               ))}
//           </div>
//         ) : (
//           <div className="content-block">{drafts.social}</div>
//         )}
//       </OutputCard>

//       {/* ── Email Campaign ───────────────────────────── */}
//       <OutputCard
//         accentColor="var(--purple)"
//         code="OUTPUT-03"
//         title="Email Campaign"
//         content={drafts.email}
//       />

//     </div>
//   )
// }




// import { useState } from 'react'
// import AuditTrail from './AuditTrail'

// function CopyButton({ text, label = 'Copy' }) {
//   const [done, setDone] = useState(false)
//   return (
//     <button
//       className="btn-ghost"
//       onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000) }}
//     >
//       {done ? '✓ Copied' : label}
//     </button>
//   )
// }

// function OutputCard({ accentColor, code, title, content, children, extra }) {
//   return (
//     <div className="output-card">
//       <div className="output-card-stripe" style={{ background: accentColor }} />
//       <div className="output-card-head">
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <span className="font-m" style={{ fontSize: 10, color: accentColor, letterSpacing: '0.12em' }}>{code}</span>
//           <span className="font-d" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
//         </div>
//         <div style={{ display: 'flex', gap: 6 }}>
//           {extra}
//           <CopyButton text={content} />
//         </div>
//       </div>
//       <div className="output-card-body">
//         {children || <div className="content-block">{content}</div>}
//       </div>
//     </div>
//   )
// }

// export default function CampaignPreview({ drafts, factSheet, auditTrail, totalAttempts, confidence, personality }) {
//   const [mobile, setMobile] = useState(false)

//   if (!drafts) return null

//   const exportKit = () => {
//     const kit = [
//       '═══════════════════════════════════════════════════════',
//       '  SENTINEL ASSEMBLY — APPROVED CAMPAIGN KIT',
//       `  Generated   : ${new Date().toLocaleString()}`,
//       `  Personality : ${personality || 'professional'}`,
//       `  Loops       : ${totalAttempts}  |  Confidence: ${confidence}%`,
//       '═══════════════════════════════════════════════════════\n',
//       '━━ BLOG POST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
//       drafts.blog,
//       '\n━━ SOCIAL THREAD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
//       drafts.social,
//       '\n━━ EMAIL CAMPAIGN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
//       drafts.email,
//     ].join('\n')
//     const blob = new Blob([kit], { type: 'text/plain' })
//     const url  = URL.createObjectURL(blob)
//     const a    = document.createElement('a')
//     a.href = url; a.download = `sentinel-kit-${Date.now()}.txt`; a.click()
//     URL.revokeObjectURL(url)
//   }

//   return (
//     <div className="anim-fade">

//       {/* ── Approval banner ─────────────────────────── */}
//       <div className="approval-banner">
//         <div style={{
//           width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
//           background: 'rgba(0,255,136,0.12)',
//           border: '1px solid rgba(0,255,136,0.25)',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           fontSize: 18, color: 'var(--green)',
//         }}>✓</div>
//         <div style={{ flex: 1 }}>
//           <div className="font-d" style={{ fontWeight: 700, color: 'var(--green)', fontSize: 14, letterSpacing: '0.04em' }}>
//             CAMPAIGN APPROVED — HALLUCINATION FREE
//           </div>
//           <div className="font-m" style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>
//             {totalAttempts} prosecution loop{totalAttempts > 1 ? 's' : ''} ·{' '}
//             {confidence}% confidence ·{' '}
//             <span style={{ color: 'var(--text-3)' }}>mission auto-saved to history</span>
//           </div>
//         </div>
//         <button className="btn-ghost" onClick={exportKit}>↓ Export Kit</button>
//       </div>

//       {/* ── Fact-Sheet stats ─────────────────────────── */}
//       {factSheet && (
//         <div className="stat-grid">
//           {[
//             { label: 'Features',   val: factSheet.core_features?.length  || 0, color: 'var(--blue)'   },
//             { label: 'Tech Specs', val: factSheet.technical_specs?.length || 0, color: 'var(--green)'  },
//             { label: 'Warnings',   val: factSheet.ambiguity_warnings?.length || 0, color: 'var(--amber)'  },
//             { label: 'Confidence', val: `${confidence}%`,                      color: 'var(--green)'  },
//           ].map(s => (
//             <div key={s.label} className="stat-card">
//               <div className="font-m" style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
//               <div className="font-d" style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Audit Trail ──────────────────────────────── */}
//       <AuditTrail trail={auditTrail} />

//       {/* ── Blog Post ────────────────────────────────── */}
//       <OutputCard
//         accentColor="var(--blue)"
//         code="OUTPUT-01"
//         title="Blog Post · 400 words"
//         content={drafts.blog}
//       />

//       {/* ── Social Thread ────────────────────────────── */}
//       <OutputCard
//         accentColor="var(--amber)"
//         code="OUTPUT-02"
//         title="Social Media Thread · 5 posts"
//         content={drafts.social}
//         extra={
//           <button
//             className="btn-ghost"
//             onClick={() => setMobile(m => !m)}
//             style={mobile ? { color: 'var(--amber)', borderColor: 'rgba(255,170,0,0.3)' } : {}}
//           >
//             {mobile ? '🖥 Desktop' : '📱 Mobile'}
//           </button>
//         }
//       >
//         {mobile ? (
//           <div className="phone-mockup">
//             {drafts.social
//               .split('\n')
//               .filter(l => l.trim())
//               .map((line, i) => (
//                 <div key={i} style={{
//                   background: 'rgba(255,255,255,0.04)',
//                   border: '1px solid var(--border)',
//                   borderRadius: 8, padding: '10px 12px', marginBottom: 8,
//                   fontSize: 12, color: '#a8bcd8', lineHeight: 1.55,
//                   fontFamily: 'var(--fb)',
//                 }}>
//                   {line.replace(/^POST \d+:\s*/i, '')}
//                 </div>
//               ))}
//           </div>
//         ) : (
//           <div className="content-block">{drafts.social}</div>
//         )}
//       </OutputCard>

//       {/* ── Email Campaign ───────────────────────────── */}
//       <OutputCard
//         accentColor="var(--purple)"
//         code="OUTPUT-03"
//         title="Email Campaign"
//         content={drafts.email}
//       />

//     </div>
//   )
// }