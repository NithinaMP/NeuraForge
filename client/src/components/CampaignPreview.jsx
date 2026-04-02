import { useState } from 'react'
import { Copy, Download, CheckCircle, Smartphone, Monitor, FileText } from 'lucide-react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="btn-ghost flex items-center gap-1 text-xs">
      {copied ? <CheckCircle size={12} className="text-sentinel-green" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function ContentCard({ title, content, color, mobilePreview }) {
  const [showMobile, setShowMobile] = useState(false)

  return (
    <div className="sentinel-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="font-display text-sm text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {mobilePreview && (
            <button
              onClick={() => setShowMobile(!showMobile)}
              className={`btn-ghost flex items-center gap-1 text-xs ${showMobile ? 'border-sentinel-accent text-sentinel-accent' : ''}`}
            >
              {showMobile ? <Monitor size={12} /> : <Smartphone size={12} />}
              {showMobile ? 'Desktop' : 'Mobile'}
            </button>
          )}
          <CopyButton text={content} />
        </div>
      </div>

      {showMobile ? (
        <div className="bg-slate-900 rounded-2xl p-3 max-w-sm mx-auto border border-slate-700">
          <div className="bg-sentinel-bg rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-sentinel-accent/20 flex items-center justify-center">
                <span className="text-sentinel-accent text-xs font-bold">S</span>
              </div>
              <div>
                <p className="text-white text-xs font-bold">Sentinel Brand</p>
                <p className="text-slate-500 text-xs">@sentinel · Just now</p>
              </div>
            </div>
            <pre className="text-slate-300 text-xs whitespace-pre-wrap font-body leading-relaxed">{content}</pre>
          </div>
        </div>
      ) : (
        <pre className="text-slate-300 text-sm whitespace-pre-wrap font-body leading-relaxed bg-sentinel-bg/50 rounded-lg p-4 max-h-64 overflow-y-auto">
          {content}
        </pre>
      )}
    </div>
  )
}

function FactSheetView({ factSheet }) {
  if (!factSheet) return null
  return (
    <div className="sentinel-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-sentinel-accent" />
        <h3 className="font-display text-sm text-white">Archivist's Fact-Sheet</h3>
        <span className="text-xs text-slate-500 font-display">(Ground Truth)</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {factSheet.product_name && (
          <div className="sentinel-card p-3">
            <p className="text-slate-500 font-display mb-1">Product</p>
            <p className="text-white">{factSheet.product_name}</p>
          </div>
        )}
        {factSheet.core_features?.length > 0 && (
          <div className="sentinel-card p-3">
            <p className="text-slate-500 font-display mb-1">Features Found</p>
            <p className="text-sentinel-green font-bold">{factSheet.core_features.length}</p>
          </div>
        )}
        {factSheet.ambiguity_warnings?.length > 0 && (
          <div className="sentinel-card p-3 border-sentinel-yellow/30">
            <p className="text-sentinel-yellow font-display mb-1">⚠ Ambiguities</p>
            <p className="text-white">{factSheet.ambiguity_warnings.length} flagged</p>
          </div>
        )}
        {factSheet.target_audience?.length > 0 && (
          <div className="sentinel-card p-3">
            <p className="text-slate-500 font-display mb-1">Audience</p>
            <p className="text-white">{factSheet.target_audience.slice(0, 2).join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CampaignPreview({ drafts, factSheet, totalAttempts, confidence }) {
  if (!drafts) return null

  const handleDownload = () => {
    const kit = `# SENTINEL ASSEMBLY — CAMPAIGN KIT\n# Generated: ${new Date().toLocaleString()}\n# Attempts: ${totalAttempts} | Confidence: ${confidence}%\n\n---\n\n## BLOG POST\n\n${drafts.blog}\n\n---\n\n## SOCIAL THREAD\n\n${drafts.social}\n\n---\n\n## EMAIL\n\n${drafts.email}`
    const blob = new Blob([kit], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sentinel-campaign-kit.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Approval Banner */}
      <div className="p-4 rounded-xl border border-sentinel-green/40 bg-green-950/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-sentinel-green" />
          <div>
            <p className="font-display text-sentinel-green text-sm font-bold">CAMPAIGN APPROVED</p>
            <p className="text-slate-400 text-xs">
              {totalAttempts} agent loop{totalAttempts > 1 ? 's' : ''} · {confidence}% confidence · Hallucination-free
            </p>
          </div>
        </div>
        <button onClick={handleDownload} className="btn-ghost flex items-center gap-2 text-xs">
          <Download size={12} />
          Export Kit
        </button>
      </div>

      <FactSheetView factSheet={factSheet} />

      <ContentCard
        title="Blog Post (500 words)"
        content={drafts.blog}
        color="bg-sentinel-accent"
      />

      <ContentCard
        title="Social Media Thread (5 posts)"
        content={drafts.social}
        color="bg-sentinel-yellow"
        mobilePreview={true}
      />

      <ContentCard
        title="Email Campaign"
        content={drafts.email}
        color="bg-purple-400"
      />
    </div>
  )
}