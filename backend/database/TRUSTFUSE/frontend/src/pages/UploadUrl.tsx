import { useState } from "react";
import type { Evidence } from "../App";

interface Props { evidence: Evidence; onSave: (p: Partial<Evidence>) => void; onBack: () => void; }

export default function UploadUrl({ evidence, onSave, onBack }: Props) {
  const [url, setUrl] = useState(evidence.websiteUrl);
  const [app, setApp] = useState(evidence.appName);
  const [name, setName] = useState(evidence.companyName);
  const [reg, setReg] = useState(evidence.regNumber);

  const canSave = url.trim() || app.trim() || name.trim() || reg.trim();

  const Field = ({ label, value, onChange, placeholder, mono = false, optional = true }:
    { label: string; value: string; onChange: (v: string) => void; placeholder: string; mono?: boolean; optional?: boolean }) => (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0E2A52" }}>
        {label} {optional && <span className="font-normal text-slate-400">(optional)</span>}
      </label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
        style={{ borderColor: "#E2E8F0", fontFamily: mono ? "'DM Mono', monospace" : "inherit" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#1D4ED8")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")} />
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium mb-8 transition-colors" style={{ color: "#6B7280" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0E2A52")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to Evidence Selection
      </button>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#DBEAFE" }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="#1D4ED8" strokeWidth="2"/>
            <path d="M4 16h24" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 4C12 8 11 13 11 16s1 8 5 12" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 4C20 8 21 13 21 16s-1 8-5 12" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#1D4ED8" }}>Evidence Type · URL / App</p>
          <h1 className="font-display text-2xl lg:text-3xl font-semibold" style={{ color: "#0E2A52" }}>URL / App Details</h1>
          <p className="text-sm text-slate-500 mt-1">Share the website, trading app, advisor details, or registration number. Fill in whatever you have.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <Field label="Website URL" value={url} onChange={setUrl} placeholder="https://example-advisor.com" mono />
        <Field label="Trading App Name" value={app} onChange={setApp} placeholder="e.g. SureProfit Trading App, WealthGrow" />

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#0E2A52" }}>Advisor / Company Details</p>
          <div className="space-y-4">
            <Field label="Advisor or Company Name" value={name} onChange={setName} placeholder="e.g. Sunrise Capital Advisors" />
            <Field label="SEBI Registration Number" value={reg} onChange={setReg} placeholder="e.g. INH000001234" mono />
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#1E3A8A" }}>What our system checks:</p>
          <p className="text-xs leading-relaxed" style={{ color: "#1E40AF" }}>Domain age & reputation · Lookalike domain detection · SSL certificate · SEBI registration verification · App store presence · Platform anomaly detection · WHOIS data</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 py-3.5 rounded-xl text-sm font-semibold border transition-all" style={{ borderColor: "#E2E8F0", color: "#6B7280" }}>Cancel</button>
          <button onClick={() => onSave({ websiteUrl: url, appName: app, companyName: name, regNumber: reg, hasUrl: !!canSave })}
            disabled={!canSave}
            className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: canSave ? "#1D4ED8" : "#E2E8F0", color: canSave ? "white" : "#9CA3AF", cursor: canSave ? "pointer" : "not-allowed" }}
            onMouseEnter={(e) => { if (canSave) e.currentTarget.style.backgroundColor = "#1E3A8A"; }}
            onMouseLeave={(e) => { if (canSave) e.currentTarget.style.backgroundColor = "#1D4ED8"; }}>
            Save & Continue →
          </button>
        </div>
      </div>
    </main>
  );
}
