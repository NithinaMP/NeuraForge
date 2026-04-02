import { useState, useRef } from 'react'
import { Upload, FileText, Zap, Shield, Brain } from 'lucide-react'

export default function UploadArea({ onStart, isRunning }) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [pastedText, setPastedText] = useState('')
  const [mode, setMode] = useState('file') // 'file' | 'text'
  const fileRef = useRef()

  const handleFile = (f) => {
    if (f && (f.type === 'application/pdf' || f.type === 'text/plain')) {
      setFile(f)
    }
  }

  const handleSubmit = () => {
    if (mode === 'file' && file) {
      onStart({ type: 'file', file })
    } else if (mode === 'text' && pastedText.trim()) {
      onStart({ type: 'text', text: pastedText })
    }
  }

  const canSubmit = (mode === 'file' && file) || (mode === 'text' && pastedText.trim().length > 50)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Hero Header */}
      <div className="text-center mb-12 max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-sentinel-accent" />
          <span className="font-display text-sentinel-accent text-xs tracking-widest uppercase">Autonomous · Self-Correcting · Trustworthy</span>
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-sentinel-accent" />
        </div>
        <h1 className="font-display text-5xl font-bold text-white mb-3 leading-tight">
          Sentinel<br />
          <span className="text-sentinel-accent">Assembly</span>
        </h1>
        <p className="text-slate-400 font-body text-lg">
          A self-governing content ecosystem. Drop a document.<br />
          Three AI agents argue, correct, and approve — autonomously.
        </p>
      </div>

      {/* Agent Icons */}
      <div className="flex gap-8 mb-12">
        {[
          { icon: Brain, label: 'The Archivist', color: 'text-sentinel-accent', desc: 'Extracts facts' },
          { icon: Zap, label: 'The Ghostwriter', color: 'text-sentinel-yellow', desc: 'Drafts content' },
          { icon: Shield, label: 'The Prosecutor', color: 'text-sentinel-red', desc: 'Audits for truth' },
        ].map(({ icon: Icon, label, color, desc }) => (
          <div key={label} className="text-center">
            <div className={`w-12 h-12 rounded-xl sentinel-card flex items-center justify-center mb-2 mx-auto ${color}`}>
              <Icon size={22} />
            </div>
            <p className={`font-display text-xs ${color}`}>{label}</p>
            <p className="text-slate-500 text-xs">{desc}</p>
          </div>
        ))}
      </div>

      {/* Upload Card */}
      <div className="w-full max-w-2xl sentinel-card p-8">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('file')}
            className={`flex-1 py-2 rounded-lg font-display text-xs transition-all ${mode === 'file' ? 'bg-sentinel-accent text-sentinel-bg' : 'border border-sentinel-border text-slate-400 hover:border-slate-500'}`}
          >
            Upload File
          </button>
          <button
            onClick={() => setMode('text')}
            className={`flex-1 py-2 rounded-lg font-display text-xs transition-all ${mode === 'text' ? 'bg-sentinel-accent text-sentinel-bg' : 'border border-sentinel-border text-slate-400 hover:border-slate-500'}`}
          >
            Paste Text
          </button>
        </div>

        {mode === 'file' ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              dragOver
                ? 'border-sentinel-accent bg-cyan-950/20 scale-[1.01]'
                : 'border-sentinel-border hover:border-slate-500'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            {file ? (
              <div>
                <FileText size={40} className="text-sentinel-accent mx-auto mb-3" />
                <p className="font-display text-sentinel-accent text-sm">{file.name}</p>
                <p className="text-slate-500 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB · Ready to process</p>
              </div>
            ) : (
              <div>
                <Upload size={40} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-body">Drop your PDF or TXT file here</p>
                <p className="text-slate-600 text-sm mt-1">Product docs, feature sheets, press releases</p>
              </div>
            )}
          </div>
        ) : (
          <textarea
            className="w-full h-48 bg-sentinel-bg border border-sentinel-border rounded-xl p-4 text-slate-300 font-body text-sm resize-none focus:outline-none focus:border-sentinel-accent transition-colors placeholder:text-slate-600"
            placeholder="Paste your product document, technical spec, or any source text here...&#10;&#10;Minimum 50 characters to activate the Assembly."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isRunning}
          className="btn-primary w-full mt-6"
        >
          {isRunning ? 'Assembly In Progress...' : '⚡ Activate Sentinel Assembly'}
        </button>

        <p className="text-center text-slate-600 font-display text-xs mt-4">
          Powered by Gemini 1.5 Flash · 3-Agent Pipeline · Self-Correcting Loop
        </p>
      </div>
    </div>
  )
}