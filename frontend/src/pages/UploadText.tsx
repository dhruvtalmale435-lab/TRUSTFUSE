import { useState, useRef } from "react";
import type { Evidence } from "../App";

interface Props { evidence: Evidence; onSave: (p: Partial<Evidence>) => void; onBack: () => void; }

const SCAM = ["guaranteed returns","100% safe","sebi registered","risk-free","limited time","invest today","double your money","no risk","fixed returns","assured profit"];

export default function UploadText({ evidence, onSave, onBack }: Props) {
  const [message, setMessage] = useState(evidence.message);
  const [screenshot, setScreenshot] = useState<File | null>(evidence.screenshot);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const flags = SCAM.filter((p) => message.toLowerCase().includes(p));
  const canSave = message.trim().length > 0 || !!screenshot;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium mb-8 transition-colors" style={{ color: "#6B7280" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0E2A52")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to Evidence Selection
      </button>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EDE9FE" }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M4 4h24v19H18l-5 5v-5H4V4z" stroke="#7C3AED" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M10 13h12M10 18h7" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#7C3AED" }}>Evidence Type · Chat / Text</p>
          <h1 className="font-display text-2xl lg:text-3xl font-semibold" style={{ color: "#0E2A52" }}>Chat / Text Evidence</h1>
          <p className="text-sm text-slate-500 mt-1">Paste the message or upload a screenshot of the conversation, email, or ad.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#0E2A52" }}>Paste the message <span className="font-normal text-slate-400">(WhatsApp, Telegram, email, SMS…)</span></label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7}
            placeholder="Paste the full message here..."
            className="w-full px-4 py-3 rounded-xl border text-sm leading-relaxed resize-none focus:outline-none transition-all"
            style={{ borderColor: "#E2E8F0" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#7C3AED")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")} />

          {/* Live scam detection */}
          {message.trim().length > 15 && (
            <div className="mt-2 rounded-xl px-4 py-3" style={{ backgroundColor: flags.length > 0 ? "#FEF2F2" : "#F0FDF4", border: `1px solid ${flags.length > 0 ? "#FECACA" : "#BBF7D0"}` }}>
              {flags.length > 0 ? (
                <p className="text-xs" style={{ color: "#DC2626" }}>
                  <strong>⚠ {flags.length} scam phrase{flags.length > 1 ? "s" : ""} detected:</strong> {flags.join(", ")}
                </p>
              ) : (
                <p className="text-xs" style={{ color: "#16A34A" }}>✓ No obvious scam phrases detected so far</p>
              )}
            </div>
          )}
          <p className="text-xs text-slate-400 mt-1.5">{message.length} characters</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#0E2A52" }}>Upload screenshot <span className="font-normal text-slate-400">(optional)</span></label>
          <div
            className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
            style={{ borderColor: drag ? "#7C3AED" : screenshot ? "#16A34A" : "#E2E8F0", backgroundColor: drag ? "#F5F3FF" : screenshot ? "#F0FDF4" : "#FAFAFA" }}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setScreenshot(f); }}
            onClick={() => ref.current?.click()}
          >
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setScreenshot(e.target.files[0])} />
            {screenshot ? (
              <>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "#DCFCE7" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="font-semibold text-sm text-slate-800">{screenshot.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Click to change</p>
              </>
            ) : (
              <>
                <svg className="mx-auto mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#94A3B8" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="#94A3B8"/>
                  <path d="M3 15l5-4 4 4 3-2 6 5" stroke="#94A3B8" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                <p className="text-sm text-slate-500">Drag & drop or <span style={{ color: "#7C3AED" }}>browse</span></p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, JPEG, WEBP · Max 10 MB</p>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "#F5F3FF", border: "1px solid #C4B5FD" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#4C1D95" }}>What our system checks:</p>
          <p className="text-xs leading-relaxed" style={{ color: "#5B21B6" }}>Scam intent language · Urgency triggers · Impersonation claims · Guaranteed-return phrases · SEBI registration mentions · Sender identity patterns · OCR on screenshots</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 py-3.5 rounded-xl text-sm font-semibold border transition-all" style={{ borderColor: "#E2E8F0", color: "#6B7280" }}>Cancel</button>
          <button onClick={() => onSave({ message, screenshot, hasText: canSave })}
            disabled={!canSave}
            className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: canSave ? "#7C3AED" : "#E2E8F0", color: canSave ? "white" : "#9CA3AF", cursor: canSave ? "pointer" : "not-allowed" }}
            onMouseEnter={(e) => { if (canSave) e.currentTarget.style.backgroundColor = "#6D28D9"; }}
            onMouseLeave={(e) => { if (canSave) e.currentTarget.style.backgroundColor = "#7C3AED"; }}>
            Save & Continue →
          </button>
        </div>
      </div>
    </main>
  );
}
