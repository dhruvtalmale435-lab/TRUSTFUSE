import { useState, useRef } from "react";
import type { Evidence } from "../App";

interface Props { evidence: Evidence; onSave: (p: Partial<Evidence>) => void; onBack: () => void; }

export default function UploadVideo({ evidence, onSave, onBack }: Props) {
  const [file, setFile] = useState<File | null>(evidence.videoFile);
  const [note, setNote] = useState(evidence.videoNote);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const fmt = (b: number) => b < 1e6 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1e6).toFixed(1)} MB`;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium mb-8 transition-colors" style={{ color: "#6B7280" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0E2A52")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to Evidence Selection
      </button>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFEDD5" }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="7" width="19" height="18" rx="2.5" stroke="#EA580C" strokeWidth="2"/>
            <path d="M21 13l9-4v14l-9-4V13z" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#EA580C" }}>Evidence Type · Video / Audio</p>
          <h1 className="font-display text-2xl lg:text-3xl font-semibold" style={{ color: "#0E2A52" }}>Upload Video or Audio</h1>
          <p className="text-sm text-slate-500 mt-1">Upload any video or audio file you received related to the investment offer.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#0E2A52" }}>Upload file <span className="font-normal text-slate-400">(video or audio)</span></label>
          <div
            className="rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all"
            style={{ borderColor: drag ? "#EA580C" : file ? "#16A34A" : "#E2E8F0", backgroundColor: drag ? "#FFF7ED" : file ? "#F0FDF4" : "#FAFAFA" }}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
            onClick={() => ref.current?.click()}
          >
            <input ref={ref} type="file" accept="video/*,audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
            {file ? (
              <>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#DCFCE7" }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6 6L23 8" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="font-semibold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{fmt(file.size)} · Click to change</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#FFEDD5" }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M14 20V8M9 13l5-5 5 5" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 22h18" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="font-semibold text-slate-700">Drag & drop or <span style={{ color: "#EA580C" }}>browse</span></p>
                <p className="text-xs text-slate-400 mt-1.5">MP4, MOV, AVI, MKV, MP3, WAV, OGG · Max 200 MB</p>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#0E2A52" }}>Add context <span className="font-normal text-slate-400">(optional)</span></label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
            placeholder="e.g. 'This video was sent to me on WhatsApp claiming the person is a SEBI-registered advisor offering 30% monthly returns.'"
            className="w-full px-4 py-3 rounded-xl border text-sm leading-relaxed resize-none focus:outline-none transition-all"
            style={{ borderColor: "#E2E8F0" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#EA580C")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")} />
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#9A3412" }}>What our system checks:</p>
          <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>Frame extraction · Face detection · Deepfake classification · Visual manipulation artifacts · Metadata consistency · Audio analysis</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 py-3.5 rounded-xl text-sm font-semibold border transition-all" style={{ borderColor: "#E2E8F0", color: "#6B7280" }}>Cancel</button>
          <button onClick={() => onSave({ videoFile: file, videoNote: note, hasVideo: !!file })}
            disabled={!file}
            className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: file ? "#EA580C" : "#E2E8F0", color: file ? "white" : "#9CA3AF", cursor: file ? "pointer" : "not-allowed" }}
            onMouseEnter={(e) => { if (file) e.currentTarget.style.backgroundColor = "#C2410C"; }}
            onMouseLeave={(e) => { if (file) e.currentTarget.style.backgroundColor = "#EA580C"; }}>
            Save & Continue →
          </button>
        </div>
      </div>
    </main>
  );
}
