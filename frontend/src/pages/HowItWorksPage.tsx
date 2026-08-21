import type { Page } from "../App";

export default function HowItWorksPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <main>
      {/* ── INTRO ─────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(160deg,#0E2A52 0%,#163561 100%)" }} className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#4FD1C5" }}>Technical Overview</p>
          <h1 className="font-display text-3xl lg:text-4xl font-semibold text-white mb-5">How SafeInvest AI works</h1>
          <p className="leading-relaxed max-w-2xl mx-auto" style={{ color: "#A8BDD4" }}>
            You submit evidence like messages, videos, links, and app details. Our system runs multiple checks — for scam language, fake apps and websites, impersonation, and deepfake media — and combines them into a single fraud risk score with clear explanations.
          </p>
        </div>
      </section>

      {/* ── STEPS ─────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl lg:text-3xl font-semibold" style={{ color: "#0E2A52" }}>Step-by-step flow</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n:"01", icon:"📩", title:"Submit Evidence", body:"Paste the message, upload video or audio, share app link or website URL — whatever you received." },
              { n:"02", icon:"⚙️", title:"Multi-Engine Analysis", body:"Text, identity, website/app, and media signals are analyzed in parallel by dedicated engines." },
              { n:"03", icon:"📊", title:"Signals Combined", body:"All signals are weighted and combined into a single fraud risk score from 0 to 100." },
              { n:"04", icon:"🛡️", title:"Clear Result + Actions", body:"You receive a risk score, reasons, and specific recommended steps — before any money moves." },
            ].map((s, i, arr) => (
              <div key={s.n} className="relative rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <span className="font-mono-data text-2xl" style={{ color: "#E2E8F0" }}>{s.n}</span>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: "#EBF7F6" }}>{s.icon}</div>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: "#0E2A52" }}>{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
                {i < arr.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3.5 z-10 -translate-y-1/2">
                    <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
                      <path d="M0 7h18M13 2l6 5-6 5" stroke="#0D7A72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PIPELINE DIAGRAM ─────────────────────────── */}
      <section style={{ backgroundColor: "#F8F9FB" }} className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#0D7A72" }}>System Design</p>
            <h2 className="font-display text-2xl lg:text-3xl font-semibold" style={{ color: "#0E2A52" }}>
              Fraud Detection Platform — Multimodal Signal Pipeline
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-10">
            <Pipeline />
          </div>

          <p className="text-center text-xs text-slate-400 mt-6 max-w-xl mx-auto">
            Prototype architecture. In production, additional security, scaling, audit trails, and SEBI/NSDL/CDSL regulatory integrations would be added.
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-semibold mb-3" style={{ color: "#0E2A52" }}>Ready to check an offer?</h2>
          <p className="text-slate-500 mb-6 text-sm">Submit any evidence you have and get your risk score in seconds.</p>
          <button onClick={() => onNavigate("investor")} className="px-8 py-3.5 rounded-xl text-white font-semibold text-sm transition-all"
            style={{ backgroundColor: "#0E2A52" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#163561")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0E2A52")}>
            Start New Check →
          </button>
        </div>
      </section>
    </main>
  );
}

/* ── PIPELINE DIAGRAM COMPONENT ────────────────────────────── */
function Pipeline() {
  return (
    <div className="flex flex-col items-center gap-0 w-full" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13 }}>

      {/* USER / INVESTOR */}
      <NodeBox color="#DBEAFE" border="#93C5FD" text="#1E40AF" label="USER / INVESTOR"
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#1E40AF" strokeWidth="1.3"/><path d="M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="#1E40AF" strokeWidth="1.3" strokeLinecap="round"/></svg>}
        wide />
      <ArrowD />

      {/* Three inputs */}
      <div className="flex justify-center gap-3 flex-wrap w-full mb-0">
        {[
          { label: "Video / Audio", icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="10" height="10" rx="1.5" stroke="#1E40AF" strokeWidth="1.2"/><path d="M11 6.5l4-2v7l-4-2V6.5z" stroke="#1E40AF" strokeWidth="1.2" strokeLinejoin="round"/></svg> },
          { label: "Chat / Text", icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="#1E40AF" strokeWidth="1.2" strokeLinejoin="round"/></svg> },
          { label: "URL / App", icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#1E40AF" strokeWidth="1.2"/><path d="M2 8h12M8 2c-1.8 2-2 4.5-2 6s.2 4 2 6" stroke="#1E40AF" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 2c1.8 2 2 4.5 2 6s-.2 4-2 6" stroke="#1E40AF" strokeWidth="1.2" strokeLinecap="round"/></svg> },
        ].map((inp) => (
          <div key={inp.label} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium"
            style={{ backgroundColor: "#EFF6FF", color: "#1E40AF", border: "1.5px solid #BFDBFE", minWidth: 120, justifyContent: "center" }}>
            {inp.icon} {inp.label}
          </div>
        ))}
      </div>
      <ArrowD />

      {/* API Gateway */}
      <NodeBox color="#DCFCE7" border="#86EFAC" text="#14532D"
        label="API Gateway" sub="FastAPI"
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#166534" strokeWidth="1.2"/><path d="M8 4v2M8 10v2M4 8h2M10 8h2M5.2 5.2l1.4 1.4M9.4 9.4l1.4 1.4M5.2 10.8l1.4-1.4M9.4 6.6l1.4-1.4" stroke="#166534" strokeWidth="1.2" strokeLinecap="round"/></svg>}
      />
      <ArrowD />

      {/* Three engine panels */}
      <div className="flex gap-3 w-full items-start flex-wrap justify-center">
        {/* Media */}
        <EnginePanel color="#EA580C" bg="#FFF7ED" border="#FED7AA" darkText="#7C2D12" title="Media Engine"
          icon={<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="10" height="10" rx="1.5" stroke="#EA580C" strokeWidth="1.2"/><path d="M11 6.5l4-2v7l-4-2V6.5z" stroke="#EA580C" strokeWidth="1.2" strokeLinejoin="round"/></svg>}
          steps={["OpenCV", "Frame Extraction", "Face Detection", "Deepfake Classifier"]}
          highlightLast />
        {/* Text */}
        <EnginePanel color="#7C3AED" bg="#F5F3FF" border="#C4B5FD" darkText="#3B0764" title="Text Engine"
          icon={<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#7C3AED" strokeWidth="1.2"/><path d="M4 5.5h8M4 8h6M4 10.5h4" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          steps={["Regex Rules", "NLP Pipeline", "Scam Intent", "Impersonation Detection"]}
          highlightLast />
        {/* Platform */}
        <EnginePanel color="#0F766E" bg="#F0FDFA" border="#99F6E4" darkText="#134E4A" title="Platform Engine"
          icon={<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#0F766E" strokeWidth="1.2"/><path d="M2 8h12M8 2c-2 2-2 9 0 12" stroke="#0F766E" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 2c2 2 2 9 0 12" stroke="#0F766E" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          steps={["Trip / API Engine", "Domain / URL Intelligence", "Reputation Lookup", "Platform Anomaly"]}
          highlightLast />
      </div>

      {/* Scoring divider */}
      <div className="flex items-center gap-3 my-4 w-full max-w-lg">
        <div className="flex-1 border-t border-dashed border-slate-300"/>
        <span className="text-xs text-slate-400 whitespace-nowrap px-1">Scoring & Decisioning</span>
        <div className="flex-1 border-t border-dashed border-slate-300"/>
      </div>

      {/* Signal Engine */}
      <NodeBox color="#EEF2FF" border="#A5B4FC" text="#312E81"
        label="Signal Engine"
        sub="Deepfake · Impersonation · Scam NLP · Platform · Identity · Urgency"
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="#4338CA" strokeWidth="1.3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" stroke="#4338CA" strokeWidth="1.2" strokeLinecap="round"/></svg>}
        wide />
      <ArrowD />

      {/* Risk Engine */}
      <NodeBox color="#FEF9C3" border="#FDE047" text="#713F12"
        label="Risk Engine"
        sub="Weighted Scoring + Rules → Fraud Risk Score (0–100)"
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L1 5v5c0 3.5 2.5 6.5 7 7.5 4.5-1 7-4 7-7.5V5L8 1.5Z" stroke="#92400E" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 8l2.5 2.5 4-4" stroke="#92400E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        wide />
      <ArrowD />

      {/* Fraud Risk Score — rotated diamond */}
      <div className="relative flex items-center justify-center my-1" style={{ width: 190, height: 72 }}>
        <div className="absolute inset-2 rounded-2xl" style={{ backgroundColor: "#FEE2E2", border: "1.5px solid #FCA5A5", transform: "rotate(7deg)" }}/>
        <div className="absolute inset-2 rounded-2xl" style={{ backgroundColor: "#FEE2E2", border: "1.5px solid #FCA5A5", transform: "rotate(-7deg)" }}/>
        <div className="relative z-10 text-center">
          <p className="text-sm font-bold" style={{ color: "#991B1B" }}>Fraud Risk Score</p>
          <p className="text-xs" style={{ color: "#DC2626" }}>0 – 100</p>
        </div>
      </div>
      <ArrowD />

      {/* Explanation Engine */}
      <NodeBox color="#DCFCE7" border="#86EFAC" text="#14532D"
        label="Explanation Engine"
        sub="Why flagged? · What evidence? · What action?"
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="7" r="4.5" stroke="#166534" strokeWidth="1.3"/><path d="M8 11.5v2M6 14.5h4" stroke="#166534" strokeWidth="1.3" strokeLinecap="round"/><path d="M6.5 6C6.5 5.2 7.2 4.8 8 4.8s1.5.4 1.5 1.2c0 .7-.5 1.1-1 1.4-.5.3-.5.6-.5.6" stroke="#166534" strokeWidth="1.2" strokeLinecap="round"/></svg>}
        wide />
      <ArrowD />

      {/* Three outputs */}
      <div className="flex justify-center gap-3 flex-wrap w-full">
        {[
          { label: "Dashboard", icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="0.8" stroke="#1E40AF" strokeWidth="1.1"/><rect x="8" y="1" width="5" height="5" rx="0.8" stroke="#1E40AF" strokeWidth="1.1"/><rect x="1" y="8" width="5" height="5" rx="0.8" stroke="#1E40AF" strokeWidth="1.1"/><rect x="8" y="8" width="5" height="5" rx="0.8" stroke="#1E40AF" strokeWidth="1.1"/></svg> },
          { label: "Alert System", icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C4.5 1.5 3 4 3 6v3l-1 1h10l-1-1V6c0-2-1.5-4.5-4-4.5z" stroke="#1E40AF" strokeWidth="1.1" strokeLinejoin="round"/><path d="M5.5 10c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" stroke="#1E40AF" strokeWidth="1.1"/></svg> },
          { label: "Report", icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 1h6l3 3v9H3V1z" stroke="#1E40AF" strokeWidth="1.1" strokeLinejoin="round"/><path d="M9 1v3h3" stroke="#1E40AF" strokeWidth="1.1" strokeLinejoin="round"/><path d="M5 7h4M5 9.5h2" stroke="#1E40AF" strokeWidth="1.1" strokeLinecap="round"/></svg> },
        ].map((o) => (
          <div key={o.label} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium"
            style={{ backgroundColor: "#EFF6FF", color: "#1E40AF", border: "1.5px solid #BFDBFE", minWidth: 110, justifyContent: "center" }}>
            {o.icon} {o.label}
          </div>
        ))}
      </div>
      <ArrowD />

      {/* PostgreSQL cylinder */}
      <div className="flex flex-col items-center" style={{ width: 220 }}>
        <div style={{ width: 220, height: 20, borderRadius: "50%", backgroundColor: "#BAE6FD", border: "1.5px solid #7DD3FC", position: "relative", zIndex: 2 }}/>
        <div style={{ width: 220, backgroundColor: "#E0F2FE", border: "1.5px solid #7DD3FC", borderTop: "none", borderBottom: "none", marginTop: -10, paddingTop: 16, paddingBottom: 10, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="mb-1">
            <ellipse cx="10" cy="4" rx="7" ry="2.5" stroke="#0369A1" strokeWidth="1.3"/>
            <path d="M3 4v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V4" stroke="#0369A1" strokeWidth="1.3"/>
            <path d="M3 10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" stroke="#0369A1" strokeWidth="1.3"/>
          </svg>
          <span className="text-sm font-bold" style={{ color: "#0C4A6E" }}>PostgreSQL</span>
          <span className="text-xs mt-0.5" style={{ color: "#0369A1" }}>Cases · Evidence · Results · Logs</span>
        </div>
        <div style={{ width: 220, height: 20, borderRadius: "50%", backgroundColor: "#BAE6FD", border: "1.5px solid #7DD3FC", marginTop: -10, position: "relative", zIndex: 2 }}/>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-5 mt-8 text-xs">
        {[["#1E40AF","User-facing"],["#0F766E","Analysis engines"],["#0369A1","Storage"]].map(([c,l]) => (
          <div key={l} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: c }}/><span className="text-slate-500">{l}</span></div>
        ))}
      </div>
    </div>
  );
}

function ArrowD() {
  return (
    <div className="flex justify-center my-2">
      <svg width="14" height="26" viewBox="0 0 14 26" fill="none">
        <path d="M7 0v20" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M2.5 17l4.5 6 4.5-6" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function NodeBox({ color, border, text, label, sub, icon, wide }: {
  color: string; border: string; text: string; label: string; sub?: string; icon?: React.ReactNode; wide?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl text-center"
      style={{ backgroundColor: color, border: `1.5px solid ${border}`, color: text, minWidth: wide ? 280 : 200 }}>
      <div className="flex items-center gap-2 justify-center">
        {icon}<span className="text-sm font-semibold">{label}</span>
      </div>
      {sub && <p className="text-xs mt-1 opacity-70 leading-snug">{sub}</p>}
    </div>
  );
}

function EnginePanel({ color, bg, border, darkText, title, icon, steps, highlightLast }: {
  color: string; bg: string; border: string; darkText: string; title: string; icon: React.ReactNode; steps: string[]; highlightLast?: boolean;
}) {
  return (
    <div className="flex-1 rounded-2xl p-4 min-w-[155px]" style={{ border: `2px solid ${border}`, backgroundColor: bg }}>
      <div className="flex items-center gap-1.5 mb-3">
        {icon}<span className="text-xs font-bold" style={{ color: darkText }}>{title}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {steps.map((s, i) => (
          <div key={s}>
            <div className="px-2.5 py-1.5 rounded-lg text-xs text-center"
              style={{ backgroundColor: (highlightLast && i === steps.length - 1) ? color : `${color}20`, color: (highlightLast && i === steps.length - 1) ? "white" : darkText, fontWeight: (highlightLast && i === steps.length - 1) ? 600 : 400 }}>
              {s}
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center my-0.5">
                <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                  <path d="M4 0v7" stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.5"/>
                  <path d="M1.5 5.5L4 8l2.5-2.5" stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
